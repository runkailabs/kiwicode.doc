# Architecture

Kiwi Code is a Python terminal application with three distinct components that work together to provide an AI-powered coding experience.

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    kiwi-code (PyPI)                       │
│                                                          │
│  ┌──────────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   kiwi (TUI)     │  │ kiwicli (CLI)│  │kiwi-runtime │ │
│  │  Textual app     │  │  Typer CLI   │  │  WebSocket  │ │
│  │  Full-screen UI  │  │  Scripting   │  │  Agent      │ │
│  └────────┬─────────┘  └──────┬───────┘  └──────┬─────┘ │
│           │                   │                  │       │
│           └───────────────────┼──────────────────┘       │
│                               │                          │
│                    ┌──────────▼──────────┐               │
│                    │    kiwi_cli         │               │
│                    │  Shared Library     │               │
│                    └─────────────────────┘               │
└──────────────────────────────────────────────────────────┘
```

## Three Source Packages

### `kiwi_cli` — Shared Infrastructure

The core library shared by both TUI and CLI. Contains:

- **Authentication:** TokenManager with secure storage, cross-process locking, atomic writes
- **API Client:** HTTP client wrapper with login, refresh, file upload, SSE streaming
- **Models:** Pydantic models for AuthTokens, LoginCredentials, AppConfig
- **Commands:** Action/run list/get handlers and slash command dispatcher
- **Server Resolution:** Preset name → URL mapping
- **Checkpoints:** File snapshot and rewind system
- **Terminal Mode:** Non-interactive scripting interface

### `kiwi_tui` — Textual TUI Application

The full-screen terminal interface. Contains:

- **Main App:** AutobotsTUI — lifecycle, SSE streaming, runtime management
- **12 Screens:** Login, Dashboard, Terminal Dashboard, Help, File Browser, Runtime Logs, Runtime Cleanup, Slash Picker, ID Picker, Command Result, Attach Content, Detach Files
- **Widgets:** ChatInput (multi-line with history), StatusBadge, StatCard, ActionButton
- **Runtime Agent:** Process spawning, tracking, validation, cleanup
- **Worktrees:** Git worktree creation for isolated AI work

### `kiwi_runtime` — WebSocket Runtime Agent

A standalone process that:

- Connects to the Kiwi server via WebSocket
- Executes shell commands in a local PTY
- Provides a file system tool (17 operations)
- Integrates with the checkpoint system
- Supports interactive terminal sessions

## Data Flow

```
User types message in TUI
       │
       ▼
TUI sends message to Kiwi Server (HTTP POST)
       │
       ▼
Server processes with AI, returns run ID
       │
       ▼
TUI subscribes to SSE stream for real-time updates
       │
       ▼
AI requests terminal command via WebSocket
       │
       ▼
kiwi-runtime executes command locally
       │
       ▼
Output streams back to Server → TUI displays it
```

## Key Design Decisions

1. **Shared library pattern:** `kiwi_cli` is the single source of truth for auth, API, and models
2. **Runtime per run_id:** One runtime process per conversation — tracked on disk
3. **Atomic token storage:** Temp file + rename prevents corruption
4. **Cross-process locking:** Prevents refresh token races between TUI and CLI
5. **No persisted config:** Server is selected per invocation
6. **SSE streaming:** Real-time status without polling

## Technology Stack

| Layer | Technology |
|-------|-----------|
| TUI Framework | Textual ≥8.1.1 |
| CLI Framework | Typer ≥0.24.1 |
| API Client | httpx + OpenAPI SDK |
| WebSocket | websockets ≥14.1 |
| Data Validation | Pydantic ≥2.12.5 |
| Logging | Loguru ≥0.7.3 |
| Process Management | psutil ≥5.9.0 |
| Build System | Hatchling |
