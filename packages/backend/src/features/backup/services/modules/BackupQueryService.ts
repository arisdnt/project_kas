/**
 * Backup Query Service Module
 * Handles backup job search and retrieval operations
 */

import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { SearchBackupQuery, BackupJob } from '../../models/BackupCore';

export class BackupQueryService {
  static async searchBackupJobs(scope: AccessScope, query: SearchBackupQuery) {
    const offset = (Number(query.page) - 1) * Number(query.limit);

    let sql = `
      SELECT bj.*
      FROM backup_job bj
      WHERE 1=1
    `;

    const params: any[] = [];

    // Search filter
    if (query.search) {
      sql += ` AND bj.nama LIKE ?`;
      params.push(`%${query.search}%`);
    }

    // Type filter
    if (query.tipe) {
      sql += ` AND bj.tipe = ?`;
      params.push(query.tipe);
    }

    // Status filter
    if (query.status) {
      sql += ` AND bj.status = ?`;
      params.push(query.status);
    }

    // Format filter
    if (query.format) {
      sql += ` AND bj.format = ?`;
      params.push(query.format);
    }

    // Date range filter
    if (query.start_date) {
      sql += ` AND DATE(bj.dibuat_pada) >= ?`;
      params.push(query.start_date);
    }

    if (query.end_date) {
      sql += ` AND DATE(bj.dibuat_pada) <= ?`;
      params.push(query.end_date);
    }

    // Apply access scope
    const scopedQuery = applyScopeToSql(sql, params, scope, {
      tenantColumn: 'bj.tenant_id',
      storeColumn: 'bj.toko_id'
    });

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM (${scopedQuery.sql}) as filtered`;
    const [countRows] = await pool.execute<RowDataPacket[]>(countSql, scopedQuery.params);
    const total = countRows[0].total;

    // Get paginated results
    const finalSql = `${scopedQuery.sql} ORDER BY bj.dibuat_pada DESC LIMIT ? OFFSET ?`;
    const finalParams = [...scopedQuery.params, Number(query.limit), offset];

    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, finalParams);

    return {
      data: rows as BackupJob[],
      total,
      page: Number(query.page),
      totalPages: Math.ceil(total / Number(query.limit))
    };
  }

  static async findBackupJobById(scope: AccessScope, id: string): Promise<BackupJob | null> {
    const sql = `
      SELECT bj.*
      FROM backup_job bj
      WHERE bj.id = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [id], scope, {
      tenantColumn: 'bj.tenant_id',
      storeColumn: 'bj.toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return rows[0] as BackupJob || null;
  }

  static async getRunningBackups(scope: AccessScope) {
    const sql = `
      SELECT bj.*
      FROM backup_job bj
      WHERE bj.status IN ('pending', 'running')
    `;

    const scopedQuery = applyScopeToSql(sql, [], scope, {
      tenantColumn: 'bj.tenant_id',
      storeColumn: 'bj.toko_id'
    });

    const finalSql = `${scopedQuery.sql} ORDER BY bj.dibuat_pada ASC`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);

    return rows as BackupJob[];
  }

  static async getBackupStats(scope: AccessScope) {
    const sql = `
      SELECT
        COUNT(*) as total_backups,
        SUM(CASE WHEN bj.status = 'completed' THEN 1 ELSE 0 END) as completed_backups,
        SUM(CASE WHEN bj.status = 'failed' THEN 1 ELSE 0 END) as failed_backups,
        SUM(CASE WHEN bj.status IN ('pending', 'running') THEN 1 ELSE 0 END) as active_backups,
        COALESCE(SUM(bj.file_size), 0) as total_size,
        bj.tipe,
        bj.format
      FROM backup_job bj
      WHERE bj.dibuat_pada >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;

    const scopedQuery = applyScopeToSql(sql, [], scope, {
      tenantColumn: 'bj.tenant_id',
      storeColumn: 'bj.toko_id'
    });

    const finalSql = `${scopedQuery.sql} GROUP BY bj.tipe, bj.format`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);

    return rows.map(row => ({
      tipe: row.tipe,
      format: row.format,
      total_backups: Number(row.total_backups),
      completed_backups: Number(row.completed_backups),
      failed_backups: Number(row.failed_backups),
      active_backups: Number(row.active_backups),
      total_size: Number(row.total_size)
    }));
  }

  static async getExpiredBackups() {
    const sql = `
      SELECT bj.*
      FROM backup_job bj
      WHERE bj.expires_at IS NOT NULL
        AND bj.expires_at < NOW()
        AND bj.status = 'completed'
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql);
    return rows as BackupJob[];
  }

  static async getScheduledBackups(scope: AccessScope) {
    const sql = `
      SELECT sb.*
      FROM scheduled_backup sb
      WHERE sb.is_aktif = 1 AND sb.next_run_at <= NOW()
    `;

    const scopedQuery = applyScopeToSql(sql, [], scope, {
      tenantColumn: 'sb.tenant_id',
      storeColumn: 'sb.toko_id'
    });

    const finalSql = `${scopedQuery.sql} ORDER BY sb.next_run_at ASC`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);

    return rows;
  }

  static async getDatabaseTables(scope: AccessScope): Promise<string[]> {
    // Get all tables that belong to the tenant's data
    const sql = `
      SELECT DISTINCT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME NOT IN ('users', 'tenant', 'toko', 'sessions')
        AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql);
    return rows.map(row => row.TABLE_NAME);
  }
}