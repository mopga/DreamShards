# Shards of Dreams

"Shards of Dreams" is a TypeScript monorepo hosting a surreal 2D RPG MVP. The client is a Vite + React front end styled with TailwindCSS; the server is an Express API prepared for SQLite persistence via Drizzle ORM. Shared TypeScript contracts and JSON content power exploration, dialogue, combat, and progression systems across both layers.

## Project Layout

```
client/              React front end (Vite, Tailwind, Zustand-free state)
  src/app/          App shell and layout
  src/features/     Feature slices (combat, dialogue, exploration, save)
  src/state/        Central game state, content dictionaries
server/             Express server + Vite dev bridge
  src/routes/       API endpoints (`/api/save`, `/api/content/:key`)
  src/db/           Drizzle schema + better-sqlite3 driver
shared/             Cross-cutting types and JSON content
```

Key gameplay content lives under `shared/content/`:
- `palaceFear.json` – room graph for the Palace of Fear.
- `dialogueBeach.json` – branching Lister dialogue.
- `enemies.json`, `skills.json` – combat actors and abilities.

## Prerequisites

- Node.js 20 LTS (includes npm 10+).
- SQLite is bundled via `better-sqlite3`; no external service is required.

## Installation

```bash
npm install
```

This installs both runtime and development dependencies (including `@types/better-sqlite3` for the server).

## Available Scripts

### Type Check

```bash
npm run check
```
Runs the TypeScript compiler (`tsc`) against the entire monorepo.

### Development (client + server)

```bash
npm run dev
```
Starts the Express server (`server/src/index.ts`) via `tsx`. In development the server attaches Vite middleware, so the React client and API are served together on port 5000.

- Client entry: http://localhost:5000
- API endpoints: http://localhost:5000/api/*

### Production Build

```bash
npm run build
```
1. Builds the Vite client bundle into `client/dist`.
2. Bundles the Express server with esbuild into `dist/server/index.js`.

### Production Start

```bash
npm run start
```
Runs the bundled Express server (`node dist/server/index.js`) which serves static assets from `server/public`.

### Standalone Build

```bash
npm run build:standalone:win
```

Generates a self-contained distribution for the current platform (defaults to Windows x64 when run via the npm script):

1. Runs the standard production build if `dist/` is missing.
2. Copies the client bundle, bundled server, SQLite database, and native `better_sqlite3.node` binary into the standalone folder.
3. Uses [`pkg`](https://github.com/vercel/pkg) to compile `dist/server/index.js` into a platform-specific executable targeting Node.js 18.

To build for a different target explicitly, run the script directly and supply `--target <platform>-<arch>`, for example `node scripts/build-standalone.mjs --target win-x64` or `--target linux-arm64`. You can also pass `--platform` and `--arch` separately. Windows aliases such as `win`, `win32`, `win64`, and `windows64` are all accepted and normalized to the supported `win32` target.

The resulting folder contains the executable (`DreamShards.exe` on Windows, `DreamShards` elsewhere), the `public/` assets directory, a `server/dreamshards.db` starter database, and the `better_sqlite3.node` native module required by SQLite. Ship or zip the entire folder to run the game without a separate Node.js installation.

## Gameplay Flow

1. **Main Menu** – start a new dream or load the latest autosave.
2. **Dialogue** – converse with Lister on the Dream Beach; choices toggle flags and unlock skills.
3. **Exploration** – move through the Palace of Fear rooms, collect shards, trigger encounters, and initiate the boss gate.
4. **Combat** – turn-based system with weakness bonuses, status effects (Vulnerable, Weakened, Guarded), skills, and items.
5. **Ending** – post-boss epilogue reflects shard count and key decisions.

Auto-save runs whenever the game state changes outside the menu. Manual save/load buttons in the top bar call `localStorage`, and `Push to Shore` sends a snapshot to `/api/save` for future persistence work.

## Drizzle ORM & Database

- Schema: `server/src/db/schema.ts` (`saves` table).
- Config: `server/drizzle.config.ts` (SQLite file stored at `server/dreamshards.db` by default).
- Drizzle commands (examples):
  ```bash
  npx drizzle-kit generate
  npx drizzle-kit push
  ```

## Coding Standards

- TypeScript everywhere with strict mode enabled.
- TailwindCSS for styling; avoid bringing back the shadcn UI bundle removed during the rewrite.
- Shared types in `shared/types.ts` drive both runtime data and compile-time safety.

## Known Issues / TODOs

- `npm audit` reports low/moderate vulnerabilities from upstream packages (see install output).
- UI currently uses placeholder art hooks (`client/src/assets/README.md`).
- Remote persistence only stores raw snapshots; retrieval endpoints remain TODO.

Feel free to expand content JSON or add additional palaces by extending the shared schema and client state dictionaries.
