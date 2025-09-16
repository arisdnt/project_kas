/**
 * Audit Controller
 * Handles audit log operations with access scope validation
 */

import { Request, Response } from 'express';
import { AuditService } from '../services/AuditService';
import { SearchAuditQuerySchema } from '../models/AuditLogCore';
import { z } from 'zod';

const DateRangeQuerySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, use YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, use YYYY-MM-DD')
});

const UserActivityQuerySchema = DateRangeQuerySchema.extend({
  user_id: z.string().uuid('Invalid user ID format')
});

export class AuditController {
  static async search(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Only admin and above can view audit logs
      if ((req.user.level || 5) > 2) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient privileges to view audit logs'
        });
      }

      const query = SearchAuditQuerySchema.parse(req.query);
      const result = await AuditService.search(req.accessScope, query);

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
      console.error('Search audit logs error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to search audit logs'
      });
    }
  }

  static async findById(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Only admin and above can view audit logs
      if ((req.user.level || 5) > 2) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient privileges to view audit logs'
        });
      }

      const { id } = req.params;
      const auditLog = await AuditService.findById(req.accessScope, id);

      return res.json({ success: true, data: auditLog });
    } catch (error: any) {
      console.error('Find audit log error:', error);
      if (error.message === 'Audit log not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getActivitySummary(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Only admin and above can view audit reports
      if ((req.user.level || 5) > 2) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient privileges to view audit reports'
        });
      }

      const query = DateRangeQuerySchema.parse(req.query);
      const summary = await AuditService.getActivitySummary(
        req.accessScope,
        query.start_date,
        query.end_date
      );

      return res.json({ success: true, data: summary });
    } catch (error: any) {
      console.error('Get activity summary error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to get activity summary'
      });
    }
  }

  static async getUserActivity(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Only admin and above can view user activity
      if ((req.user.level || 5) > 2) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient privileges to view user activity'
        });
      }

      const query = UserActivityQuerySchema.parse(req.query);
      const activity = await AuditService.getUserActivity(
        req.accessScope,
        query.user_id,
        query.start_date,
        query.end_date
      );

      return res.json({ success: true, data: activity });
    } catch (error: any) {
      console.error('Get user activity error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to get user activity'
      });
    }
  }
}