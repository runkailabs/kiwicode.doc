# Runtime Reference

The Kiwi Runtime (`kiwi-runtime`) is a standalone WebSocket agent that connects to the Kiwi backend and executes terminal commands on behalf of the AI. It's the bridge between the cloud AI and your local machine.

## Quick Start

```bash
# Production, restricted to current directory
kiwi-runtime connect --server app

# Development, full filesystem access
kiwi-runtime connect --server dev --scope full

# Production with extra allowed directories
kiwi-runtime connect --server app --allow /tmp --allow /var/log
```

---

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--server` | Server preset (`app`, `dev`, `local`) or full URL | `app` |
| `--token` | Access token for authentication (used by TUI for shared auth) | — |
| `--email` | Email address for authentication | — |
| `--scope` | Execution scope: `restricted` or `full` | `restricted` |
| `--allow PATH` | Additional allowed directory (repeatable, restricted mode only) | — |
| `--runID` / `--run-id` | Pin this runtime to a specific run ID | — |
| `-w, --worktree NAME` | Create/reuse an isolated git worktree | — |
| `--version` | Show version and exit | — |

---

## Architecture

```
  +-- Kiwi Backend ----+          +-- Your Machine -------------+
  |                     |   WSS    |                              |
  |   AI Model          |<-------->|  kiwi-runtime               |
  |   (cloud)           |          |                              |
  |                     |          |  +-- File System Tool ------+
  |                     |          |  |  read, write, edit,       |
  |                     |          |  |  search, delete, move     |
  |                     |          |  +--------------------------+
  |                     |          |                              |
  |                     |          |  +-- Command Executor ------+
  |                     |          |  |  non-interactive + PTY    |
  |                     |          |  +--------------------------+
  +---------------------+          +------------------------------+
```

The runtime maintains a persistent WebSocket connection to the backend. When the AI needs to execute a command or manipulate files, it sends a message through the WebSocket. The runtime executes it locally and streams results back.

---

## Scope Modes

### Restricted Mode (Default)

The runtime can only access files within the current working directory. This is the safe default — the AI can't accidentally modify files outside your project.

```bash
kiwi-runtime connect --server app --scope restricted
```

Additional directories can be allowed with `--allow`:

```bash
kiwi-runtime connect --server app --scope restricted --allow /tmp --allow /var/log
```

### Full Mode

The runtime can access the entire filesystem. Use with caution — the AI can read and write anywhere.

```bash
kiwi-runtime connect --server app --scope full
```

### Path Validation

Every file operation is validated against the allowed paths before execution:

- In restricted mode: paths must be within the working directory or explicitly allowed directories
- In full mode: all paths are allowed
- Symlinks are resolved before validation to prevent escape
- `..` traversal is blocked

---

## File System Operations

When connected, the AI can use these 20 file operations on your machine:

### Reading

| Operation | Description |
|-----------|-------------|
| `read_file` | Read file content — supports full, range, head, tail, chunk, and grep modes |
| `stat_file` | Get file metadata (size, permissions, timestamps) |
| `list_dir` | List directory contents (recursive option available) |
| `search_in_file` | Search within a single file with context lines |
| `search_in_files` | Recursive grep across multiple files with glob patterns |

### Writing

| Operation | Description |
|-----------|-------------|
| `write_file` | Create or overwrite a file (with parent directory creation) |
| `append_file` | Append content to an existing file |
| `replace_in_file` | Find and replace text (single or all occurrences) |
| `replace_line_range` | Replace a specific range of lines |
| `insert_at_line` | Insert lines at a specific position |
| `apply_unified_diff` | Apply a unified diff patch |

### File Management

| Operation | Description |
|-----------|-------------|
| `mkdir` | Create directory (with parents option) |
| `move_path` | Move or rename a file or directory |
| `copy_path` | Copy a file or directory (recursive option) |
| `delete_path` | Delete a file or directory (recursive option) |

### Chunked Writing (Large Files)

| Operation | Description |
|-----------|-------------|
| `file_write_start` | Begin a chunked write session |
| `file_write_chunk` | Write a chunk of content |
| `file_write_finish` | Finalize the chunked write |
| `file_write_abort` | Abort a chunked write session |

### Batch

| Operation | Description |
|-----------|-------------|
| `batch` | Execute multiple operations sequentially with stop-on-error option |

---

## Command Execution

### Non-Interactive Commands

Standard commands run in a subprocess with stdout/stderr captured and streamed back:

- Timeout protection (configurable per command)
- Output size limits to prevent memory issues
- Exit code reported to the AI

### Interactive Commands (PTY)

For commands that need user interaction (like `npm login`, `gh auth login`, `ssh-keygen`):

- Runs in a pseudo-terminal (PTY)
- You can type input directly in the Runtime Logs screen (`Ctrl+O`)
- `Ctrl+K` to interrupt a running interactive command
- Control directory at `~/.kiwi/runtimes/<run_id>/control/` for IPC

### Concurrency

The runtime limits concurrent operations:

| Resource | Limit |
|----------|-------|
| Concurrent commands | 1 (sequential execution) |
| File system operations | Queued, processed in order |
| WebSocket message queue | Bounded buffer |

---

## Authentication

### Token-Based (TUI Managed)

When spawned by the TUI, the runtime receives a `--token` directly. No login prompt needed.

### Email-Based (Standalone)

When run standalone without `--token`, the runtime prompts for email and password.

### Token Refresh

- Tokens are loaded from `~/.kiwi/tokens.json`
- Expired tokens are automatically refreshed using the refresh token
- Token writes use atomic replace with file locking

---

## Lifecycle

### Spawned by TUI

```
TUI starts  -->  spawns kiwi-runtime  -->  runtime connects  -->  AI can execute
                    |
                    v
              State: pending  -->  bound (when run starts)
```

1. TUI spawns `kiwi-runtime connect --server <s> --token <t> --runID <id>`
2. Runtime connects to backend via WebSocket
3. State is `pending` — waiting for a run to bind
4. When the user sends a message, the run binds to this runtime
5. State becomes `bound` — AI can now execute commands

### Standalone

```
User runs kiwi-runtime  -->  connects to backend  -->  waits for AI to bind
```

1. User runs `kiwi-runtime connect --server app`
2. Runtime authenticates and connects
3. User opens the web dashboard and starts a conversation
4. AI binds to the runtime and starts executing

### Cleanup

- When the TUI quits, it prompts to terminate or keep runtimes
- Runtimes left running survive and can be reconnected
- Runtime logs are trimmed to prevent disk bloat
- State directory: `~/.kiwi/runtimes/<run_id>/`

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `PYTHONUNBUFFERED` | Set to `1` for unbuffered output |
| `PYTHONUTF8` | Set to `1` for UTF-8 mode (Windows) |
| `PYTHONIOENCODING` | Set to `utf-8:replace` |
| `KIWI_TUI_MANAGED` | Set to `1` when spawned by TUI |
| `KIWI_RUNTIME_CONTROL_DIR` | Control directory for interactive PTY sessions |

---

## Platform Support

| Feature | Linux | macOS | Windows |
|---------|-------|-------|---------|
| Non-interactive commands | ✅ | ✅ | ✅ |
| Interactive PTY | ✅ | ✅ | ⚠️ Limited |
| File system operations | ✅ | ✅ | ✅ |
| Worktree mode | ✅ | ✅ | ✅ |
| Token storage | ✅ | ✅ | ✅ |

---

## Troubleshooting

### Runtime not starting

Check authentication:

```bash
kiwi whoami
```

If not authenticated, run `kiwi login` first.

### WebSocket disconnects after server redeploy

If the backend restarts, the WebSocket connection drops. The TUI automatically detects this and respawns the runtime. For standalone runtimes, restart manually:

```bash
kiwi-runtime connect --server app
```

### "Permission denied" in restricted mode

Add the directory with `--allow`:

```bash
kiwi-runtime connect --server app --allow /path/to/dir
```

Or switch to full mode:

```bash
kiwi-runtime connect --server app --scope full
```

### Interactive command hangs

Open Runtime Logs (`Ctrl+O`) — the command may be waiting for your input. Type directly in the logs screen. Press `Ctrl+K` to interrupt if needed.

### Runtime logs growing too large

The TUI automatically trims runtime logs. For standalone runtimes, logs are at `~/.kiwi/runtimes/<run_id>/logs/`.
