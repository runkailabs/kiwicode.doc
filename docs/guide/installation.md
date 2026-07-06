# Installation

## Requirements

- **Python:** 3.11, 3.12, or 3.13
- **OS:** Linux, macOS, Windows
- **Git:** Required for worktree mode (`kiwi -w`)

## Install via pip

```bash
pip install kiwi-code
```

## Install via uv

```bash
uv pip install kiwi-code
```

## Verify Installation

```bash
kiwi --version
# kiwi 0.0.445

kiwicli --version
# kiwicli 0.0.445

kiwi-runtime --help
# usage: kiwi-runtime connect [-h] --server SERVER ...
```

## Install from Source (Development)

```bash
git clone https://github.com/jetoslabs/kiwi-code.git
cd kiwi-code
uv sync
```

Then run with:

```bash
uv run python -m kiwi_tui.main --server dev
```

## Configuration Files

Kiwi Code stores its data under `~/.kiwi/`:

| File | Purpose |
|------|---------|
| `~/.kiwi/tokens.json` | Authentication tokens (permissions: `0600`) |
| `~/.kiwi/settings.json` | UI settings (theme, etc.) |
| `~/.kiwi/kiwi_tui.log` | Application logs (rotated at 10MB, kept 7 days) |
| `~/.kiwi/runtimes/` | Runtime process state |
| `~/.kiwi/runs/` | Checkpoint/rewind data |

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `KIWI_HOME_DIR` | Override the `~/.kiwi` directory location |
| `KIWI_DISABLE_REEXEC` | Disable process re-execution on startup |

## Uninstall

```bash
pip uninstall kiwi-code
rm -rf ~/.kiwi
```

## Next

- [Quick Start — log in and send your first message](/guide/quick-start)
