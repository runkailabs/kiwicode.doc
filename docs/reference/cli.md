# CLI Reference (`kiwicli`)

`kiwicli` is a Typer-based CLI for scripting and inspecting Kiwi Code resources. Use it to list actions, check run statuses, and manage authentication from the command line.

## Global Options

| Option | Description |
|--------|-------------|
| `--server` | Server preset (`app`, `dev`, `local`) or full URL |
| `--version` | Show version and exit |

## Commands

### `kiwicli login`

Interactive login with email and password.

```bash
kiwicli login
# Email: user@example.com
# Password: ••••••••
# Logged in successfully.
```

### `kiwicli logout`

Clear saved authentication tokens.

```bash
kiwicli logout
# Logged out successfully.
```

### `kiwicli whoami`

Show current authentication status and server.

```bash
kiwicli whoami
# Authenticated
# Server: https://api.meetkiwi.ai
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

### `kiwicli runs get`

Get action run details by ID.

```bash
kiwicli runs get <RUN_ID>
```

### `kiwicli tui`

Launch the interactive TUI from the CLI.

```bash
kiwicli tui
```

## Authentication Flow

1. On any command requiring auth, loads tokens from `~/.kiwi/tokens.json`
2. If access token is expired but refresh token exists, attempts automatic refresh
3. On 401/403 response, retries once with forced token refresh
4. If still unauthenticated, exits with error message

## Server Selection

```bash
# Use a preset
kiwicli --server dev actions list

# Use a custom URL
kiwicli --server https://custom.example.com actions list
```
