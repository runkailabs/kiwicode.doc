# Kiwi Code Atlas

Developer documentation site for **Kiwi Code** — the terminal-first AI coding assistant.

- **Production:** https://kiwi-code-atlas.vercel.app
- **Docs source:** `./docs/` (VitePress)

---

## Tech stack

- **VitePress** (static docs)
- **Node.js** (dev tooling)
- **Vercel** (hosting)

---

## Local development

### 1) Install dependencies

```bash
npm install
```

### 2) Run the docs locally

```bash
npm run docs:dev
```

VitePress will print a local URL (usually `http://localhost:5173`).

### 3) Build + preview

```bash
npm run docs:build
npm run docs:preview
```

---

## Project structure

```text
.
├── docs/                  # VitePress site content
│   ├── guide/             # Getting started / setup
│   ├── reference/         # CLI / TUI / runtime references
│   ├── concepts/          # Architecture & core concepts
│   ├── public/            # Static assets (favicon, logo)
│   └── .vitepress/        # VitePress config + theme overrides
├── package.json           # VitePress scripts
└── .vercel/               # Vercel project linkage (local-only)
```

---

## Deployment (Vercel)

This repo is linked to a Vercel project via `.vercel/project.json`.

Typical workflow:

```bash
vercel deploy --prod
```

(You may need to run `vercel login` once on a new machine.)

---

## Contributing

1. Make changes under `docs/`
2. Run `npm run docs:dev` and verify pages render correctly
3. Commit your changes

---

## License

See the repository license (if present) or the organization policy.
