/**
 * Sales Report Service Module
 * Handles sales reporting and analytics operations
 */

import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';

export class PenjualanReportService {
  static async getDailySales(scope: AccessScope, date: string) {
    const sql = `
      SELECT
        COUNT(*) as total_transaksi,
        COALESCE(SUM(total), 0) as total_penjualan,
        COALESCE(AVG(total), 0) as rata_rata_transaksi,
        COALESCE(SUM(CASE WHEN metode_bayar = 'tunai' THEN total ELSE 0 END), 0) as tunai,
        COALESCE(SUM(CASE WHEN metode_bayar != 'tunai' THEN total ELSE 0 END), 0) as non_tunai
      FROM transaksi_penjualan
      WHERE DATE(tanggal) = ? AND status = 'completed'
    `;

    const scopedQuery = applyScopeToSql(sql, [date], scope, {
      tenantColumn: 'tenant_id',
      storeColumn: 'toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return rows[0] as any;
  }

  static async getTopProducts(scope: AccessScope, startDate: string, endDate: string, limit = 10) {
    const sql = `
      SELECT
        p.id, p.nama as produk_nama, p.kode as produk_kode,
        SUM(itp.kuantitas) as total_terjual,
        COALESCE(SUM(itp.subtotal), 0) as total_pendapatan,
        COUNT(DISTINCT tp.id) as jumlah_transaksi
      FROM item_transaksi_penjualan itp
      JOIN transaksi_penjualan tp ON itp.transaksi_penjualan_id = tp.id
      JOIN produk p ON itp.produk_id = p.id
      WHERE tp.status = 'completed' AND DATE(tp.tanggal) BETWEEN ? AND ?
    `;

    const scopedQuery = applyScopeToSql(sql, [startDate, endDate], scope, {
      tenantColumn: 'tp.tenant_id',
      storeColumn: 'tp.toko_id'
    });

    const finalSql = `${scopedQuery.sql} GROUP BY p.id, p.nama, p.kode ORDER BY total_terjual DESC LIMIT ${limit}`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);
    return rows as any[];
  }

  static async getSalesChart(scope: AccessScope, startDate: string, endDate: string) {
    const sql = `
      SELECT
        DATE(tanggal) as tanggal,
        COUNT(*) as jumlah_transaksi,
        COALESCE(SUM(total), 0) as total_penjualan
      FROM transaksi_penjualan
      WHERE status = 'completed' AND DATE(tanggal) BETWEEN ? AND ?
    `;

    const scopedQuery = applyScopeToSql(sql, [startDate, endDate], scope, {
      tenantColumn: 'tenant_id',
      storeColumn: 'toko_id'
    });

    const finalSql = `${scopedQuery.sql} GROUP BY DATE(tanggal) ORDER BY tanggal ASC`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);
    return rows as any[];
  }

  static async getPaymentMethodStats(scope: AccessScope, startDate: string, endDate: string) {
    const sql = `
      SELECT
        metode_bayar,
        COUNT(*) as jumlah_transaksi,
        COALESCE(SUM(total), 0) as total_nilai
      FROM transaksi_penjualan
      WHERE status = 'completed' AND DATE(tanggal) BETWEEN ? AND ?
    `;

    const scopedQuery = applyScopeToSql(sql, [startDate, endDate], scope, {
      tenantColumn: 'tenant_id',
      storeColumn: 'toko_id'
    });

    const finalSql = `${scopedQuery.sql} GROUP BY metode_bayar ORDER BY total_nilai DESC`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);
    return rows as any[];
  }

  static async getCashierPerformance(scope: AccessScope, startDate: string, endDate: string) {
    const sql = `
      SELECT
        u.id as kasir_id,
        u.nama_lengkap as kasir_nama,
        COUNT(*) as jumlah_transaksi,
        COALESCE(SUM(tp.total), 0) as total_penjualan,
        COALESCE(AVG(tp.total), 0) as rata_rata_transaksi
      FROM transaksi_penjualan tp
      JOIN users u ON tp.pengguna_id = u.id
      WHERE tp.status = 'completed' AND DATE(tp.tanggal) BETWEEN ? AND ?
    `;

    const scopedQuery = applyScopeToSql(sql, [startDate, endDate], scope, {
      tenantColumn: 'tp.tenant_id',
      storeColumn: 'tp.toko_id'
    });

    const finalSql = `${scopedQuery.sql} GROUP BY u.id, u.nama_lengkap ORDER BY total_penjualan DESC`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);
    return rows as any[];
  }
}