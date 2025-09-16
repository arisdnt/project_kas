/**
 * Notification Routes
 * Notification system routes with proper authentication
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { NotifikasiController } from '../controllers/NotifikasiController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

// Basic notification routes
router.get('/',
  requirePermission(PERMISSIONS.NOTIFICATION_READ),
  NotifikasiController.searchNotifications
);

router.get('/unread-count',
  requirePermission(PERMISSIONS.NOTIFICATION_READ),
  NotifikasiController.getUnreadCount
);

router.get('/stats',
  requirePermission(PERMISSIONS.NOTIFICATION_READ),
  NotifikasiController.getNotificationStats
);

router.get('/type/:tipe',
  requirePermission(PERMISSIONS.NOTIFICATION_READ),
  NotifikasiController.getNotificationsByType
);

router.get('/:id',
  requirePermission(PERMISSIONS.NOTIFICATION_READ),
  NotifikasiController.findNotificationById
);

// Notification management routes
router.post('/',
  requirePermission(PERMISSIONS.NOTIFICATION_CREATE),
  NotifikasiController.createNotification
);

router.put('/:id',
  requirePermission(PERMISSIONS.NOTIFICATION_UPDATE),
  NotifikasiController.updateNotification
);

router.put('/:id/read',
  requirePermission(PERMISSIONS.NOTIFICATION_UPDATE),
  NotifikasiController.markAsRead
);

router.put('/read-all',
  requirePermission(PERMISSIONS.NOTIFICATION_UPDATE),
  NotifikasiController.markAllAsRead
);

// Bulk operations
router.post('/bulk-send',
  requirePermission(PERMISSIONS.NOTIFICATION_CREATE),
  NotifikasiController.sendBulkNotifications
);

// Admin only routes
router.post('/cleanup-expired',
  requirePermission(PERMISSIONS.SYSTEM_MANAGE),
  NotifikasiController.cleanupExpiredNotifications
);

export default router;