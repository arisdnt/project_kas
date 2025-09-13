# Repository Guidelines

## Project Structure & Module Organization
- Root: Node workspaces (`packages/*`). Docs in `dokumentasi/`, shared assets in `assets/`.
- Backend (`packages/backend`): Express + TypeScript. Modules under `src` using path aliases `@/core/*`, `@/features/*`. Feature layout: `controllers/`, `services/`, `models/`, `routes/`.
- Frontend (`packages/frontend`): React + Vite + Tailwind. `src/core/*` for shared UI/utilities, `src/features/*` per domain.
- Migrations: `packages/backend/database/migrations/*.sql` (apply with your MySQL client).

## Build, Test, and Development Commands
- Install workspaces: `npm run install:all`
- Run both apps: `npm run dev` (backend + frontend concurrently)
- Build both: `npm run build`
- Clean artifacts: `npm run clean`
- Backend only: `npm run dev --workspace=backend`, `npm test --workspace=backend`, `npm run lint --workspace=backend`
- Frontend only: `npm run dev --workspace=frontend`, `npm run lint --workspace=frontend`, `npm run build --workspace=frontend`

## Coding Style & Naming Conventions
- TypeScript strict mode; 2-space indent, semicolons, single quotes.
- React components: PascalCase (e.g., `KategoriPage.tsx`), hooks `useThing.ts`, Zustand stores `thingStore.ts`.
- Backend files: `ProdukController.ts`, `ProdukService.ts`, `produkRoutes.ts` (route files camelCase + `Routes`).
- Use path aliases (`@/...`) instead of deep relatives. Run ESLint before pushing: `npm run lint --workspace=<pkg>`.

## Testing Guidelines
- Backend: Jest. Place tests as `*.test.ts` near code or under `__tests__/`. Run `npm test --workspace=backend` (add `--coverage` locally as needed).
- Frontend: no unit test setup yet; prefer manual/e2e verification. If adding complex logic, include lightweight tests or story-like examples.

## Commit & Pull Request Guidelines
- Use Conventional Commits when possible: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- PRs should include: clear description, linked issues, screenshots/GIFs for UI, and test steps. Require green `lint` and `build`.
- Keep diffs focused and avoid renaming public routes or breaking APIs without migration notes.

## Security & Configuration Tips
- Backend env: create `packages/backend/.env` (DB_*, JWT_*, CORS_*, MINIO_*). Do not commit production secrets. Default ports: API `PORT=3000`; Vite dev uses its default.
- Run frontend build before serving SPA from backend (`packages/frontend/dist`).
- Apply SQL in `packages/backend/database/migrations` to your MySQL instance before running the API.

## Agent-Specific Instructions
- Respect module boundaries and aliases; keep feature folders coherent.
- When changing models, update related services, controllers, and types together.
- Prefer minimal, surgical changes; add or adjust backend tests for affected logic.
