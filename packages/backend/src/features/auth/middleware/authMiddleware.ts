/**
 * Authentication Middleware
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { JWTPayload, AuthenticatedUser, UserRole, hasPermission } from '../models/User';
import { logger } from '@/core/utils/logger';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      jwtPayload?: JWTPayload;
    }
  }
}

/**
 * Middleware untuk autentikasi JWT
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Access token is required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const payload = AuthService.verifyToken(token);
    
    // Get user data
    const user = await AuthService.getUserById(payload.userId, payload.tenantId);
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found or inactive'
      });
    }

    // Attach user data to request
    req.user = user;
    req.jwtPayload = payload;
    
    logger.info({
      userId: user.id,
      username: user.username,
      tenantId: user.tenantId,
      method: req.method,
      url: req.url
    }, 'Authenticated request');
    
    return next();
    
  } catch (error) {
    logger.warn({
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method,
      url: req.url,
      ip: req.ip
    }, 'Authentication failed');
    
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Middleware untuk authorization berdasarkan role
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn({
        userId: req.user.id,
        userRole: req.user.role,
        allowedRoles,
        method: req.method,
        url: req.url
      }, 'Authorization failed - insufficient role');
      
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
    }

    return next();
  };
};

/**
 * Middleware untuk authorization berdasarkan permission
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (!hasPermission(req.user.role, permission)) {
      logger.warn({
        userId: req.user.id,
        userRole: req.user.role,
        requiredPermission: permission,
        method: req.method,
        url: req.url
      }, 'Authorization failed - insufficient permission');
      
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
    }

    return next();
  };
};

/**
 * Middleware untuk memastikan user hanya bisa akses data tenant mereka
 */
export const ensureTenantAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  // Extract tenant ID from request (bisa dari params, query, atau body)
  const requestTenantId = req.params.tenantId || req.query.tenantId || req.body.tenantId;
  
  if (requestTenantId && parseInt(requestTenantId) !== req.user.tenantId) {
    // Super admin bisa akses semua tenant
    if (req.user.role !== UserRole.SUPER_ADMIN) {
      logger.warn({
        userId: req.user.id,
        userTenantId: req.user.tenantId,
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

  return next();
};

/**
 * Middleware untuk optional authentication (tidak wajib login)
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = AuthService.verifyToken(token);
      const user = await AuthService.getUserById(payload.userId, payload.tenantId);
      
      if (user) {
        req.user = user;
        req.jwtPayload = payload;
      }
    }
    
    next();
    
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};

/**
 * Middleware untuk rate limiting per user
 */
export const userRateLimit = (maxRequests: number, windowMs: number) => {
  const userRequests = new Map<number, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next();
    }
    
    const now = Date.now();
    const userId = req.user.id;
    const userLimit = userRequests.get(userId);
    
    if (!userLimit || now > userLimit.resetTime) {
      userRequests.set(userId, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (userLimit.count >= maxRequests) {
      logger.warn({
        userId,
        requestCount: userLimit.count,
        maxRequests,
        method: req.method,
        url: req.url
      }, 'User rate limit exceeded');
      
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.'
      });
    }
    
    userLimit.count++;
    next();
  };
};