/**
 * Notification Controller
 * Handles notification operations with access scope validation
 */

import { Request, Response } from 'express';
import { NotifikasiService } from '../services/NotifikasiService';
import { SearchNotifikasiQuerySchema, CreateNotifikasiSchema, UpdateNotifikasiSchema, BulkNotificationRequestSchema } from '../models/NotifikasiCore';

export class NotifikasiController {
  static async searchNotifications(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = SearchNotifikasiQuerySchema.parse(req.query);
      const result = await NotifikasiService.searchNotifications(req.accessScope, query);

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
      console.error('Search notifications error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to search notifications'
      });
    }
  }

  static async findNotificationById(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const notification = await NotifikasiService.findNotificationById(req.accessScope, id);

      return res.json({ success: true, data: notification });
    } catch (error: any) {
      console.error('Find notification error:', error);
      if (error.message === 'Notification not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getUnreadCount(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const count = await NotifikasiService.getUnreadCount(req.accessScope);
      return res.json({ success: true, data: { unread_count: count } });
    } catch (error: any) {
      console.error('Get unread count error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getNotificationsByType(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { tipe } = req.params;
      const limit = Number(req.query.limit) || 10;
      const notifications = await NotifikasiService.getNotificationsByType(req.accessScope, tipe, limit);

      return res.json({ success: true, data: notifications });
    } catch (error: any) {
      console.error('Get notifications by type error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getNotificationStats(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const stats = await NotifikasiService.getNotificationStats(req.accessScope);
      return res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('Get notification stats error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async createNotification(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data = CreateNotifikasiSchema.parse(req.body);
      const notification = await NotifikasiService.createNotification(req.accessScope, data);

      return res.status(201).json({ success: true, data: notification });
    } catch (error: any) {
      console.error('Create notification error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create notification'
      });
    }
  }

  static async updateNotification(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const data = UpdateNotifikasiSchema.parse(req.body);
      const result = await NotifikasiService.updateNotification(req.accessScope, id, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update notification error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update notification'
      });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const result = await NotifikasiService.markAsRead(req.accessScope, id);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Mark as read error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to mark notification as read'
      });
    }
  }

  static async markAllAsRead(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const result = await NotifikasiService.markAllAsRead(req.accessScope);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Mark all as read error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async sendBulkNotifications(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const request = BulkNotificationRequestSchema.parse(req.body);
      const result = await NotifikasiService.sendBulkNotifications(req.accessScope, request);

      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      console.error('Send bulk notifications error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to send bulk notifications'
      });
    }
  }

  static async cleanupExpiredNotifications(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Only God and Admin users can cleanup expired notifications
      if ((req.user.level || 5) > 2) {
        return res.status(403).json({ success: false, message: 'Insufficient permissions' });
      }

      const result = await NotifikasiService.cleanupExpiredNotifications();
      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Cleanup expired notifications error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}