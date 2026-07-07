# Runtime Agent

The runtime agent is the bridge between the cloud AI and your local machine. It's a persistent WebSocket-connected process that executes terminal commands, reads and writes files, and manages interactive shell sessions — all on behalf of the AI.

## Architecture

```
  +-- Kiwi Backend ----+          +-- Your Machine -----------------+
  |                     |          |                                |
  |   AI Model          |  WSS     |   kiwi-runtime                 |
  |   (cloud)           |<=======> |   (local process)              |
  |                     |  JSON    |       |                        |
  +---------------------+          |       |  spawns                |
                                   |       v                        |
                                   |   /bin/sh (PTY)                |
                                   |       |                        |
                                   |       |  reads/writes          |
                                   |       v                        |
                                   |   Your filesystem              |
                                   +--------------------------------+
```

The runtime is a standalone Python process (`python -m kiwi_runtime.main connect`) that:

1. Opens a WebSocket to the Kiwi backend
2. Authenticates with your access token
3. Waits for commands from the AI
4. Executes them locally and streams results back

## How the TUI Manages the Runtime

When you launch the TUI, it automatically spawns and manages the runtime for you. You don't need to start it manually.

### State Directory

Runtime state is stored under `~/.kiwi/runtimes/`:

```
~/.kiwi/runtimes/
├── by-run/
│   └── <run_id>/
│       ├── pid          # Process ID of the runtime
│       ├── log          # stdout/stderr output
│       └── meta.json    # Server, scope, cwd, allow list
├── pending/
│   └── <uuid>/
│       ├── pid
│       ├── log
│       └── meta.json
└── control/
    └── <uuid>/          # IPC control directory
```

### Pending → Bound Flow

For new conversations, the run ID isn't known until the first message is sent. The TUI handles this with a two-phase approach:

1. **Pending phase** — A runtime is started immediately with a random UUID. It connects and waits.
2. **Binding phase** — Once the `async-run` API call returns a `run_id`, the pending runtime is bound to it. The state directory moves from `pending/<uuid>/` to `by-run/<run_id>/`.

On Windows (where open file handles can block directory renames), a "soft bind" is used instead — metadata in `by-run/<run_id>/meta.json` points back to the pending directory's log file.

### Validation Before Reuse

Before reusing an existing runtime, the TUI validates that it's still healthy:

| Check | Why |
|-------|-----|
| PID exists and is alive | Avoids using dead processes |
| Process creation time matches | Prevents PID reuse (a new process could get the same PID) |
| Command line contains `kiwi_runtime.main` | Confirms it's actually our runtime |
| Log doesn't contain "disconnected. goodbye!" | Detects cleanly-exited runtimes |
| Server, scope, allow dirs, cwd match | Ensures the runtime is configured for this session |

If any check fails, the stale runtime is discarded and a fresh one is spawned.

### Log Trimming

Runtime logs can grow large during long sessions. A background thread trims each log file to the last ~30 KB, keeping only recent output. This prevents disk and memory bloat while preserving enough context for debugging.

### Cleanup on Exit

When you quit the TUI, a cleanup screen lists all running runtimes. You can choose to keep or kill each one. Runtimes left running will survive and can be reconnected to in a future session.

---

## WebSocket Connection

### Endpoint

```
WSS: wss://<server>/v1/terminal/ws/connect
```

### Connection Parameters

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `ping_interval` | 20s | Keep-alive pings to detect dead connections |
| `ping_timeout` | 90s | How long to wait for a pong before considering the connection dead |
| `close_timeout` | 60s | Graceful shutdown window |
| `max_queue` | 64 | Maximum outgoing message queue size |

### Authentication Handshake

On connect, the runtime sends:

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

The server responds with `auth_ok` (or `error` on failure).

### Reconnection

If the WebSocket drops, the runtime automatically reconnects with exponential backoff. Before each reconnect attempt, it:

- Reads fresh tokens from `~/.kiwi/tokens.json` (so token refreshes by the TUI are picked up)
- Re-authenticates on expired/invalid tokens if email credentials are available
- Retries up to a configurable maximum before giving up

---

## Message Types

The runtime handles these message types from the server:

### Command Execution

| Type | Description |
|------|-------------|
| `command` | Run a shell command. Queued and executed by a dedicated worker. Results streamed back as `result`. |
| `interactive` | Run a command that may need user input (e.g., `npm login`). Uses a PTY for proper terminal interaction. |

### File System

| Type | Description |
|------|-------------|
| `read_file` | Read a file with support for modes: `full`, `range`, `head`, `tail`, `chunk`, `grep` |
| `write_file` | Create or overwrite a file |
| `append_file` | Append content to a file |
| `replace_in_file` | Find and replace text within a file |
| `stat_file` | Get file metadata (size, permissions, timestamps) |
| `list_dir` | List directory contents (optionally recursive) |
| `mkdir` | Create directories |
| `move_path` | Move or rename files/directories |
| `copy_path` | Copy files/directories |
| `delete_path` | Delete files/directories |
| `search_in_file` | Search within a single file |
| `search_in_files` | Search across multiple files (repo grep) |
| `apply_unified_diff` | Apply a unified diff patch |
| `replace_line_range` | Replace a range of lines |
| `insert_at_line` | Insert lines at a specific position |
| `file_write_start` | Begin a chunked file write |
| `file_write_chunk` | Write a chunk of a large file |
| `file_write_finish` | Finalize a chunked file write |
| `file_write_abort` | Abort a chunked file write |
| `read_files` | Upload files to S3 and return URLs (for binary files) |

All file system operations respect the runtime's scope mode. In `restricted` mode, paths are validated to stay within `allowed_dirs`.

### PTY Sessions

| Type | Description |
|------|-------------|
| `pty_start` | Start an interactive PTY session (e.g., `bash`) |
| `pty_input` | Send input to a running PTY session |
| `pty_resize` | Resize the PTY terminal dimensions |
| `pty_kill` | Terminate a PTY session |

---

## Command Execution

### Non-Interactive Commands

Commands of type `command` are processed by a dedicated worker that pulls from an `asyncio.Queue` (max 64 items). The worker:

1. Runs the command via `subprocess` with stdout/stderr captured
2. Applies a configurable timeout (default 120s, max 600s)
3. Sends the result back as:

```json
{
  "type": "result",
  "request_id": "...",
  "stdout": "...",
  "stderr": "...",
  "exit_code": 0
}
```

### Interactive Commands

Commands of type `interactive` use a PTY (pseudo-terminal) on Unix/macOS or piped subprocess on Windows. This allows:

- Proper terminal control sequences (colors, progress bars)
- User input via the TUI's input field
- Signal handling (Ctrl+C sends SIGINT)

On Unix, the PTY is created with `os.openpty()` and the shell runs as a process group (`os.setsid`), so signals are delivered correctly to the entire process tree.

### Timeouts

Commands have a configurable timeout. If a command exceeds it:

1. `SIGTERM` is sent to the process group
2. If it doesn't exit within 3 seconds, `SIGKILL` is sent
3. The result is returned with `exit_code: -1`

---

## Scope Modes

The runtime operates in one of two modes:

| Mode | Behavior |
|------|----------|
| `restricted` | All file operations are validated against `allowed_dirs`. Paths outside these directories are rejected. This is the default. |
| `full` | No directory restrictions. The AI can access any path on the system. |

In restricted mode, the runtime also validates that paths don't escape via symlinks or `..` traversal.

---

## Checkpoints

Before any file mutation (write, delete, replace), the runtime can optionally create a checkpoint — a snapshot of the file's current state. This enables:

- Rolling back AI changes
- Comparing before/after states
- Auditing what the AI modified

Checkpoints are stored in `.kiwi/checkpoints/` within the working directory. See [Checkpoint System](/concepts/checkpoint-system) for details.

---

## Token Management

### Shared Storage

Tokens are stored in `~/.kiwi/tokens.json` and shared between the TUI and runtime:

```json
{
  "access_token": "eyJ...",
  "refresh_token": "rt_...",
  "token_type": "Bearer",
  "expires_at": "2025-07-06T12:00:00"
}
```

### Atomic Writes

Token writes use atomic replace (write to temp file, `fsync`, then `os.replace`) to prevent corruption. A file lock (`~/.kiwi/tokens.lock`) prevents race conditions between the TUI and runtime.

### Auto-Refresh

The runtime checks token expiry before connecting (with a 60-second skew buffer). If expired, it refreshes using the refresh token and writes the new tokens atomically. It also falls back to JWT `exp` claim parsing if `expires_at` is missing.

---

## Running Standalone

While the TUI manages the runtime automatically, you can also run it directly for debugging:

```bash
# Connect to production
kiwi-runtime connect --server app --scope full

# Connect to dev with full filesystem access
kiwi-runtime connect --server dev --scope full

# Connect with extra allowed directories
kiwi-runtime connect --server dev --allow /tmp --allow /var/log

# Use a worktree
kiwi-runtime -w my-experiment
```

Standalone runtimes are not tracked by the TUI and won't appear in the cleanup prompt.

---

## Platform Support

| Feature | Linux | macOS | Windows |
|---------|-------|-------|---------|
| PTY sessions | ✅ `os.openpty()` | ✅ `os.openpty()` | ✅ `PipeProcess` (piped subprocess) |
| Process groups | ✅ `os.setsid` | ✅ `os.setsid` | ✅ `CREATE_NEW_PROCESS_GROUP` |
| File locking | ✅ `fcntl.flock` | ✅ `fcntl.flock` | ✅ `msvcrt.locking` |
| Atomic writes | ✅ `os.replace` | ✅ `os.replace` | ✅ `os.replace` |
| Soft bind (pending→by-run) | ✅ Directory rename | ✅ Directory rename | ✅ Metadata-based fallback |

---

## Concurrency

File system operations are limited to **8 concurrent operations** via an `asyncio.Semaphore`. This prevents resource exhaustion when the AI issues many parallel file reads/writes.

Command execution uses a dedicated worker pulling from a queue (max 64 items). If the queue is full, new commands are rejected with an error rather than blocking the WebSocket message loop.
