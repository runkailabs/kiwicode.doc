import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Kiwi Code Docs',
  description: 'Developer documentation for Kiwi Code — the terminal-first AI coding assistant',
  lang: 'en-US',
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap' }],
  ],

  themeConfig: {
    logo: '/kiwi-logo.svg',

    nav: [
      {
        text: '📘 Guide',
        items: [
          { text: '🚀 Getting Started', link: '/guide/getting-started' },
          { text: '📦 Installation', link: '/guide/installation' },
          { text: '⚡ Quick Start', link: '/guide/quick-start' },
          { text: '🔐 Authentication', link: '/guide/authentication' },
        ]
      },
      {
        text: '📋 Reference',
        items: [
          { text: '💻 CLI (kiwicli)', link: '/reference/cli' },
          { text: '🖥️  TUI (kiwi)', link: '/reference/tui' },
          { text: '⚙️  Runtime', link: '/reference/runtime' },
          { text: '💬 Slash Commands', link: '/reference/slash-commands' },
          { text: '⌨️  Shortcuts', link: '/reference/keyboard-shortcuts' },
        ]
      },
      {
        text: '🧠 Concepts',
        items: [
          { text: '🤖 Runtime Agent', link: '/concepts/runtime-agent' },
          { text: '📸 Checkpoints', link: '/concepts/checkpoint-system' },
          { text: '🔗 API Communication', link: '/concepts/api-communication' },
          { text: '🌿 Worktrees', link: '/concepts/worktree-mode' },
        ]
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '📘 Guide',
          collapsed: false,
          items: [
            { text: '🚀 Getting Started', link: '/guide/getting-started' },
            { text: '📦 Installation', link: '/guide/installation' },
            { text: '⚡ Quick Start', link: '/guide/quick-start' },
            { text: '🔐 Authentication', link: '/guide/authentication' },
          ]
        }
      ],
      '/reference/': [
        {
          text: '📋 Reference',
          collapsed: false,
          items: [
            { text: '💻 CLI (kiwicli)', link: '/reference/cli' },
            { text: '🖥️  TUI (kiwi)', link: '/reference/tui' },
            { text: '⚙️  Runtime', link: '/reference/runtime' },
            { text: '💬 Slash Commands', link: '/reference/slash-commands' },
            { text: '⌨️  Shortcuts', link: '/reference/keyboard-shortcuts' },
            { text: '🖧  Servers', link: '/reference/server-presets' },
          ]
        }
      ],
      '/concepts/': [
        {
          text: '🧠 Concepts',
          collapsed: false,
          items: [
            { text: '🤖 Runtime Agent', link: '/concepts/runtime-agent' },
            { text: '📸 Checkpoints', link: '/concepts/checkpoint-system' },
            { text: '🔗 API Communication', link: '/concepts/api-communication' },
            { text: '🌿 Worktrees', link: '/concepts/worktree-mode' },
          ]
        }
      ]
    },

    // socialLinks: [
    //   { icon: 'github', link: 'https://github.com/runkailabs/kiwicode.doc' }
    // ],

    search: {
      provider: 'local'
    },

    footer: {
      message: 'Documentation for Kiwi Code',
      copyright: 'Copyright © 2025 Kiwi Code contributors'
    },

    // editLink: {
    //   pattern: 'https://github.com/runkailabs/kiwicode.doc/edit/main/docs/:path'
    // }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  }
})
