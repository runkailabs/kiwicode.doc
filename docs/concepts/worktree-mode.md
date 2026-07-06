# Worktree Mode

Kiwi Code can create isolated git worktrees for AI-assisted coding. This lets the AI work in a sandboxed environment while your main branch stays clean.

## What is a Git Worktree?

A git worktree is an additional working directory attached to the same repository. Each worktree has its own branch and working files, but shares the same git history.

## Usage

```bash
# Create a worktree with a random name
kiwi -w

# Create a worktree with a specific name
kiwi -w my-feature
```

## How It Works

1. Kiwi Code creates a worktree at `.kiwi/worktrees/<name>/` inside your repo
2. A new branch `<name>` is created from `origin/HEAD` (or local `HEAD`)
3. The TUI launches with the worktree as the working directory
4. The AI's changes are isolated to the worktree branch

## Worktree Names

If you don't provide a name, Kiwi Code generates a random one in the format:

```
<adjective>-<verb>-<noun>
```

Examples: `bright-running-fox`, `calm-thinking-owl`, `swift-coding-hawk`

## Branch Strategy

- If a local branch `<name>` already exists → use it
- If a remote branch `origin/<name>` exists → create a local tracking branch
- Otherwise → create a new branch from `origin/HEAD` (or local `HEAD`)

## Safety Features

- **Stale worktree healing:** If a worktree is registered but missing on disk, Kiwi Code prunes and retries
- **Branch consistency:** If a worktree exists but is on a different branch, Kiwi Code warns you
- **Path validation:** Worktree paths are validated to stay within `.kiwi/worktrees/`
- **Commit requirement:** The repo must have at least one commit

## Example Workflow

```bash
# Start a worktree for a new feature
cd ~/my-project
kiwi -w add-auth

# In the TUI, ask the AI to implement authentication
# > Add JWT authentication to the API

# The AI works in .kiwi/worktrees/add-auth/
# Your main branch is untouched

# Review changes
cd .kiwi/worktrees/add-auth
git diff main

# Merge when ready
git checkout main
git merge add-auth
```

## Requirements

- **Git** must be installed and on your PATH
- You must be inside a git repository
- The repository must have at least one commit
