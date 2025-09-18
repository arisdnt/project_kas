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
  // Ambil store id dari urutan prioritas: param -> query -> body -> user.tokoId
  const paramStore = (req.params as any)?.tokoId || (req.query as any)?.tokoId || (req.body as any)?.tokoId;

  const scope: AccessScope = {
    tenantId: user.tenantId,
    storeId: (paramStore as string) || user.tokoId,
    level,
    role: user.role,
    isGod,
    // God user melewati semua pembatasan
    enforceTenant: !isGod,
    // Hanya level >=3 (admin_toko/kasir) yang dibatasi toko
    // Super admin (1) dan admin (2) tidak dibatasi toko
    enforceStore: !isGod && (level ?? 5) >= 3
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
 * Middleware pembantu untuk memastikan scope minimal (mis. butuh store untuk level >=3)
 */
export function requireStoreWhenNeeded(req: Request, res: Response, next: NextFunction) {
  const scope = req.accessScope;
  if (!scope) return next();
  if (scope.enforceStore && !scope.storeId) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Store ID (tokoId) is required for this operation'
    });
  }
  return next();
}

