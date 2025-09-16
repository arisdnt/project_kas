# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development Commands
```bash
# Start both backend and frontend in development mode
npm run dev

# Install dependencies for all workspaces
npm run install:all

# Build both backend and frontend for production
npm run build

# Clean all node_modules and dist directories
npm run clean
```

### Per-Workspace Commands
```bash
# Backend (Express + TypeScript)
npm run dev --workspace=backend      # Start backend dev server on port 3000
npm run build --workspace=backend    # Compile TypeScript to dist/
npm run start --workspace=backend    # Run production build
npm test --workspace=backend         # Run Jest tests
npm run lint --workspace=backend     # ESLint check

# Frontend (React + Vite + Tailwind)
npm run dev --workspace=frontend     # Start Vite dev server on port 5173
npm run build --workspace=frontend   # Build for production to dist/
npm run preview --workspace=frontend # Preview production build
npm run lint --workspace=frontend    # ESLint check
```

### Database Operations
```bash
# Apply all SQL migrations in order
for f in packages/backend/database/migrations/*.sql; do \
  echo "Applying $f"; \
  mysql -u posuser -p'strong_password_here' kasir < "$f"; \
done
```

## Architecture Overview

### Monorepo Structure
This is a **multi-tenant Point of Sales (POS) system** built as a monorepo with:
- **Backend**: Express + TypeScript API with JWT authentication
- **Frontend**: React + Vite + Tailwind CSS SPA
- **Database**: MySQL with multi-tenant support
- **Real-time**: Socket.IO for live updates
- **Storage**: Optional MinIO/S3-compatible object storage

### Multi-Tenant Architecture
The system uses a **shared database, separate schema** approach:
- All data is scoped by `tenant_id` and optionally `toko_id` (store_id)
- Access control enforced through `AccessScope` middleware
- Each user belongs to a tenant and can access one or more stores
- SQL queries automatically filtered by tenant/store scope

### Backend Architecture (packages/backend/src/)

#### Core Structure
- **`core/`**: Shared infrastructure
  - `config/`: App configuration and environment variables
  - `database/`: MySQL connection pooling and utilities
  - `middleware/`: Authentication, rate limiting, access scope
  - `storage/`: MinIO/S3 integration for file uploads
  - `utils/`: Logging, validation, and helper functions

#### Feature-Based Organization
- **`features/`**: Business domain modules, each containing:
  - `controllers/`: HTTP request handlers
  - `services/`: Business logic and database operations
  - `models/`: TypeScript interfaces and Zod schemas
  - `routes/`: Express route definitions

#### Key Features
- `auth/`: JWT authentication, user management, role-based access
- `dashboard/`: Analytics and KPI endpoints
- `produk/`: Product catalog management
- `penjualan/`: Sales transactions and POS operations
- `pelanggan/`: Customer management
- `supplier/`: Supplier management
- `dokumen/`: File upload and document management

### Frontend Architecture (packages/frontend/src/)

#### Core Structure
- **`core/`**: Shared frontend infrastructure
  - `components/ui/`: Reusable UI components (shadcn/ui style)
  - `layouts/`: Page layout components and routing
  - `store/`: Zustand global state management
  - `lib/`: API client, utilities, and configurations

#### Feature-Based Organization
- **`features/`**: Business domain components, each containing:
  - `components/`: React components specific to the feature
  - `pages/`: Page-level components
  - `services/`: API service functions
  - `store/`: Feature-specific Zustand stores
  - `types/`: TypeScript interfaces

#### Key Features
- `dashboard/`: Real-time analytics dashboard with charts
- `kasir/`: Point of sale interface
- `produk/`: Product management interface
- `penjualan/`: Sales management interface
- `pelanggan/`: Customer management interface

### Database Schema
17 tables supporting multi-tenant POS operations:
- **Master Data**: `brand`, `kategori`, `supplier`
- **Product Management**: `produk`, `inventaris`
- **Sales**: `transaksi_penjualan`, `item_transaksi_penjualan`
- **Purchasing**: `pembelian`, `item_pembelian`
- **Customer Management**: `pelanggan`
- **User Management**: `user`, `tenant`, `toko` (store)
- **System**: `log_aktivitas`, `notifikasi`

### API Patterns

#### Access Scope Middleware
All routes automatically enforce tenant/store isolation:
```typescript
// Middleware attaches req.accessScope with tenant/store context
router.use(attachAccessScope);

// SQL queries automatically scoped
const scopedQuery = applyScopeToSql(baseSql, params, scope, {
  tenantColumn: 'tenant_id',
  storeColumn: 'toko_id'
});
```

#### Standard Response Format
```typescript
{
  success: boolean,
  message: string,
  data: any
}
```

### State Management Patterns

#### Zustand Stores
- Named with `Store` suffix (e.g., `authStore.ts`, `produkStore.ts`)
- Use `persist` middleware for data that should survive page refresh
- Feature stores isolated to their respective feature directories

#### API Integration
- Centralized API client in `core/lib/api.ts`
- Service functions in feature `services/` directories
- Error handling with user-friendly messages

### Authentication & Authorization

#### JWT Flow
1. Login returns access token and refresh token
2. Access token used for API requests (Bearer header)
3. Refresh token used to get new access tokens
4. Multi-tenant scope attached to user session

#### Role-Based Access Control (RBAC)
- Roles: `super_admin`, `admin`, `kasir`, `viewer`
- Permissions checked at route level
- Store-level access control for kasir users

### Real-time Features
- Socket.IO server setup in backend `index.ts`
- Client connection in frontend for live updates
- Used for inventory changes, new orders, notifications

### Development Patterns

#### Import Aliases
- Backend: `@/` maps to `src/`
- Frontend: `@/` maps to `src/`

#### Naming Conventions
- React Components: PascalCase (`ProductList.tsx`)
- Hooks: `use` prefix (`useProductData.ts`)
- Stores: camelCase with Store suffix (`authStore.ts`)
- Backend: Controllers end with `Controller`, Services with `Service`
- Routes: kebab-case file names (`authRoutes.ts`)

#### Error Handling
- Backend: Centralized error middleware with logging
- Frontend: Error boundaries and user-friendly error messages
- API errors returned in standard format with HTTP status codes

## Production Deployment

The frontend builds to static files served by the backend at `/` and `/dashboard/*` routes. Backend serves both API (`/api/*`) and the SPA, making it a single-service deployment.

## Environment Configuration

Backend requires `.env` file with:
- Database connection (MySQL)
- JWT secrets
- CORS origins
- Optional MinIO/S3 configuration
- Rate limiting settings

See README.md for complete environment variable list and setup instructions.