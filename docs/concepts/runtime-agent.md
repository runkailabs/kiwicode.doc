# Runtime Agent

The Kiwi Runtime agent is the bridge between the cloud AI and your local machine. It's a WebSocket-connected process that executes terminal commands on behalf of the AI.

## How It Works

```
┌──────────────┐     WebSocket      ┌──────────────┐
│  Kiwi Server │ ◄────────────────► │ kiwi-runtime │
│  (Cloud AI)  │    JSON messages   │  (Local)     │
└──────────────┘                    └──────┬───────┘
                                           │
                                    ┌──────▼───────┐
                                    │  Local Shell  │
                                    │  (PTY/Term)  │
                                    └──────────────┘
```

1. The runtime connects to the Kiwi server via WebSocket
2. It authenticates using your access token
3. When the AI needs to run a command, the server sends a JSON message
4. The runtime executes the command in a local PTY (pseudo-terminal)
5. Output is streamed back to the server in real-time

## Lifecycle

### Managed by TUI (Recommended)

When you use `/connect-cli` in the TUI, Kiwi Code:

1. Spawns a `kiwi-runtime` process
2. Tracks it under `~/.kiwi/runtimes/by-run/<run_id>/`
3. Stores PID, logs, and metadata
4. Automatically trims logs to ~30KB
5. Survives TUI restarts (can reconnect)
6. Prompts for cleanup on quit

### Standalone (Debugging)

You can run the runtime manually:

```bash
kiwi-runtime connect --server dev --scope restricted --allow "$PWD"
```

Standalone runtimes are not tracked and won't appear in the cleanup prompt.

## Runtime Per Run

Each conversation (run) gets its own runtime process. This means:

- Different conversations are isolated
- You can have multiple runtimes running simultaneously
- Each runtime is scoped to its own working directory

## Pending Runtimes

When you start a fresh conversation, the run ID isn't known until the first message is sent. Kiwi Code handles this with "pending" runtimes:

1. A runtime is started in "pending" state
2. Once the run ID is known, the runtime is "bound" to it
3. On Linux/macOS: the runtime directory is moved (`pending/` → `by-run/`)
4. On Windows: a "soft bind" is used (metadata points to the pending directory)

## Validation

Kiwi Code validates that a runtime process is still healthy before reusing it:

1. PID exists and is alive
2. Process create time matches (prevents PID reuse)
3. Log doesn't contain "disconnected. goodbye!"
4. Command line confirms it's a `kiwi-runtime` process
5. Runtime properties (server, scope, allow dirs, cwd) match current session

## Interactive Sessions

When the AI runs an interactive command (e.g., `npm login`, `gh auth login`), the runtime creates an interactive session. You can:

- Open the Runtime Logs screen (`Ctrl+O`)
- Type input directly in the input field
- Send input with Enter
- Interrupt with `Ctrl+K`

## File System Tool

The runtime exposes a comprehensive file system API that the AI can use. See the [Runtime Reference](/reference/runtime#file-system-tool) for the full list of operations.
