# API Communication

Kiwi Code communicates with the Kiwi backend using a combination of REST APIs, Server-Sent Events (SSE), and WebSockets.

## Communication Channels

| Channel | Protocol | Direction | Purpose |
|---------|----------|-----------|---------|
| REST API | HTTP/HTTPS | Client → Server | Login, actions, runs, file upload |
| SSE | HTTP/HTTPS | Server → Client | Real-time status and text streaming |
| WebSocket | WSS/WS | Bidirectional | Runtime command execution |

## REST API

All REST calls go through `AutobotsClientWrapper` (`src/kiwi_cli/client.py`):

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/v1/auth/` | Login with email/password |
| `POST` | `/v1/auth/session/refresh` | Refresh access token |
| `GET` | `/v1/hello` | Health check |
| `GET` | `/v1/actions/` | List actions |
| `GET` | `/v1/actions/{id}` | Get action details |
| `POST` | `/v1/actions/{id}/async-run` | Start an action run |
| `GET` | `/v1/action-results/` | List runs |
| `GET` | `/v1/action-results/{id}` | Get run result |
| `POST` | `/v1/files/public/` | Upload files |

## SSE Streaming

Instead of polling, the TUI subscribes to Server-Sent Events for real-time updates:

```
GET /v1/server_sent_events/stream/{topic}
```

### Topics

| Topic | Content |
|-------|---------|
| `{run_id}` | Status updates (JSON) + plain text wrapped as `{type: "status", text: ...}` |
| `{run_id}-text` | Assistant text stream (plain text only, no status) |

### Terminal Statuses

The SSE stream stops automatically when it receives a terminal status:

- `completed`
- `success`
- `finished`
- `failed`
- `error`

## WebSocket (Runtime)

The `kiwi-runtime` process maintains a persistent WebSocket connection to the server:

```
WSS Connection: wss://<server>/...
```

Through this connection:
- The server sends command execution requests
- The runtime executes them locally
- Output is streamed back in real-time
- Interactive sessions are supported

## Authentication

All authenticated requests include:

```
Authorization: Bearer <access_token>
```

The client automatically:
- Refreshes expired tokens before requests
- Retries once on 401/403 with forced refresh
- Shares refreshed tokens with the runtime

## Server Resolution

See [Server Presets](/reference/server-presets) for how `--server` values are resolved to URLs.
