/**
 * Customer Query Service Module
 * Handles customer search and retrieval operations
 */

import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { SearchPelangganQuery, Pelanggan, PelangganTransactionHistory, PelangganPoinLog } from '../../models/PelangganCore';

export class PelangganQueryService {
  static async search(scope: AccessScope, query: SearchPelangganQuery) {
    const offset = (Number(query.page) - 1) * Number(query.limit);

    let sql = `
      SELECT p.*
      FROM pelanggan p
      WHERE 1=1
    `;

    const params: any[] = [];

    // Search filter
    if (query.search) {
      sql += ` AND (p.nama LIKE ? OR p.kode LIKE ? OR p.email LIKE ? OR p.telepon LIKE ?)`;
      const searchPattern = `%${query.search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Type filter
    if (query.tipe) {
      sql += ` AND p.tipe = ?`;
      params.push(query.tipe);
    }

    // Status filter
    if (query.status) {
      sql += ` AND p.status = ?`;
      params.push(query.status);
    }

    // Gender filter
    if (query.jenis_kelamin) {
      sql += ` AND p.jenis_kelamin = ?`;
      params.push(query.jenis_kelamin);
    }

    // Email filter
    if (query.has_email !== undefined) {
      if (query.has_email) {
        sql += ` AND p.email IS NOT NULL AND p.email != ''`;
      } else {
        sql += ` AND (p.email IS NULL OR p.email = '')`;
      }
    }

    // Phone filter
    if (query.has_phone !== undefined) {
      if (query.has_phone) {
        sql += ` AND p.telepon IS NOT NULL AND p.telepon != ''`;
      } else {
        sql += ` AND (p.telepon IS NULL OR p.telepon = '')`;
      }
    }

    // Code filter
    if (query.kode) {
      sql += ` AND p.kode = ?`;
      params.push(query.kode);
    }

    // Apply access scope
    const scopedQuery = applyScopeToSql(sql, params, scope, {
      tenantColumn: 'p.tenant_id',
      storeColumn: 'p.toko_id'
    });

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM (${scopedQuery.sql}) as filtered`;
    const [countRows] = await pool.execute<RowDataPacket[]>(countSql, scopedQuery.params);
    const total = countRows[0].total;

    // Get paginated results
    const finalSql = `${scopedQuery.sql} ORDER BY p.nama ASC LIMIT ? OFFSET ?`;
    const finalParams = [...scopedQuery.params, Number(query.limit), offset];

    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, finalParams);

    return {
      data: rows.map(row => ({
        ...row,
        diskon_persen: Number(row.diskon_persen),
        limit_kredit: Number(row.limit_kredit),
        saldo_poin: Number(row.saldo_poin)
      })) as Pelanggan[],
      total,
      page: Number(query.page),
      totalPages: Math.ceil(total / Number(query.limit))
    };
  }

  static async findById(scope: AccessScope, id: string): Promise<Pelanggan | null> {
    const sql = `
      SELECT p.*
      FROM pelanggan p
      WHERE p.id = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [id], scope, {
      tenantColumn: 'p.tenant_id',
      storeColumn: 'p.toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      ...row,
      diskon_persen: Number(row.diskon_persen),
      limit_kredit: Number(row.limit_kredit),
      saldo_poin: Number(row.saldo_poin)
    } as Pelanggan;
  }

  static async findByCode(scope: AccessScope, kode: string): Promise<Pelanggan | null> {
    const sql = `
      SELECT p.*
      FROM pelanggan p
      WHERE p.kode = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [kode], scope, {
      tenantColumn: 'p.tenant_id',
      storeColumn: 'p.toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      ...row,
      diskon_persen: Number(row.diskon_persen),
      limit_kredit: Number(row.limit_kredit),
      saldo_poin: Number(row.saldo_poin)
    } as Pelanggan;
  }

  static async getPelangganStats(scope: AccessScope, pelangganId: string) {
    // Get customer statistics
    const statsQueries = [
      // Transaction statistics
      `SELECT
         COUNT(*) as total_transactions,
         COALESCE(SUM(total), 0) as total_spent,
         COALESCE(AVG(total), 0) as average_order_value,
         MAX(tanggal) as last_transaction_date
       FROM transaksi_penjualan
       WHERE pelanggan_id = '${pelangganId}' AND status = 'completed'`,

      // Points statistics
      `SELECT
         COALESCE(SUM(CASE WHEN tipe = 'earned' THEN jumlah ELSE 0 END), 0) as total_points_earned,
         COALESCE(SUM(CASE WHEN tipe = 'used' THEN jumlah ELSE 0 END), 0) as total_points_used
       FROM pelanggan_poin_log
       WHERE pelanggan_id = '${pelangganId}'`
    ];

    const results = await Promise.all(
      statsQueries.map(query => pool.execute<RowDataPacket[]>(query))
    );

    const transactionStats = results[0][0][0] || {};
    const pointsStats = results[1][0][0] || {};

    // Get favorite products
    const favoriteProductsQuery = `
      SELECT
        p.id as product_id,
        p.nama as product_name,
        COUNT(*) as purchase_count
      FROM item_transaksi_penjualan itp
      JOIN transaksi_penjualan tp ON itp.transaksi_penjualan_id = tp.id
      JOIN produk p ON itp.produk_id = p.id
      WHERE tp.pelanggan_id = '${pelangganId}' AND tp.status = 'completed'
      GROUP BY p.id
      ORDER BY purchase_count DESC
      LIMIT 5
    `;

    const [favoriteRows] = await pool.execute<RowDataPacket[]>(favoriteProductsQuery);

    return {
      pelanggan_id: pelangganId,
      total_transactions: Number(transactionStats.total_transactions || 0),
      total_spent: Number(transactionStats.total_spent || 0),
      total_points_earned: Number(pointsStats.total_points_earned || 0),
      total_points_used: Number(pointsStats.total_points_used || 0),
      average_order_value: Number(transactionStats.average_order_value || 0),
      last_transaction_date: transactionStats.last_transaction_date,
      favorite_products: favoriteRows.map(row => ({
        product_id: row.product_id,
        product_name: row.product_name,
        purchase_count: Number(row.purchase_count)
      }))
    };
  }

  static async getTransactionHistory(scope: AccessScope, pelangganId: string, limit: number = 50) {
    const sql = `
      SELECT
        tp.id as transaction_id,
        tp.nomor_transaksi,
        tp.tanggal,
        tp.total,
        tp.status,
        COUNT(itp.id) as items_count,
        COALESCE(tp.poin_didapat, 0) as points_earned,
        COALESCE(tp.poin_digunakan, 0) as points_used
      FROM transaksi_penjualan tp
      LEFT JOIN item_transaksi_penjualan itp ON tp.id = itp.transaksi_penjualan_id
      WHERE tp.pelanggan_id = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [pelangganId], scope, {
      tenantColumn: 'tp.tenant_id',
      storeColumn: 'tp.toko_id'
    });

    const finalSql = `${scopedQuery.sql} GROUP BY tp.id ORDER BY tp.tanggal DESC LIMIT ?`;
    const finalParams = [...scopedQuery.params, limit];

    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, finalParams);

    return rows.map(row => ({
      transaction_id: row.transaction_id,
      nomor_transaksi: row.nomor_transaksi,
      tanggal: row.tanggal,
      total: Number(row.total),
      status: row.status,
      items_count: Number(row.items_count),
      points_earned: Number(row.points_earned),
      points_used: Number(row.points_used)
    })) as PelangganTransactionHistory[];
  }

  static async getPoinLogs(scope: AccessScope, pelangganId: string, limit: number = 50) {
    const sql = `
      SELECT ppl.*
      FROM pelanggan_poin_log ppl
      WHERE ppl.pelanggan_id = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [pelangganId], scope, {
      tenantColumn: 'ppl.tenant_id',
      storeColumn: 'ppl.toko_id'
    });

    const finalSql = `${scopedQuery.sql} ORDER BY ppl.created_at DESC LIMIT ?`;
    const finalParams = [...scopedQuery.params, limit];

    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, finalParams);

    return rows.map(row => ({
      ...row,
      jumlah: Number(row.jumlah),
      saldo_sebelum: Number(row.saldo_sebelum),
      saldo_sesudah: Number(row.saldo_sesudah)
    })) as PelangganPoinLog[];
  }

  static async getCustomerSegmentation(scope: AccessScope) {
    const segmentationQuery = `
      SELECT
        CASE
          WHEN p.tipe = 'vip' THEN 'VIP Customers'
          WHEN p.tipe = 'member' THEN 'Member Customers'
          WHEN p.tipe = 'wholesale' THEN 'Wholesale Customers'
          ELSE 'Regular Customers'
        END as segment,
        CONCAT('Customer type: ', p.tipe) as criteria,
        COUNT(p.id) as customer_count,
        COALESCE(SUM(stats.total_spent), 0) as total_value,
        COALESCE(AVG(stats.total_spent), 0) as avg_order_value
      FROM pelanggan p
      LEFT JOIN (
        SELECT
          tp.pelanggan_id,
          SUM(tp.total) as total_spent
        FROM transaksi_penjualan tp
        WHERE tp.status = 'completed'
        GROUP BY tp.pelanggan_id
      ) stats ON p.id = stats.pelanggan_id
      WHERE p.status = 'aktif'
    `;

    const scopedQuery = applyScopeToSql(segmentationQuery, [], scope, {
      tenantColumn: 'p.tenant_id',
      storeColumn: 'p.toko_id'
    });

    const finalSql = `${scopedQuery.sql} GROUP BY p.tipe`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);

    return rows.map(row => ({
      segment: row.segment,
      criteria: row.criteria,
      customer_count: Number(row.customer_count),
      total_value: Number(row.total_value),
      avg_order_value: Number(row.avg_order_value)
    }));
  }

  static async getLoyaltyReport(scope: AccessScope, limit: number = 100) {
    const sql = `
      SELECT
        p.id as pelanggan_id,
        p.nama,
        p.tipe,
        p.saldo_poin as points_balance,
        COALESCE(stats.total_spent, 0) as total_spent,
        COALESCE(stats.total_transactions, 0) as total_transactions,
        stats.last_visit,
        CASE
          WHEN stats.total_spent >= 10000000 THEN 100
          WHEN stats.total_spent >= 5000000 THEN 90
          WHEN stats.total_spent >= 1000000 THEN 75
          WHEN stats.total_spent >= 500000 THEN 50
          ELSE 25
        END as loyalty_score,
        CASE
          WHEN stats.total_spent >= 10000000 THEN 'Champion'
          WHEN stats.total_spent >= 5000000 THEN 'Loyal'
          WHEN stats.total_spent >= 1000000 THEN 'Potential'
          WHEN stats.total_spent >= 500000 THEN 'Regular'
          ELSE 'New'
        END as segment
      FROM pelanggan p
      LEFT JOIN (
        SELECT
          tp.pelanggan_id,
          SUM(tp.total) as total_spent,
          COUNT(*) as total_transactions,
          MAX(tp.tanggal) as last_visit
        FROM transaksi_penjualan tp
        WHERE tp.status = 'completed'
        GROUP BY tp.pelanggan_id
      ) stats ON p.id = stats.pelanggan_id
      WHERE p.status = 'aktif'
    `;

    const scopedQuery = applyScopeToSql(sql, [], scope, {
      tenantColumn: 'p.tenant_id',
      storeColumn: 'p.toko_id'
    });

    const finalSql = `${scopedQuery.sql} ORDER BY loyalty_score DESC, total_spent DESC LIMIT ?`;
    const finalParams = [...scopedQuery.params, limit];

    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, finalParams);

    return rows.map(row => ({
      pelanggan_id: row.pelanggan_id,
      nama: row.nama,
      tipe: row.tipe,
      total_spent: Number(row.total_spent),
      total_transactions: Number(row.total_transactions),
      points_balance: Number(row.points_balance),
      last_visit: row.last_visit,
      loyalty_score: Number(row.loyalty_score),
      segment: row.segment
    }));
  }

  static async getActiveCustomers(scope: AccessScope) {
    const sql = `
      SELECT p.id, p.kode, p.nama, p.email, p.telepon, p.tipe, p.saldo_poin
      FROM pelanggan p
      WHERE p.status = 'aktif'
    `;

    const scopedQuery = applyScopeToSql(sql, [], scope, {
      tenantColumn: 'p.tenant_id',
      storeColumn: 'p.toko_id'
    });

    const finalSql = `${scopedQuery.sql} ORDER BY p.nama ASC`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);

    return rows.map(row => ({
      ...row,
      saldo_poin: Number(row.saldo_poin)
    }));
  }
}