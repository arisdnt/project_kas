/**
 * Customer Loyalty Service - Logic untuk loyalty points dan member benefits
 * Mengintegrasikan dengan skema database pelanggan
 */

import { Pool, PoolConnection } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';

export interface CustomerLoyaltyData {
  id: string;
  kode: string;
  nama: string;
  tipe: 'reguler' | 'member' | 'vip';
  diskon_persen: number;
  saldo_poin: number;
  limit_kredit: number;
  total_transaksi?: number;
  total_belanja?: number;
}

export interface LoyaltyCalculation {
  diskonMemberPersen: number;
  diskonMemberNominal: number;
  poinEarned: number;
  poinUsed: number;
  saldoPoinBaru: number;
  canUsePoints: boolean;
  pointValue: number; // Nilai poin dalam rupiah
}

export class CustomerLoyaltyService {
  private static db: Pool = pool;

  // Konfigurasi loyalty program
  private static readonly POIN_PER_RUPIAH = 0.001; // 1 poin per 1000 rupiah
  private static readonly POIN_TO_RUPIAH = 1000; // 1 poin = 1000 rupiah
  private static readonly MIN_POIN_USAGE = 10; // Minimum poin untuk digunakan

  /**
   * Dapatkan data loyalty pelanggan lengkap
   */
  static async getCustomerLoyaltyData(
    pelangganId: string,
    scope: AccessScope
  ): Promise<CustomerLoyaltyData | null> {
    const connection = await this.db.getConnection();

    try {
      const [rows] = await connection.execute(`
        SELECT
          p.id, p.kode, p.nama, p.tipe, p.diskon_persen,
          p.saldo_poin, p.limit_kredit,
          COUNT(tp.id) as total_transaksi,
          COALESCE(SUM(tp.total), 0) as total_belanja
        FROM pelanggan p
        LEFT JOIN transaksi_penjualan tp ON p.id = tp.pelanggan_id
          AND tp.status = 'selesai'
        WHERE p.id = ?
          AND p.tenant_id = ?
          AND p.toko_id = ?
          AND p.status = 'aktif'
        GROUP BY p.id
      `, [pelangganId, scope.tenantId, scope.storeId]) as [any[], any];

      if (rows.length === 0) {
        return null;
      }

      return rows[0] as CustomerLoyaltyData;

    } finally {
      connection.release();
    }
  }

  /**
   * Hitung benefit loyalty untuk transaksi
   */
  static async calculateLoyaltyBenefits(
    pelangganId: string,
    subtotalTransaksi: number,
    poinDigunakan: number = 0,
    scope: AccessScope
  ): Promise<LoyaltyCalculation> {
    const customer = await this.getCustomerLoyaltyData(pelangganId, scope);

    if (!customer) {
      return {
        diskonMemberPersen: 0,
        diskonMemberNominal: 0,
        poinEarned: 0,
        poinUsed: 0,
        saldoPoinBaru: 0,
        canUsePoints: false,
        pointValue: 0
      };
    }

    // Diskon member berdasarkan tipe
    const diskonMemberPersen = customer.diskon_persen;
    const diskonMemberNominal = (subtotalTransaksi * diskonMemberPersen) / 100;

    // Validasi penggunaan poin
    const canUsePoints = customer.saldo_poin >= this.MIN_POIN_USAGE;
    const maxPoinUsable = Math.min(customer.saldo_poin, Math.floor(subtotalTransaksi / this.POIN_TO_RUPIAH));
    const poinUsed = Math.min(poinDigunakan, maxPoinUsable);
    const pointValue = poinUsed * this.POIN_TO_RUPIAH;

    // Hitung poin earned (setelah diskon member tapi sebelum poin discount)
    const subtotalSetelahDiskonMember = subtotalTransaksi - diskonMemberNominal;
    const poinEarned = Math.floor(subtotalSetelahDiskonMember * this.POIN_PER_RUPIAH);

    // Saldo poin baru
    const saldoPoinBaru = customer.saldo_poin - poinUsed + poinEarned;

    return {
      diskonMemberPersen,
      diskonMemberNominal,
      poinEarned,
      poinUsed,
      saldoPoinBaru,
      canUsePoints,
      pointValue
    };
  }

  /**
   * Update saldo poin setelah transaksi selesai
   */
  static async updateCustomerPoints(
    connection: PoolConnection,
    pelangganId: string,
    loyaltyCalc: LoyaltyCalculation
  ): Promise<void> {
    await connection.execute(`
      UPDATE pelanggan
      SET saldo_poin = ?,
          diperbarui_pada = NOW()
      WHERE id = ?
    `, [loyaltyCalc.saldoPoinBaru, pelangganId]);
  }

  /**
   * Log aktivitas poin untuk audit trail
   */
  static async logPointActivity(
    connection: PoolConnection,
    pelangganId: string,
    transaksiId: string,
    tipeAktivitas: 'earned' | 'used' | 'expired' | 'bonus',
    jumlahPoin: number,
    keterangan: string
  ): Promise<void> {
    await connection.execute(`
      INSERT INTO audit_log (
        tenant_id, user_id, tabel, record_id, aksi,
        data_baru, ip_address, user_agent, dibuat_pada
      ) VALUES (
        (SELECT tenant_id FROM pelanggan WHERE id = ?),
        NULL, 'point_activity', ?, 'CREATE',
        JSON_OBJECT(
          'pelanggan_id', ?,
          'transaksi_id', ?,
          'tipe_aktivitas', ?,
          'jumlah_poin', ?,
          'keterangan', ?
        ),
        '127.0.0.1', 'POS-System', NOW()
      )
    `, [pelangganId, pelangganId, pelangganId, transaksiId, tipeAktivitas, jumlahPoin, keterangan]);
  }

  /**
   * Upgrade tipe member berdasarkan total belanja
   */
  static async checkMemberUpgrade(
    connection: PoolConnection,
    pelangganId: string
  ): Promise<boolean> {
    // Ambil total belanja dalam 12 bulan terakhir
    const [rows] = await connection.execute(`
      SELECT
        p.tipe,
        COALESCE(SUM(tp.total), 0) as total_belanja_12bulan
      FROM pelanggan p
      LEFT JOIN transaksi_penjualan tp ON p.id = tp.pelanggan_id
        AND tp.status = 'selesai'
        AND tp.tanggal >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      WHERE p.id = ?
      GROUP BY p.id
    `, [pelangganId]) as [any[], any];

    if (rows.length === 0) return false;

    const { tipe, total_belanja_12bulan } = rows[0];

    // Logic upgrade (bisa disesuaikan dengan kebijakan)
    let newTipe = tipe;
    let diskonBaru = 0;

    if (total_belanja_12bulan >= 50000000 && tipe !== 'vip') { // 50 juta
      newTipe = 'vip';
      diskonBaru = 10;
    } else if (total_belanja_12bulan >= 10000000 && tipe === 'reguler') { // 10 juta
      newTipe = 'member';
      diskonBaru = 5;
    }

    if (newTipe !== tipe) {
      await connection.execute(`
        UPDATE pelanggan
        SET tipe = ?, diskon_persen = ?, diperbarui_pada = NOW()
        WHERE id = ?
      `, [newTipe, diskonBaru, pelangganId]);

      // Log upgrade
      await this.logPointActivity(
        connection,
        pelangganId,
        '',
        'bonus',
        100, // Bonus 100 poin untuk upgrade
        `Upgrade member dari ${tipe} ke ${newTipe}`
      );

      return true;
    }

    return false;
  }

  /**
   * Validasi limit kredit untuk metode bayar kredit
   */
  static async validateCreditLimit(
    pelangganId: string,
    totalTransaksi: number,
    scope: AccessScope
  ): Promise<{ isValid: boolean; message: string; sisaLimit: number }> {
    const customer = await this.getCustomerLoyaltyData(pelangganId, scope);

    if (!customer) {
      return {
        isValid: false,
        message: 'Data pelanggan tidak ditemukan',
        sisaLimit: 0
      };
    }

    if (customer.limit_kredit <= 0) {
      return {
        isValid: false,
        message: 'Pelanggan tidak memiliki limit kredit',
        sisaLimit: 0
      };
    }

    // Hitung kredit yang sedang berjalan
    const connection = await this.db.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT COALESCE(SUM(total), 0) as kredit_berjalan
        FROM transaksi_penjualan
        WHERE pelanggan_id = ?
          AND metode_bayar = 'kredit'
          AND status IN ('selesai', 'pending')
      `, [pelangganId]) as [any[], any];

      const kreditBerjalan = rows[0]?.kredit_berjalan || 0;
      const sisaLimit = customer.limit_kredit - kreditBerjalan;

      return {
        isValid: totalTransaksi <= sisaLimit,
        message: totalTransaksi <= sisaLimit
          ? 'Limit kredit mencukupi'
          : `Limit kredit tidak mencukupi. Sisa limit: Rp ${sisaLimit.toLocaleString()}`,
        sisaLimit
      };

    } finally {
      connection.release();
    }
  }
}