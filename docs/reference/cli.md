# CLI Reference

Kiwi Code provides three command-line entry points: `kiwi` (the main command), `kiwicli` (API inspection), and `kiwi-runtime` (the local agent).

---

## `kiwi` — Main Command

The primary entry point. Launches the TUI, terminal mode, or handles auth.

### Global Options

| Option | Description | Default |
|--------|-------------|---------|
| `--server` | Server preset (`app`, `dev`, `local`) or full URL | `app` |
| `--version` | Show version and exit | — |
| `--scope` | Runtime execution scope: `restricted` or `full` | `restricted` |
| `--allow PATH` | Additional allowed directory (repeatable, restricted mode only) | — |
| `--email` | Email for runtime auth (usually not needed) | — |
| `--token` | Access token for runtime (overrides saved token) | — |
| `-w, --worktree NAME` | Create/reuse an isolated git worktree | — |

### `kiwi` — Launch the TUI

Opens the full-screen terminal interface. The runtime auto-connects.

```bash
kiwi
kiwi --server dev
kiwi --scope full
kiwi -w my-experiment
```

### `kiwi --terminal` — Terminal Mode

Run a one-off query without the full TUI. Starts the run, spawns the runtime, and returns immediately.

```bash
# New conversation with default action
kiwi --terminal "Explain the architecture of this repo"

# New conversation with a specific action
kiwi --terminal --action-id abc123 "Hello"

# Continue an existing run
kiwi --terminal --run-id run_abc123 "Continue where we left off"

# Inspect a completed run (no message = show transcript)
kiwi --terminal --run-id run_abc123

# JSON output for scripting
kiwi --terminal --json "Hello"

# Pipe input from other commands
echo "Summarize the latest changes" | kiwi --terminal
```

::: tip Terminal mode behavior
- **Start a run**: `--action-id <id> <message>` — starts the run, spawns runtime, returns immediately
- **Continue a run**: `--run-id <id> <message>` — continues a completed run
- **Inspect a run**: `--run-id <id>` (no message) — prints the full transcript
- Terminal mode does **not** poll or stream results. Use the TUI for interactive sessions.
:::

### `kiwi login`

Interactive login with email and password. Saves tokens to `~/.kiwi/tokens.json`.

```bash
kiwi login
# Email: user@example.com
# Password: ••••••••
# Logged in successfully.
```

### `kiwi logout`

Clear saved authentication tokens.

```bash
kiwi logout
# Logged out successfully.
```

### `kiwi whoami`

Show current authentication status and server.

```bash
kiwi whoami
# Authenticated
# Server: https://api.runkai.ai
```

### `kiwi serve`

Serve the TUI in a browser via web server.

```bash
kiwi serve
kiwi serve --port 3000
```

---

## `kiwicli` — API CLI

A Typer-based CLI for listing and inspecting actions and runs. Shares the same auth and server resolution as `kiwi`.

### Global Options

| Option | Description | Default |
|--------|-------------|---------|
| `--server` | Server preset (`app`, `dev`, `local`) or full URL | `app` |
| `--version` | Show version and exit | — |

### `kiwicli login`

Interactive login with email and password.

```bash
kiwicli login
```

### `kiwicli logout`

Clear saved authentication tokens.

```bash
kiwicli logout
```

### `kiwicli whoami`

Show current authentication status and server.

```bash
kiwicli whoami
```

### `kiwicli actions list`

List available actions.

```bash
kiwicli actions list [OPTIONS]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--name` | Filter by name | — |
| `--limit` | Max results | `20` |
| `--offset` | Pagination offset | `0` |

**Example output:**

```
Actions (42 total, showing 0-20):

ID                           Name                           Type                      Ver    Created
---------------------------------------------------------------------------------------------------------
69c2180355a89324a9926bc6     AutoCode                       openai_chat               1      2025-01-15 10:30
...
```

### `kiwicli actions get`

Get action details by ID.

```bash
kiwicli actions get <ACTION_ID>
```

**Example output:**

```
ID:          69c2180355a89324a9926bc6
Name:        AutoCode
Type:        openai_chat
Version:     1
Description: End-to-end coding agent
Published:   True
Saved:       True
Created:     2025-01-15 10:30
Updated:     2025-06-20 14:15
```

### `kiwicli runs list`

List action runs (results).

```bash
kiwicli runs list [OPTIONS]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--action-id` | Filter by action ID | — |
| `--action-name` | Filter by action name | — |
| `--status` | Filter by status | — |
| `--limit` | Max results | `20` |
| `--offset` | Pagination offset | `0` |

**Valid status values:** `processing`, `success`, `error`, `stuck`, `waiting`

**Example output:**

```
Action Runs (156 total, showing 0-20):

ID                           Status       Name                           Created            Updated
---------------------------------------------------------------------------------------------------------
run_abc123                   success      Fix auth bug                   2025-07-01 09:15   2025-07-01 09:20
...
```

### `kiwicli runs get`

Get action run details by ID.

```bash
kiwicli runs get <RUN_ID>
```

**Example output:**

```
ID:          run_abc123
Status:      success
Name:        Fix auth bug
Type:        action_run
Saved:       True
Created:     2025-07-01 09:15
Updated:     2025-07-01 09:20

Action:
  Name:    AutoCode
  Type:    openai_chat
  ID:      69c2180355a89324a9926bc6
```

### `kiwicli tui`

Launch the interactive TUI from the CLI.

```bash
kiwicli tui
```

---

## `kiwi-runtime` — Runtime Agent

The standalone WebSocket agent that executes commands on your machine. Usually managed automatically by the TUI, but can be run directly.

### `kiwi-runtime connect`

Connect to the Kiwi backend and wait for commands.

```bash
kiwi-runtime connect --server app
```

| Option | Description | Default |
|--------|-------------|---------|
| `--server` | Server preset or URL | `app` |
| `--scope` | Execution scope: `restricted` or `full` | `restricted` |
| `--allow PATH` | Additional allowed directory (repeatable) | — |
| `-w, --worktree NAME` | Use a worktree | — |

**Examples:**

```bash
# Production, restricted to current directory
kiwi-runtime connect --server app

# Development, full filesystem access
kiwi-runtime connect --server dev --scope full

# Production with extra allowed directories
kiwi-runtime connect --server app --allow /tmp --allow /var/log

# Use a worktree
kiwi-runtime -w my-experiment
```

---

## Authentication Flow

All three commands share the same auth system:

1. Tokens are loaded from `~/.kiwi/tokens.json`
2. If the access token is expired but a refresh token exists, an automatic refresh is attempted
3. On 401/403 responses, a forced refresh is retried once
4. If still unauthenticated, the command exits with an error

Token writes use atomic replace (write to temp file, `fsync`, then `os.replace`) with file locking to prevent corruption from concurrent access.

---

## Server Selection

All three commands accept `--server` with the same resolution logic:

```bash
# Use a preset
kiwi --server dev
kiwicli --server dev actions list
kiwi-runtime connect --server dev

# Use a custom URL
kiwi --server https://custom.example.com
kiwicli --server https://custom.example.com actions list
kiwi-runtime connect --server wss://custom.example.com
```

See [Server Presets](/reference/server-presets) for the full resolution logic.

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `kiwi` | Launch the TUI |
| `kiwi --terminal "msg"` | One-off query (terminal mode) |
| `kiwi login` | Authenticate |
| `kiwi logout` | Clear tokens |
| `kiwi whoami` | Show auth status |
| `kiwi serve` | Serve TUI in browser |
| `kiwi -w NAME` | Launch in a worktree |
| `kiwicli actions list` | List actions |
| `kiwicli actions get <id>` | Get action details |
| `kiwicli runs list` | List runs |
| `kiwicli runs get <id>` | Get run details |
| `kiwicli login` | Authenticate |
| `kiwicli tui` | Launch TUI |
| `kiwi-runtime connect` | Start runtime agent |
