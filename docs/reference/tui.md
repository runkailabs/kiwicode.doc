# TUI Reference (`kiwi`)

The `kiwi` command launches the full-screen Textual TUI — the primary interactive interface for Kiwi Code.

## CLI Flags

```bash
kiwi [OPTIONS]
```

| Flag | Description |
|------|-------------|
| `--server` | Server preset (`app`, `dev`, `local`) or full URL |
| `--scope` | Runtime scope: `restricted` (default) or `full` |
| `--allow PATH` | Repeatable; additional allowed directories in restricted mode |
| `--terminal` | Run in plain terminal mode instead of full-screen TUI |
| `--action-id ID` | Start fresh conversation for given action |
| `--run-id ID` | Continue an existing run |
| `--connect-cli` | Ensure runtime exists and send connect prompt |
| `--json` | Machine-readable JSON output (terminal mode) |
| `--no-stream` | Wait for final result without live streaming |
| `--worktree NAME` / `-w NAME` | Create/use a git worktree for isolated AI work |
| `--version` | Show version and exit |

## Screens

### Login Screen

The first screen you see if not authenticated. Shows:
- ASCII art Kiwi logo
- Server, mode (scope), and working directory
- Email + password fields

### Dashboard (Main Chat)

The main interface where you interact with the AI:

- **Chat area:** Scrollable message history with user and assistant messages
- **Chat input:** Multi-line text area with history navigation, slash command autocomplete, and `@` file picker
- **Status bar:** Current action, run ID, and processing status

### Help Screen

Press `Ctrl+G` or type `/help` to see all available slash commands. You can copy any command to your clipboard.

### File Browser

Type `/upload` or use `Ctrl+U` to open the file browser. Navigate directories and select files to attach to your next message.

### Runtime Logs

Press `Ctrl+O` or type `/show-logs` to view the live output of your local `kiwi-runtime` process. When the AI runs an interactive command, you can type input directly in this screen.

### Runtime Cleanup

When you quit (`Ctrl+C`), Kiwi Code shows a cleanup prompt listing all running runtimes. Choose which to terminate or keep them all running.

## Chat Input Features

### `@` File Picker

Type `@` at the start of the input to open an inline file picker:
- Shows files and directories in your current working directory
- Filter by typing after `@`
- Arrow keys to navigate, Enter to select
- Directories are entered (navigated into)
- Files are selected and attached to your message

### Drag-and-Drop

Paste file paths from your terminal's drag-and-drop. Kiwi Code detects valid file paths and automatically attaches them.

### Slash Command Autocomplete

Type `/` to see command suggestions. Press Tab to accept.

### History Navigation

Press ↑/↓ when the cursor is at the top or bottom of the input to navigate through your message history.

## Terminal Mode

Use `kiwi --terminal` for non-interactive, scriptable usage:

```bash
# New conversation
kiwi --terminal "Explain this codebase"

# Specific action
kiwi --terminal --action-id <ID> "Hello"

# Continue existing run
kiwi --terminal --run-id <ID> "What changed?"

# Pipe input
echo "Summarize" | kiwi --terminal --run-id <ID>

# Connect runtime
kiwi --terminal --connect-cli

# JSON output
kiwi --terminal --json --action-id <ID> "Hello"
```
