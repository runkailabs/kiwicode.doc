# Installation

## Requirements

- **Python:** 3.11, 3.12, or 3.13
- **OS:** Linux, macOS, Windows
- **Git:** Required for worktree mode (`kiwi -w`)

## Install

Choose the method that works best for your setup.

### pip

```bash
pip install kiwi-code
```

### pipx (macOS / Linux)

[pipx](https://pipx.pypa.io/) installs Kiwi Code in an isolated environment and makes the `kiwi` and `kiwicli` commands available globally.

```bash
pipx install kiwi-code
```

### uv

```bash
uv pip install kiwi-code
```

## Upgrade

To upgrade to the latest version:

```bash
# pip
pip install --upgrade kiwi-code

# pipx
pipx upgrade kiwi-code

# uv
uv pip install --upgrade kiwi-code
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
# pip
pip uninstall kiwi-code

# pipx
pipx uninstall kiwi-code

# Clean up data
rm -rf ~/.kiwi
```

## Next

- [Quick Start — log in and send your first message](/guide/quick-start)
