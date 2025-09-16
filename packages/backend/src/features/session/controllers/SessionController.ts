/**
 * Session Controller
 * Handles user session operations with security validation
 */

import { Request, Response } from 'express';
import { SessionService } from '../services/SessionService';
import { SearchSessionQuerySchema } from '../models/SessionCore';
import { z } from 'zod';

const RefreshTokenSchema = z.object({
  refresh_token: z.string().min(1)
});

const ExtendSessionSchema = z.object({
  additional_hours: z.number().min(1).max(24).optional().default(1)
});

export class SessionController {
  static async search(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Only admin and above can view all sessions
      if ((req.user.level || 5) > 2) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient privileges to view sessions'
        });
      }

      const query = SearchSessionQuerySchema.parse(req.query);
      const result = await SessionService.search(req.accessScope, query);

      return res.json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit: Number(query.limit)
        }
      });
    } catch (error: any) {
      console.error('Search sessions error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to search sessions'
      });
    }
  }

  static async getMySessions(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const sessions = await SessionService.findActiveSessionsByUser(req.user.id);

      return res.json({ success: true, data: sessions });
    } catch (error: any) {
      console.error('Get my sessions error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getSessionStats(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Only admin and above can view session stats
      if ((req.user.level || 5) > 2) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient privileges to view session statistics'
        });
      }

      const stats = await SessionService.getSessionStats(req.accessScope);

      return res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('Get session stats error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async refreshSession(req: Request, res: Response) {
    try {
      const { refresh_token } = RefreshTokenSchema.parse(req.body);
      const result = await SessionService.refreshSession(refresh_token);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Refresh session error:', error);
      if (error.message === 'Invalid refresh token') {
        return res.status(401).json({ success: false, message: error.message });
      }
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to refresh session'
      });
    }
  }

  static async extendSession(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { additional_hours } = ExtendSessionSchema.parse(req.body);
      const sessionToken = req.headers.authorization?.replace('Bearer ', '');

      if (!sessionToken) {
        return res.status(400).json({
          success: false,
          message: 'Session token required'
        });
      }

      const result = await SessionService.extendSession(sessionToken, additional_hours);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Extend session error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to extend session'
      });
    }
  }

  static async logoutCurrentSession(req: Request, res: Response) {
    try {
      const sessionToken = req.headers.authorization?.replace('Bearer ', '');

      if (!sessionToken) {
        return res.status(400).json({
          success: false,
          message: 'Session token required'
        });
      }

      const result = await SessionService.deactivateSession(sessionToken);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Logout current session error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to logout'
      });
    }
  }

  static async logoutAllSessions(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const result = await SessionService.logoutAllDevices(req.user.id);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Logout all sessions error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to logout all sessions'
      });
    }
  }

  static async logoutOtherSessions(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const currentToken = req.headers.authorization?.replace('Bearer ', '');

      if (!currentToken) {
        return res.status(400).json({
          success: false,
          message: 'Session token required'
        });
      }

      const result = await SessionService.logoutOtherDevices(req.user.id, currentToken);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Logout other sessions error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to logout other sessions'
      });
    }
  }
}