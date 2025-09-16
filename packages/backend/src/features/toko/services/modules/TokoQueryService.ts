/**
 * Store Query Service Module
 * Handles store search and retrieval operations
 */

import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { SearchTokoQuery, Toko, TokoConfig, TokoOperatingHours } from '../../models/TokoCore';

export class TokoQueryService {
  static async search(scope: AccessScope, query: SearchTokoQuery) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const offset = (page - 1) * limit;

    let sql = `
      SELECT t.*
      FROM toko t
      WHERE 1=1
    `;

    const params: any[] = [];

    // Search filter
    if (query.search) {
      sql += ` AND (t.nama LIKE ? OR t.kode LIKE ? OR t.alamat LIKE ?)`;
      const searchPattern = `%${query.search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Status filter
    if (query.status) {
      sql += ` AND t.status = ?`;
      params.push(query.status);
    }

    // Code filter
    if (query.kode) {
      sql += ` AND t.kode = ?`;
      params.push(query.kode);
    }

    // Apply access scope
    const scopedQuery = applyScopeToSql(sql, params, scope, {
      tenantColumn: 't.tenant_id'
    });

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM (${scopedQuery.sql.trim()}) as filtered`;
    const [countRows] = await pool.query<RowDataPacket[]>(countSql, scopedQuery.params);
    const total = countRows[0].total;

    // Get paginated results
    const finalSql = `${scopedQuery.sql.trim()} ORDER BY t.nama ASC LIMIT ? OFFSET ?`;
    const finalParams = [...scopedQuery.params, limit, offset];
    const [rows] = await pool.query<RowDataPacket[]>(finalSql, finalParams);

    return {
      data: rows as Toko[],
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async findById(scope: AccessScope, id: string): Promise<Toko | null> {
    const sql = `
      SELECT t.*
      FROM toko t
      WHERE t.id = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [id], scope, {
      tenantColumn: 't.tenant_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return rows[0] as Toko || null;
  }

  static async findByCode(scope: AccessScope, kode: string): Promise<Toko | null> {
    const sql = `
      SELECT t.*
      FROM toko t
      WHERE t.kode = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [kode], scope, {
      tenantColumn: 't.tenant_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return rows[0] as Toko || null;
  }

  static async getTokoConfigs(scope: AccessScope, tokoId: string) {
    const sql = `
      SELECT tc.*
      FROM toko_config tc
      JOIN toko t ON tc.toko_id = t.id
      WHERE tc.toko_id = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [tokoId], scope, {
      tenantColumn: 't.tenant_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);

    return rows.map(row => ({
      ...row,
      value: this.parseConfigValue(row.value, row.tipe)
    })) as TokoConfig[];
  }

  static async getTokoConfig(scope: AccessScope, tokoId: string, key: string) {
    const sql = `
      SELECT tc.*
      FROM toko_config tc
      JOIN toko t ON tc.toko_id = t.id
      WHERE tc.toko_id = ? AND tc.key = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [tokoId, key], scope, {
      tenantColumn: 't.tenant_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      ...row,
      value: this.parseConfigValue(row.value, row.tipe)
    } as TokoConfig;
  }

  static async getOperatingHours(scope: AccessScope, tokoId: string) {
    const sql = `
      SELECT toh.*
      FROM toko_operating_hours toh
      JOIN toko t ON toh.toko_id = t.id
      WHERE toh.toko_id = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [tokoId], scope, {
      tenantColumn: 't.tenant_id'
    });

    const finalSql = `${scopedQuery.sql} ORDER BY
      CASE toh.hari
        WHEN 'senin' THEN 1
        WHEN 'selasa' THEN 2
        WHEN 'rabu' THEN 3
        WHEN 'kamis' THEN 4
        WHEN 'jumat' THEN 5
        WHEN 'sabtu' THEN 6
        WHEN 'minggu' THEN 7
      END`;

    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);
    return rows as TokoOperatingHours[];
  }

  static async getTokoStats(scope: AccessScope, tokoId: string) {
    const today = new Date().toISOString().split('T')[0];

    // Get store statistics
    const statsQueries = [
      // Total products
      `SELECT COUNT(*) as total_products FROM produk WHERE toko_id = '${tokoId}'`,

      // Transactions today
      `SELECT COUNT(*) as total_transactions_today, COALESCE(SUM(total), 0) as total_sales_today
       FROM transaksi_penjualan
       WHERE toko_id = '${tokoId}' AND DATE(tanggal) = '${today}' AND status = 'completed'`,

      // Total customers
      `SELECT COUNT(*) as total_customers FROM pelanggan WHERE toko_id = '${tokoId}' AND status = 'aktif'`,

      // Low stock items
      `SELECT COUNT(*) as low_stock_items
       FROM inventaris i
       JOIN produk p ON i.produk_id = p.id
       WHERE i.toko_id = '${tokoId}' AND i.stok_tersedia <= COALESCE(i.stok_minimum_toko, p.stok_minimum, 0)`,

      // Active users
      `SELECT COUNT(*) as active_users FROM users WHERE toko_id = '${tokoId}' AND status = 'aktif'`
    ];

    const results = await Promise.all(
      statsQueries.map(query => pool.execute<RowDataPacket[]>(query))
    );

    return {
      toko_id: tokoId,
      total_products: Number(results[0][0][0]?.total_products || 0),
      total_transactions_today: Number(results[1][0][0]?.total_transactions_today || 0),
      total_sales_today: Number(results[1][0][0]?.total_sales_today || 0),
      total_customers: Number(results[2][0][0]?.total_customers || 0),
      low_stock_items: Number(results[3][0][0]?.low_stock_items || 0),
      active_users: Number(results[4][0][0]?.active_users || 0)
    };
  }

  static async getActiveStores(scope: AccessScope) {
    const sql = `
      SELECT t.*
      FROM toko t
      WHERE t.status = 'aktif'
    `;

    const scopedQuery = applyScopeToSql(sql, [], scope, {
      tenantColumn: 't.tenant_id'
    });

    const finalSql = `${scopedQuery.sql} ORDER BY t.nama ASC`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);

    return rows as Toko[];
  }

  private static parseConfigValue(value: string, tipe: string): any {
    switch (tipe) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value === 'true';
      case 'json':
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      default:
        return value;
    }
  }
}