# Pokemon Copilot — Client

Vite + React single-page app for [Pokemon Copilot](../README.md). No router — `App.tsx` owns top-level view state directly.

## Setup

Requires the [server](../server/README.md) running locally on port `3333` (or a `VITE_API_URL` pointing somewhere else).

```bash
npm install
npm run dev
```

The dev server expects the API at `http://localhost:3333/api` by default. Override with a `VITE_API_URL` env var (must include the `/api` suffix) if your server runs elsewhere.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | oxlint |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview the production build locally |

No test suite exists — verify changes with `typecheck`/`lint` and by running the app.

## Tech stack

- React 19 + TypeScript, Vite
- Tailwind CSS v4, `tailwind-variants` + `class-variance-authority` for component variants
- [Base UI](https://base-ui.com) primitives, restyled per the [neobrutalism-components](https://neobrutalism.dev) registry (see `src/components/ui/`)
- TanStack Query for all server state, persisted to `localStorage` (`@tanstack/react-query-persist-client`) so reopening the app shows last-known data instantly instead of blocking on a fresh fetch
- `vite-plugin-pwa` — installable as a PWA with offline asset caching
- Icons from `pixelarticons`

## Deployment

Vercel project, auto-deploys on push to `main`. The project's **Root Directory must be set to `client`** in Vercel's settings (the repo has no root `package.json`). Production needs a `VITE_API_URL` env var pointing at the deployed server's `/api` path.

## More detail

See [`CLAUDE.md`](CLAUDE.md) for the full file-organization conventions, styling rules, and known gotchas (cascade layers, pixel-font sizing, PWA safe-area handling, etc.).
