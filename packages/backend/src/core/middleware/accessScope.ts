/**
 * Access Scope Middleware (Terpusat)
 * - Menyatukan isolasi data berdasarkan tenant, toko, dan level/role user
 * - Menyediakan helper untuk menyusun klausul WHERE ter-otorisasi
 */

import { NextFunction, Request, Response } from 'express';
import { AuthenticatedUser, UserRole } from '@/features/auth/models/User';
import { GOD_TENANT_ID, GOD_STORE_ID } from '@/core/config/godUser';

export interface AccessScope {
  tenantId: string;
  storeId?: string; // toko_id
  level?: number;
  role: UserRole;
  isGod: boolean;
  // Flag penegakan otomatis
  enforceTenant: boolean;
  enforceStore: boolean;
  // Target tenant/store untuk operasi create/update
  targetTenantId?: string;
  targetStoreId?: string;
  // Flag untuk operasi multi-tenant/multi-store
  applyToAllTenants?: boolean;
  applyToAllStores?: boolean;
}

export interface ScopeSqlOptions {
  // Nama kolom untuk tenant dan toko (boleh menyertakan alias tabel, mis: 'p.tenant_id')
  tenantColumn?: string; // default: 'tenant_id'
  storeColumn?: string;  // default: 'toko_id'
}

// Perluas tipe Request Express
declare global {
  namespace Express {
    interface Request {
      accessScope?: AccessScope;
    }
  }
}

/**
 * Menentukan scope akses dari req.user dan param permintaan
 */
export function attachAccessScope(req: Request, _res: Response, next: NextFunction) {
  const user = req.user as AuthenticatedUser | undefined;
  if (!user) return next(); // route publik akan skip

  const isGod = Boolean(user.isGodUser);
  const level = user.level ?? 5;

  // Ambil target tenant/store dari body atau query untuk create/update operations
  const targetTenantId = (req.body as any)?.targetTenantId || (req.query as any)?.targetTenantId;
  const targetStoreId = (req.body as any)?.targetStoreId || (req.query as any)?.targetStoreId;
  const applyToAllTenants = (req.body as any)?.applyToAllTenants || (req.query as any)?.applyToAllTenants;
  const applyToAllStores = (req.body as any)?.applyToAllStores || (req.query as any)?.applyToAllStores;

  // Ambil store id dari urutan prioritas: param -> query -> body -> user.tokoId
  const paramStore = (req.params as any)?.tokoId || (req.query as any)?.tokoId || (req.body as any)?.tokoId;

  const scope: AccessScope = {
    tenantId: isGod ? GOD_TENANT_ID : user.tenantId,
    storeId: isGod ? ((paramStore as string) || GOD_STORE_ID) : ((paramStore as string) || user.tokoId),
    level,
    role: user.role,
    isGod,
    // God user melewati semua pembatasan
    enforceTenant: !isGod,
    // Hanya level >=3 (admin_toko/kasir) yang dibatasi toko
    // Super admin (1) dan admin (2) tidak dibatasi toko
    enforceStore: !isGod && (level ?? 5) >= 3,
    // Target scope untuk operasi create/update
    targetTenantId: validateTargetTenant(targetTenantId, user, isGod, level),
    targetStoreId: validateTargetStore(targetStoreId, user, isGod, level),
    applyToAllTenants: validateApplyToAllTenants(applyToAllTenants, isGod, level),
    applyToAllStores: validateApplyToAllStores(applyToAllStores, isGod, level)
  };

  req.accessScope = scope;
  return next();
}

/**
 * Utility untuk mengaplikasikan filter scope ke WHERE clause SQL.
 * Mengembalikan potongan clause dan parameter tambahan.
 */
export function scopeWhereClause(scope: AccessScope, options: ScopeSqlOptions = {}) {
  const clauses: string[] = [];
  const params: any[] = [];

  const tenantCol = options.tenantColumn || 'tenant_id';
  const storeCol = options.storeColumn || 'toko_id';

  // God user melewati semua filter tenant dan store
  if (scope.isGod) {
    return { clause: '', params: [] };
  }

  if (scope.enforceTenant) {
    clauses.push(`${tenantCol} = ?`);
    params.push(scope.tenantId);
  }

  if (scope.enforceStore && scope.storeId) {
    clauses.push(`${storeCol} = ?`);
    params.push(scope.storeId);
  }

  return { clause: clauses.join(' AND '), params };
}

/**
 * Utility untuk menentukan tenant_id dan toko_id saat insert data
 * berdasarkan AccessScope dan target yang dipilih user
 */
export function getInsertScope(scope: AccessScope): { tenantId: string; storeId: string | null } {
  // Jika apply to all tenants (hanya God user level 1)
  if (scope.applyToAllTenants) {
    return { tenantId: GOD_TENANT_ID, storeId: null };
  }

  // Jika apply to all stores dalam tenant
  if (scope.applyToAllStores) {
    const tenantId = scope.targetTenantId || scope.tenantId;
    return { tenantId, storeId: null };
  }

  // Jika ada target spesifik
  if (scope.targetTenantId || scope.targetStoreId) {
    return {
      tenantId: scope.targetTenantId || scope.tenantId,
      storeId: scope.targetStoreId || null
    };
  }

  // Default: gunakan scope user
  return {
    tenantId: scope.tenantId,
    storeId: scope.storeId || null
  };
}

/**
 * Utility untuk mendapatkan daftar tenant yang bisa diakses user
 */
export async function getAccessibleTenants(scope: AccessScope): Promise<string[]> {
  if (scope.isGod || scope.level === 1) {
    // God user bisa akses semua tenant
    return ['*']; // Special marker untuk semua tenant
  }

  // User lain hanya bisa akses tenant mereka sendiri
  return [scope.tenantId];
}

/**
 * Utility untuk mendapatkan daftar store yang bisa diakses user dalam tenant tertentu
 */
export async function getAccessibleStores(scope: AccessScope, tenantId?: string): Promise<string[]> {
  if (scope.isGod || scope.level === 1) {
    // God user bisa akses semua store
    return ['*']; // Special marker untuk semua store
  }

  if (scope.level === 2) {
    // Admin bisa akses semua store dalam tenant mereka
    const targetTenant = tenantId || scope.tenantId;
    if (targetTenant === scope.tenantId) {
      return ['*']; // Semua store dalam tenant mereka
    }
  }

  // Level 3+ hanya bisa akses store mereka sendiri
  if (scope.storeId) {
    return [scope.storeId];
  }

  return [];
}

/**
 * Menambahkan filter scope ke SQL yang sudah ada.
 * - Akan mendeteksi apakah sudah ada WHERE.
 */
export function applyScopeToSql(
  sql: string,
  existingParams: any[] = [],
  scope?: AccessScope,
  options: ScopeSqlOptions = {}
) {
  if (!scope) return { sql, params: existingParams };

  const { clause, params } = scopeWhereClause(scope, options);
  if (!clause) return { sql, params: existingParams };

  const hasWhere = /\bWHERE\b/i.test(sql);
  const glue = hasWhere ? ' AND ' : ' WHERE ';
  const scopedSql = `${sql}${glue}${clause}`;
  return { sql: scopedSql, params: [...existingParams, ...params] };
}

/**
 * Validasi target tenant berdasarkan level user
 */
function validateTargetTenant(targetTenantId: string | undefined, user: AuthenticatedUser, isGod: boolean, level: number): string | undefined {
  if (!targetTenantId) return undefined;

  // God user (level 1) bisa memilih tenant apapun
  if (isGod || level === 1) {
    return targetTenantId;
  }

  // Admin (level 2) dan level 3+ hanya bisa memilih tenant mereka sendiri
  if (targetTenantId === user.tenantId) {
    return targetTenantId;
  }

  return undefined; // Invalid target tenant
}

/**
 * Validasi target store berdasarkan level user
 */
function validateTargetStore(targetStoreId: string | undefined, user: AuthenticatedUser, isGod: boolean, level: number): string | undefined {
  if (!targetStoreId) return undefined;

  // God user (level 1) bisa memilih store apapun
  if (isGod || level === 1) {
    return targetStoreId;
  }

  // Admin (level 2) bisa memilih store dalam tenant mereka
  if (level === 2) {
    return targetStoreId; // Validasi akan dilakukan di database level
  }

  // Level 3+ hanya bisa memilih store mereka sendiri
  if (targetStoreId === user.tokoId) {
    return targetStoreId;
  }

  return undefined; // Invalid target store
}

/**
 * Validasi apakah user bisa apply ke semua tenant
 */
function validateApplyToAllTenants(applyToAllTenants: boolean | undefined, isGod: boolean, level: number): boolean {
  if (!applyToAllTenants) return false;

  // Hanya God user (level 1) yang bisa apply ke semua tenant
  return isGod || level === 1;
}

/**
 * Validasi apakah user bisa apply ke semua store
 */
function validateApplyToAllStores(applyToAllStores: boolean | undefined, isGod: boolean, level: number): boolean {
  if (!applyToAllStores) return false;

  // God user (level 1) bisa apply ke semua store
  if (isGod || level === 1) return true;

  // Admin (level 2) bisa apply ke semua store dalam tenant mereka
  if (level === 2) return true;

  return false;
}

/**
 * Middleware pembantu untuk memastikan scope minimal (mis. butuh store untuk level >=3)
 */
export function requireStoreWhenNeeded(req: Request, res: Response, next: NextFunction) {
  const scope = req.accessScope;
  if (!scope) return next();
  if (scope.enforceStore && !scope.storeId && !scope.targetStoreId && !scope.applyToAllStores) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Store ID (tokoId) is required for this operation'
    });
  }
  return next();
}

