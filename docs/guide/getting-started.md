# Getting Started

Welcome to **Kiwi Code** — a terminal-first interface for chatting with AI, managing runs, and connecting a local CLI runtime so AI can execute terminal commands on your machine.

## What is Kiwi Code?

Kiwi Code is a Python terminal application with three components:

| Component | Command | Purpose |
|-----------|---------|---------|
| **TUI** | `kiwi` | Full-screen Textual terminal UI for interactive AI chat |
| **CLI** | `kiwicli` | Command-line tool for scripting and inspection |
| **Runtime** | `kiwi-runtime` | WebSocket agent that executes shell commands for the AI |

## How It Works

```
┌──────────────┐     HTTP/SSE      ┌──────────────┐
│  Kiwi Server │ ◄───────────────► │  kiwi (TUI)  │
│  (Cloud AI)  │                   │  (Your Terminal) │
└──────┬───────┘                   └──────┬───────┘
       │                                  │
       │         WebSocket                │ spawns
       └────────────────────► ┌───────────▼───────────┐
                               │  kiwi-runtime (Local) │
                               │  Executes commands    │
                               └───────────────────────┘
```

1. You type a message in the TUI
2. The message goes to the Kiwi server (cloud AI)
3. The AI can request terminal commands
4. The local `kiwi-runtime` executes them on your machine
5. Results stream back in real-time

## Prerequisites

- **Python 3.11+** (3.11, 3.12, or 3.13)
- **Linux**, **macOS**, or **Windows**
- **Git** (required for worktree mode)

## Next Steps

- [Install Kiwi Code](/guide/installation)
- [Quick Start guide](/guide/quick-start)
- [Understand the runtime agent](/concepts/runtime-agent)
