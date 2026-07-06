# Checkpoint System

Kiwi Code's checkpoint system lets you rewind your workspace to the state before any previous AI prompt. Think of it as "undo" for AI-assisted code changes — experiment fearlessly.

## How It Works

Before each AI prompt, Kiwi Code snapshots every file the AI might modify:

```
User sends prompt
       │
       ▼
Kiwi Code snapshots current file states
       │
       ▼
AI makes changes to files
       │
       ▼
User can /rewind to restore pre-prompt state
```

## Storage

Checkpoint data is stored under `~/.kiwi/runs/<run_id>/`:

```
~/.kiwi/runs/<run_id>/
├── Snapshots/                    # File snapshot storage
│   ├── w-src-foo-bar-v000001.py  # Snapshot files
│   └── ...
├── rewind.json                   # Prompt history + file change records
├── latest.json                   # "Head" snapshot (latest code)
├── active_checkpoint.json        # Current checkpoint state
├── meta.json                     # Workspace metadata
└── snapshot_index.json           # Next version counter
```

## Using Rewind

In the TUI, type:

```
/rewind
```

This opens a picker showing your prompt history. Select a prompt to restore your files to the state before that prompt was sent.

### Smart Restore

Kiwi Code tracks which prompt state you're currently in:

- **Moving backwards** (prompt 5 → prompt 3): Only reverts the files changed in prompts 3-4
- **Moving forwards** (prompt 3 → prompt 5): Restores head then reverts to target, showing net changes
- **"Latest Code"**: Returns to the most recent state of all files

## Safety Features

- **Root escaping prevention:** Files cannot be restored outside their allowed directories
- **Directory protection:** Only files are snapshotted (directories raise errors)
- **Idempotent recording:** Same file recorded twice for the same prompt is a no-op
- **Content comparison:** Skip restore if file content already matches the snapshot
- **Atomic writes:** All JSON files use temp + rename to prevent corruption

## Tracked Directories (Roots)

| Root ID | Description |
|---------|-------------|
| `w` | Workspace root (always tracked) |
| `fs` | Filesystem root (full scope mode only) |
| `a0`, `a1`, ... | Additional allowed directories (restricted mode) |

## rewind.json Structure

```json
{
  "schema_version": 1,
  "entries": [
    {
      "id": 1,
      "datetime": "2025-07-06T10:30:00+00:00",
      "user_prompt": "Fix the bug in auth.py",
      "files": [
        {
          "root": "w",
          "path": "src/auth.py",
          "existed": true,
          "snapshot": "Snapshots/w-src-auth-v000001.py"
        }
      ]
    }
  ]
}
```

## Limitations

- Only **files** are snapshotted, not directories
- Snapshots are stored as raw bytes — large files consume disk space
- The system tracks files the AI is known to have touched, not all files in the workspace
