---
layout: home

hero:
  name: "Kiwi Code Docs"
  text: "Terminal-first AI coding assistant"
  tagline: Think fast. Code smarter. Automate everything.
  image:
    src: /kiwi-logo.svg
    alt: Kiwi Code
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
      # text: View on GitHub
      # link: https://github.com/runkailabs/kiwicode.doc

features:
  - icon: 🖥️
    title: Full-Screen TUI
    details: A rich terminal user interface built with Textual. Chat with AI, manage runs, upload files, and control your local runtime — all from your terminal.
  - icon: 🔧
    title: Local CLI Runtime
    details: A WebSocket agent that executes shell commands on your machine. The AI can read, write, edit, and search your codebase with full file system access.
  - icon: ⚡
    title: Terminal Mode
    details: Use Kiwi Code in plain terminal mode for scripting and automation. Pipe messages, get JSON output, and integrate with your existing workflows.
  - icon: 🔄
    title: Checkpoint & Rewind
    details: Every AI prompt snapshots your files. Rewind to any previous state with a single command. Experiment fearlessly.
  - icon: 🌿
    title: Git Worktrees
    details: Spawn isolated git worktrees for AI-assisted coding. Keep your main branch clean while the AI works in a sandboxed environment.
  - icon: 🎨
    title: Themeable
    details: Choose from dozens of built-in Textual themes or create your own. Your terminal, your style.
---

<div class="hero-demo">

## Try it in your terminal

```bash
# Install
pip install kiwi-ai

# Launch the full-screen TUI
kiwi

# Launch the full-screen TUI with full access
kiwi --scope full
```

</div>

<style>
.hero-demo {
  max-width: 680px;
  margin: 0 auto;
  padding: 48px 24px 64px;
}

.hero-demo h2 {
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-bottom: 24px;
}

.hero-demo div[class*='language-'] {
  border-radius: 12px;
  border: 1px solid var(--vp-c-bg-soft);
  box-shadow: 0 4px 24px rgba(0, 194, 255, 0.08);
}
.VPHero .actions .VPButton.brand {
  position: relative;
  padding: 0 26px 0 22px;
  min-height: 48px;

  border: 1px solid rgba(0, 194, 255, 0.6);
  border-radius: 8px;

  background: rgba(0, 194, 255, 0.1);
  color: #00c2ff;

  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  font-weight: 600;

  box-shadow:
    0 0 0 1px rgba(0, 194, 255, 0.05) inset,
    0 8px 30px rgba(0, 194, 255, 0.1);

  transition: all 0.2s ease;
}

.VPHero .actions .VPButton.brand::before {
  content: '>_';
  margin-right: 10px;

  color: #00c2ff;
  font-weight: 700;
}

.VPHero .actions .VPButton.brand:hover {
  color: #ffffff;
  background: #076180;
  border-color: #00c2ff;

  transform: translateY(-2px);

  box-shadow:
    0 10px 30px rgba(0, 194, 255, 0.3),
    0 0 24px rgba(0, 194, 255, 0.15);
}

.VPHero .actions .VPButton.brand:hover::before {
  color: #ffffff;
}

.VPHero .actions .VPButton.brand:active {
  transform: translateY(0) scale(0.98);
}
</style>
