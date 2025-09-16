/**
 * Supplier Query Service Module
 * Handles supplier search and retrieval operations
 */

import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { SearchSupplierQuery, Supplier, SupplierPurchaseHistory, SupplierProducts, SupplierContactLog } from '../../models/SupplierCore';

export class SupplierQueryService {
  static async search(scope: AccessScope, query: SearchSupplierQuery) {
    const offset = (Number(query.page) - 1) * Number(query.limit);

    let sql = `
      SELECT s.*
      FROM supplier s
      WHERE 1=1
    `;

    const params: any[] = [];

    // Search filter
    if (query.search) {
      sql += ` AND (s.nama LIKE ? OR s.kontak_person LIKE ? OR s.email LIKE ? OR s.telepon LIKE ?)`;
      const searchPattern = `%${query.search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Status filter
    if (query.status) {
      sql += ` AND s.status = ?`;
      params.push(query.status);
    }

    // Email filter
    if (query.has_email !== undefined) {
      if (query.has_email) {
        sql += ` AND s.email IS NOT NULL AND s.email != ''`;
      } else {
        sql += ` AND (s.email IS NULL OR s.email = '')`;
      }
    }

    // Phone filter
    if (query.has_phone !== undefined) {
      if (query.has_phone) {
        sql += ` AND s.telepon IS NOT NULL AND s.telepon != ''`;
      } else {
        sql += ` AND (s.telepon IS NULL OR s.telepon = '')`;
      }
    }

    // Bank info filter
    if (query.has_bank_info !== undefined) {
      if (query.has_bank_info) {
        sql += ` AND s.bank_nama IS NOT NULL AND s.bank_rekening IS NOT NULL`;
      } else {
        sql += ` AND (s.bank_nama IS NULL OR s.bank_rekening IS NULL)`;
      }
    }

    // Apply access scope
    const scopedQuery = applyScopeToSql(sql, params, scope, {
      tenantColumn: 's.tenant_id',
      storeColumn: 's.toko_id'
    });

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM (${scopedQuery.sql}) as filtered`;
    const [countRows] = await pool.execute<RowDataPacket[]>(countSql, scopedQuery.params);
    const total = countRows[0].total;

    // Get paginated results
    const finalSql = `${scopedQuery.sql} ORDER BY s.nama ASC LIMIT ? OFFSET ?`;
    const finalParams = [...scopedQuery.params, Number(query.limit), offset];

    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, finalParams);

    return {
      data: rows as Supplier[],
      total,
      page: Number(query.page),
      totalPages: Math.ceil(total / Number(query.limit))
    };
  }

  static async findById(scope: AccessScope, id: string): Promise<Supplier | null> {
    const sql = `
      SELECT s.*
      FROM supplier s
      WHERE s.id = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [id], scope, {
      tenantColumn: 's.tenant_id',
      storeColumn: 's.toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return rows[0] as Supplier || null;
  }

  static async getSupplierStats(scope: AccessScope, supplierId: string) {
    // Get supplier statistics
    const statsQueries = [
      // Purchase statistics
      `SELECT
         COUNT(*) as total_purchases,
         COALESCE(SUM(total), 0) as total_amount,
         COALESCE(AVG(total), 0) as average_order_value,
         MAX(tanggal) as last_purchase_date
       FROM transaksi_pembelian
       WHERE supplier_id = '${supplierId}' AND status = 'completed'`,

      // Products supplied count
      `SELECT COUNT(DISTINCT produk_id) as total_products_supplied
       FROM item_transaksi_pembelian itp
       JOIN transaksi_pembelian tp ON itp.transaksi_pembelian_id = tp.id
       WHERE tp.supplier_id = '${supplierId}' AND tp.status = 'completed'`,

      // Outstanding balance (assuming there's a payment tracking system)
      `SELECT COALESCE(SUM(CASE WHEN status_bayar = 'pending' THEN total ELSE 0 END), 0) as outstanding_balance
       FROM transaksi_pembelian
       WHERE supplier_id = '${supplierId}'`
    ];

    const results = await Promise.all(
      statsQueries.map(query => pool.execute<RowDataPacket[]>(query))
    );

    const purchaseStats = results[0][0][0] || {};
    const productStats = results[1][0][0] || {};
    const balanceStats = results[2][0][0] || {};

    // Calculate payment performance based on on-time payments
    let paymentPerformance: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
    const totalPurchases = Number(purchaseStats.total_purchases || 0);
    const outstandingBalance = Number(balanceStats.outstanding_balance || 0);
    const totalAmount = Number(purchaseStats.total_amount || 0);

    if (totalAmount > 0) {
      const outstandingRatio = outstandingBalance / totalAmount;
      if (outstandingRatio < 0.1) paymentPerformance = 'excellent';
      else if (outstandingRatio < 0.3) paymentPerformance = 'good';
      else if (outstandingRatio < 0.6) paymentPerformance = 'fair';
      else paymentPerformance = 'poor';
    }

    return {
      supplier_id: supplierId,
      total_purchases: Number(purchaseStats.total_purchases || 0),
      total_amount: Number(purchaseStats.total_amount || 0),
      total_products_supplied: Number(productStats.total_products_supplied || 0),
      average_order_value: Number(purchaseStats.average_order_value || 0),
      last_purchase_date: purchaseStats.last_purchase_date,
      outstanding_balance: outstandingBalance,
      payment_performance: paymentPerformance
    };
  }

  static async getPurchaseHistory(scope: AccessScope, supplierId: string, limit: number = 50) {
    const sql = `
      SELECT
        tp.id as purchase_id,
        tp.nomor_pembelian,
        tp.tanggal,
        tp.total,
        tp.status,
        tp.status_bayar as payment_status,
        tp.jatuh_tempo as due_date,
        COUNT(itp.id) as items_count
      FROM transaksi_pembelian tp
      LEFT JOIN item_transaksi_pembelian itp ON tp.id = itp.transaksi_pembelian_id
      WHERE tp.supplier_id = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [supplierId], scope, {
      tenantColumn: 'tp.tenant_id',
      storeColumn: 'tp.toko_id'
    });

    const finalSql = `${scopedQuery.sql} GROUP BY tp.id ORDER BY tp.tanggal DESC LIMIT ?`;
    const finalParams = [...scopedQuery.params, limit];

    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, finalParams);

    return rows.map(row => ({
      purchase_id: row.purchase_id,
      nomor_pembelian: row.nomor_pembelian,
      tanggal: row.tanggal,
      total: Number(row.total),
      status: row.status,
      payment_status: row.payment_status,
      due_date: row.due_date,
      items_count: Number(row.items_count)
    })) as SupplierPurchaseHistory[];
  }

  static async getSupplierProducts(scope: AccessScope, supplierId: string) {
    const sql = `
      SELECT
        p.id as product_id,
        p.nama as product_name,
        p.kode as product_code,
        k.nama as category_name,
        latest_purchase.last_purchase_price,
        latest_purchase.last_purchase_date,
        purchase_summary.total_purchased
      FROM produk p
      JOIN kategori k ON p.kategori_id = k.id
      JOIN (
        SELECT
          itp.produk_id,
          COUNT(*) as total_purchased
        FROM item_transaksi_pembelian itp
        JOIN transaksi_pembelian tp ON itp.transaksi_pembelian_id = tp.id
        WHERE tp.supplier_id = ? AND tp.status = 'completed'
        GROUP BY itp.produk_id
      ) purchase_summary ON p.id = purchase_summary.produk_id
      LEFT JOIN (
        SELECT DISTINCT
          itp.produk_id,
          FIRST_VALUE(itp.harga_satuan) OVER (
            PARTITION BY itp.produk_id
            ORDER BY tp.tanggal DESC
          ) as last_purchase_price,
          FIRST_VALUE(tp.tanggal) OVER (
            PARTITION BY itp.produk_id
            ORDER BY tp.tanggal DESC
          ) as last_purchase_date
        FROM item_transaksi_pembelian itp
        JOIN transaksi_pembelian tp ON itp.transaksi_pembelian_id = tp.id
        WHERE tp.supplier_id = ? AND tp.status = 'completed'
      ) latest_purchase ON p.id = latest_purchase.produk_id
      WHERE p.supplier_id = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [supplierId, supplierId, supplierId], scope, {
      tenantColumn: 'p.tenant_id',
      storeColumn: 'p.toko_id'
    });

    const finalSql = `${scopedQuery.sql} ORDER BY purchase_summary.total_purchased DESC`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);

    return rows.map(row => ({
      product_id: row.product_id,
      product_name: row.product_name,
      product_code: row.product_code,
      category_name: row.category_name,
      last_purchase_price: Number(row.last_purchase_price || 0),
      last_purchase_date: row.last_purchase_date,
      total_purchased: Number(row.total_purchased)
    })) as SupplierProducts[];
  }

  static async getActiveSuppliers(scope: AccessScope) {
    const sql = `
      SELECT s.id, s.nama, s.kontak_person, s.telepon, s.email
      FROM supplier s
      WHERE s.status = 'aktif'
    `;

    const scopedQuery = applyScopeToSql(sql, [], scope, {
      tenantColumn: 's.tenant_id',
      storeColumn: 's.toko_id'
    });

    const finalSql = `${scopedQuery.sql} ORDER BY s.nama ASC`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);

    return rows;
  }

  static async getSupplierPerformanceReport(scope: AccessScope) {
    const sql = `
      SELECT
        s.id as supplier_id,
        s.nama,
        COALESCE(stats.total_purchases, 0) as total_purchases,
        COALESCE(stats.total_amount, 0) as total_amount,
        COALESCE(stats.average_order_value, 0) as average_order_value,
        COALESCE(delivery_stats.on_time_delivery_rate, 100) as on_time_delivery_rate,
        85 as quality_rating, -- Default rating, could be enhanced
        COALESCE(payment_stats.payment_terms_compliance, 100) as payment_terms_compliance,
        CASE
          WHEN stats.total_amount >= 100000000 THEN 95
          WHEN stats.total_amount >= 50000000 THEN 85
          WHEN stats.total_amount >= 10000000 THEN 75
          WHEN stats.total_amount >= 1000000 THEN 65
          ELSE 50
        END as overall_score
      FROM supplier s
      LEFT JOIN (
        SELECT
          tp.supplier_id,
          COUNT(*) as total_purchases,
          SUM(tp.total) as total_amount,
          AVG(tp.total) as average_order_value
        FROM transaksi_pembelian tp
        WHERE tp.status = 'completed'
        GROUP BY tp.supplier_id
      ) stats ON s.id = stats.supplier_id
      LEFT JOIN (
        SELECT
          tp.supplier_id,
          AVG(CASE WHEN tp.tanggal <= tp.jatuh_tempo THEN 100 ELSE 0 END) as on_time_delivery_rate
        FROM transaksi_pembelian tp
        WHERE tp.status = 'completed' AND tp.jatuh_tempo IS NOT NULL
        GROUP BY tp.supplier_id
      ) delivery_stats ON s.id = delivery_stats.supplier_id
      LEFT JOIN (
        SELECT
          tp.supplier_id,
          AVG(CASE WHEN tp.status_bayar = 'lunas' THEN 100 ELSE 50 END) as payment_terms_compliance
        FROM transaksi_pembelian tp
        GROUP BY tp.supplier_id
      ) payment_stats ON s.id = payment_stats.supplier_id
      WHERE s.status = 'aktif'
    `;

    const scopedQuery = applyScopeToSql(sql, [], scope, {
      tenantColumn: 's.tenant_id',
      storeColumn: 's.toko_id'
    });

    const finalSql = `${scopedQuery.sql} ORDER BY overall_score DESC, total_amount DESC`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);

    return rows.map((row, index) => ({
      supplier_id: row.supplier_id,
      nama: row.nama,
      total_purchases: Number(row.total_purchases),
      total_amount: Number(row.total_amount),
      average_order_value: Number(row.average_order_value),
      on_time_delivery_rate: Number(row.on_time_delivery_rate),
      quality_rating: Number(row.quality_rating),
      payment_terms_compliance: Number(row.payment_terms_compliance),
      overall_score: Number(row.overall_score),
      rank: index + 1
    }));
  }

  static async getSupplierContactLogs(scope: AccessScope, supplierId: string, limit: number = 50) {
    const sql = `
      SELECT scl.*, u.nama_lengkap as user_name
      FROM supplier_contact_log scl
      JOIN users u ON scl.user_id = u.id
      WHERE scl.supplier_id = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [supplierId], scope, {
      tenantColumn: 'scl.tenant_id'
    });

    const finalSql = `${scopedQuery.sql} ORDER BY scl.created_at DESC LIMIT ?`;
    const finalParams = [...scopedQuery.params, limit];

    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, finalParams);

    return rows as SupplierContactLog[];
  }

  static async getSupplierPaymentTerms(scope: AccessScope, supplierId: string) {
    const sql = `
      SELECT spt.*
      FROM supplier_payment_terms spt
      JOIN supplier s ON spt.supplier_id = s.id
      WHERE spt.supplier_id = ? AND spt.is_active = 1
    `;

    const scopedQuery = applyScopeToSql(sql, [supplierId], scope, {
      tenantColumn: 's.tenant_id',
      storeColumn: 's.toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return rows[0] || null;
  }
}