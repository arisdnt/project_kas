/**
 * Tenant Access Middleware
 * Middleware khusus untuk memastikan hanya God User yang dapat mengakses tenant management
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '@/core/utils/logger';
import { AuthenticatedUser } from '@/features/auth/models/User';

/**
 * Middleware untuk memastikan hanya God User (level 1) yang dapat mengakses tenant management
 */
export const requireGodUserForTenant = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as AuthenticatedUser;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user is God User (either by isGodUser flag or level 1)
    const isGodUser = user.isGodUser || (user.level === 1);

    if (!isGodUser) {
      logger.warn({
        userId: user.id,
        username: user.username,
        userLevel: user.level,
        isGodUser: user.isGodUser,
        method: req.method,
        url: req.url
      }, 'Non-God user attempted to access tenant management');

      return res.status(403).json({
        success: false,
        message: 'Only God users (Level 1) can access tenant management',
        error: 'Insufficient privileges'
      });
    }

    logger.info({
      userId: user.id,
      username: user.username,
      userLevel: user.level,
      isGodUser: user.isGodUser,
      method: req.method,
      url: req.url
    }, 'God user accessing tenant management');

    return next();

  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method,
      url: req.url
    }, 'Tenant access validation error');

    return res.status(500).json({
      success: false,
      message: 'Access validation failed'
    });
  }
};

/**
 * Middleware untuk operasi read-only tenant (level 1-2 dapat akses)
 */
export const requireTenantReadAccess = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as AuthenticatedUser;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Level 1 (God) dan Level 2 (Admin) dapat melihat tenant
    const canRead = user.isGodUser || (user.level && user.level <= 2);

    if (!canRead) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient privileges to view tenant information'
      });
    }

    return next();

  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method,
      url: req.url
    }, 'Tenant read access validation error');

    return res.status(500).json({
      success: false,
      message: 'Access validation failed'
    });
  }
};