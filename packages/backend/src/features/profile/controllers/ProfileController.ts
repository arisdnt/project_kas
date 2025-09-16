/**
 * Profile Controller
 * Handles user profile and settings operations with authentication
 */

import { Request, Response } from 'express';
import { ProfileService } from '../services/ProfileService';
import { UpdateProfileSchema, ChangePasswordSchema, UpdateSettingsSchema } from '../models/ProfileCore';
import { z } from 'zod';

const AvatarUploadSchema = z.object({
  avatar_url: z.string().url()
});

export class ProfileController {
  // Profile information endpoints
  static async getMyProfile(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const profile = await ProfileService.getMyProfile(req.accessScope, req.user.id);

      return res.json({ success: true, data: profile });
    } catch (error: any) {
      console.error('Get my profile error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getUserProfile(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { userId } = req.params;
      const profile = await ProfileService.getUserProfile(req.accessScope, userId);

      if (!profile) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.json({ success: true, data: profile });
    } catch (error: any) {
      console.error('Get user profile error:', error);
      if (error.message === 'Insufficient permissions to view other user profiles') {
        return res.status(403).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async updateMyProfile(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data = UpdateProfileSchema.parse(req.body);
      const result = await ProfileService.updateMyProfile(req.accessScope, data, req.user.id);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update my profile error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update profile'
      });
    }
  }

  static async updateUserProfile(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { userId } = req.params;
      const data = UpdateProfileSchema.parse(req.body);
      const result = await ProfileService.updateUserProfile(req.accessScope, userId, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update user profile error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update profile'
      });
    }
  }

  // Password management endpoints
  static async changeMyPassword(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data = ChangePasswordSchema.parse(req.body);
      const result = await ProfileService.changeMyPassword(req.accessScope, data, req.user.id);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Change my password error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to change password'
      });
    }
  }

  static async changeUserPassword(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { userId } = req.params;
      const data = ChangePasswordSchema.parse(req.body);
      const result = await ProfileService.changeUserPassword(req.accessScope, userId, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Change user password error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to change password'
      });
    }
  }

  // Performance and analytics endpoints
  static async getMyPerformanceStats(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const days = Number(req.query.days) || 30;
      const stats = await ProfileService.getMyPerformanceStats(req.accessScope, days, req.user.id);

      return res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('Get my performance stats error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getUserPerformanceStats(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { userId } = req.params;
      const days = Number(req.query.days) || 30;
      const stats = await ProfileService.getUserPerformanceStats(req.accessScope, userId, days);

      return res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('Get user performance stats error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getMyActivityLogs(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const limit = Number(req.query.limit) || 50;
      const logs = await ProfileService.getMyActivityLogs(req.accessScope, limit, req.user.id);

      return res.json({ success: true, data: logs });
    } catch (error: any) {
      console.error('Get my activity logs error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getUserActivityLogs(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { userId } = req.params;
      const limit = Number(req.query.limit) || 50;
      const logs = await ProfileService.getUserActivityLogs(req.accessScope, userId, limit);

      return res.json({ success: true, data: logs });
    } catch (error: any) {
      console.error('Get user activity logs error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getMySalesReport(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const days = Number(req.query.days) || 30;
      const report = await ProfileService.getMySalesReport(req.accessScope, days, req.user.id);

      return res.json({ success: true, data: report });
    } catch (error: any) {
      console.error('Get my sales report error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getUserSalesReport(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { userId } = req.params;
      const days = Number(req.query.days) || 30;
      const report = await ProfileService.getUserSalesReport(req.accessScope, userId, days);

      return res.json({ success: true, data: report });
    } catch (error: any) {
      console.error('Get user sales report error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Settings management endpoints
  static async getMySettings(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const settings = await ProfileService.getMySettings(req.accessScope, req.user.id);

      return res.json({ success: true, data: settings });
    } catch (error: any) {
      console.error('Get my settings error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async updateMySettings(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data = UpdateSettingsSchema.parse(req.body);
      const result = await ProfileService.updateMySettings(req.accessScope, data, req.user.id);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update my settings error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update settings'
      });
    }
  }

  // Avatar management endpoints
  static async updateMyAvatar(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { avatar_url } = AvatarUploadSchema.parse(req.body);
      const result = await ProfileService.updateMyAvatar(req.accessScope, avatar_url, req.user.id);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update my avatar error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update avatar'
      });
    }
  }

  // Dashboard endpoint
  static async getProfileDashboard(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const dashboard = await ProfileService.getProfileDashboard(req.accessScope, req.user.id);

      return res.json({ success: true, data: dashboard });
    } catch (error: any) {
      console.error('Get profile dashboard error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Team performance comparison endpoint
  static async getTeamPerformanceComparison(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const days = Number(req.query.days) || 30;
      const comparison = await ProfileService.getTeamPerformanceComparison(req.accessScope, days, req.user.id);

      return res.json({ success: true, data: comparison });
    } catch (error: any) {
      console.error('Get team performance comparison error:', error);
      if (error.message === 'Insufficient permissions to view team performance') {
        return res.status(403).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Account management endpoints
  static async deleteMyAccount(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const result = await ProfileService.deleteMyAccount(req.accessScope, req.user.id);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Delete my account error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete account'
      });
    }
  }

  static async deleteUserAccount(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { userId } = req.params;
      const result = await ProfileService.deleteUserAccount(req.accessScope, userId);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Delete user account error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete account'
      });
    }
  }
}