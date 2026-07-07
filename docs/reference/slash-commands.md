# Slash Commands

Slash commands are the primary way to control Kiwi Code from within the TUI. Type `/` in the chat input to see autocomplete suggestions, or press `Ctrl+G` to open the command picker.

## How to Use

| Action | How |
|--------|-----|
| **Type a command** | Start typing `/` in the chat input — autocomplete shows matching commands |
| **Command picker** | Press `Ctrl+G` to browse all commands in a searchable modal |
| **Cancel** | Press `Escape` to clear a partially-typed slash command |
| **Arguments** | Commands that need arguments end with a trailing space — just type the value after |

Commands without arguments (like `/help`, `/new`, `/status`) execute immediately. Commands with arguments (like `/use `, `/name `) wait for you to type the value.

---

## Session

Commands for managing your conversation session.

### `/help`

Show all available slash commands in a modal.

```
/help
```

### `/new`

Start a fresh conversation. Cancels any in-progress streaming, clears the chat history, and resets to the default action.

```
/new
```

### `/status`

Show the current action ID, run ID, and action details. Useful for debugging or sharing your session state.

```
/status
```

### `/quit`

Quit Kiwi Code. You'll be prompted to clean up any running runtimes.

```
/quit
```

### `/use <action_id>`

Switch to a different action (AI model configuration). Starts a fresh chat with the new action. The action must exist in your account.

```
/use abc123def456
```

### `/autocode-select`

Choose which version of AutoCode to use. Opens a picker with available AutoCode variants.

```
/autocode-select
```

### `/name <new name>`

Rename the current run. The name appears in run lists and the cleanup prompt. Requires an active run (send a message first, or use `/continue`).

```
/name Fixing the auth bug
```

### `/continue <run_id>`

Continue an existing conversation. Loads the full chat history and resumes where you left off. The run must exist in your account.

```
/continue run_abc123
```

---

## Files

Commands for attaching files to your messages.

### `/upload <path> [path2 ...]`

Upload one or more files from your local machine. Files are attached to your **next message** — they're sent along with whatever you type next. Supports multiple paths.

```
/upload ~/screenshot.png
/upload src/main.py tests/test_main.py
```

After upload, a pending files bar appears above the input showing what's attached.

### `/files`

Show all currently pending file attachments. Lists the full S3 URLs.

```
/files
```

### `/detach`

Open a multi-select screen to remove specific pending attachments. Select files to detach, or choose "Detach All" to clear everything.

```
/detach
```

### `/clear-files`

Remove all pending file attachments at once.

```
/clear-files
```

---

## Checkpoints

Commands for managing file snapshots.

### `/rewind`

Restore files to the state they were in **before** a previous AI prompt. Opens a picker showing all checkpoint entries for the current run — each entry shows the prompt text and timestamp. Select one to rewind your working tree to that point.

```
/rewind
```

::: warning Cannot rewind during streaming
Wait for the current AI response to finish before using `/rewind`.
:::

See [Checkpoint System](/concepts/checkpoint-system) for details on how checkpoints work.

---

## Auth

Commands for managing your login session.

### `/login`

Open the login screen. Prompts for email and password. If you're already logged in, it tells you to `/logout` first.

```
/login
```

### `/logout`

Log out and clear saved tokens from `~/.kiwi/tokens.json`. You'll need to log in again to continue.

```
/logout
```

---

## Metadata

Commands for controlling metadata sent with each API request. Metadata affects how the AI processes your messages.

### `/metadata`

Show the effective metadata for the current run, including any overrides you've set.

```
/metadata
```

### `/metadata set <key> <value>`

Set a metadata field. Values are auto-typed: `true`/`false` become booleans, numbers become int/float, everything else is a string.

```
/metadata set process_url_in_text true
/metadata set attachment_requested 3
/metadata set custom_field hello world
```

### `/metadata remove <key>`

Remove a metadata override. The key reverts to its default value.

```
/metadata remove custom_field
```

### `/metadata clear`

Remove all metadata overrides at once. Everything resets to defaults.

```
/metadata clear
```

---

## Runtime

Commands for interacting with the local CLI runtime.

### `/show-logs`

Open the runtime logs screen. Shows real-time output from the `kiwi-runtime` process — commands being executed, their output, and any errors. Also accessible via `Ctrl+O`.

```
/show-logs
```

### `/runtime`

Runtime management commands. Currently disabled.

```
/runtime
```

---

## Theme

Commands for customizing the TUI appearance.

### `/theme`

Show the current theme and usage instructions.

```
/theme
```

### `/theme list`

List all available themes. The current theme is marked with `*`.

```
/theme list
```

### `/theme set <name>`

Set and persist a theme. The choice is saved and restored on next launch.

```
/theme set dracula
/theme set kiwi-black
```

### `/theme reset`

Reset to the Kiwi default theme (`kiwi-black`).

```
/theme reset
```

### `/theme <name>`

Shorthand — same as `/theme set <name>`.

```
/theme monokai
```

---

## Query (API)

Commands for listing and inspecting actions and runs via the API.

### `/actions list`

List recent actions. Supports optional filters:

```
/actions list
/actions list --name "AutoCode"
/actions list --limit 20
```

### `/actions get <id>`

Get detailed information about a specific action.

```
/actions get abc123
```

### `/runs list`

List recent runs. Supports optional filters:

```
/runs list
/runs list --action-id abc123
/runs list --status success
/runs list --limit 50
```

### `/runs get <id>`

Get detailed information about a specific run.

```
/runs get run_abc123
```

---

## Keyboard Shortcuts

In addition to slash commands, these keyboard shortcuts are always available:

| Shortcut | Action |
|----------|--------|
| `Ctrl+G` | Open command picker (browse all slash commands) |
| `Ctrl+O` | Open runtime logs (same as `/show-logs`) |
| `Ctrl+Q` | Quit Kiwi Code (same as `/quit`) |
| `Ctrl+L` | Log out (same as `/logout`) |
| `Ctrl+Shift+C` | Copy selected text |
| `Escape` | Clear partially-typed slash command |

---

## Quick Reference

| Category | Commands |
|----------|----------|
| **Session** | `/help` `/new` `/status` `/quit` `/use` `/autocode-select` `/name` `/continue` |
| **Files** | `/upload` `/files` `/detach` `/clear-files` |
| **Checkpoints** | `/rewind` |
| **Auth** | `/login` `/logout` |
| **Metadata** | `/metadata` `/metadata set` `/metadata remove` `/metadata clear` |
| **Runtime** | `/show-logs` `/runtime` |
| **Theme** | `/theme` `/theme list` `/theme set` `/theme reset` |
| **Query** | `/actions list` `/actions get` `/runs list` `/runs get` |
