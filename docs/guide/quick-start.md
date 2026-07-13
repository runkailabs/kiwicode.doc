# Quick Start

Get up and running with Kiwi Code in under 2 minutes. There are two ways to use Kiwi Code — pick the one that fits your workflow.

---

## Primary: Kiwi TUI

The TUI (Terminal User Interface) is the recommended way to use Kiwi Code. It gives you a full-screen chat experience with the AI, complete with file attachments, slash commands, and real-time streaming.

### 1. Install

```bash
# pip
pip install kiwi-ai

# pipx (recommended for CLI tools)
pipx install kiwi-ai

# uv
uv pip install kiwi-ai
```

### 2. Log In

```bash
kiwi login
```

You'll be prompted for your email and password. Tokens are saved securely to `~/.kiwi/tokens.json`.

Verify you're authenticated:

```bash
kiwi whoami
# Authenticated
# Server: https://api.runkai.ai
```

### 3. Launch the TUI

```bash
kiwi
```

This opens the full-screen terminal interface. You'll see:

- **Chat area** — your conversation with the AI
- **Input bar** — type messages, slash commands, or `@` to attach files
- **Status bar** — current action, run ID, and processing status

::: tip Runtime auto-connects
When you launch the TUI, a local `kiwi-runtime` process starts automatically in the background. This lets the AI read and write files, run shell commands, search your codebase, and execute tests — no manual setup needed.
:::

### 4. Send Your First Message

Type a message and press **Enter**. For example:

```
Explain the architecture of this repository
```

The AI will respond in the chat area. Status indicators like "Thinking" or "Analyzing" will appear while the AI processes your request.

### 5. Choose a Server

| Command | Server |
|---------|--------|
| `kiwi` | Production (`https://api.runkai.ai`) |
| `kiwi --server dev` | Development |
| `kiwi --server local` | Local (`http://localhost:8000`) |

---

## Alternative: Standalone Runtime + Web Dashboard

If you prefer a browser-based experience, you can run the runtime as a standalone process and chat with the AI through the web dashboard. This is also useful when you want the AI to work on your local machine while you interact from a different device or browser.

### How It Works

```
  +-- Your Terminal --------+     +-- Browser -----------------+
  |                          |     |                            |
  |  kiwi-runtime connect    |     |  runkai.ai           |
  |  (WebSocket to backend)  |<===>|  /dashboard/autocode/new   |
  |                          |     |                            |
  |  AI executes commands    |     |  You type messages here    |
  |  on your machine         |     |                            |
  +--------------------------+     +----------------------------+
```

1. You start `kiwi-runtime` in your terminal — it connects to the backend and waits
2. You open the web dashboard in your browser and start a new conversation
3. You ask the AI to connect to your CLI runtime
4. The AI binds to your runtime and can now execute commands on your machine

### Step by Step

#### 1. Install

Same as above — install `kiwi-ai` via pip, pipx, or uv.

#### 2. Start the Runtime

Open your terminal and run:

```bash
kiwi-runtime connect --server app --scope full
```

You'll see output like:

```
> Connected as user@example.com
> Agent ID: abc123-def456

  Ready | Mode: unrestricted | Ctrl+C to disconnect
  ──────────────────────────────────────────────────
```

The runtime is now waiting for the AI to connect. Keep this terminal open.

::: tip Scope modes
- `--scope full` — the AI can access any path on your system
- `--scope restricted` — the AI is limited to the current directory (default)

Use `--allow /extra/path` to grant access to additional directories in restricted mode.
:::

#### 3. Open the Web Dashboard

Go to **[https://runkai.ai/dashboard/autocode/new](https://runkai.ai/dashboard/autocode/new)** in your browser.

#### 4. Start Chatting

In the chat, ask the AI to connect to your runtime:

```
Connect to my CLI runtime and list the files in my current directory
```

The AI will detect your running runtime, bind to it, and start executing commands on your machine.

#### 5. Ask the AI to Do Anything

Once connected, you can ask the AI to:

- Read and analyze your codebase
- Write or modify files
- Run tests and fix failures
- Execute shell commands
- Search through your project
- And anything else you'd do in the TUI

### Stopping

Press `Ctrl+C` in the terminal where `kiwi-runtime` is running to disconnect.

---

## Terminal Mode (Scripting)

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

---

## Which Should I Use?

| Approach | Best For |
|----------|----------|
| **Kiwi TUI** (`kiwi`) | Full interactive coding sessions, file attachments, slash commands, worktree mode |
| **Standalone + Web** | Browser-based workflow, remote access, quick tasks without installing the TUI dependencies |
| **Terminal Mode** (`kiwi --terminal`) | Scripting, CI/CD pipelines, one-off queries |

---

## Next Steps

- [Learn the TUI interface](/reference/tui)
- [Explore slash commands](/reference/slash-commands)
- [Understand the runtime agent](/concepts/runtime-agent)
- [Use worktree mode for isolated AI work](/concepts/worktree-mode)
