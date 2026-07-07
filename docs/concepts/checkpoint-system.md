# Checkpoint System

Kiwi Code's checkpoint system lets you rewind your workspace to the state before any previous AI prompt. Think of it as "undo" for AI-assisted code changes — experiment fearlessly, knowing you can always go back.

## Quick Start

```
/rewind
```

Type `/rewind` in the TUI. A picker opens showing your prompt history. Select a prompt to restore your files to the state **before** that prompt was sent.

---

## How It Works

### The Snapshot Cycle

```
  1. User sends prompt
         │
         ▼
  2. Runtime snapshots current file states
     (only files the AI is about to modify)
         │
         ▼
  3. AI makes changes to files
         │
         ▼
  4. User can /rewind to restore pre-prompt state
```

### Step by Step

1. **Before each prompt**, the runtime calls `append_prompt_entry()` — creating a new numbered entry in `rewind.json` with the user's prompt text and timestamp.

2. **Before modifying any file**, the runtime snapshots the file's current content. The snapshot is stored as raw bytes under `Snapshots/` with a versioned filename. The file record (root, path, existed, snapshot path) is attached to the current prompt entry.

3. **After the AI finishes**, `update_latest_from_entry()` refreshes `latest.json` with the current state of all touched files — keeping the "Latest Code" snapshot accurate.

4. **When you `/rewind`**, the system computes a restore plan and applies it. Files are restored to their pre-prompt state from the stored snapshots.

---

## Storage Layout

All checkpoint data lives under `~/.kiwi/runs/<run_id>/`:

```
~/.kiwi/runs/<run_id>/
├── Snapshots/                        # Raw file snapshots
│   ├── w-src-auth-v000001.py         # Workspace file snapshot
│   ├── w-src-auth-v000002.py         # Later version of same file
│   └── ...
├── rewind.json                       # Prompt history + file change records
├── latest.json                       # "Head" snapshot (latest code state)
├── active_checkpoint.json            # Current checkpoint tracking
├── meta.json                         # Workspace metadata (roots, scope)
└── snapshot_index.json               # Monotonic version counter
```

### File Purposes

| File | Purpose |
|------|---------|
| `rewind.json` | The main journal — every prompt and every file it touched |
| `latest.json` | Snapshot of the most recent state of all tracked files. Created on first `/rewind`. Enables "Latest Code" option |
| `active_checkpoint.json` | Tracks `entry_id` (for runtime) and `state_entry_id` (for smart rewind) |
| `meta.json` | Workspace root path, scope mode, and root ID mappings |
| `snapshot_index.json` | Monotonic counter (`next_version`) for unique snapshot filenames |
| `Snapshots/` | Raw file content snapshots, named `{root}-{path}-v{version}.{ext}` |

### Snapshot Naming

```
{root_id}-{flattened_path}-v{version}.{ext}

Examples:
  w-src-auth-v000001.py          # Workspace: src/auth.py, version 1
  w-tests-test_auth-v000003.py   # Workspace: tests/test_auth.py, version 3
  a0-var-log-syslog-v000001.log  # Allowed dir a0: /var/log/syslog
```

Paths are flattened: `/` replaced with `-`, version zero-padded to 6 digits.

---

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
        },
        {
          "root": "w",
          "path": "tests/test_auth.py",
          "existed": true,
          "snapshot": "Snapshots/w-tests-test_auth-v000002.py"
        }
      ]
    },
    {
      "id": 2,
      "datetime": "2025-07-06T10:35:00+00:00",
      "user_prompt": "Add error handling",
      "files": [
        {
          "root": "w",
          "path": "src/auth.py",
          "existed": true,
          "snapshot": "Snapshots/w-src-auth-v000003.py"
        }
      ]
    }
  ]
}
```

Each entry records:

| Field | Description |
|-------|-------------|
| `id` | Auto-incrementing entry number |
| `datetime` | UTC timestamp when the prompt was sent |
| `user_prompt` | The exact text the user sent |
| `files` | Every file the AI touched in this prompt turn |

Each file record:

| Field | Description |
|-------|-------------|
| `root` | Root ID (`w`, `fs`, `a0`, `a1`, ...) |
| `path` | Relative path from the root |
| `existed` | Whether the file existed before the AI touched it |
| `snapshot` | Path to the snapshot file (relative to run directory) |

---

## Smart Restore

Kiwi Code tracks which prompt state you're currently in via `active_checkpoint.json`. This enables smarter, more efficient restores:

### Moving Backwards (prompt 5 → prompt 3)

Only reverts the files changed in prompts 3–4. No need to restore head first — just apply the minimal revert range.

```
Current state: after prompt 5
Target: before prompt 3
Action: revert only prompts [3, 4]
Files changed: only those touched in prompts 3 and 4
```

### Moving Forwards (prompt 3 → prompt 5)

Restores head (latest code) first, then reverts to the target. Computes the net number of files changed.

```
Current state: after prompt 3 (rewound)
Target: before prompt 5
Action: restore head → revert to prompt 5
Files changed: net difference between current and target
```

### "Latest Code"

Returns to the most recent state of all tracked files. Uses `latest.json` which is kept up-to-date after every prompt.

### Same Entry

No-op — returns immediately with 0 changes.

---

## Tracked Directories (Roots)

| Root ID | Description | When Active |
|---------|-------------|-------------|
| `w` | Workspace root (current directory) | Always |
| `fs` | Filesystem root | Full scope mode only |
| `a0`, `a1`, ... | Additional allowed directories | Restricted mode with `--allow` |

Roots are stored in `meta.json` and never deleted once created — `rewind.json` references them by ID, so removing a root would break existing entries.

---

## Safety Features

| Feature | Description |
|---------|-------------|
| **Root escape prevention** | Files cannot be restored outside their allowed root directory. Symlinks are resolved before validation |
| **Directory protection** | Only files are snapshotted — directories raise errors. If a directory exists where a file is expected, the restore fails safely |
| **Idempotent recording** | Recording the same file twice for the same prompt is a no-op (checked by `root::path` key) |
| **Content comparison** | Before restoring, compares current file content with snapshot. Skips restore if already matching |
| **Atomic writes** | All JSON files use temp file + `os.replace()` to prevent corruption from crashes or concurrent access |
| **Monotonic versions** | Snapshot filenames use a global counter — no collisions, no overwrites |

---

## Using Rewind

### In the TUI

```
/rewind
```

Opens a picker showing:

| Column | Content |
|--------|---------|
| ID | Entry number |
| Time (UTC) | When the prompt was sent |
| Prompt | First 80 characters of the prompt text |

Plus a "Latest Code" option to return to the most recent state.

::: warning Cannot rewind during streaming
Wait for the current AI response to finish before using `/rewind`.
:::

### What Happens During Restore

For each file in the restore plan:

1. Resolve the absolute path from root ID + relative path
2. Validate the path is within the root (no escape)
3. If the file didn't exist before (`existed: false`): delete it
4. If the file existed: read the snapshot, compare with current content, restore if different
5. Parent directories are created if missing

---

## Limitations

| Limitation | Detail |
|------------|--------|
| **Files only** | Only files are snapshotted, not directories. If a directory exists where a file is expected, restore fails |
| **Disk usage** | Snapshots are raw bytes — large files consume proportional disk space. No compression or deduplication |
| **Tracked files only** | Only files the AI is known to have touched are tracked, not all files in the workspace |
| **Single run scope** | Checkpoints are per-run. You can't rewind across different conversations |
| **No partial restore** | `/rewind` restores all files to the target state. You can't pick individual files |

---

## Troubleshooting

### "No checkpoints yet for this run"

You need to send at least one prompt and let the AI modify files before `/rewind` has anything to show.

### "Error loading checkpoints"

This usually means `rewind.json` is corrupted. Check `~/.kiwi/runs/<run_id>/rewind.json` — you can delete it to start fresh (you'll lose rewind history for that run).

### Restore fails with "Refusing to restore outside root"

A file path in `rewind.json` resolves outside its allowed root. This can happen if you moved the workspace or changed `--allow` directories mid-run. The system refuses to restore for safety.

### Disk space concerns

Snapshot files accumulate over long runs. To clean up:

```bash
# Remove all checkpoint data for a specific run
rm -rf ~/.kiwi/runs/<run_id>/

# Remove all checkpoint data
rm -rf ~/.kiwi/runs/
```
