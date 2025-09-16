/**
 * Profile Query Service Module
 * Handles user profile information retrieval and analytics
 */

import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';
import { UserProfile, UserPerformanceStats, UserActivityLog, UserSalesReport, ProfileSettings } from '../../models/ProfileCore';

export class ProfileQueryService {
  static async getUserProfile(scope: AccessScope, userId: string): Promise<UserProfile | null> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Check if has permission to view profiles
    if (scope.level && scope.level > 2) {
      throw new Error('Insufficient permissions to view other user profiles');
    }

    const sql = `
      SELECT
        u.*,
        p.nama as peran_nama,
        p.level as peran_level,
        t.nama as toko_nama
      FROM users u
      LEFT JOIN peran p ON u.peran_id = p.id
      LEFT JOIN toko t ON u.toko_id = t.id
      WHERE u.id = ? AND u.tenant_id = ?
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [userId, scope.tenantId]);

    if (rows.length === 0) {
      return null;
    }

    const user = rows[0];
    return {
      id: user.id,
      tenant_id: user.tenant_id,
      toko_id: user.toko_id,
      peran_id: user.peran_id,
      username: user.username,
      email: user.email,
      nama_lengkap: user.nama_lengkap,
      telepon: user.telepon,
      alamat: user.alamat,
      tanggal_lahir: user.tanggal_lahir,
      jenis_kelamin: user.jenis_kelamin,
      gaji_pokok: Number(user.gaji_pokok || 0),
      komisi_persen: Number(user.komisi_persen || 0),
      tanggal_masuk: user.tanggal_masuk,
      tanggal_keluar: user.tanggal_keluar,
      avatar_url: user.avatar_url,
      status: user.status,
      last_login: user.last_login,
      dibuat_pada: user.dibuat_pada,
      diperbarui_pada: user.diperbarui_pada,
      peran_nama: user.peran_nama,
      peran_level: user.peran_level,
      toko_nama: user.toko_nama
    } as any;
  }

  static async getUserPerformanceStats(scope: AccessScope, userId: string, days: number = 30): Promise<UserPerformanceStats> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const statsQueries = [
      // Sales statistics
      `SELECT
         COUNT(*) as total_sales,
         COALESCE(SUM(total), 0) as total_sales_amount,
         COALESCE(AVG(total), 0) as average_transaction_value
       FROM transaksi_penjualan
       WHERE pengguna_id = ? AND status = 'completed'
       AND tanggal >= ?`,

      // Purchase statistics
      `SELECT
         COUNT(*) as total_purchases,
         COALESCE(SUM(total), 0) as total_purchases_amount
       FROM transaksi_pembelian
       WHERE pengguna_id = ? AND status = 'completed'
       AND tanggal >= ?`,

      // Returns statistics
      `SELECT
         COUNT(*) as total_returns,
         COALESCE(SUM(total), 0) as total_returns_amount
       FROM retur_penjualan
       WHERE pengguna_id = ? AND status = 'completed'
       AND tanggal >= ?`,

      // Best sales day
      `SELECT
         DATE(tanggal) as best_day,
         SUM(total) as day_total
       FROM transaksi_penjualan
       WHERE pengguna_id = ? AND status = 'completed'
       AND tanggal >= ?
       GROUP BY DATE(tanggal)
       ORDER BY day_total DESC
       LIMIT 1`
    ];

    const results = await Promise.all(
      statsQueries.map(query => pool.execute<RowDataPacket[]>(query, [userId, dateFrom]))
    );

    const salesStats = results[0][0][0] || { total_sales: 0, total_sales_amount: 0, average_transaction_value: 0 };
    const purchaseStats = results[1][0][0] || { total_purchases: 0, total_purchases_amount: 0 };
    const returnStats = results[2][0][0] || { total_returns: 0, total_returns_amount: 0 };
    const bestDayStats = results[3][0][0] || null;

    // Get user commission percentage
    const [userRows] = await pool.execute<RowDataPacket[]>(
      'SELECT komisi_persen FROM users WHERE id = ?',
      [userId]
    );

    const komisiPersen = Number(userRows[0]?.komisi_persen || 0);
    const commissionEarned = (Number(salesStats.total_sales_amount) * komisiPersen) / 100;

    // Calculate performance score
    const totalSales = Number(salesStats.total_sales);
    const avgTransaction = Number(salesStats.average_transaction_value);
    const returnRate = totalSales > 0 ? Number(returnStats.total_returns) / totalSales : 0;

    let performanceScore = 50; // Base score
    if (totalSales >= 50) performanceScore += 20;
    else if (totalSales >= 30) performanceScore += 15;
    else if (totalSales >= 10) performanceScore += 10;

    if (avgTransaction >= 100000) performanceScore += 15;
    else if (avgTransaction >= 50000) performanceScore += 10;

    if (returnRate < 0.02) performanceScore += 15;
    else if (returnRate < 0.05) performanceScore += 10;
    else performanceScore -= 10;

    // Determine productivity rating
    let productivityRating: 'excellent' | 'good' | 'average' | 'below_average' | 'poor' = 'average';
    if (performanceScore >= 90) productivityRating = 'excellent';
    else if (performanceScore >= 75) productivityRating = 'good';
    else if (performanceScore >= 60) productivityRating = 'average';
    else if (performanceScore >= 40) productivityRating = 'below_average';
    else productivityRating = 'poor';

    return {
      user_id: userId,
      total_sales: totalSales,
      total_sales_amount: Number(salesStats.total_sales_amount),
      total_purchases: Number(purchaseStats.total_purchases),
      total_purchases_amount: Number(purchaseStats.total_purchases_amount),
      total_returns: Number(returnStats.total_returns),
      total_returns_amount: Number(returnStats.total_returns_amount),
      average_transaction_value: Number(salesStats.average_transaction_value),
      best_sales_day: bestDayStats?.best_day || null,
      performance_score: Math.min(100, Math.max(0, performanceScore)),
      commission_earned: commissionEarned,
      active_days: days,
      productivity_rating: productivityRating
    };
  }

  static async getUserActivityLogs(scope: AccessScope, userId: string, limit: number = 50): Promise<UserActivityLog[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const sql = `
      SELECT
        al.*,
        CASE
          WHEN al.tabel = 'transaksi_penjualan' THEN 'sale'
          WHEN al.tabel = 'transaksi_pembelian' THEN 'purchase'
          WHEN al.tabel = 'retur_penjualan' THEN 'return'
          WHEN al.tabel = 'users' THEN 'profile_update'
          ELSE 'other'
        END as activity_type
      FROM audit_log al
      WHERE al.user_id = ? AND al.tenant_id = ?
      ORDER BY al.dibuat_pada DESC
      LIMIT ?
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [userId, scope.tenantId, limit]);

    return rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      activity_type: row.activity_type,
      description: `${row.aksi} on ${row.tabel}`,
      transaction_id: row.record_id,
      amount: undefined, // Would need to join with transaction tables for amount
      ip_address: row.ip_address,
      user_agent: row.user_agent,
      metadata: row.data_baru ? JSON.parse(row.data_baru) : null,
      created_at: row.dibuat_pada
    }));
  }

  static async getUserSalesReport(scope: AccessScope, userId: string, days: number = 30): Promise<UserSalesReport[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const sql = `
      SELECT
        DATE(tp.tanggal) as date,
        COUNT(CASE WHEN tp.status = 'completed' THEN 1 END) as sales_count,
        COALESCE(SUM(CASE WHEN tp.status = 'completed' THEN tp.total ELSE 0 END), 0) as sales_amount,
        COUNT(CASE WHEN rp.status = 'completed' THEN 1 END) as returns_count,
        COALESCE(SUM(CASE WHEN rp.status = 'completed' THEN rp.total ELSE 0 END), 0) as returns_amount
      FROM transaksi_penjualan tp
      LEFT JOIN retur_penjualan rp ON tp.id = rp.transaksi_penjualan_id AND rp.pengguna_id = tp.pengguna_id
      WHERE tp.pengguna_id = ? AND tp.tanggal >= ?
      GROUP BY DATE(tp.tanggal)
      ORDER BY DATE(tp.tanggal) DESC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [userId, dateFrom]);

    // Get user commission percentage
    const [userRows] = await pool.execute<RowDataPacket[]>(
      'SELECT komisi_persen FROM users WHERE id = ?',
      [userId]
    );

    const komisiPersen = Number(userRows[0]?.komisi_persen || 0);

    return rows.map(row => {
      const salesAmount = Number(row.sales_amount);
      const returnsAmount = Number(row.returns_amount);
      const netSales = salesAmount - returnsAmount;
      const commission = (netSales * komisiPersen) / 100;

      // Simple productivity score based on sales vs target
      const dailyTarget = 1000000; // 1M IDR daily target
      const productivityScore = Math.min(100, (netSales / dailyTarget) * 100);

      return {
        date: row.date,
        sales_count: Number(row.sales_count),
        sales_amount: salesAmount,
        returns_count: Number(row.returns_count),
        returns_amount: returnsAmount,
        net_sales: netSales,
        commission: commission,
        productivity_score: productivityScore
      };
    });
  }

  static async getProfileSettings(scope: AccessScope, userId: string): Promise<ProfileSettings | null> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // For now, return default settings as there's no settings table in schema
    // In a real implementation, you'd have a user_settings table
    return {
      user_id: userId,
      notifications_enabled: true,
      email_notifications: true,
      sms_notifications: false,
      language: 'id',
      timezone: 'Asia/Jakarta',
      theme: 'light',
      currency_format: 'IDR',
      date_format: 'DD/MM/YYYY',
      auto_logout_minutes: 60,
      dashboard_widgets: ['sales_today', 'performance', 'recent_transactions'],
      created_at: new Date(),
      updated_at: new Date()
    };
  }
}