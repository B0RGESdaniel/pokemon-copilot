# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Pokemon Copilot: a personal companion app for tracking a Pokémon save file (party, PC boxes, moves, held items) and getting matchup/moveset advice during battles. Two independent packages, no shared workspace tooling — `client` (Vite/React SPA) and `server` (Fastify API), run and versioned separately.

## Commands

Run from the respective package directory (`client/` or `server/`), not the repo root — there is no root `package.json`.

**client**
- `npm run dev` — Vite dev server (expects the API at `http://localhost:3333/api`, override with `VITE_API_URL`)
- `npm run typecheck` — `tsc -b`
- `npm run lint` — oxlint
- `npm run build` — typecheck + Vite build

**server**
- `npm run dev` — `tsx watch src/server.ts` (port from `PORT` env, see `.env`)
- `npm run typecheck` — `tsc --noEmit`
- `npm run build` / `npm start` — compile to `dist/` and run
- `npm run prisma:generate` / `npm run prisma:migrate` / `npm run prisma:studio`
- `npm run lint` exists in package.json but eslint is not installed/configured — it currently fails with `eslint: command not found`. Don't rely on it; use `typecheck` instead.

No test suite exists in either package (no test runner installed, no test files). Verify changes with `typecheck` and by running the app (`npm run dev` in both packages) rather than proposing a test command that doesn't exist.

Both dev servers must run simultaneously for the app to work end-to-end (client on Vite's default port, server on 3333).

## Architecture

### Server (`server/src`)

Fastify app, one module per resource under `src/modules/<name>/`, each with a consistent 4-file shape: `*.routes.ts` (registers endpoints, prefixed with `/api` in `app.ts`) → `*.controller.ts` (parses/validates request with Zod, calls service) → `*.service.ts` (business logic, Prisma calls) → `*.types.ts` (Zod schemas + DTOs). Follow this shape for new modules.

- **Persistence**: SQLite via Prisma (`server/prisma/schema.prisma`). No enums/JSON columns (SQLite limitation) — fields like `Pokemon.location` (`"PARTY" | "PC"`) and `BattleSession.status` (`"active" | "ended"`) are plain strings validated at the application layer, matched by the corresponding union type in `*.types.ts`. `Pokemon.moves` is a JSON-stringified array in a text column, parsed in `pokemon.service.ts::toDTO`.
- **Save-scoped data**: every domain entity hangs off a `Save` (game + generation). Almost every service function takes a `saveId` and validates it exists via `save.service.ts::getSaveOrThrow` before doing anything else.
- **PokeAPI integration** (`src/lib/pokeapi/`, `src/modules/pokeapi/`): `client.ts` fetches from the public PokeAPI with retry/backoff; `cache.ts` wraps any fetch in a permanent (no-TTL) cache backed by the `PokeApiCacheEntry` table, keyed by strings like `pokemon:{id}`, `move:{name}`, `type:{name}` — species/move/type data from PokeAPI is treated as immutable. `pokeapi.service.ts` maps raw PokeAPI shapes to app DTOs and holds the generation/version-group logic:
  - `getSpeciesByGeneration` is cumulative (fetches gen 1..N and merges) since a single `/generation/{n}` call only returns species *introduced* in that generation.
  - `getTypeChartByGeneration` reconstructs historical type effectiveness using `past_damage_relations`, since type matchups have changed across generations (e.g. Steel/Dark didn't exist before Gen 2).
  - `getVersionGroupForGame` resolves a save's `game` string (e.g. `"platinum"`) to the exact moveset-relevant version group, since a `generation` groups multiple games with slightly different learnsets.
- **Battle logic** (`battle.service.ts`, `moveset.service.ts`): `BattleSession` is one row per save (upserted, not historized — starting a new battle overwrites the previous session's opponent/state). Matchup scoring (`computeMatchup`) and move scoring (`scoreMove`, used for moveset suggestions and level-up move-learning) are heuristics, not a full damage engine — see the inline rationale comments in those files before changing the scoring formulas, since a lot of the shape is driven by what PokeAPI does/doesn't expose historically (e.g. no per-generation physical/special split before Gen 4).
- **Errors**: services throw `HttpError(statusCode, message)` (`middlewares/errorHandler.ts`); the central error handler also translates `ZodError` to 400 and passes through Fastify's own 4xx errors. Don't catch-and-format errors inside services — throw `HttpError` and let the handler serialize it.

### Client (`client/src`)

Single-page app, no router — `app/App.tsx` owns top-level view state (active save, tab, open modals) via `useState`, not URL-driven.

- **Data layer**: TanStack Query for all server state. `hooks/data.ts` and `hooks/useBattle.ts` wrap `api/*.ts` fetch functions with `useQuery`/`useMutation`; query keys are centralized in `api/queryKeys.ts` — reuse/extend that object rather than inlining key arrays. `api/client.ts` has the raw `get/post/put/patch/del` helpers (thin fetch wrapper, throws `ApiError`).
- **Save selection**: `useSaves` (`hooks/data.ts`) persists the selected save id to `localStorage` and is the source of truth for which save the rest of the app operates on; `App.tsx` gates rendering on save selection/loading state before mounting `MainApp`.
- **Styling**: Tailwind v4 (`@tailwindcss/vite`, no separate config file needed) + `tailwind-variants` for component-level variant styling (see `utils/effectiveness.ts::effectivenessTier` or `components/primitives.tsx` for the pattern). Theme tokens (colors like `bg`, `ink`, `text-muted`) are Tailwind theme values, not ad hoc classes.
- **Duplicated domain logic**: `client/src/utils/effectiveness.ts::multiplierAgainst` intentionally mirrors `server/src/modules/battle/battle.service.ts::multiplierAgainst` — it's a client-side read over a type chart the server already computed and sent down, not an independent implementation. If the effectiveness formula changes, change both.
- **Feature structure**: `features/<domain>/` holds screen-level components (e.g. `features/battle/BattleTab.tsx`, `features/pokemon/pages/*`); `components/` holds cross-feature primitives; `hooks/` holds data/state hooks; `app/Shell.tsx` holds chrome (header/nav) shared across tabs.

### Cross-cutting

- The client has **no generated/shared types** from the server — DTOs are hand-duplicated in `client/src/types/*.ts` matching the server's `*.types.ts` shapes. When changing a server DTO shape, update the matching client type by hand.
- Existing code comments (in Portuguese) explain non-obvious *why* — historical PokeAPI quirks, deliberate scope cuts, SQLite limitations. Read them before changing the surrounding logic; they usually record a constraint that isn't visible from the code alone. Write new comments in English going forward.
