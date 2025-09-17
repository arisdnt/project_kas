# Repository Guidelines

## Project Structure & Module Organization
Sistem POS monorepo uses npm workspaces under `packages/`. Backend lives in `packages/backend/src` with feature folders `core/` and `features/` plus migrations in `packages/backend/migrations`. Frontend code is in `packages/frontend/src` following feature-based pages, components, hooks, and types. Shared documentation sits in `dokumentasi/`, while database artifacts are in `database/` and backup scripts at repo root. Place new assets under `assets/`; keep tests beside the implementation or in `__tests__/` directories.

## Build, Test, and Development Commands
Run `npm run install:all` once to install every workspace. Use `npm run dev` from the repo root to start backend (Express) and frontend (Vite) together. Build both apps with `npm run build`, and clean generated artifacts via `npm run clean`. For backend-only flows use `npm run dev --workspace=backend`, `npm test --workspace=backend`, and `npm run lint --workspace=backend`. Frontend linting runs with `npm run lint --workspace=frontend`.

## Coding Style & Naming Conventions
TypeScript is in strict mode targeting ES2020 with CommonJS modules. Use two-space indentation, single quotes, and mandatory semicolons. React components and backend controllers/services/models use PascalCase (`ProdukController.ts`); hooks follow `useThing.ts`, stores `thingStore.ts`, routes `thingRoutes.ts`. Reference internal modules with the `@/*`, `@/core/*`, and `@/features/*` aliases instead of relative paths.

## Testing Guidelines
Backend tests rely on Jest and should follow Arrange–Act–Assert. Name files `*.test.ts` or `*.spec.ts` and colocate them with the code they verify. Mock external integrations, especially database and network calls. Maintain at least 80% coverage on new logic, and update snapshots when behaviour changes. No frontend test harness is configured yet; leave TODOs for future coverage.

## Commit & Pull Request Guidelines
Write Conventional Commits such as `feat: tambah endpoint produk` or `fix: perbaiki perhitungan stok`. Branches start with `feature/`, `fix/`, or `chore/`. Each PR must describe scope, link issues, note migrations or env changes, and include test evidence (`npm test --workspace=backend`). Ensure CI builds green before requesting review.

## Security & Configuration Tips
Never commit secrets; reference `.env` templates and document required keys in PRs. Rate limiting and CORS defaults live in `packages/backend/src/config`. Validate every inbound payload with Zod schemas and surface errors using the structured response helpers. Use the Pino logger for backend observability and redact sensitive claims before logging.
