# Pokemon Copilot — Server

Fastify API for [Pokemon Copilot](../README.md). One module per resource under `src/modules/<name>/` (routes → controller → service → types), backed by SQLite via Prisma.

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

The [client](../client/README.md) expects this server on port `3333` by default.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | yes | SQLite connection string, e.g. `file:./prisma/dev.db` |
| `PORT` | yes | Port to listen on (`3333` locally) |
| `CORS_ORIGIN` | no | Comma-separated list of allowed origins; defaults to `http://localhost:5173` |

See `.env.example` for a starting point.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | `tsx watch src/server.ts` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run the compiled build |
| `npm run prisma:generate` | Regenerate the Prisma client |
| `npm run prisma:migrate` | Run/create a dev migration |
| `npm run prisma:studio` | Open Prisma Studio |

`npm run lint` exists but eslint isn't configured — use `typecheck` instead. No test suite exists — verify changes with `typecheck` and by running the app.

## Tech stack

- Fastify 5, TypeScript
- Prisma + `better-sqlite3` (SQLite)
- Zod for request validation and DTO schemas
- [PokeAPI](https://pokeapi.co/) as the data source, cached permanently in a `PokeApiCacheEntry` table (species/move/type data is treated as immutable)

## Deployment

Fly.io, deployed manually via `fly deploy` (no CI/auto-deploy). The production database lives on a persistent volume; migrations run as part of the container's startup command, not a Fly `release_command` (see `CLAUDE.md` for why). The machine scales to zero when idle by default, so the first request after idle time can take a few seconds.

## More detail

See [`CLAUDE.md`](CLAUDE.md) for the full architecture (PokeAPI generation/version-group logic, battle/moveset scoring heuristics, error handling conventions) and deployment gotchas (Docker build quirks, CORS setup, cold starts).
