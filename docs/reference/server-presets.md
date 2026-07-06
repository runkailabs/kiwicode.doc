# Server Presets

Kiwi Code supports multiple server environments through presets. Select a server with the `--server` flag.

## Built-in Presets

| Preset | HTTP URL | WebSocket URL | Use Case |
|--------|----------|---------------|----------|
| `app` | `https://api.meetkiwi.ai` | `wss://api.meetkiwi.ai` | Production |
| `dev` | `https://dev.api.myautobots.com` | `wss://dev.api.myautobots.com` | Development / Testing |
| `local` | `http://localhost:8000` | `ws://localhost:8000` | Local Development |

## Usage

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

You can also use a full URL instead of a preset:

```bash
kiwi --server https://custom.example.com
kiwi --server wss://custom.example.com
kiwi --server http://localhost:3000
```

## How It Works

Kiwi Code resolves the `--server` value as follows:

1. Check if it matches a preset name (`app`, `dev`, `local`)
2. If it starts with `https://` or `http://` → use as-is
3. If it starts with `wss://` → convert to `https://`
4. If it starts with `ws://` → convert to `http://`
5. Otherwise → treat as bare hostname, prefix with `https://`

## Default Server

If no `--server` is specified, Kiwi Code defaults to the **production** server (`app`):

```
https://api.meetkiwi.ai
```
