# Getting Started

Welcome to **Kiwi Code** — a terminal-first interface for chatting with AI, managing runs, and connecting a local CLI runtime so AI can execute terminal commands on your machine.

## What is Kiwi Code?

Kiwi Code is a Python terminal application with three components:

| Component | Command | Purpose |
|-----------|---------|---------|
| **TUI** | `kiwi` | Full-screen Textual terminal UI for interactive AI chat |
| **CLI** | `kiwicli` | Command-line tool for scripting and inspection |
| **Runtime** | `kiwi-runtime` | WebSocket agent that executes shell commands for the AI |

## Two Ways to Use Kiwi Code

### Primary: Kiwi TUI

```
  +-- Kiwi Backend ----+          +-- Your Terminal ------------+
  |                     |  HTTP    |                             |
  |   AI Model          |<-------->|      kiwi (TUI)             |
  |   (cloud)           |  SSE     | (Textual full-screen UI)    |
  |                     |          |        |                    |
  |                     |  WSS     |        | spawns             |
  |                     |<-------->|        v                    |
  |                     |          |  kiwi-runtime (local)       |
  |                     |          |  Executes commands          |
  +---------------------+          +----------------------------+
```

1. You type a message in the TUI
2. The message goes to the Kiwi server (cloud AI)
3. The AI can request terminal commands
4. The local `kiwi-runtime` executes them on your machine
5. Results stream back in real-time

### Alternative: Standalone Runtime + Web Dashboard

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

1. You start `kiwi-runtime` in your terminal
2. You open the web dashboard in your browser
3. You ask the AI to connect to your runtime
4. The AI executes commands on your machine while you chat from the browser

## Prerequisites

- **Python 3.11+** (3.11, 3.12, or 3.13)
- **Linux**, **macOS**, or **Windows**
- **Git** (required for worktree mode)

## Next Steps

- [Install Kiwi Code](/guide/installation)
- [Quick Start guide](/guide/quick-start)
- [Understand the runtime agent](/concepts/runtime-agent)
