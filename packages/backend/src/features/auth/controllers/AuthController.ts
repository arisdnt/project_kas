
import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { LoginSchema, GodLoginSchema, ChangePasswordSchema } from '../models/User';
import { logger } from '@/core/utils/logger';
import { isGodUser } from '@/core/config/godUser';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { username, password, tenantId } = req.body;

      // Handle god user login (tanpa tenant)
      if (isGodUser(username) && !tenantId) {
        const godLoginData = GodLoginSchema.parse({ username, password });
        const result = await AuthService.godLogin(godLoginData.username, godLoginData.password);

        return res.json({
          success: true,
          message: 'God user login successful',
          data: {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
          }
        });
      }

      // Regular user login (dengan tenant)
      const loginData = LoginSchema.parse({ username, password, tenantId });

      if (!loginData.tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant ID is required for regular users'
        });
      }

      // Authenticate user
      const result = await AuthService.login({
        username: loginData.username,
        password: loginData.password,
        tenantId: loginData.tenantId
      });

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