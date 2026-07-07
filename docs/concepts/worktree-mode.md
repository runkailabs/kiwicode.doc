# Worktree Mode

Worktree mode lets Kiwi Code work in an **isolated git worktree** — a sandboxed copy of your repository where the AI can read, write, and run commands without touching your main branch.

::: tip Why use worktrees?
- Keep your working branch clean while the AI experiments
- Review AI-generated changes before merging
- Run multiple AI sessions in parallel on different branches
- Safely test AI suggestions without fear of breaking things
:::

## Quick Start

```bash
# Generate a random worktree name and launch Kiwi inside it
kiwi -w

# Use a specific name
kiwi -w add-jwt-auth

# Same flags work with kiwi-runtime directly
kiwi-runtime -w refactor-db
```

That's it. Kiwi creates the worktree, switches into it, and launches the TUI — all in one command.

## How It Works

### Step by Step

1. **Locate the repo root** — Kiwi runs `git rev-parse --show-toplevel` to find your repository root
2. **Create the worktree directory** — A new folder is created at `.kiwi/worktrees/<name>/`
3. **Determine the base branch** — Kiwi tries `origin/HEAD` first (by running `git fetch origin`), falling back to local `HEAD`
4. **Create the branch** — A new branch `<name>` is created from the base ref
5. **Switch into the worktree** — The TUI or runtime launches with the worktree as its working directory

### Directory Layout

```
your-project/
├── .kiwi/
│   └── worktrees/
│       └── add-jwt-auth/    ← isolated worktree
│           ├── src/          ← same files as your repo
│           ├── .git/         ← points to main repo's git data
│           └── ...
├── src/                      ← your original files (untouched)
└── ...
```

The worktree shares the same git history as your main repo but has its own working directory and branch. Changes in the worktree don't affect your main checkout.

## Naming

### Auto-Generated Names

When you run `kiwi -w` without a name, Kiwi generates one in the format:

```
adjective-verb-noun
```

Examples: `calm-thinking-owl`, `swift-coding-hawk`, `bright-running-fox`

Names are generated using the `wonderwords` library and are always lowercase with hyphens.

### Custom Names

You can provide any valid git branch name:

```bash
kiwi -w fix-login-bug
kiwi -w feature/user-auth
kiwi -w experiment/rust-rewrite
```

## Branch Resolution

When you specify a worktree name, Kiwi resolves the branch as follows:

| Scenario | Behavior |
|----------|----------|
| Local branch `<name>` exists | Reuse the existing branch |
| Remote branch `origin/<name>` exists | Create a local tracking branch from `origin/<name>` |
| Neither exists | Create a new branch from `origin/HEAD` (or local `HEAD` if fetch fails) |

This means you can use `kiwi -w` to pick up an existing branch you've already started working on.

## Reusing Worktrees

If a worktree already exists at `.kiwi/worktrees/<name>/` and is on the correct branch, Kiwi reuses it instead of creating a new one. This is useful for:

- Resuming an AI session you started earlier
- Continuing work on a feature across multiple sessions
- Picking up where you left off after closing the TUI

```bash
# First session
kiwi -w build-api    # Creates worktree + branch "build-api"
# ... do work, close TUI ...

# Later — resumes the same worktree
kiwi -w build-api    # Reuses existing worktree, no recreation
```

## Safety Features

### Stale Worktree Healing

If a worktree is registered with git but the directory was deleted manually, Kiwi automatically runs `git worktree prune` and retries the creation. No manual cleanup needed.

### Branch Consistency Check

If a worktree folder exists but is on a different branch than expected, Kiwi warns you instead of silently proceeding:

```
Error: Worktree folder .kiwi/worktrees/my-feature is currently on branch
other-branch, expected my-feature.
Hint: Switch the worktree back to the expected branch, or choose a
different -w name.
```

### Path Validation

Worktree paths are validated to stay within `.kiwi/worktrees/`. Names containing `..` or absolute paths are rejected to prevent directory traversal.

### Commit Requirement

The repository must have at least one commit. If you try `kiwi -w` in a fresh repo with no commits, you'll get a clear error:

```
Error: This repository has no commits yet, so a worktree cannot be created.
Hint: Create an initial commit (e.g. add a README and commit) and try again.
```

### Git Requirement

Git must be installed and available on your `PATH`. If not, Kiwi exits with a clear message.

## Typical Workflow

```bash
# 1. Navigate to your project
cd ~/my-api-project

# 2. Start a worktree session
kiwi -w add-rate-limiting

# 3. In the TUI, ask the AI to implement the feature
#    > Add rate limiting middleware to the Express API

# 4. The AI works inside .kiwi/worktrees/add-rate-limiting/
#    Your main branch is completely untouched

# 5. Review the changes
cd .kiwi/worktrees/add-rate-limiting
git diff main   # or: git diff origin/main

# 6. When satisfied, merge back
git checkout main
git merge add-rate-limiting

# 7. Clean up the worktree (optional)
git worktree remove .kiwi/worktrees/add-rate-limiting
```

## Using with kiwi-runtime

Worktree mode also works when running `kiwi-runtime` directly:

```bash
kiwi-runtime -w my-experiment
```

This is useful when you want the runtime agent to operate in an isolated environment without the full TUI.

## Requirements

| Requirement | Details |
|-------------|---------|
| **Git** | Must be installed and on `PATH` |
| **Git repo** | Must run from inside a git repository |
| **At least one commit** | The repo must have an initial commit |

## Troubleshooting

### "Worktree is registered but missing on disk"

This happens when a worktree directory was deleted manually without telling git. Kiwi auto-heals this in most cases, but if it persists:

```bash
git worktree prune
```

### "Branch is already checked out in another worktree"

Choose a different worktree name, or remove the conflicting worktree:

```bash
git worktree list              # See all worktrees
git worktree remove <path>     # Remove a specific one
```

### "Worktree directory already exists but is not registered with git"

A folder exists at the worktree path but git doesn't know about it. Either:

```bash
rm -rf .kiwi/worktrees/<name>   # Remove it and retry
# or
kiwi -w <different-name>        # Use a different name
```
