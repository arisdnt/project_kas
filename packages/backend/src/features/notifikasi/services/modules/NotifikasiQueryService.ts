/**
 * Notification Query Service Module
 * Handles notification search and retrieval operations
 */

import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { SearchNotifikasiQuery, Notifikasi } from '../../models/NotifikasiCore';

export class NotifikasiQueryService {
  static async search(scope: AccessScope, query: SearchNotifikasiQuery) {
    const offset = (Number(query.page) - 1) * Number(query.limit);

    let sql = `
      SELECT n.*
      FROM notifikasi n
      WHERE 1=1
    `;

    const params: any[] = [];

    // User-specific notifications (if user_id is null, it's for all users)
    if (scope.tenantId) {
      sql += ` AND (n.user_id IS NULL OR n.user_id = ?)`;
      params.push(scope.tenantId);
    }

    // Type filter
    if (query.tipe) {
      sql += ` AND n.tipe = ?`;
      params.push(query.tipe);
    }

    // Category filter
    if (query.kategori) {
      sql += ` AND n.kategori = ?`;
      params.push(query.kategori);
    }

    // Read status filter
    if (query.is_read !== undefined) {
      sql += ` AND n.is_read = ?`;
      params.push(query.is_read ? 1 : 0);
    }

    // Priority filter
    if (query.prioritas) {
      sql += ` AND n.prioritas = ?`;
      params.push(query.prioritas);
    }

    // Date range filter
    if (query.start_date) {
      sql += ` AND DATE(n.dibuat_pada) >= ?`;
      params.push(query.start_date);
    }

    if (query.end_date) {
      sql += ` AND DATE(n.dibuat_pada) <= ?`;
      params.push(query.end_date);
    }

    // Exclude expired notifications
    sql += ` AND (n.expires_at IS NULL OR n.expires_at > NOW())`;

    // Apply access scope
    const scopedQuery = applyScopeToSql(sql, params, scope, {
      tenantColumn: 'n.tenant_id',
      storeColumn: 'n.toko_id'
    });

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM (${scopedQuery.sql}) as filtered`;
    const [countRows] = await pool.execute<RowDataPacket[]>(countSql, scopedQuery.params);
    const total = countRows[0].total;

    // Get paginated results
    const finalSql = `${scopedQuery.sql} ORDER BY n.prioritas DESC, n.dibuat_pada DESC LIMIT ? OFFSET ?`;
    const finalParams = [...scopedQuery.params, Number(query.limit), offset];

    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, finalParams);

    return {
      data: rows as Notifikasi[],
      total,
      page: Number(query.page),
      totalPages: Math.ceil(total / Number(query.limit))
    };
  }

  static async findById(scope: AccessScope, id: string): Promise<Notifikasi | null> {
    let sql = `
      SELECT n.*
      FROM notifikasi n
      WHERE n.id = ?
    `;

    const params = [id];

    // User can only see their own notifications or global notifications
    if (scope.tenantId) {
      sql += ` AND (n.user_id IS NULL OR n.user_id = ?)`;
      params.push(scope.tenantId);
    }

    const scopedQuery = applyScopeToSql(sql, params, scope, {
      tenantColumn: 'n.tenant_id',
      storeColumn: 'n.toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return rows[0] as Notifikasi || null;
  }

  static async getUnreadCount(scope: AccessScope): Promise<number> {
    let sql = `
      SELECT COUNT(*) as count
      FROM notifikasi n
      WHERE n.is_read = 0 AND (n.expires_at IS NULL OR n.expires_at > NOW())
    `;

    const params: any[] = [];

    // User-specific count
    if (scope.tenantId) {
      sql += ` AND (n.user_id IS NULL OR n.user_id = ?)`;
      params.push(scope.tenantId);
    }

    const scopedQuery = applyScopeToSql(sql, params, scope, {
      tenantColumn: 'n.tenant_id',
      storeColumn: 'n.toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return Number(rows[0].count);
  }

  static async getNotificationsByType(scope: AccessScope, tipe: string, limit: number = 10) {
    let sql = `
      SELECT n.*
      FROM notifikasi n
      WHERE n.tipe = ? AND (n.expires_at IS NULL OR n.expires_at > NOW())
    `;

    const params = [tipe];

    if (scope.tenantId) {
      sql += ` AND (n.user_id IS NULL OR n.user_id = ?)`;
      params.push(scope.tenantId);
    }

    const scopedQuery = applyScopeToSql(sql, params, scope, {
      tenantColumn: 'n.tenant_id',
      storeColumn: 'n.toko_id'
    });

    const finalSql = `${scopedQuery.sql} ORDER BY n.dibuat_pada DESC LIMIT ?`;
    const finalParams = [...scopedQuery.params, limit];

    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, finalParams);
    return rows as Notifikasi[];
  }

  static async getNotificationStats(scope: AccessScope) {
    let sql = `
      SELECT
        n.tipe,
        n.kategori,
        n.prioritas,
        COUNT(*) as total,
        SUM(CASE WHEN n.is_read = 0 THEN 1 ELSE 0 END) as unread
      FROM notifikasi n
      WHERE (n.expires_at IS NULL OR n.expires_at > NOW())
    `;

    const params: any[] = [];

    if (scope.tenantId) {
      sql += ` AND (n.user_id IS NULL OR n.user_id = ?)`;
      params.push(scope.tenantId);
    }

    const scopedQuery = applyScopeToSql(sql, params, scope, {
      tenantColumn: 'n.tenant_id',
      storeColumn: 'n.toko_id'
    });

    const finalSql = `${scopedQuery.sql} GROUP BY n.tipe, n.kategori, n.prioritas`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);

    return rows.map(row => ({
      tipe: row.tipe,
      kategori: row.kategori,
      prioritas: row.prioritas,
      total: Number(row.total),
      unread: Number(row.unread)
    }));
  }
}