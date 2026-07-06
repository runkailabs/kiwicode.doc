# Slash Commands

Slash commands are the primary way to control Kiwi Code from within the TUI. Type `/` in the chat input to see suggestions, or press `Ctrl+G` to open the command picker.

## Session

| Command | Description |
|---------|-------------|
| `/help` | Show all slash commands |
| `/new` | Start a new conversation with the default action |
| `/status` | Show current action ID and run ID |
| `/quit` | Quit Kiwi Code |
| `/use <action_id>` | Switch to a different action (starts fresh chat) |
| `/autocode-select` | Choose which version of AutoCode to use |
| `/name <new name>` | Rename the current run |
| `/continue <run_id>` | Continue an existing run and load its history |

## Files

| Command | Description |
|---------|-------------|
| `/upload <path> [path2 ...]` | Upload file(s) and attach to next message |
| `/files` | Show pending file attachments |
| `/detach` | Detach pending attachments (multi-select UI) |
| `/clear-files` | Clear all pending attachments |

## Checkpoints

| Command | Description |
|---------|-------------|
| `/rewind` | Rewind files to the state before a previous prompt |

## Auth

| Command | Description |
|---------|-------------|
| `/login` | Log in with email and password |
| `/logout` | Log out and clear saved tokens |

## Metadata

| Command | Description |
|---------|-------------|
| `/metadata` | Show effective metadata for the current run |
| `/metadata set <key> <value>` | Set a metadata field |
| `/metadata remove <key>` | Remove a metadata field |
| `/metadata clear` | Clear all metadata overrides |

## Runtime

| Command | Description |
|---------|-------------|
| `/show-logs` | Show local CLI runtime logs (also: `Ctrl+O`) |
| `/runtime` | Runtime commands (currently disabled) |

## Theme

| Command | Description |
|---------|-------------|
| `/theme` | Show current theme and usage |
| `/theme list` | List all available themes |
| `/theme set <name>` | Set and persist a theme |
| `/theme reset` | Reset to the Kiwi default theme |

## Query (API)

| Command | Description |
|---------|-------------|
| `/actions list [--name NAME] [--limit N]` | List recent actions |
| `/actions get <id>` | Get action details by ID |
| `/runs list [--action-id ID] [--status STATUS] [--limit N]` | List recent runs |
| `/runs get <id>` | Get run details by ID |

## Tips

- Commands that need arguments end with a trailing space (e.g., `/use `) — just type the value after
- Commands without arguments (e.g., `/help`, `/new`, `/status`) execute immediately
- Press **Escape** to clear a partially-typed slash command
- Use `Ctrl+G` to browse all commands in a picker modal
