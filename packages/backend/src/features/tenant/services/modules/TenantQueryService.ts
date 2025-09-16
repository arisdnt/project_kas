/**
 * Tenant Query Service Module
 * Handles tenant search and retrieval operations
 */

import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { SearchTenantQuery } from '../../models/TenantCore';

export class TenantQueryService {
  static async search(query: SearchTenantQuery) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const offset = (page - 1) * limit;

    let baseWhere = '';
    const baseParams: any[] = [];

    // Text search
    if (query.search) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') +
        '(t.nama LIKE ? OR t.email LIKE ? OR t.telepon LIKE ?)';
      const like = `%${query.search}%`;
      baseParams.push(like, like, like);
    }

    // Status filter
    if (query.status) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 't.status = ?';
      baseParams.push(query.status);
    }

    // Package filter
    if (query.paket) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 't.paket = ?';
      baseParams.push(query.paket);
    }

    // Count query
    const countSql = `SELECT COUNT(*) as total FROM tenants t ${baseWhere}`;
    const [countRows] = await pool.execute<RowDataPacket[]>(countSql, baseParams);
    const total = Number(countRows[0]?.total || 0);

    // Data query with store counts
    const dataSql = `
      SELECT
        t.*,
        COUNT(tk.id) as jumlah_toko,
        COUNT(u.id) as jumlah_pengguna
      FROM tenants t
      LEFT JOIN toko tk ON t.id = tk.tenant_id AND tk.status = 'aktif'
      LEFT JOIN users u ON t.id = u.tenant_id AND u.status = 'aktif'
      ${baseWhere}
      GROUP BY t.id
      ORDER BY t.dibuat_pada DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(dataSql, baseParams);

    return {
      data: rows as any[],
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async findById(id: string) {
    const sql = `
      SELECT
        t.*,
        COUNT(DISTINCT tk.id) as jumlah_toko,
        COUNT(DISTINCT u.id) as jumlah_pengguna,
        COUNT(DISTINCT tp.id) as total_transaksi_penjualan,
        COALESCE(SUM(tp.total), 0) as total_penjualan
      FROM tenants t
      LEFT JOIN toko tk ON t.id = tk.tenant_id AND tk.status = 'aktif'
      LEFT JOIN users u ON t.id = u.tenant_id AND u.status = 'aktif'
      LEFT JOIN transaksi_penjualan tp ON t.id = tp.tenant_id AND tp.status = 'completed'
      WHERE t.id = ?
      GROUP BY t.id
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [id]);
    return rows[0] as any || null;
  }

  static async getTenantStores(tenantId: string) {
    const sql = `
      SELECT
        tk.*,
        COUNT(DISTINCT u.id) as jumlah_pengguna,
        COUNT(DISTINCT tp.id) as total_transaksi,
        COALESCE(SUM(tp.total), 0) as total_penjualan
      FROM toko tk
      LEFT JOIN users u ON tk.id = u.toko_id AND u.status = 'aktif'
      LEFT JOIN transaksi_penjualan tp ON tk.id = tp.toko_id AND tp.status = 'completed'
      WHERE tk.tenant_id = ?
      GROUP BY tk.id
      ORDER BY tk.nama ASC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [tenantId]);
    return rows as any[];
  }

  static async getTenantStats() {
    const sql = `
      SELECT
        COUNT(*) as total_tenant,
        SUM(CASE WHEN status = 'aktif' THEN 1 ELSE 0 END) as tenant_aktif,
        SUM(CASE WHEN paket = 'basic' THEN 1 ELSE 0 END) as paket_basic,
        SUM(CASE WHEN paket = 'standard' THEN 1 ELSE 0 END) as paket_standard,
        SUM(CASE WHEN paket = 'premium' THEN 1 ELSE 0 END) as paket_premium,
        SUM(CASE WHEN paket = 'enterprise' THEN 1 ELSE 0 END) as paket_enterprise
      FROM tenants
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql);
    return rows[0] as any;
  }

  static async checkTenantLimits(tenantId: string) {
    const sql = `
      SELECT
        t.max_toko,
        t.max_pengguna,
        COUNT(DISTINCT tk.id) as current_toko,
        COUNT(DISTINCT u.id) as current_pengguna
      FROM tenants t
      LEFT JOIN toko tk ON t.id = tk.tenant_id AND tk.status = 'aktif'
      LEFT JOIN users u ON t.id = u.tenant_id AND u.status = 'aktif'
      WHERE t.id = ?
      GROUP BY t.id
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [tenantId]);
    const data = rows[0] as any;

    if (!data) {
      throw new Error('Tenant not found');
    }

    return {
      max_toko: data.max_toko,
      max_pengguna: data.max_pengguna,
      current_toko: data.current_toko,
      current_pengguna: data.current_pengguna,
      can_add_toko: data.current_toko < data.max_toko,
      can_add_pengguna: data.current_pengguna < data.max_pengguna
    };
  }
}