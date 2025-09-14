# Agent Guidelines for Sistem POS Repository

## Build/Lint/Test Commands
- **Install all workspaces**: `npm run install:all`
- **Run both apps**: `npm run dev` (backend + frontend concurrently)
- **Build both**: `npm run build`
- **Clean artifacts**: `npm run clean`

### Backend Commands
- **Dev server**: `npm run dev --workspace=backend`
- **Run all tests**: `npm test --workspace=backend`
- **Run single test**: `npm test --workspace=backend -- <test-file>` or `npx jest <test-file>`
- **Lint**: `npm run lint --workspace=backend`
- **Lint fix**: `npm run lint:fix --workspace=backend`

### Frontend Commands
- **Dev server**: `npm run dev --workspace=frontend`
- **Lint**: `npm run lint --workspace=frontend`
- **Build**: `npm run build --workspace=frontend`

## Code Style Guidelines

### TypeScript Configuration
- **Strict mode**: Enabled with all strict checks
- **Target**: ES2020, Module: CommonJS
- **Path aliases**: `@/*` for root, `@/core/*`, `@/features/*`
- **Source maps**: Enabled for debugging

### Formatting & Syntax
- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Line endings**: LF (Unix)
- **Max file length**: 250 LOC per file (enforced)

### Naming Conventions
- **React Components**: PascalCase (e.g., `KategoriPage.tsx`, `ProductTable.tsx`)
- **React Hooks**: `useThing.ts` (e.g., `useAuth.ts`, `useProducts.ts`)
- **Zustand Stores**: `thingStore.ts` (e.g., `authStore.ts`, `productStore.ts`)
- **Backend Controllers**: PascalCase (e.g., `ProdukController.ts`, `AuthController.ts`)
- **Backend Services**: PascalCase (e.g., `ProdukService.ts`, `AuthService.ts`)
- **Backend Routes**: camelCase + `Routes` (e.g., `produkRoutes.ts`, `authRoutes.ts`)
- **Backend Models**: PascalCase (e.g., `User.ts`, `Product.ts`)
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase

### Import/Export Style
- **Default imports**: `import React from 'react'`
- **Named imports**: `import { useState, useEffect } from 'react'`
- **Path aliases**: Always use `@/core/*` and `@/features/*` instead of relative paths
- **Group imports**: Separate external, internal, and relative imports with blank lines
- **Export order**: Default export last, named exports alphabetical

### Error Handling
- **Backend**: Use try-catch blocks, return structured error responses
- **Frontend**: Use error boundaries, handle async errors with `.catch()` or try-catch
- **Logging**: Use Pino logger for backend, console for frontend dev
- **Validation**: Use Zod schemas for input validation

### Comments & Documentation
- **Language**: All comments must be in Indonesian
- **JSDoc**: Use for public functions/methods
- **Inline comments**: For complex logic only
- **TODO comments**: Use `// TODO: description` format

### File Organization
- **Backend**: Feature-based with `controllers/`, `services/`, `models/`, `routes/`
- **Frontend**: Feature-based with `components/`, `pages/`, `hooks/`, `types/`
- **Shared code**: Place in `core/` directories
- **Tests**: Place `*.test.ts` files next to implementation or in `__tests__/` folders

## Testing Guidelines
- **Framework**: Jest for backend (no frontend tests yet)
- **Test files**: `*.test.ts` or `*.spec.ts`
- **Test structure**: Arrange-Act-Assert pattern
- **Mocking**: Use Jest mocks for external dependencies
- **Coverage**: Aim for >80% coverage on new code

## Commit & Pull Request Guidelines
- **Commit style**: Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`)
- **PR requirements**: Clear description, linked issues, test steps, green CI
- **Branch naming**: `feature/`, `fix/`, `chore/` prefixes
- **Code review**: Required for all changes

## Security & Configuration
- **Environment variables**: Never commit secrets, use `.env` files
- **CORS**: Configured for development and production
- **Rate limiting**: Applied to auth and upload endpoints
- **Input validation**: Use Zod schemas throughout
- **Authentication**: JWT-based with role-based access control

## Agent-Specific Instructions
- **Respect boundaries**: Keep feature modules coherent and independent
- **Path aliases**: Always use configured aliases, never relative paths
- **Type safety**: Maintain strict TypeScript compliance
- **Testing**: Add tests for new backend logic, verify existing tests pass
- **Minimal changes**: Make surgical edits, avoid unrelated modifications
- **Indonesian comments**: All code comments must be in Indonesian
- **File size limit**: Keep files under 250 LOC, split large functions
