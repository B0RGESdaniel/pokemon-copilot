# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. Package-specific commands, architecture, and deployment details live in `client/CLAUDE.md` and `server/CLAUDE.md` — Claude Code loads whichever of those is an ancestor of the current working directory automatically, alongside this one. This file only covers what's genuinely shared between the two.

## Project overview

Pokemon Copilot: a personal companion app for tracking a Pokémon save file (party, PC boxes, moves, held items) and getting matchup/moveset advice during battles. Two independent packages, no shared workspace tooling — `client` (Vite/React SPA) and `server` (Fastify API), run and versioned separately.

## Commands

Run from the respective package directory (`client/` or `server/`), not the repo root — there is no root `package.json`. See `client/CLAUDE.md` and `server/CLAUDE.md` for each package's command list.

Neither package has a test suite (no test runner installed, no test files in either). Verify changes with `typecheck`/`lint` and by running the app rather than proposing a test command that doesn't exist.

Both dev servers must run simultaneously for the app to work end-to-end (client on Vite's default port, server on 3333).

## Cross-cutting

- The client has **no generated/shared types** from the server — DTOs are hand-duplicated in `client/src/types/*.ts` matching the server's `*.types.ts` shapes. When changing a server DTO shape, update the matching client type by hand. Same pattern for the `GENERATION_GAMES` table (`client/src/types/saves.ts` / `server/src/modules/save/save.games.ts`) — a hand-curated, hardcoded map of valid game/generation combinations (not fetched from PokeAPI live), used both for the client's save-creation `Select` options and the server's `createSaveSchema` cross-field validation. Keep both copies in sync; the comment in the server file explains why specific PokeAPI version-groups were excluded (JP-only variants, spin-offs, DLC-only groups, games PokeAPI has no moveset data for yet).
- Existing code comments (in Portuguese) explain non-obvious *why* — historical PokeAPI quirks, deliberate scope cuts, SQLite limitations. Read them before changing the surrounding logic; they usually record a constraint that isn't visible from the code alone. Write new comments in English going forward.
- Deployment is split across `server/CLAUDE.md` (Fly.io) and `client/CLAUDE.md` (Vercel), but the two are coupled via CORS: the server's `CORS_ORIGIN` Fly secret must list every client Vercel domain actually in use, and needs updating whenever that changes (see the last bullet of `client/CLAUDE.md`'s Deployment section and the CORS bullet of `server/CLAUDE.md`'s).
