/**
 * Level Access Middleware
 * Middleware untuk validasi akses berdasarkan level peran
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '@/core/utils/logger';
import { AuthenticatedUser } from '../models/User';

// Definisi level akses
export enum AccessLevel {
  GOD = 1,        // Akses penuh semua tenant
  ADMIN = 2,      // Akses semua toko dalam tenant
  ADMIN_TOKO = 3, // Akses toko tertentu
  KASIR = 4,      // Akses transaksi kasir
  REVIEWER = 5,   // Akses read-only
  SUPER_ADMIN = 8 // Super admin dengan akses penuh
}

// Definisi operasi CRUD
export enum CrudOperation {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete'
}

// Definisi modul sistem
export enum SystemModule {
  PENGGUNA = 'pengguna',
  PRODUK = 'produk',
  TRANSAKSI = 'transaksi',
  LAPORAN = 'laporan',
  INVENTARIS = 'inventaris',
  PELANGGAN = 'pelanggan',
  SUPPLIER = 'supplier',
  KONFIGURASI = 'konfigurasi'
}

// Interface untuk konfigurasi akses
interface AccessConfig {
  level: AccessLevel;
  module: SystemModule;
  operation: CrudOperation;
  requireSameTenant?: boolean;
  requireSameStore?: boolean;
}

/**
 * Fungsi untuk memeriksa apakah level peran memiliki akses
 */
export const hasLevelAccess = (
  userLevel: number,
  requiredLevel: AccessLevel,
  operation: CrudOperation,
  module: SystemModule
): boolean => {
  // Level 1 (GOD) memiliki akses penuh ke semua operasi
  if (userLevel === AccessLevel.GOD) {
    return true;
  }

  // Level 2 (ADMIN) dapat melakukan semua operasi CRUD di tenant mereka
  if (userLevel === AccessLevel.ADMIN) {
    return true;
  }

  // Level 8 (SUPER_ADMIN) memiliki akses penuh seperti admin
  if (userLevel === AccessLevel.SUPER_ADMIN) {
    return true;
  }

  // Level 3 (ADMIN_TOKO) dapat melakukan semua operasi CRUD di toko mereka
  if (userLevel === AccessLevel.ADMIN_TOKO) {
    return true;
  }

  // Level 4 (KASIR) hanya dapat melakukan operasi terkait transaksi
  if (userLevel === AccessLevel.KASIR) {
    const allowedModules = [SystemModule.TRANSAKSI, SystemModule.PRODUK, SystemModule.PELANGGAN];
    
    if (!allowedModules.includes(module)) {
      return false;
    }

    // Kasir hanya bisa read produk dan pelanggan, tapi bisa CRUD transaksi
    if (module === SystemModule.TRANSAKSI) {
      return true;
    }
    
    if (module === SystemModule.PRODUK || module === SystemModule.PELANGGAN) {
      return operation === CrudOperation.READ;
    }

    return false;
  }

  // Level 5 (REVIEWER) hanya memiliki akses read-only
  if (userLevel === AccessLevel.REVIEWER) {
    return operation === CrudOperation.READ;
  }

  return false;
};

/**
 * Middleware untuk validasi akses berdasarkan level
 */
export const requireLevelAccess = (
  requiredLevel: AccessLevel,
  module: SystemModule,
  operation: CrudOperation,
  options: {
    requireSameTenant?: boolean;
    requireSameStore?: boolean;
  } = {}
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const user = req.user as AuthenticatedUser & { level?: number; tokoId?: string };
    
    // Ambil level dari user (default ke level tertinggi jika tidak ada)
    const userLevel = user.level || AccessLevel.GOD;

    // God user bypass semua validasi level
    if (user.isGodUser) {
      logger.info({
        userId: user.id,
        username: user.username,
        module,
        operation,
        method: req.method,
        url: req.url
      }, 'God user bypassing level access control');
      return next();
    }

    // Periksa akses berdasarkan level
    if (!hasLevelAccess(userLevel, requiredLevel, operation, module)) {
      logger.warn({
        userId: user.id,
        userLevel,
        requiredLevel,
        module,
        operation,
        method: req.method,
        url: req.url
      }, 'Level access denied');
      
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient access level for this operation'
      });
    }

    // Validasi tenant access (kecuali untuk level GOD)
    if (options.requireSameTenant && userLevel !== AccessLevel.GOD) {
      const requestTenantId = (req.params.tenantId || req.query.tenantId || req.body.tenantId) as string;
      
      if (requestTenantId && requestTenantId !== user.tenantId) {
        // Level ADMIN bisa akses semua tenant
        if (userLevel !== AccessLevel.ADMIN) {
          logger.warn({
            userId: user.id,
            userTenantId: user.tenantId,
            requestTenantId,
            method: req.method,
            url: req.url
          }, 'Tenant access violation');
          
          return res.status(403).json({
            error: 'Forbidden',
            message: 'Access denied to this tenant data'
          });
        }
      }
    }

    // Validasi store access (untuk level ADMIN_TOKO dan KASIR)
    if (options.requireSameStore && 
        (userLevel === AccessLevel.ADMIN_TOKO || userLevel === AccessLevel.KASIR)) {
      const requestTokoId = (req.params.tokoId || req.query.tokoId || req.body.tokoId) as string;
      
      if (requestTokoId && requestTokoId !== user.tokoId) {
        logger.warn({
          userId: user.id,
          userTokoId: user.tokoId,
          requestTokoId,
          method: req.method,
          url: req.url
        }, 'Store access violation');
        
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied to this store data'
        });
      }
    }

    logger.info({
      userId: user.id,
      userLevel,
      module,
      operation,
      method: req.method,
      url: req.url
    }, 'Level access granted');

    return next();
  };
};

/**
 * Helper functions untuk operasi umum
 */
export const requireGodAccess = (module: SystemModule, operation: CrudOperation) => 
  requireLevelAccess(AccessLevel.GOD, module, operation);

export const requireAdminAccess = (module: SystemModule, operation: CrudOperation) => 
  requireLevelAccess(AccessLevel.ADMIN, module, operation, { requireSameTenant: true });

export const requireAdminTokoAccess = (module: SystemModule, operation: CrudOperation) => 
  requireLevelAccess(AccessLevel.ADMIN_TOKO, module, operation, { 
    requireSameTenant: true, 
    requireSameStore: true 
  });

export const requireKasirAccess = (module: SystemModule, operation: CrudOperation) => 
  requireLevelAccess(AccessLevel.KASIR, module, operation, { 
    requireSameTenant: true, 
    requireSameStore: true 
  });

export const requireReviewerAccess = (module: SystemModule) => 
  requireLevelAccess(AccessLevel.REVIEWER, module, CrudOperation.READ, { 
    requireSameTenant: true, 
    requireSameStore: true 
  });

/**
 * Middleware khusus untuk operasi transaksi kasir
 */
export const requireCashierTransactionAccess = () => {
  return requireLevelAccess(
    AccessLevel.KASIR, 
    SystemModule.TRANSAKSI, 
    CrudOperation.CREATE,
    { requireSameTenant: true, requireSameStore: true }
  );
};

/**
 * Middleware untuk operasi read-only (semua level bisa akses)
 */
export const requireReadAccess = (module: SystemModule) => {
  return requireLevelAccess(
    AccessLevel.REVIEWER, 
    module, 
    CrudOperation.READ,
    { requireSameTenant: true }
  );
};