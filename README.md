# Pokemon Copilot

A personal companion app for tracking a Pokémon save file — party, PC boxes, moves, held items — and getting matchup/moveset advice during battles. Not a damage calculator or full battle simulator: matchup and move scoring are heuristics meant as a quick reference while you play, not a substitute for in-game combat.

Live at [pokemon-copilot.danielborges.me](https://pokemon-copilot.danielborges.me).

## Features

- Track your party and PC boxes for a save (species, level, nickname, held item, moves)
- Look up any Pokémon species available in your save's generation and add it to your team
- Get type-effectiveness matchup scoring against an opponent, and swap suggestions from your party
- Move scoring for moveset decisions and level-up move-learning
- Evolve Pokémon and manage multiple saves (different games/generations) side by side
- Installable as a PWA on mobile, with offline-friendly caching so reopening the app doesn't block on a fresh network fetch

## Tech stack

- **Client**: React 19 + TypeScript, Vite, Tailwind CSS v4, TanStack Query, Base UI (neobrutalism-styled components)
- **Server**: Fastify, TypeScript, Prisma + SQLite (`better-sqlite3`), Zod
- **Data source**: [PokeAPI](https://pokeapi.co/), cached permanently server-side (species/move/type data is immutable)

## Project structure

Two independent packages, no shared workspace tooling — there is no root `package.json`. Install and run each separately:

```
client/   Vite + React SPA
server/   Fastify API + Prisma/SQLite
```

See [`client/README.md`](client/README.md) and [`server/README.md`](server/README.md) for setup instructions for each. Both dev servers need to be running at the same time for the app to work end-to-end (client on Vite's default port, server on `3333`).

## Deployment

- **Client** → Vercel, auto-deploys on push to `main`
- **Server** → Fly.io, deployed manually via `fly deploy`

Deployment specifics (env vars, CORS, cold starts, migrations) are documented in each package's README and `CLAUDE.md`.

## Documentation for AI coding agents

Each package has its own `CLAUDE.md` (plus one at the repo root) with architecture notes, conventions, and known gotchas for tools like Claude Code — worth reading before making non-trivial changes.
