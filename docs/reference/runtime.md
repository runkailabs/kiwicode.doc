# Runtime Reference (`kiwi-runtime`)

The Kiwi Runtime is a standalone WebSocket agent that connects to the Kiwi server and executes terminal commands on behalf of the AI. It's the bridge between the cloud AI and your local machine.

## Usage

```bash
kiwi-runtime connect [OPTIONS]
```

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--server` | Server preset (`app`, `dev`, `local`) or full URL | **Required** |
| `--token` | Access token for authentication | — |
| `--email` | Email for authentication | — |
| `--scope` | File system scope: `restricted` or `full` | `restricted` |
| `--allow PATH` | Repeatable; additional allowed directories (restricted mode) | — |
| `--runID` | Consumer/run ID for TUI integration | — |

## Scope Modes

### Restricted Mode (Default)

The runtime can only access files within the working directory. Additional directories can be allowed via `--allow`.

```bash
kiwi-runtime connect --server dev --scope restricted --allow /path/to/extra/dir
```

### Full Mode

The runtime can access the entire filesystem. Use with caution.

```bash
kiwi-runtime connect --server dev --scope full
```

## File System Tool

When connected, the AI can use these file operations on your machine:

| Operation | Description |
|-----------|-------------|
| `read_file` | Read file content (full, range, head, tail, chunk, grep) |
| `write_file` | Create or overwrite a file |
| `append_file` | Append content to a file |
| `replace_in_file` | Find and replace text in a file |
| `delete_path` | Delete file or directory |
| `mkdir` | Create directory |
| `list_dir` | List directory contents |
| `move_path` | Move/rename file or directory |
| `copy_path` | Copy file or directory |
| `stat_file` | Get file metadata |
| `search_in_file` | Search within a file |
| `search_in_files` | Recursive grep across files |
| `apply_unified_diff` | Apply a unified diff patch |
| `replace_line_range` | Replace specific line range |
| `insert_at_line` | Insert lines at position |
| `batch` | Execute multiple operations atomically |

## Standalone Usage

You can run the runtime independently (without the TUI) for debugging:

```bash
# From installed package
kiwi-runtime connect --server dev --scope restricted --allow "$PWD"

# From source
uv run python -m kiwi_runtime.main connect --server dev --scope restricted --allow "$PWD"
```

Press **Ctrl+C** to disconnect and exit.

::: warning
Standalone runtimes are **not tracked** in `~/.kiwi/runtimes/`. For normal usage, let the TUI manage the runtime via `/connect-cli`.
:::

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `PYTHONUNBUFFERED` | Set to `1` for unbuffered output |
| `PYTHONUTF8` | Set to `1` for UTF-8 mode (Windows) |
| `PYTHONIOENCODING` | Set to `utf-8:replace` |
| `KIWI_TUI_MANAGED` | Set to `1` when managed by TUI |
| `KIWI_RUNTIME_CONTROL_DIR` | Control directory for interactive sessions |

## Troubleshooting

### "CLI runtime stopped responding" after server redeploy

If the backend restarts, the runtime WebSocket may close. Run `/connect-cli` again in the TUI.

### Runtime not starting

Check that you're authenticated:

```bash
kiwi whoami
```

If not, run `kiwi login` first.
