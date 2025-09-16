/**
 * Session Query Service Module
 * Handles user session search and retrieval operations
 */

import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { SearchSessionQuery } from '../../models/SessionCore';

export class SessionQueryService {
  static async search(scope: AccessScope, query: SearchSessionQuery) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const offset = (page - 1) * limit;

    let baseWhere = '';
    const baseParams: any[] = [];

    // Filter by user
    if (query.user_id) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'us.user_id = ?';
      baseParams.push(query.user_id);
    }

    // Filter by active status
    if (query.is_active) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'us.is_active = ?';
      baseParams.push(query.is_active === 'true' ? 1 : 0);
    }

    // Filter by expired status
    if (query.expired === 'true') {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'us.expires_at < NOW()';
    } else if (query.expired === 'false') {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'us.expires_at > NOW()';
    }

    // Filter by IP address
    if (query.ip_address) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'us.ip_address LIKE ?';
      baseParams.push(`%${query.ip_address}%`);
    }

    return this.executeSearch(scope, baseWhere, baseParams, limit, offset);
  }

  private static async executeSearch(
    scope: AccessScope,
    baseWhere: string,
    baseParams: any[],
    limit: number,
    offset: number,
    page: number = 1
  ) {
    // Count query
    const countBase = `
      SELECT COUNT(*) as total
      FROM user_sessions us
      LEFT JOIN users u ON us.user_id = u.id
      ${baseWhere}
    `;

    const scopedCount = applyScopeToSql(countBase, baseParams, scope, {
      tenantColumn: 'us.tenant_id',
      storeColumn: 'us.toko_id'
    });

    const [countRows] = await pool.execute<RowDataPacket[]>(scopedCount.sql, scopedCount.params);
    const total = Number(countRows[0]?.total || 0);

    // Data query
    const dataBase = `
      SELECT
        us.id, us.user_id, us.ip_address, us.user_agent, us.expires_at,
        us.is_active, us.dibuat_pada, us.diperbarui_pada,
        u.nama_lengkap as user_nama, u.username, u.email as user_email,
        t.nama as toko_nama
      FROM user_sessions us
      LEFT JOIN users u ON us.user_id = u.id
      LEFT JOIN toko t ON us.toko_id = t.id
      ${baseWhere}
    `;

    const scopedData = applyScopeToSql(dataBase, baseParams, scope, {
      tenantColumn: 'us.tenant_id',
      storeColumn: 'us.toko_id'
    });

    const finalSql = `${scopedData.sql} ORDER BY us.dibuat_pada DESC LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedData.params);

    return {
      data: rows as any[],
      total,
      page: page,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async findActiveSessionsByUser(userId: string) {
    const sql = `
      SELECT
        us.id, us.ip_address, us.user_agent, us.expires_at, us.dibuat_pada,
        t.nama as toko_nama
      FROM user_sessions us
      LEFT JOIN toko t ON us.toko_id = t.id
      WHERE us.user_id = ? AND us.is_active = 1 AND us.expires_at > NOW()
      ORDER BY us.dibuat_pada DESC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [userId]);
    return rows as any[];
  }

  static async findSessionByToken(token: string) {
    const sql = `
      SELECT
        us.*,
        u.nama_lengkap as user_nama, u.username, u.email as user_email,
        u.tenant_id, u.toko_id as user_toko_id, u.level as user_level
      FROM user_sessions us
      LEFT JOIN users u ON us.user_id = u.id
      WHERE us.session_token = ? AND us.is_active = 1 AND us.expires_at > NOW()
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [token]);
    return rows[0] as any || null;
  }

  static async getSessionStats(scope: AccessScope) {
    const sql = `
      SELECT
        COUNT(*) as total_sessions,
        SUM(CASE WHEN us.is_active = 1 AND us.expires_at > NOW() THEN 1 ELSE 0 END) as active_sessions,
        SUM(CASE WHEN us.expires_at <= NOW() THEN 1 ELSE 0 END) as expired_sessions,
        COUNT(DISTINCT us.user_id) as unique_users,
        COUNT(DISTINCT us.ip_address) as unique_ips
      FROM user_sessions us
      WHERE us.dibuat_pada >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;

    const scopedQuery = applyScopeToSql(sql, [], scope, {
      tenantColumn: 'us.tenant_id',
      storeColumn: undefined
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return rows[0] as any;
  }
}