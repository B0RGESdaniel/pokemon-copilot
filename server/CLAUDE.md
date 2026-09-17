# CLAUDE.md (server)

This file provides guidance to Claude Code when working in `server/`. See the repo root `CLAUDE.md` for project-wide context (what this app is, cross-cutting rules shared with `client/`).

## Commands

Run from this directory (`server/`) — there is no root `package.json`.

- `npm run dev` — `tsx watch src/server.ts` (port from `PORT` env, see `.env`)
- `npm run typecheck` — `tsc --noEmit`
- `npm run build` / `npm start` — compile to `dist/` and run
- `npm run prisma:generate` / `npm run prisma:migrate` / `npm run prisma:studio`
- `npm run lint` exists in package.json but eslint is not installed/configured — it currently fails with `eslint: command not found`. Don't rely on it; use `typecheck` instead.

No test suite exists (no test runner installed, no test files). Verify changes with `typecheck` and by running the app (`npm run dev`) rather than proposing a test command that doesn't exist. The client (`client/`) must also be running for the app to work end-to-end.

## Architecture

Fastify app, one module per resource under `src/modules/<name>/`, each with a consistent 4-file shape: `*.routes.ts` (registers endpoints, prefixed with `/api` in `app.ts`) → `*.controller.ts` (parses/validates request with Zod, calls service) → `*.service.ts` (business logic, Prisma calls) → `*.types.ts` (Zod schemas + DTOs). Follow this shape for new modules.

- **Persistence**: SQLite via Prisma (`server/prisma/schema.prisma`). No enums/JSON columns (SQLite limitation) — fields like `Pokemon.location` (`"PARTY" | "PC"`) and `BattleSession.status` (`"active" | "ended"`) are plain strings validated at the application layer, matched by the corresponding union type in `*.types.ts`. `Pokemon.moves` is a JSON-stringified array in a text column, parsed in `pokemon.service.ts::toDTO`.
- **Save-scoped data**: every domain entity hangs off a `Save` (game + generation). Almost every service function takes a `saveId` and validates it exists via `save.service.ts::getSaveOrThrow` before doing anything else.
- **PokeAPI integration** (`src/lib/pokeapi/`, `src/modules/pokeapi/`): `client.ts` fetches from the public PokeAPI with retry/backoff; `cache.ts` wraps any fetch in a permanent (no-TTL) cache backed by the `PokeApiCacheEntry` table, keyed by strings like `pokemon:{id}`, `move:{name}`, `type:{name}` — species/move/type data from PokeAPI is treated as immutable. `pokeapi.service.ts` maps raw PokeAPI shapes to app DTOs and holds the generation/version-group logic:
  - `getSpeciesByGeneration` is cumulative (fetches gen 1..N and merges) since a single `/generation/{n}` call only returns species *introduced* in that generation.
  - `getTypeChartByGeneration` reconstructs historical type effectiveness using `past_damage_relations`, since type matchups have changed across generations (e.g. Steel/Dark didn't exist before Gen 2).
  - `getVersionGroupForGame` resolves a save's `game` string (e.g. `"platinum"`) to the exact moveset-relevant version group, since a `generation` groups multiple games with slightly different learnsets.
- **Battle logic** (`battle.service.ts`, `moveset.service.ts`): `BattleSession` is one row per save (upserted, not historized — starting a new battle overwrites the previous session's opponent/state). Matchup scoring (`computeMatchup`) and move scoring (`scoreMove`, used for moveset suggestions and level-up move-learning) are heuristics, not a full damage engine — see the inline rationale comments in those files before changing the scoring formulas, since a lot of the shape is driven by what PokeAPI does/doesn't expose historically (e.g. no per-generation physical/special split before Gen 4).
- **Errors**: services throw `HttpError(statusCode, message)` (`middlewares/errorHandler.ts`); the central error handler also translates `ZodError` to 400 and passes through Fastify's own 4xx errors. Don't catch-and-format errors inside services — throw `HttpError` and let the handler serialize it.

## Deployment

Fly.io app `pokemon-copilot-api` (region `gru`), deployed manually via `fly deploy` from this directory — no CI, no auto-deploy on push. `Dockerfile` is a multi-stage build on `node:22-bookworm-slim` (not alpine — `better-sqlite3`'s native binding needs glibc); `fly.toml` mounts a persistent volume (`pokemon_copilot_data`) at `/data`, sets `DATABASE_URL=file:/data/prod.db`, and configures `http_service` with `min_machines_running = 0` (scales to zero when idle — expect a several-second cold start on the first request after idle time; bump to `1` if that becomes annoying — costs roughly $2/mo for the current `shared-cpu-1x:256MB` machine size if always on, unless the Fly account still has the legacy free compute allowance).

- **Migrations run in the app's own Docker `CMD`** (`npx prisma migrate deploy && node dist/src/server.js`), not via a `fly.toml` `release_command`. `release_command` runs on a separate ephemeral machine that does **not** mount the app's volume — migrations applied there hit a throwaway SQLite file while the real `/data` volume stays empty forever. This happened once in production (`release_command` reported success, but every real request failed with `no such table: main.Save`). Don't reintroduce `release_command` for migrations on this app.
- `prisma.config.ts` lives at the package root (not inside `prisma/`) and must be explicitly `COPY`'d into the Docker runtime stage — `COPY --from=build /app/prisma ./prisma` looks like it should cover it but doesn't. Without it, `prisma migrate deploy` silently fails to load the config and errors with a misleading `datasource.url property is required` instead of a "config not found" error.
- The Docker **build** stage needs a dummy `DATABASE_URL` (`ENV DATABASE_URL="file:./prisma/dev.db"`) purely so `prisma generate` can resolve `prisma.config.ts`'s `env("DATABASE_URL")` — `generate` never connects to a real database, so the value doesn't matter, but an *unset* var makes the config throw immediately.
- `prisma.config.ts`'s `process.loadEnvFile(".env")` must stay wrapped in try/catch — there's no `.env` file in the production container (Fly injects `DATABASE_URL`/`PORT`/`CORS_ORIGIN` directly as env vars/secrets), and an unguarded call throws on the missing file.
- `server.ts` binds `host: "0.0.0.0"` — required in a container; Fastify's default (`127.0.0.1`) isn't reachable from outside it.
- CORS is env-driven: `CORS_ORIGIN` (comma-separated list, read in `app.ts`) defaults to `http://localhost:5173` for local dev. The production value is a Fly secret and must list every client origin actually in use — update it whenever a Vercel domain changes (see `client/CLAUDE.md`'s Deployment section): `fly secrets set CORS_ORIGIN="https://a,https://b" -a pokemon-copilot-api` (setting a secret triggers a rolling restart automatically, no redeploy needed).
