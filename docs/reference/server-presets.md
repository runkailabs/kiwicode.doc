# Server Presets

Kiwi Code supports multiple server environments through presets. This lets you switch between production, development, and local servers with a single short name.

## Built-in Presets

| Preset | HTTP URL | WebSocket URL | Use Case |
|--------|----------|---------------|----------|
| `app` | `https://api.runkai.ai` | `wss://api.runkai.ai` | Production — the live Kiwi Code service |
| `dev` | `https://dev.api.myautobots.com` | `wss://dev.api.myautobots.com` | Development / staging — test new features before they hit production |
| `local` | `http://localhost:8000` | `ws://localhost:8000` | Local development — run the backend on your own machine |

## Usage

All three components accept the `--server` flag:

### TUI

```bash
kiwi --server dev
```

### CLI

```bash
kiwicli --server dev actions list
```

### Runtime

```bash
kiwi-runtime connect --server dev
```

### Terminal Mode

```bash
kiwi --terminal --server dev "Hello"
```

## Custom URLs

You're not limited to presets. Pass any URL:

```bash
# HTTPS
kiwi --server https://custom.example.com

# WebSocket (auto-converted to HTTPS for REST calls)
kiwi --server wss://custom.example.com

# Local with custom port
kiwi --server http://localhost:3000

# Bare hostname (assumed HTTPS)
kiwi --server staging.mycompany.com
```

## Resolution Logic

When you pass a `--server` value, Kiwi Code resolves it in this order:

| Step | Input Example | Result |
|------|--------------|--------|
| 1. Preset match | `app` | `https://api.runkai.ai` |
| 2. Starts with `https://` | `https://custom.com` | Used as-is |
| 3. Starts with `http://` | `http://localhost:3000` | Used as-is |
| 4. Starts with `wss://` | `wss://custom.com` | Converted to `https://custom.com` |
| 5. Starts with `ws://` | `ws://localhost:8000` | Converted to `http://localhost:8000` |
| 6. Bare hostname | `staging.example.com` | Prefixed with `https://` |

This resolution is handled by `http_url_from_server()` in `kiwi_cli/server.py`. It's a pure runtime function — no persistence, no config files.

## Default Server

If no `--server` is specified, Kiwi Code defaults to **production**:

```
https://api.runkai.ai
```

## How the TUI Maps Backend URLs

When the TUI spawns `kiwi-runtime`, it needs to pass the correct `--server` value. It uses a reverse mapping from the backend HTTP URL:

| Backend URL | Runtime `--server` |
|-------------|-------------------|
| `https://api.runkai.ai` | `app` |
| `https://dev.api.myautobots.com` | `dev` |
| `http://localhost:8000` | `local` |
| Any other URL | Passed as-is (converted to WS) |

This ensures the runtime always connects to the same server as the TUI.

## Environment Variables

Kiwi Code does **not** use environment variables for server configuration. The `--server` flag is the single source of truth. This keeps behavior predictable and avoids hidden state.

## Common Patterns

### Testing Against Dev

```bash
# Log in to dev
kiwi --server dev login

# Start TUI on dev
kiwi --server dev
```

### Local Backend Development

```bash
# Start the backend locally first, then:
kiwi --server local login
kiwi --server local
```

### Custom Staging Server

```bash
kiwi --server https://staging.kiwi.internal
```
