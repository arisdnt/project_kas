/**
 * Dashboard Analytics Service Module
 * Handles comprehensive dashboard analytics and KPI calculations
 */

import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { AnalyticsFilter } from '../../models/DashboardCore';

export class DashboardAnalyticsService {
  static async getOverviewKPIs(scope: AccessScope, startDate: string, endDate: string) {
    // Sales KPIs
    const salesKPIsQuery = `
      SELECT
        COUNT(*) as total_transactions,
        COALESCE(SUM(total), 0) as total_sales,
        COALESCE(AVG(total), 0) as average_order_value,
        COUNT(DISTINCT pelanggan_id) as unique_customers
      FROM transaksi_penjualan
      WHERE status = 'completed' AND DATE(tanggal) BETWEEN ? AND ?
    `;

    const scopedSalesQuery = applyScopeToSql(salesKPIsQuery, [startDate, endDate], scope, {
      tenantColumn: 'tenant_id',
      storeColumn: 'toko_id'
    });

    const [salesRows] = await pool.execute<RowDataPacket[]>(scopedSalesQuery.sql, scopedSalesQuery.params);
    const salesData = salesRows[0];

    // Product KPIs
    const productKPIsQuery = `
      SELECT
        COUNT(*) as total_products,
        SUM(CASE WHEN is_aktif = 1 THEN 1 ELSE 0 END) as active_products,
        COUNT(DISTINCT kategori_id) as total_categories
      FROM produk
    `;

    const scopedProductQuery = applyScopeToSql(productKPIsQuery, [], scope, {
      tenantColumn: 'tenant_id',
      storeColumn: 'toko_id'
    });

    const [productRows] = await pool.execute<RowDataPacket[]>(scopedProductQuery.sql, scopedProductQuery.params);
    const productData = productRows[0];

    // Inventory KPIs
    const inventoryQuery = `
      SELECT
        COALESCE(SUM(i.stok_tersedia), 0) as total_stock,
        COUNT(CASE WHEN i.stok_tersedia <= COALESCE(i.stok_minimum_toko, p.stok_minimum, 0) THEN 1 END) as low_stock_items
      FROM inventaris i
      LEFT JOIN produk p ON i.produk_id = p.id
    `;

    const scopedInventoryQuery = applyScopeToSql(inventoryQuery, [], scope, {
      tenantColumn: 'p.tenant_id',
      storeColumn: 'i.toko_id'
    });

    const [inventoryRows] = await pool.execute<RowDataPacket[]>(scopedInventoryQuery.sql, scopedInventoryQuery.params);
    const inventoryData = inventoryRows[0];

    // Return format that matches apidashboard.json specification
    return {
      total_sales: Number(salesData?.total_sales || 0),
      total_transactions: Number(salesData?.total_transactions || 0),
      total_customers: Number(salesData?.unique_customers || 0),
      average_transaction: Number(salesData?.average_order_value || 0),
      growth_rate: 0 // Calculate growth rate in a separate query if needed
    };
  }

  static async getSalesChart(scope: AccessScope, filter: AnalyticsFilter) {
    let dateGrouping = 'DATE(tanggal)';
    let dateFormat = '%Y-%m-%d';

    switch (filter.group_by) {
      case 'week':
        dateGrouping = 'YEARWEEK(tanggal)';
        dateFormat = 'Week %u, %Y';
        break;
      case 'month':
        dateGrouping = 'DATE_FORMAT(tanggal, "%Y-%m")';
        dateFormat = '%Y-%m';
        break;
      case 'year':
        dateGrouping = 'YEAR(tanggal)';
        dateFormat = '%Y';
        break;
    }

    // NOTE (only_full_group_by): Ekspresi DATE_FORMAT(tanggal, ...) tidak diperbolehkan tanpa agregat
    // karena kolom 'tanggal' tidak termasuk GROUP BY. Untuk kompatibilitas dengan mode
    // ONLY_FULL_GROUP_BY, gunakan nilai agregat deterministik (MIN(tanggal)) untuk label.
    // Hal ini valid karena seluruh baris dalam grup punya periode yang sama sehingga MIN(tanggal)
    // mewakili tanggal pertama grup.
    const sql = `
      SELECT
        ${dateGrouping} AS period,
        DATE_FORMAT(MIN(tanggal), '${dateFormat}') AS label,
        COUNT(*) AS transaction_count,
        COALESCE(SUM(total), 0) AS total_sales
      FROM transaksi_penjualan
      WHERE status = 'completed' AND DATE(tanggal) BETWEEN ? AND ?
    `;

    const scopedQuery = applyScopeToSql(sql, [filter.start_date, filter.end_date], scope, {
      tenantColumn: 'tenant_id',
      storeColumn: 'toko_id'
    });

  // Gunakan alias 'period' dalam GROUP BY untuk konsistensi (MySQL 8 mendukung)
  const finalSql = `${scopedQuery.sql} GROUP BY period ORDER BY period ASC`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);

    // Return format that matches apidashboard.json specification
    return rows.map(row => ({
      date: row.period,
      sales: Number(row.total_sales),
      transactions: Number(row.transaction_count)
    }));
  }

  static async getTopProducts(scope: AccessScope, startDate: string, endDate: string, limit: number = 10) {
    const sql = `
      SELECT
        p.id, p.nama, p.kode,
        COALESCE(k.nama, 'Uncategorized') as category_name,
        SUM(itp.kuantitas) as total_sold,
        COALESCE(SUM(itp.subtotal), 0) as total_revenue
      FROM item_transaksi_penjualan itp
      JOIN transaksi_penjualan tp ON itp.transaksi_penjualan_id = tp.id
      JOIN produk p ON itp.produk_id = p.id
      LEFT JOIN kategori k ON p.kategori_id = k.id
      WHERE tp.status = 'completed' AND DATE(tp.tanggal) BETWEEN ? AND ?
    `;

    const scopedQuery = applyScopeToSql(sql, [startDate, endDate], scope, {
      tenantColumn: 'tp.tenant_id',
      storeColumn: 'tp.toko_id'
    });

    const finalSql = `${scopedQuery.sql} GROUP BY p.id ORDER BY total_sold DESC LIMIT ${limit}`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);

    // Return format that matches apidashboard.json specification
    return rows.map(row => ({
      product_id: row.id,
      product_name: row.nama,
      total_sold: Number(row.total_sold),
      total_revenue: Number(row.total_revenue),
      category: row.category_name || 'Uncategorized'
    }));
  }

  static async getTopCustomers(scope: AccessScope, startDate: string, endDate: string, limit: number = 10) {
    const sql = `
      SELECT
        p.id, p.nama, p.email,
        COUNT(*) as order_count,
        COALESCE(SUM(tp.total), 0) as total_spent,
        COALESCE(AVG(tp.total), 0) as average_order_value,
        MAX(tp.tanggal) as last_order_date
      FROM transaksi_penjualan tp
      LEFT JOIN pelanggan p ON tp.pelanggan_id = p.id
      WHERE tp.status = 'completed' AND DATE(tp.tanggal) BETWEEN ? AND ?
        AND tp.pelanggan_id IS NOT NULL
    `;

    const scopedQuery = applyScopeToSql(sql, [startDate, endDate], scope, {
      tenantColumn: 'tp.tenant_id',
      storeColumn: 'tp.toko_id'
    });

    const finalSql = `${scopedQuery.sql} GROUP BY p.id ORDER BY total_spent DESC LIMIT ${limit}`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);

    return rows.map(row => ({
      customer_id: row.id,
      customer_name: row.nama,
      customer_email: row.email,
      order_count: Number(row.order_count),
      total_spent: Number(row.total_spent),
      average_order_value: Number(row.average_order_value),
      last_order_date: row.last_order_date
    }));
  }

  static async getPaymentMethodDistribution(scope: AccessScope, startDate: string, endDate: string) {
    const sql = `
      SELECT
        metode_bayar,
        COUNT(*) as transaction_count,
        COALESCE(SUM(total), 0) as total_amount
      FROM transaksi_penjualan
      WHERE status = 'completed' AND DATE(tanggal) BETWEEN ? AND ?
    `;

    const scopedQuery = applyScopeToSql(sql, [startDate, endDate], scope, {
      tenantColumn: 'tenant_id',
      storeColumn: 'toko_id'
    });

    const finalSql = `${scopedQuery.sql} GROUP BY metode_bayar ORDER BY total_amount DESC`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);

    const total = rows.reduce((sum, row) => sum + Number(row.total_amount), 0);

    return rows.map(row => ({
      payment_method: row.metode_bayar,
      transaction_count: Number(row.transaction_count),
      total_amount: Number(row.total_amount),
      percentage: total > 0 ? (Number(row.total_amount) / total * 100) : 0
    }));
  }

  static async getCategoryPerformance(scope: AccessScope, startDate: string, endDate: string) {
    const sql = `
      SELECT
        k.id, k.nama as kategori_nama,
        COUNT(DISTINCT itp.produk_id) as product_count,
        SUM(itp.kuantitas) as quantity_sold,
        COALESCE(SUM(itp.subtotal), 0) as revenue
      FROM item_transaksi_penjualan itp
      JOIN transaksi_penjualan tp ON itp.transaksi_penjualan_id = tp.id
      JOIN produk p ON itp.produk_id = p.id
      JOIN kategori k ON p.kategori_id = k.id
      WHERE tp.status = 'completed' AND DATE(tp.tanggal) BETWEEN ? AND ?
    `;

    const scopedQuery = applyScopeToSql(sql, [startDate, endDate], scope, {
      tenantColumn: 'tp.tenant_id',
      storeColumn: 'tp.toko_id'
    });

    const finalSql = `${scopedQuery.sql} GROUP BY k.id ORDER BY revenue DESC`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);

    // Return format that matches apidashboard.json specification
    return rows.map(row => ({
      category_id: row.id,
      category_name: row.kategori_nama,
      total_products: Number(row.product_count),
      total_sold: Number(row.quantity_sold),
      total_revenue: Number(row.revenue),
      growth_rate: 0 // Calculate growth rate in a separate query if needed
    }));
  }

  static async getRecentTransactions(scope: AccessScope, startDate: string, endDate: string, limit: number = 10) {
    const sql = `
      SELECT
        tp.id,
        tp.nomor_transaksi,
        tp.tanggal,
        tp.total,
        tp.status,
        p.nama as pelanggan_nama,
        du.nama_lengkap as kasir_nama
      FROM transaksi_penjualan tp
      LEFT JOIN pelanggan p ON tp.pelanggan_id = p.id
      LEFT JOIN users u ON tp.pengguna_id = u.id
      LEFT JOIN detail_user du ON u.id = du.user_id
      WHERE DATE(tp.tanggal) BETWEEN ? AND ?
    `;

    const scopedQuery = applyScopeToSql(sql, [startDate, endDate], scope, {
      tenantColumn: 'tp.tenant_id',
      storeColumn: 'tp.toko_id'
    });

    const finalSql = `${scopedQuery.sql} ORDER BY tp.tanggal DESC LIMIT ${limit}`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);

    return rows.map(row => ({
      id: row.id,
      transaction_number: row.nomor_transaksi,
      date: row.tanggal,
      total: Number(row.total),
      status: row.status,
      customer_name: row.pelanggan_nama || 'Walk-in Customer',
      cashier_name: row.kasir_nama || 'Unknown'
    }));
  }
}