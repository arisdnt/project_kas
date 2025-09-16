/**
 * Notification Service Orchestrator
 * Main service that coordinates notification operations
 */

import { AccessScope } from '@/core/middleware/accessScope';
import { SearchNotifikasiQuery, CreateNotifikasi, UpdateNotifikasi, BulkNotificationRequest } from '../models/NotifikasiCore';
import { NotifikasiQueryService } from './modules/NotifikasiQueryService';
import { NotifikasiMutationService } from './modules/NotifikasiMutationService';

export class NotifikasiService {
  // Query operations
  static async searchNotifications(scope: AccessScope, query: SearchNotifikasiQuery) {
    return NotifikasiQueryService.search(scope, query);
  }

  static async findNotificationById(scope: AccessScope, id: string) {
    const notification = await NotifikasiQueryService.findById(scope, id);
    if (!notification) {
      throw new Error('Notification not found');
    }
    return notification;
  }

  static async getUnreadCount(scope: AccessScope) {
    return NotifikasiQueryService.getUnreadCount(scope);
  }

  static async getNotificationsByType(scope: AccessScope, tipe: string, limit: number = 10) {
    return NotifikasiQueryService.getNotificationsByType(scope, tipe, limit);
  }

  static async getNotificationStats(scope: AccessScope) {
    return NotifikasiQueryService.getNotificationStats(scope);
  }

  // Mutation operations
  static async createNotification(scope: AccessScope, data: CreateNotifikasi) {
    // Auto-set tenant and store if not provided
    if (!data.tenant_id) {
      data.tenant_id = scope.tenantId;
    }
    if (!data.toko_id && scope.storeId) {
      data.toko_id = scope.storeId;
    }

    return NotifikasiMutationService.create(scope, data);
  }

  static async updateNotification(scope: AccessScope, id: string, data: UpdateNotifikasi) {
    return NotifikasiMutationService.update(scope, id, data);
  }

  static async markAsRead(scope: AccessScope, id: string) {
    return NotifikasiMutationService.markAsRead(scope, id);
  }

  static async markAllAsRead(scope: AccessScope) {
    return NotifikasiMutationService.markAllAsRead(scope);
  }

  static async sendBulkNotifications(scope: AccessScope, request: BulkNotificationRequest) {
    if ((scope.level || 5) > 2) {
      throw new Error('Insufficient permissions to send bulk notifications');
    }
    return NotifikasiMutationService.createBulkNotifications(scope, request);
  }

  static async cleanupExpiredNotifications() {
    return NotifikasiMutationService.deleteExpiredNotifications();
  }

  // Helper methods for common notification types
  static async createInventoryAlert(scope: AccessScope, productId: string, currentStock: number, minimumStock: number) {
    return this.createNotification(scope, {
      tenant_id: scope.tenantId,
      toko_id: scope.storeId,
      tipe: 'inventory',
      kategori: 'warning',
      judul: 'Low Stock Alert',
      pesan: `Product stock is running low. Current stock: ${currentStock}, Minimum: ${minimumStock}`,
      data_tambahan: {
        product_id: productId,
        current_stock: currentStock,
        minimum_stock: minimumStock
      },
      kanal: ['in_app', 'email'],
      prioritas: 'high',
      is_read: false,
      is_sent: false
    });
  }

  static async createTransactionAlert(scope: AccessScope, transactionId: string, amount: number, type: 'sale' | 'purchase') {
    return this.createNotification(scope, {
      tenant_id: scope.tenantId,
      toko_id: scope.storeId,
      tipe: 'transaction',
      kategori: 'success',
      judul: `${type === 'sale' ? 'Sale' : 'Purchase'} Transaction Completed`,
      pesan: `A new ${type} transaction has been completed for ${amount}`,
      data_tambahan: {
        transaction_id: transactionId,
        amount,
        type
      },
      kanal: ['in_app'],
      prioritas: 'medium',
      is_read: false,
      is_sent: false
    });
  }

  static async createSystemAlert(scope: AccessScope, message: string, kategori: 'error' | 'warning' | 'info' = 'info') {
    return this.createNotification(scope, {
      tenant_id: scope.tenantId,
      tipe: 'system',
      kategori,
      judul: 'System Notification',
      pesan: message,
      kanal: ['in_app'],
      prioritas: kategori === 'error' ? 'urgent' : 'medium',
      is_read: false,
      is_sent: false
    });
  }
}