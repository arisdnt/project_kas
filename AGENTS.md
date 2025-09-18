# Repository Guidelines

## Project Structure & Module Organization
Sistem POS is a monorepo using npm workspaces under `packages/`. Backend logic sits in `packages/backend/src` split into `core/` utilities and `features/` domains, with database migrations in `packages/backend/migrations`. Frontend code lives in `packages/frontend/src` following feature-based pages, components, hooks, and types. Shared documentation resides in `dokumentasi/`, database artifacts in `database/`, and backup scripts at the repo root. Place new static assets inside `assets/`, and keep tests beside their implementations or under `__tests__/` folders.

## Build, Test, and Development Commands
Run `npm run install:all` once to bootstrap every workspace. Use `npm run dev` at the repo root to start Express and Vite together during development. Build both applications with `npm run build` and clean generated artifacts via `npm run clean`. Backend-only flows rely on `npm run dev --workspace=backend`, `npm test --workspace=backend`, and `npm run lint --workspace=backend`. Frontend linting is available through `npm run lint --workspace=frontend`.

## Coding Style & Naming Conventions
TypeScript runs in strict mode targeting ES2020 with CommonJS modules. Use two-space indentation, single quotes, and mandatory semicolons. Favor the path aliases `@/*`, `@/core/*`, and `@/features/*` instead of deep relative imports. Name React components and backend controllers/services/models with PascalCase (e.g., `ProdukController.ts`), hooks as `useThing.ts`, stores as `thingStore.ts`, and routes as `thingRoutes.ts`.

## Testing Guidelines
Jest powers backend tests; follow Arrange–Act–Assert and keep coverage above 80% for new logic. Name test files `*.test.ts` or `*.spec.ts` and colocate them with the code exercised. Mock database or network boundaries. Running `npm test --workspace=backend` executes the suite; add TODOs for pending frontend coverage.

## Commit & Pull Request Guidelines
Adopt Conventional Commits such as `feat: tambah endpoint produk` or `fix: perbaiki perhitungan stok`. Branch names start with `feature/`, `fix/`, or `chore/`. Pull requests should describe scope, link related issues, mention migrations or env changes, and include evidence of `npm test --workspace=backend` passing. Ensure CI builds succeed before requesting review.

## Security & Configuration Tips
Do not commit secrets; rely on `.env` templates and document required keys. Rate limiting and CORS defaults live in `packages/backend/src/config`. Validate inbound payloads with Zod schemas and use the Pino logger while redacting sensitive claims before logging.
