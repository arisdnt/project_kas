/**
 * Level-based Authorization Middleware
 * Middleware untuk validasi akses berdasarkan level peran pengguna
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedUser } from '../models/User';
import { logger } from '@/core/utils/logger';
import { 
  hasLevelAccess, 
  requireGodAccess, 
  requireAdminAccess, 
  requireAdminTokoAccess, 
  requireKasirAccess, 
  requireReviewerAccess,
  AccessLevel,
  CrudOperation,
  SystemModule
} from './levelAccessMiddleware';

/**
 * Middleware untuk memvalidasi akses berdasarkan level minimum yang diperlukan
 */
export const requireMinimumLevel = (minimumLevel: AccessLevel, operation: CrudOperation, module: SystemModule): (req: Request, res: Response, next: NextFunction) => void => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as AuthenticatedUser;
      
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User authentication required'
        });
      }

      // Cek akses berdasarkan level
      const hasAccess = hasLevelAccess(user.level || 5, minimumLevel, operation, module);
      
      if (!hasAccess) {
        logger.warn({
          userId: user.id,
          username: user.username,
          userLevel: user.level,
          requiredLevel: minimumLevel,
          operation,
          module,
          tokoId: req.params.tokoId,
          method: req.method,
          url: req.url
        }, 'Access denied - insufficient level');
        
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Insufficient access level for this operation'
        });
      }

      logger.info({
        userId: user.id,
        username: user.username,
        userLevel: user.level,
        operation,
        module,
        method: req.method,
        url: req.url
      }, 'Level access granted');
      
      return next();
      
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        method: req.method,
        url: req.url
      }, 'Level access validation error');
      
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Access validation failed'
      });
    }
  };
};

/**
 * Middleware khusus untuk akses level God (Level 1)
 */
export const requireGod = () => {
  return requireMinimumLevel(AccessLevel.GOD, CrudOperation.CREATE, SystemModule.KONFIGURASI);
};

/**
 * Middleware khusus untuk akses level Admin (Level 2)
 */
export const requireAdmin = (operation: CrudOperation, module: SystemModule) => {
  return requireMinimumLevel(AccessLevel.ADMIN, operation, module);
};

/**
 * Middleware khusus untuk akses level Admin Toko (Level 3)
 */
export const requireAdminToko = (operation: CrudOperation, module: SystemModule) => {
  return requireMinimumLevel(AccessLevel.ADMIN_TOKO, operation, module);
};

/**
 * Middleware khusus untuk akses level Kasir (Level 4)
 */
export const requireKasir = (operation: CrudOperation, module: SystemModule) => {
  return requireMinimumLevel(AccessLevel.KASIR, operation, module);
};

/**
 * Middleware khusus untuk akses level Reviewer (Level 5)
 */
export const requireReviewer = (operation: CrudOperation, module: SystemModule) => {
  return requireMinimumLevel(AccessLevel.REVIEWER, operation, module);
};

/**
 * Middleware untuk validasi akses CRUD berdasarkan operasi
 */
export const requireCRUDAccess = (operation: CrudOperation, module: SystemModule): (req: Request, res: Response, next: NextFunction) => void => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as AuthenticatedUser;
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required'
      });
    }

    // Tentukan level minimum berdasarkan operasi
    let minimumLevel: number;
    
    switch (operation) {
      case CrudOperation.CREATE:
      case CrudOperation.UPDATE:
      case CrudOperation.DELETE:
        // Operasi write memerlukan minimal level 3 (admin toko)
        minimumLevel = AccessLevel.ADMIN_TOKO;
        break;
      case CrudOperation.READ:
        // Operasi read dapat dilakukan oleh semua level
        minimumLevel = AccessLevel.REVIEWER;
        break;
      default:
        minimumLevel = AccessLevel.ADMIN_TOKO;
    }

    // Untuk modul transaksi, kasir (level 4) dapat melakukan create
    if (module === SystemModule.TRANSAKSI && operation === CrudOperation.CREATE && user.level === 4) {
      minimumLevel = AccessLevel.KASIR;
    }

    return requireMinimumLevel(minimumLevel, operation, module)(req, res, next);
  };
};

/**
 * Middleware untuk validasi akses toko spesifik
 */
export const requireTokoAccess = (operation: CrudOperation, module: SystemModule): (req: Request, res: Response, next: NextFunction) => void => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as AuthenticatedUser;
    const tokoId = req.params.tokoId || req.body.tokoId || req.query.tokoId;
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required'
      });
    }

    // Level 1 (god) dan 2 (admin) dapat mengakses semua toko
    if (user.level && user.level <= 2) {
      return next();
    }

    // Level 3+ harus memiliki akses ke toko spesifik
    if (!tokoId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Store ID is required for this operation'
      });
    }

    // Validasi akses toko untuk level 3+
    if (user.level && user.level >= 3 && user.tokoId !== tokoId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this store'
      });
    }

    return requireCRUDAccess(operation, module)(req, res, next);
  };
};

/**
 * Middleware untuk validasi akses tenant (untuk level 1 god user)
 */
export const requireTenantAccess = (operation: CrudOperation, module: SystemModule): (req: Request, res: Response, next: NextFunction) => void => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as AuthenticatedUser;
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required'
      });
    }

    // Hanya level 1 (god) yang dapat mengakses lintas tenant
    if (user.level !== 1) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Cross-tenant access denied'
      });
    }

    return requireMinimumLevel(AccessLevel.GOD, operation, module)(req, res, next);
  };
};