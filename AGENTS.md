# Repository Guidelines

## Project Structure & Module Organization
- Root uses npm workspaces: `packages/backend` (Express + TS) and `packages/frontend` (React + Vite + TS).
- Backend: `src/core/*` (config, db, utils), `src/features/<domain>/{models,services,controllers,routes}`.
- Frontend: `src/core/*` (components, layouts, store), `src/features/<domain>/{components,pages,store,types}`.
- Database SQL: `database/setup.sql`, `database/auth_tables.sql`.

## Build, Test, and Development Commands
- Root dev (backend + frontend): `npm run dev`
- Build all: `npm run build`
- Install all workspaces: `npm run install:all`
- Clean node_modules/dist: `npm run clean`
- Backend: `npm run dev --workspace=backend`, `npm run build --workspace=backend`, `npm start --workspace=backend`, `npm run lint[ :fix] --workspace=backend`
- Frontend: `npm run dev --workspace=frontend`, `npm run build --workspace=frontend`, `npm run preview --workspace=frontend`, `npm run lint[ :fix] --workspace=frontend`

## Coding Style & Naming Conventions
- Language: TypeScript (strict). Indentation: 2 spaces, single quotes in JS/TS, trailing commas where valid.
- Paths: use aliases `@/*`, `@/core/*`, `@/features/*` (see tsconfig).
- Files: feature-first structure; keep files ≤ ~250 LOC; names in `PascalCase` for React components, `camelCase` for variables/functions, `UPPER_SNAKE_CASE` for constants.
- Linting: ESLint is configured in both packages. Run `npm run lint` before PRs.

## Testing Guidelines
- Backend ships with Jest deps; no tests yet. Prefer `*.test.ts` colocated under `src/`. If using TS, add `ts-jest` or compile tests to JS. Run: `npm test --workspace=backend` (after configuring).
- Frontend: testing libs not installed. If adding tests, prefer Vitest + Testing Library. Place in `src/**/__tests__` or `*.test.tsx`.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- PRs must include: concise description, screenshots for UI changes, reproduction or test notes, and linked issues. Keep changes scoped to one feature.

## Security & Configuration Tips
- Backend config uses `dotenv` + Zod validation. Set `PORT`, `JWT_SECRET` (≥32 chars), and DB vars: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`. Do not commit real secrets.
- Initialize DB: import `database/setup.sql` and `database/auth_tables.sql` into MySQL `kasir`. Example: `mysql -u <user> -p < database/setup.sql`.

## Architecture Notes
- Real-time via Socket.IO (backend `index.ts`).
- Follow feature-first modularity and keep imports through path aliases for clarity.

