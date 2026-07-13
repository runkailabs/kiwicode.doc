# API Communication

Kiwi Code communicates with the Kiwi backend through three distinct channels, each optimized for a specific purpose. This page explains how they work, when each is used, and how they fit together.

## Overview

Kiwi Code uses three communication channels, each with a specific role:

```
  +-- Kiwi Backend ---------------------------------------+
  |                                                        |
  |   REST API (HTTP)     SSE (HTTP)     WebSocket (WSS)   |
  |        ^                  |                 ^  |       |
  |        |                  v                 |  v       |
  +--------+------------------+-----------------+--+-------+
           |                  |                 |  |
      kiwi TUI           kiwi TUI         kiwi-runtime
     (Textual)          (Textual)          (process)
```

| Channel | Protocol | Direction | Used By | Purpose |
|---------|----------|-----------|---------|---------|
| **REST API** | HTTP/HTTPS | Client → Server | TUI & CLI | Login, actions, runs, file upload |
| **SSE** | HTTP/HTTPS | Server → Client | TUI | Real-time status and text streaming |
| **WebSocket** | WSS/WS | Bidirectional | Runtime | Command execution on your machine |

---

## REST API

All REST calls go through `AutobotsClientWrapper`, a thin wrapper around the auto-generated `pykiwiai` SDK. The wrapper handles authentication, token refresh, and error normalization.

### Client Initialization

```python
# Authenticated (after login)
client = AutobotsClientWrapper(
    base_url="https://api.runkai.ai",
    access_token="eyJ..."
)

# Unauthenticated (before login)
client = AutobotsClientWrapper(
    base_url="https://api.runkai.ai"
)
```

The wrapper creates either an `AuthenticatedClient` (with Bearer token injection) or a plain `Client` depending on whether a token is provided.

### Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/v1/auth/` | Login with email/password. Returns `access_token`, `refresh_token`, `expires_in`. |
| `POST` | `/v1/auth/session/refresh` | Refresh an expired access token using the refresh token. |
| `GET` | `/v1/hello` | Health check — verifies the server is reachable. |
| `GET` | `/v1/actions/` | List available actions (AI models, tools, etc.). |
| `GET` | `/v1/actions/{id}` | Get details for a specific action. |
| `POST` | `/v1/actions/{id}/async-run` | Start an action run. Returns a `run_id` for tracking. |
| `GET` | `/v1/action-results/` | List past action runs. |
| `GET` | `/v1/action-results/{id}` | Get the result of a specific run (status, output, errors). |
| `POST` | `/v1/files/public/` | Upload files. Returns public URLs for each uploaded file. |

### Starting an Action Run

When you send a message in the TUI, Kiwi calls `async-run` with a `DataBlock` payload:

```json
{
  "input": {
    "text": "Add rate limiting to the API",
    "urls": ["https://.../screenshot.png"],
    "metadata": {
      "process_url_in_text": false,
      "process_attachment_url": true,
      "attachment_requested": 0
    }
  }
}
```

The response contains a `run_id` — a unique identifier used to track the run's progress via SSE and poll for its final result.

### Continuing a Conversation

To continue an existing conversation, pass the previous `action_result_id`:

```python
client.run_action_async(
    action_id="action-123",
    user_input="Now add tests for it",
    action_result_id="run-456"  # continues the conversation
)
```

### File Upload

Files are uploaded as `multipart/form-data` with proper MIME type detection:

```python
success, urls, msg = client.upload_files([
    "/path/to/screenshot.png",
    "/path/to/error.log"
])
# urls = ["https://.../screenshot.png", "https://.../error.log"]
```

The returned URLs are then passed to `async-run` so the AI can access them.

---

## SSE Streaming

Instead of polling for updates, the TUI subscribes to **Server-Sent Events** for real-time streaming. This is how you see the AI's response appear character by character.

### How It Works

```
GET /v1/server_sent_events/stream/{topic}
```

The backend publishes messages to Redis topics. The TUI opens a long-lived HTTP connection and receives events as they arrive.

### Topics

| Topic | Content | Terminal Detection |
|-------|---------|--------------------|
| `{run_id}` | JSON status payloads + plain text wrapped as `{type: "status", text: ...}` | Yes — stops on `completed`, `success`, `finished`, `failed`, `error` |
| `{run_id}-text` | Plain text only (assistant's streaming response) | No — caller polls separately for completion |

### Why Two Topics?

Some AI providers (notably OpenAI Responses) publish the assistant's text stream to a separate `-text` topic. This topic contains only plain text — no JSON status payloads. The TUI subscribes to both:

1. **`{run_id}`** — for status updates (processing, completed, failed)
2. **`{run_id}-text`** — for the actual assistant response text

### SSE Protocol Handling

The SSE parser in `AutobotsClientWrapper.stream_action_result()` handles:

- **Incremental UTF-8 decoding** — multi-byte characters split across TCP chunks are correctly reassembled
- **SSE framing** — `data:` lines, multi-line events, comment lines (`:`), blank-line delimiters
- **JSON parsing** — valid JSON is passed as-is; plain text is wrapped in `{type, text}`
- **Terminal status detection** — when a JSON payload contains a terminal status, the stream closes automatically

### Terminal Statuses

The SSE stream stops automatically when it receives any of these statuses:

- `completed`
- `success`
- `finished`
- `failed`
- `error`

### Polling Fallback

For the `-text` topic (which doesn't emit status), the TUI also runs a polling loop:

```python
client.poll_action_result(
    run_id="run-456",
    max_attempts=60,   # 2 minutes
    interval=2.0       # every 2 seconds
)
```

This polls `GET /v1/action-results/{id}` until the status is terminal.

---

## WebSocket (Runtime)

The `kiwi-runtime` process maintains a persistent WebSocket connection to the backend. This is the channel through which the AI executes commands on your machine.

### Connection

```
WSS: wss://<server>/v1/terminal/ws/connect
```

Connection parameters:

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `ping_interval` | 20s | Keep-alive pings |
| `ping_timeout` | 90s | Wait for pong before considering dead |
| `close_timeout` | 60s | Graceful shutdown window |
| `max_queue` | 64 | Max outgoing message queue |

### Authentication Handshake

On connect, the runtime sends an auth message:

```json
{
  "type": "auth",
  "token": "eyJ...",
  "agent_id": "uuid-v4",
  "platform": "linux",
  "mode": "restricted",
  "allowed_dirs": ["/home/user/project"],
  "consumer_id": "run-456"
}
```

The server responds with:

```json
{
  "type": "auth_ok",
  "user_id": "user@example.com",
  "agent_id": "uuid-v4"
}
```

### Message Flow

```
  Server                              Runtime
    |                                    |
    | -- {type: "cmd", id, ...} ------> |  execute command
    |                                    |  runs locally
    | <-- {type: "output", id, ...} --- |  stream stdout/stderr
    | <-- {type: "exit", id, code} ---- |  command finished
    |                                    |
```

### Reconnection

The runtime automatically reconnects on connection loss with exponential backoff. It also:

- Reads fresh access tokens from `~/.kiwi/tokens.json` before each reconnect (so token refreshes by the TUI are picked up)
- Re-authenticates on expired/invalid tokens if email credentials are available
- Retries up to a configurable maximum before giving up

### Scope Modes

The runtime operates in one of two modes:

| Mode | Behavior |
|------|----------|
| `restricted` | Commands can only access files within `allowed_dirs`. The file system tool enforces path boundaries. |
| `full` | No directory restrictions. The AI can access any path on the system. |

---

## Authentication Flow

### Token Storage

Tokens are stored in `~/.kiwi/tokens.json`:

```json
{
  "access_token": "eyJ...",
  "refresh_token": "rt_...",
  "token_type": "Bearer",
  "expires_at": "2025-07-06T12:00:00"
}
```

### Cross-Process Token Sharing

The TUI and runtime are separate processes. They share tokens through the filesystem:

1. **TUI** refreshes tokens and writes to `~/.kiwi/tokens.json`
2. **Runtime** reads fresh tokens from disk before each WebSocket reconnect
3. A file lock (`~/.kiwi/tokens.lock`) prevents race conditions during writes

### Auto-Refresh

The client automatically:

- Checks token expiry before each request (with a 60-second skew buffer)
- Refreshes expired tokens using the refresh token
- Retries once on `401`/`403` with a forced refresh
- Updates the in-memory client with the new token

### Refresh Endpoint Detail

The refresh call is made with a raw `httpx` client (not the OpenAPI SDK) to avoid the SDK injecting a stale `Authorization` header that could cause the refresh to fail:

```python
POST /v1/auth/session/refresh?refresh_token=rt_...
Authorization: Bearer <current_access_token>
```

---

## Server Resolution

Kiwi Code accepts a `--server` argument that can be any of:

| Input | Resolves To |
|-------|-------------|
| `app` | `https://api.runkai.ai` (HTTP) / `wss://api.runkai.ai` (WS) |
| `dev` | `https://dev.api.myautobots.com` (HTTP) / `wss://dev.api.myautobots.com` (WS) |
| `local` | `http://localhost:8000` (HTTP) / `ws://localhost:8000` (WS) |
| `https://custom.example.com` | Used as-is |
| `wss://custom.example.com` | Converted to `https://custom.example.com` for HTTP |
| `custom.example.com` | Prefixed with `https://` |

See [Server Presets](/reference/server-presets) for more details.

---

## Runtime Lifecycle

### Spawning

When the TUI starts, it spawns `kiwi-runtime` as a subprocess:

```bash
python -m kiwi_runtime.main connect \
  --server app \
  --token eyJ... \
  --scope restricted \
  --allow /home/user/project \
  --runID run-456
```

The runtime's stdout/stderr are captured to a log file at `~/.kiwi/runtimes/`.

### Pending → Bound

For new conversations where the `run_id` isn't known yet:

1. A **pending** runtime is started with a random UUID
2. Once the `async-run` call returns a `run_id`, the pending runtime is **bound** to it
3. The state directory is moved from `~/.kiwi/runtimes/pending/<uuid>/` to `~/.kiwi/runtimes/by-run/<run_id>/`

### Validation

Before reusing a runtime, Kiwi validates:

- The PID still exists and belongs to a `kiwi-runtime` process (not a reused PID)
- The process creation time matches the recorded time
- The log file doesn't contain a shutdown message
- The runtime's server, scope, allow list, and cwd match the current session

### Cleanup

On exit, the TUI shows a cleanup screen listing all running runtimes. You can choose to keep or kill each one.

---

## Error Handling

### REST API

- **401/403**: Triggers automatic token refresh and retry
- **Network errors**: Caught and surfaced as user-friendly messages
- **Unexpected statuses**: Logged with response body for debugging

### SSE

- **Connection drops**: The TUI falls back to polling
- **Malformed JSON**: Treated as plain text and wrapped in `{type, text}`
- **UTF-8 split across chunks**: Handled by incremental decoder

### WebSocket

- **Connection closed**: Automatic reconnect with exponential backoff
- **Auth failure**: Attempts re-login if credentials are available
- **Stale tokens**: Reads fresh tokens from disk before reconnect
