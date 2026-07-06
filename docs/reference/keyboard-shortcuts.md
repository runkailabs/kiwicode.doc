# Keyboard Shortcuts

Kiwi Code's TUI is designed to be fully keyboard-driven. These shortcuts work even when the chat input is blocked during streaming.

## Global Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+C` | Quit (shows runtime cleanup prompt if runtimes are alive) |
| `Ctrl+O` | Open CLI runtime logs (`/show-logs`) |
| `Ctrl+G` | Open slash-command picker |
| `Ctrl+U` | Attach files / content (`@` picker) |
| `Ctrl+J` | Send message |

## Chat Input

| Key | Action |
|-----|--------|
| `Enter` | Submit message |
| `Shift+Enter` | Insert newline |
| `Ctrl+N` (macOS) | Insert newline |
| `Ctrl+A` | Select all text and copy to clipboard |
| `Escape` | Clear partially-typed slash command |
| `↑` | Previous message in history (when at top of input) |
| `↓` | Next message in history (when browsing history) |
| `@` | Open inline file picker (when typed as first character) |
| `/` | Trigger slash command autocomplete |
| `Tab` | Accept slash command suggestion |

## File Picker (`@` mode)

| Key | Action |
|-----|--------|
| `↑/↓` | Navigate files |
| `Enter` | Select file or enter directory |
| `Escape` | Close picker |
| `Tab` | Select highlighted file |

## Help Screen

| Key | Action |
|-----|--------|
| `Enter` | Copy highlighted command to clipboard |
| `C` | Copy highlighted command |
| `Escape` | Close help |

## Runtime Logs

| Key | Action |
|-----|--------|
| `Escape` | Go back to dashboard |
| `Ctrl+K` | Interrupt interactive session |

## Runtime Cleanup (Exit Prompt)

| Key | Action |
|-----|--------|
| `Space` / `T` | Toggle kill for highlighted runtime |
| `Y` | Mark highlighted runtime for kill |
| `N` | Unmark highlighted runtime |
| `Enter` / `Ctrl+S` | Exit (kill selected runtimes) |
| `Ctrl+Q` / `Q` | Exit (keep all runtimes running) |
| `Escape` / `B` / `Ctrl+C` | Go back to Kiwi Code (cancel quit) |

## Modals (General)

| Key | Action |
|-----|--------|
| `Escape` | Close modal / cancel |
