# Quick Start

Get up and running with Kiwi Code in under 2 minutes.

## 1. Log In

```bash
kiwi login
```

You'll be prompted for your email and password. Tokens are saved securely to `~/.kiwi/tokens.json`.

Verify you're authenticated:

```bash
kiwi whoami
# Authenticated
# Server: https://api.meetkiwi.ai
```

## 2. Launch the TUI

```bash
kiwi
```

This opens the full-screen terminal interface. You'll see:

- **Chat area** — your conversation with the AI
- **Input bar** — type messages, slash commands, or `@` to attach files
- **Status bar** — current action, run ID, and processing status

## 3. Send Your First Message

Type a message and press **Enter**. For example:

```
Explain the architecture of this repository
```

The AI will respond in the chat area. Status words like "Thinking", "Reasoning", or "Analyzing" will appear while the AI processes your request.

## 4. Connect the CLI Runtime

To let the AI execute terminal commands on your machine, connect the runtime:

Type `/connect-cli` and press Enter.

This starts a local `kiwi-runtime` process that the AI can use to:
- Read and write files
- Run shell commands
- Search your codebase
- Execute tests

## 5. Use Terminal Mode (Scripting)

For quick one-off queries without the full TUI:

```bash
kiwi --terminal "What does git status do?"
```

Pipe input from other commands:

```bash
echo "Summarize the latest changes" | kiwi --terminal --run-id <RUN_ID>
```

Get JSON output for scripts:

```bash
kiwi --terminal --json --action-id <ACTION_ID> "Hello"
```

## 6. Choose a Server

| Command | Server |
|---------|--------|
| `kiwi` | Production (`https://api.meetkiwi.ai`) |
| `kiwi --server dev` | Development |
| `kiwi --server local` | Local (`http://localhost:8000`) |

## Next Steps

- [Learn the TUI interface](/reference/tui)
- [Explore slash commands](/reference/slash-commands)
- [Understand the runtime agent](/concepts/runtime-agent)
- [Use worktree mode for isolated AI work](/concepts/worktree-mode)
