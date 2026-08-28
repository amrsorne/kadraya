# Kadraya

Malay-first web app for creating, managing, and sending digital Hari Raya greeting cards (*kad raya*). Compose a festive card with templates, colors, photos, and stickers, then send it to another user or share a link.

This MVP uses **dummy auth** and a **localStorage-backed database** — no real backend yet.

## Features

- Dummy login / registration with seeded demo accounts
- Card studio: 6 festive templates, color palettes, letter fields, photo upload, draggable stickers
- Draft, sent, and inbox management
- Send to another dummy user (same-browser inbox)
- Shareable public link at `/k/:token`

## Tech stack

- **Monorepo:** pnpm workspaces + Turborepo
- **Web:** React 19, Vite, TypeScript, Tailwind CSS
- **Data:** TanStack Router, Query, Form
- **Packages:** `@kadraya/shared` (schemas/types), `@kadraya/api` (localStorage API layer)

## Project structure

```
apps/web/           # Vite SPA
packages/shared/    # Zod schemas + shared types
packages/api/       # API interface (localStorage implementation)
turbo.json          # Turborepo pipeline
pnpm-workspace.yaml
```

## Getting started

**Requirements:** Node.js 20+, pnpm 10+

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

### Other commands

```bash
pnpm build       # Production build (all packages)
pnpm typecheck   # TypeScript check
pnpm lint        # Lint (placeholder scripts)
```

## Demo accounts

| Username | Password   |
|----------|------------|
| aminah   | any value  |
| faizal   | any value  |
| siti     | any value  |

You can also register a new account via **Daftar**.

### Quick demo flow

1. Log in as `aminah`
2. Create a kad in **Studio**, customize it, and save the draft
3. **Hantar** to `faizal` and copy the share link
4. Log out, log in as `faizal`, and check **Peti Masuk**

## Routes

| Route | Description |
|-------|-------------|
| `/login`, `/daftar` | Auth |
| `/` | Dashboard |
| `/studio`, `/studio/:id` | Create / edit draft |
| `/draf`, `/dihantar`, `/peti-masuk` | Lists |
| `/lihat/:id` | View a card (authenticated) |
| `/k/:token` | Public share view |

## Limitations (v1)

- **localStorage is per-browser** — inbox delivery between dummy accounts only works on the same machine/browser
- Share links resolve only if the card exists in that browser's storage
- No real backend, email, PDF export, or multi-device sync

## Architecture note

The web app never reads or writes `localStorage` directly. All data goes through `@kadraya/api`, which mirrors the shape a future HTTP API would expose — so swapping to a real backend later should not require rewriting the studio UI.
