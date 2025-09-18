# Test Enhanced Multi-Level Access Control System

## Summary of Implemented Features

### 1. Enhanced Access Scope Middleware
- **File**: `packages/backend/src/core/middleware/accessScope.ts`
- **New Features**:
  - Support for `targetTenantId` and `targetStoreId` in request body/query
  - Support for `applyToAllTenants` and `applyToAllStores` flags
  - Validation functions for different user levels
  - Utility functions for insert scope determination

### 2. Enhanced CRUD Operations
- **File**: `packages/backend/src/features/produk/services/modules/MasterDataService.ts`
- **Enhanced Functions**:
  - `createCategory()` - supports multi-tenant/multi-store creation
  - `createBrand()` - supports multi-tenant/multi-store creation
  - `createSupplier()` - supports multi-tenant/multi-store creation

### 3. New API Endpoints
- **Scope Management**:
  - `GET /api/scope/tenants` - Get accessible tenants
  - `GET /api/scope/stores` - Get accessible stores
  - `GET /api/scope/capabilities` - Get user capabilities
- **Enhanced Product Master Data**:
  - `POST /api/produk/categories` - Create category with scope
  - `POST /api/produk/brands` - Create brand with scope
  - `POST /api/produk/suppliers` - Create supplier with scope

### 4. Frontend Components
- **ScopeSelector Component**: `packages/frontend/src/core/components/ui/scope-selector.tsx`
- **ScopeStore**: `packages/frontend/src/core/store/scopeStore.ts`
- **CreateCategoryDialog**: `packages/frontend/src/features/produk/components/CreateCategoryDialog.tsx`

## User Level Capabilities

### Level 1 (God User)
- ✅ Can select any tenant
- ✅ Can select any store
- ✅ Can apply to all tenants
- ✅ Can apply to all stores
- ✅ Bypasses all access restrictions

### Level 2 (Admin)
- ✅ Can only access their own tenant
- ✅ Can select any store within their tenant
- ❌ Cannot apply to all tenants
- ✅ Can apply to all stores within their tenant

### Level 3+ (Manager/Cashier)
- ✅ Restricted to their own tenant
- ✅ Restricted to their own store
- ❌ Cannot apply to all tenants
- ❌ Cannot apply to all stores

## Testing Instructions

### 1. Test API Endpoints

```bash
# Get user capabilities
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/scope/capabilities

# Get accessible tenants (for God user)
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/scope/tenants

# Get accessible stores
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/scope/stores

# Create category for all tenants (God user only)
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Test Category Global",
    "deskripsi": "Category for all tenants",
    "applyToAllTenants": true
  }' \
  http://localhost:3000/api/produk/categories

# Create category for all stores in tenant (Admin)
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Test Category Tenant",
    "deskripsi": "Category for all stores in tenant",
    "targetTenantId": "<tenant-id>",
    "applyToAllStores": true
  }' \
  http://localhost:3000/api/produk/categories

# Create category for specific store
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Test Category Store",
    "deskripsi": "Category for specific store",
    "targetTenantId": "<tenant-id>",
    "targetStoreId": "<store-id>"
  }' \
  http://localhost:3000/api/produk/categories
```

### 2. Test Frontend Integration

1. **Login with different user levels**
2. **Open product management page**
3. **Test create category dialog**:
   - God user should see options for all tenants and all stores
   - Admin should see their tenant and option for all stores
   - Manager/Cashier should be restricted to their store

### 3. Database Verification

```sql
-- Check created categories
SELECT
  id, tenant_id, toko_id, nama, deskripsi
FROM kategori
WHERE nama LIKE 'Test Category%'
ORDER BY dibuat_pada DESC;

-- Check for multi-tenant entries (God user)
SELECT
  COUNT(*) as total_tenants,
  COUNT(DISTINCT tenant_id) as unique_tenants
FROM kategori
WHERE nama = 'Test Category Global';

-- Verify tenant isolation
SELECT
  k.nama, k.tenant_id, t.nama as tenant_nama
FROM kategori k
JOIN tenants t ON k.tenant_id = t.id
WHERE k.nama LIKE 'Test Category%';
```

## Expected Behavior

### God User (Level 1)
- Can create data that applies to all tenants
- Can create data that applies to all stores within a tenant
- Can create data for any specific tenant/store combination
- When `applyToAllTenants: true`, creates separate entries for each active tenant

### Admin (Level 2)
- Can create data for all stores within their tenant
- Can create data for specific stores within their tenant
- Cannot create data for other tenants
- `applyToAllTenants` flag is ignored/rejected

### Manager/Cashier (Level 3+)
- Can only create data for their own store
- All target scope parameters are validated against their permissions
- Cannot use any "apply to all" options

## Error Scenarios

### Invalid Permissions
```json
{
  "success": false,
  "message": "Only God user can apply to all tenants"
}
```

### Invalid Target Scope
```json
{
  "success": false,
  "message": "Cannot create data in different tenant"
}
```

### Missing Store Access
```json
{
  "success": false,
  "message": "Store ID (tokoId) is required for this operation"
}
```

## Files Modified/Created

### Backend
- ✅ `packages/backend/src/core/middleware/accessScope.ts` (Enhanced)
- ✅ `packages/backend/src/features/produk/services/modules/MasterDataService.ts` (Enhanced)
- ✅ `packages/backend/src/features/produk/controllers/ProdukController.ts` (Enhanced)
- ✅ `packages/backend/src/features/produk/routes/produkRoutes.ts` (Enhanced)
- ✅ `packages/backend/src/features/auth/controllers/ScopeController.ts` (New)
- ✅ `packages/backend/src/features/auth/services/ScopeService.ts` (New)
- ✅ `packages/backend/src/features/auth/routes/scopeRoutes.ts` (New)
- ✅ `packages/backend/src/index.ts` (Updated routes)

### Frontend
- ✅ `packages/frontend/src/core/components/ui/scope-selector.tsx` (New)
- ✅ `packages/frontend/src/core/store/scopeStore.ts` (New)
- ✅ `packages/frontend/src/features/produk/components/CreateCategoryDialog.tsx` (New)
- ✅ `packages/frontend/src/features/produk/store/produkStore.ts` (Enhanced)

## Next Steps

1. **Test with real users** at different levels
2. **Extend to other entities** (pelanggan, promo, etc.)
3. **Add audit logging** for multi-scope operations
4. **Implement frontend integration** in existing pages
5. **Add validation** for business rules (e.g., prevent deletion of global data by non-God users)