/**
 * Notification Mutation Service Module
 * Handles notification creation, updates, and sending operations
 */

import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';
import { CreateNotifikasi, UpdateNotifikasi, BulkNotificationRequest } from '../../models/NotifikasiCore';

export class NotifikasiMutationService {
  static async create(scope: AccessScope, data: CreateNotifikasi) {
    const id = uuidv4();

    const sql = `
      INSERT INTO notifikasi (
        id, tenant_id, toko_id, user_id, tipe, kategori, judul, pesan,
        data_tambahan, is_read, is_sent, kanal, prioritas, expires_at,
        dibuat_pada
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
      )
    `;

    const params = [
      id, data.tenant_id, data.toko_id || null, data.user_id || null,
      data.tipe, data.kategori, data.judul, data.pesan,
      data.data_tambahan ? JSON.stringify(data.data_tambahan) : null,
      data.is_read ? 1 : 0, data.is_sent ? 1 : 0,
      JSON.stringify(data.kanal), data.prioritas, data.expires_at
    ];

    await pool.execute(sql, params);

    // Return created notification
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM notifikasi WHERE id = ?',
      [id]
    );

    return rows[0];
  }

  static async update(scope: AccessScope, id: string, data: UpdateNotifikasi) {
    // Check if notification exists and user has access
    let checkSql = `
      SELECT id FROM notifikasi
      WHERE id = ? AND tenant_id = ?
    `;
    let checkParams = [id, scope.tenantId];

    // Users can only update their own notifications
    if (scope.tenantId && (scope.level || 5) > 2) {
      checkSql += ` AND (user_id IS NULL OR user_id = ?)`;
      checkParams.push(scope.tenantId);
    }

    if (scope.storeId) {
      checkSql += ` AND (toko_id IS NULL OR toko_id = ?)`;
      checkParams.push(scope.storeId);
    }

    const [checkRows] = await pool.execute<RowDataPacket[]>(checkSql, checkParams);

    if (checkRows.length === 0) {
      throw new Error('Notification not found or access denied');
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (data.is_read !== undefined) {
      updates.push('is_read = ?');
      params.push(data.is_read ? 1 : 0);

      if (data.is_read && !data.dibaca_pada) {
        updates.push('dibaca_pada = NOW()');
      }
    }

    if (data.is_sent !== undefined) {
      updates.push('is_sent = ?');
      params.push(data.is_sent ? 1 : 0);

      if (data.is_sent && !data.dikirim_pada) {
        updates.push('dikirim_pada = NOW()');
      }
    }

    if (data.dibaca_pada !== undefined) {
      updates.push('dibaca_pada = ?');
      params.push(data.dibaca_pada);
    }

    if (data.dikirim_pada !== undefined) {
      updates.push('dikirim_pada = ?');
      params.push(data.dikirim_pada);
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    const sql = `UPDATE notifikasi SET ${updates.join(', ')} WHERE id = ?`;
    params.push(id);

    await pool.execute(sql, params);

    // Return updated notification
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM notifikasi WHERE id = ?',
      [id]
    );

    return rows[0];
  }

  static async markAsRead(scope: AccessScope, id: string) {
    return this.update(scope, id, {
      is_read: true,
      dibaca_pada: new Date()
    });
  }

  static async markAllAsRead(scope: AccessScope) {
    let sql = `
      UPDATE notifikasi
      SET is_read = 1, dibaca_pada = NOW()
      WHERE is_read = 0 AND tenant_id = ?
    `;
    let params = [scope.tenantId];

    // Users can only mark their own notifications as read
    if (scope.tenantId && (scope.level || 5) > 2) {
      sql += ` AND (user_id IS NULL OR user_id = ?)`;
      params.push(scope.tenantId);
    }

    if (scope.storeId) {
      sql += ` AND (toko_id IS NULL OR toko_id = ?)`;
      params.push(scope.storeId);
    }

    const [result] = await pool.execute(sql, params);
    return { updated: (result as any).affectedRows };
  }

  static async createBulkNotifications(scope: AccessScope, request: BulkNotificationRequest) {
    // Get template
    const templateSql = `
      SELECT * FROM notification_template
      WHERE kode = ? AND tenant_id = ? AND is_aktif = 1
    `;
    const [templateRows] = await pool.execute<RowDataPacket[]>(templateSql, [request.template_kode, scope.tenantId]);

    if (templateRows.length === 0) {
      throw new Error('Notification template not found or inactive');
    }

    const template = templateRows[0];

    // Get target users
    let targetUsers: any[] = [];

    if (request.user_ids && request.user_ids.length > 0) {
      const userPlaceholders = request.user_ids.map(() => '?').join(',');
      const userSql = `SELECT id, nama FROM users WHERE id IN (${userPlaceholders}) AND tenant_id = ?`;
      const userParams = [...request.user_ids, scope.tenantId];
      const [userRows] = await pool.execute<RowDataPacket[]>(userSql, userParams);
      targetUsers = userRows;
    } else if (request.toko_ids && request.toko_ids.length > 0) {
      const storePlaceholders = request.toko_ids.map(() => '?').join(',');
      const storeSql = `SELECT u.id, u.nama FROM users u WHERE u.toko_id IN (${storePlaceholders}) AND u.tenant_id = ?`;
      const storeParams = [...request.toko_ids, scope.tenantId];
      const [storeRows] = await pool.execute<RowDataPacket[]>(storeSql, storeParams);
      targetUsers = storeRows;
    } else {
      // Send to all users in tenant
      const allUsersSql = `SELECT id, nama FROM users WHERE tenant_id = ? AND status = 'aktif'`;
      const [allUsersRows] = await pool.execute<RowDataPacket[]>(allUsersSql, [scope.tenantId]);
      targetUsers = allUsersRows;
    }

    // Create notifications for each target user
    const notifications = [];
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const user of targetUsers) {
        const id = uuidv4();

        // Replace template variables
        let judul = template.template_judul;
        let pesan = template.template_pesan;

        if (request.data) {
          Object.keys(request.data).forEach(key => {
            const placeholder = `{{${key}}}`;
            judul = judul.replace(new RegExp(placeholder, 'g'), request.data![key]);
            pesan = pesan.replace(new RegExp(placeholder, 'g'), request.data![key]);
          });
        }

        // Replace user-specific variables
        judul = judul.replace(/{{user_nama}}/g, user.nama);
        pesan = pesan.replace(/{{user_nama}}/g, user.nama);

        const insertSql = `
          INSERT INTO notifikasi (
            id, tenant_id, toko_id, user_id, tipe, kategori, judul, pesan,
            kanal, prioritas, dibuat_pada
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const kanal = request.kanal_override || template.kanal_default;
        const prioritas = request.prioritas_override || template.prioritas_default;

        await connection.execute(insertSql, [
          id, scope.tenantId, scope.storeId || null, user.id,
          template.tipe, 'info', judul, pesan,
          JSON.stringify(kanal), prioritas
        ]);

        notifications.push({ id, user_id: user.id, judul, pesan });
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return {
      created: notifications.length,
      notifications
    };
  }

  static async deleteExpiredNotifications() {
    const sql = `
      DELETE FROM notifikasi
      WHERE expires_at IS NOT NULL AND expires_at < NOW()
    `;

    const [result] = await pool.execute(sql);
    return { deleted: (result as any).affectedRows };
  }
}