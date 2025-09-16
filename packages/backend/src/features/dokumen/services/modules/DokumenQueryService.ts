/**
 * Document Query Service Module
 * Handles document search and retrieval operations
 */

import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { SearchDokumenQuery, DokumenMinio } from '../../models/DokumenCore';

export class DokumenQueryService {
  static async search(scope: AccessScope, query: SearchDokumenQuery) {
    const offset = (Number(query.page) - 1) * Number(query.limit);

    let sql = `
      SELECT dm.*
      FROM dokumen_minio dm
      WHERE 1=1
    `;

    const params: any[] = [];

    // Search filter
    if (query.search) {
      sql += ` AND (
        dm.nama_file LIKE ? OR
        dm.nama_file_asli LIKE ? OR
        dm.deskripsi LIKE ?
      )`;
      const searchPattern = `%${query.search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Type filter
    if (query.tipe_file) {
      sql += ` AND dm.tipe_file = ?`;
      params.push(query.tipe_file);
    }

    // Category filter
    if (query.kategori_dokumen) {
      sql += ` AND dm.kategori_dokumen = ?`;
      params.push(query.kategori_dokumen);
    }

    // Status filter
    if (query.status) {
      sql += ` AND dm.status = ?`;
      params.push(query.status);
    }

    // Public filter
    if (query.is_public !== undefined) {
      sql += ` AND dm.is_public = ?`;
      params.push(query.is_public ? 1 : 0);
    }

    // Date range filter
    if (query.start_date) {
      sql += ` AND DATE(dm.dibuat_pada) >= ?`;
      params.push(query.start_date);
    }

    if (query.end_date) {
      sql += ` AND DATE(dm.dibuat_pada) <= ?`;
      params.push(query.end_date);
    }

    // Apply access scope
    const scopedQuery = applyScopeToSql(sql, params, scope, {
      tenantColumn: 'dm.tenant_id',
      storeColumn: 'dm.toko_id'
    });

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM (${scopedQuery.sql}) as filtered`;
    const [countRows] = await pool.execute<RowDataPacket[]>(countSql, scopedQuery.params);
    const total = countRows[0].total;

    // Get paginated results
    const finalSql = `${scopedQuery.sql} ORDER BY dm.dibuat_pada DESC LIMIT ? OFFSET ?`;
    const finalParams = [...scopedQuery.params, Number(query.limit), offset];

    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, finalParams);

    return {
      data: rows as DokumenMinio[],
      total,
      page: Number(query.page),
      totalPages: Math.ceil(total / Number(query.limit))
    };
  }

  static async findById(scope: AccessScope, id: string): Promise<DokumenMinio | null> {
    const sql = `
      SELECT dm.*
      FROM dokumen_minio dm
      WHERE dm.id = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [id], scope, {
      tenantColumn: 'dm.tenant_id',
      storeColumn: 'dm.toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return rows[0] as DokumenMinio || null;
  }

  static async getDocumentsByCategory(scope: AccessScope, kategori: string) {
    const sql = `
      SELECT dm.*
      FROM dokumen_minio dm
      WHERE dm.kategori_dokumen = ? AND dm.status = 'uploaded'
    `;

    const scopedQuery = applyScopeToSql(sql, [kategori], scope, {
      tenantColumn: 'dm.tenant_id',
      storeColumn: 'dm.toko_id'
    });

    const finalSql = `${scopedQuery.sql} ORDER BY dm.dibuat_pada DESC`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);

    return rows as DokumenMinio[];
  }

  static async getStorageStats(scope: AccessScope) {
    const sql = `
      SELECT
        COUNT(*) as total_files,
        COALESCE(SUM(dm.ukuran_file), 0) as total_size,
        dm.tipe_file,
        dm.kategori_dokumen,
        COUNT(*) as file_count
      FROM dokumen_minio dm
      WHERE dm.status = 'uploaded'
    `;

    const scopedQuery = applyScopeToSql(sql, [], scope, {
      tenantColumn: 'dm.tenant_id',
      storeColumn: 'dm.toko_id'
    });

    const finalSql = `${scopedQuery.sql} GROUP BY dm.tipe_file, dm.kategori_dokumen`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);

    return rows.map(row => ({
      tipe_file: row.tipe_file,
      kategori_dokumen: row.kategori_dokumen,
      file_count: Number(row.file_count),
      total_size: Number(row.total_size)
    }));
  }
}