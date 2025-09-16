/**
 * Authentication Controller
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { LoginSchema, CreateUserSchema, ChangePasswordSchema } from '../models/User';
import { logger } from '@/core/utils/logger';

export class AuthController {
  /**
   * Login endpoint
   */
  static async login(req: Request, res: Response) {
    try {
      // Validate request body
      const loginData = LoginSchema.parse(req.body);
      
      // Authenticate user
      const result = await AuthService.login(loginData);
      
      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        }
      });
      
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        body: req.body,
        ip: req.ip
      }, 'Login failed');
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid username or password')) {
          return res.status(401).json({
            success: false,
            error: 'Authentication Failed',
            message: 'Invalid username or password'
          });
        }
        
        if (error.message.includes('Invalid tenant access')) {
          return res.status(403).json({
            success: false,
            error: 'Access Denied',
            message: 'Invalid tenant access'
          });
        }
      }
      
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Login failed. Please try again.'
      });
    }
  }

  /**
   * Register new user endpoint
   */
  static async register(req: Request, res: Response) {
    try {
      // Validate request body
      const userData = CreateUserSchema.parse(req.body);
      
      // Create user
      const user = await AuthService.createUser(userData);
      
      // Remove password from response
      const { password_hash, ...userResponse } = user;
      
      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { user: userResponse }
      });
      
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        body: { ...req.body, password: '[REDACTED]' },
        ip: req.ip
      }, 'User registration failed');
      
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          return res.status(409).json({
            success: false,
            error: 'Conflict',
            message: 'Username already exists'
          });
        }
      }
      
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Registration failed. Please try again.'
      });
    }
  }

  /**
   * Refresh token endpoint
   */
  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Refresh token is required'
        });
      }
      
      const result = await AuthService.refreshToken(refreshToken);
      
      return res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        }
      });
      
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: req.ip
      }, 'Token refresh failed');
      
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired refresh token'
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }
      
      return res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user: req.user }
      });
      
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id
      }, 'Get profile failed');
      
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve profile'
      });
    }
  }

  /**
   * Logout endpoint (client-side token invalidation)
   */
  static async logout(req: Request, res: Response) {
    try {
      // In a stateless JWT system, logout is typically handled client-side
      // by removing the token from storage. Here we just log the action.
      
      if (req.user) {
        logger.info({
          userId: req.user.id,
          username: req.user.username,
          tenantId: req.user.tenantId
        }, 'User logged out');
      }
      
      return res.json({
        success: true,
        message: 'Logout successful'
      });
      
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id
      }, 'Logout failed');
      
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Logout failed'
      });
    }
  }

  /**
   * Change password endpoint
   */
  static async changePassword(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }
      
      // Validate request body
      const passwordData = ChangePasswordSchema.parse(req.body);
      
      // For now, we'll implement this as a placeholder
      // In a full implementation, you'd verify current password and update
      
      logger.info({
        userId: req.user.id,
        username: req.user.username
      }, 'Password change requested');
      
      return res.json({
        success: true,
        message: 'Password change functionality will be implemented'
      });
      
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id
      }, 'Change password failed');
      
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Password change failed'
      });
    }
  }

  /**
   * Verify token endpoint
   */
  static async verifyToken(req: Request, res: Response) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Token is required'
        });
      }
      
      const payload = AuthService.verifyToken(token);
      
      return res.json({
        success: true,
        message: 'Token is valid',
        data: { payload }
      });
      
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
    }
  }
}