/**
 * Audit Query Service Module
 * Handles audit log search and retrieval operations
 */

import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { SearchAuditQuery } from '../../models/AuditLogCore';

export class AuditQueryService {
  static async search(scope: AccessScope, query: SearchAuditQuery) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 20);
    const offset = (page - 1) * limit;

    let baseWhere = '';
    const baseParams: any[] = [];

    // Text search across multiple fields
    if (query.search) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') +
        '(al.tabel LIKE ? OR al.record_id LIKE ? OR u.nama_lengkap LIKE ? OR al.ip_address LIKE ?)';
      const like = `%${query.search}%`;
      baseParams.push(like, like, like, like);
    }

    // Filter by user
    if (query.user_id) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'al.user_id = ?';
      baseParams.push(query.user_id);
    }

    // Filter by table
    if (query.tabel) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'al.tabel = ?';
      baseParams.push(query.tabel);
    }

    // Filter by action
    if (query.aksi) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'al.aksi = ?';
      baseParams.push(query.aksi);
    }

    // Filter by record ID
    if (query.record_id) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'al.record_id = ?';
      baseParams.push(query.record_id);
    }

    // Date range filter
    if (query.tanggal_dari) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'al.dibuat_pada >= ?';
      baseParams.push(query.tanggal_dari);
    }
    if (query.tanggal_sampai) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'al.dibuat_pada <= ?';
      baseParams.push(query.tanggal_sampai + ' 23:59:59');
    }

    return this.executeSearch(scope, baseWhere, baseParams, limit, offset);
  }

  private static async executeSearch(
    scope: AccessScope,
    baseWhere: string,
    baseParams: any[],
    limit: number,
    offset: number
  ) {
    // Count query
    const countBase = `
      SELECT COUNT(*) as total
      FROM audit_log al
      LEFT JOIN users u ON al.user_id = u.id
      ${baseWhere}
    `;

    const scopedCount = applyScopeToSql(countBase, baseParams, scope, {
      tenantColumn: 'al.tenant_id'
      // Audit logs are tenant-level, not store-specific
    });

    const [countRows] = await pool.execute<RowDataPacket[]>(scopedCount.sql, scopedCount.params);
    const total = Number(countRows[0]?.total || 0);

    // Data query
    const dataBase = `
      SELECT
        al.id, al.tabel, al.record_id, al.aksi, al.data_lama, al.data_baru,
        al.ip_address, al.user_agent, al.dibuat_pada,
        u.nama_lengkap as user_nama, u.username as user_username,
        u.email as user_email
      FROM audit_log al
      LEFT JOIN users u ON al.user_id = u.id
      ${baseWhere}
    `;

    const scopedData = applyScopeToSql(dataBase, baseParams, scope, {
      tenantColumn: 'al.tenant_id'
    });

    const finalSql = `${scopedData.sql} ORDER BY al.dibuat_pada DESC LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedData.params);

    const page = Math.floor(offset / limit) + 1;
    
    return {
      data: rows as any[],
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async findById(scope: AccessScope, id: string) {
    const sql = `
      SELECT
        al.*,
        u.nama_lengkap as user_nama, u.username as user_username, u.email as user_email
      FROM audit_log al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.id = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [id], scope, {
      tenantColumn: 'al.tenant_id',
      // storeColumn not needed for audit logs
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return rows[0] as any || null;
  }

  static async getActivitySummary(scope: AccessScope, startDate: string, endDate: string) {
    const sql = `
      SELECT
        al.aksi,
        al.tabel,
        COUNT(*) as jumlah_aktivitas,
        COUNT(DISTINCT al.user_id) as jumlah_user
      FROM audit_log al
      WHERE al.dibuat_pada >= ? AND al.dibuat_pada <= ?
    `;

    const scopedQuery = applyScopeToSql(sql, [startDate, endDate + ' 23:59:59'], scope, {
      tenantColumn: 'al.tenant_id',
      // storeColumn not needed for audit logs
    });

    const finalSql = `${scopedQuery.sql} GROUP BY al.aksi, al.tabel ORDER BY jumlah_aktivitas DESC`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);

    return rows as any[];
  }

  static async getUserActivity(scope: AccessScope, userId: string, startDate: string, endDate: string) {
    const sql = `
      SELECT
        al.aksi,
        al.tabel,
        COUNT(*) as jumlah_aktivitas,
        DATE(al.dibuat_pada) as tanggal
      FROM audit_log al
      WHERE al.user_id = ? AND al.dibuat_pada >= ? AND al.dibuat_pada <= ?
    `;

    const scopedQuery = applyScopeToSql(sql, [userId, startDate, endDate + ' 23:59:59'], scope, {
      tenantColumn: 'al.tenant_id',
      // storeColumn not needed for audit logs
    });

    const finalSql = `${scopedQuery.sql} GROUP BY al.aksi, al.tabel, DATE(al.dibuat_pada) ORDER BY al.dibuat_pada DESC`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);

    return rows as any[];
  }
}