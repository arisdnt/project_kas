/**
 * Promo Integration Service - Logic untuk validasi dan aplikasi promo pada transaksi
 * Memastikan konsistensi dengan database schema promo
 */

import { Pool, PoolConnection } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { KasirCartItem } from '../models/KasirCore';

export interface PromoValidationResult {
  isValid: boolean;
  message: string;
  diskonNominal: number;
  promoId?: string;
}

export interface ApplicablePromo {
  id: string;
  kode_promo: string;
  nama: string;
  tipe_promo: 'produk' | 'kategori' | 'transaksi' | 'pelanggan';
  tipe_diskon: 'persen' | 'nominal' | 'beli_dapat';
  nilai_diskon: number;
  minimum_pembelian: number;
  maksimum_penggunaan?: number;
  jumlah_terpakai: number;
}

export class PromoIntegrationService {
  private static db: Pool = pool;

  /**
   * Validasi kode promo dan kembalikan detail promo jika valid
   */
  static async validatePromoCode(
    kodePromo: string,
    subtotalTransaksi: number,
    pelangganId: string | null,
    scope: AccessScope
  ): Promise<PromoValidationResult> {
    const connection = await this.db.getConnection();

    try {
      // Query promo dengan validasi scope dan status
      const [promoRows] = await connection.execute(`
        SELECT
          p.id, p.kode_promo, p.nama, p.tipe_promo, p.tipe_diskon,
          p.nilai_diskon, p.minimum_pembelian, p.maksimum_penggunaan,
          p.jumlah_terpakai, p.tanggal_mulai, p.tanggal_berakhir
        FROM promo p
        WHERE p.kode_promo = ?
          AND p.tenant_id = ?
          AND p.toko_id = ?
          AND p.status = 'aktif'
          AND NOW() BETWEEN p.tanggal_mulai AND p.tanggal_berakhir
        LIMIT 1
      `, [kodePromo, scope.tenantId, scope.storeId]) as [any[], any];

      if (promoRows.length === 0) {
        return {
          isValid: false,
          message: 'Kode promo tidak ditemukan atau sudah tidak berlaku',
          diskonNominal: 0
        };
      }

      const promo = promoRows[0];

      // Validasi maksimum penggunaan
      if (promo.maksimum_penggunaan && promo.jumlah_terpakai >= promo.maksimum_penggunaan) {
        return {
          isValid: false,
          message: 'Promo sudah mencapai batas maksimum penggunaan',
          diskonNominal: 0
        };
      }

      // Validasi minimum pembelian
      if (subtotalTransaksi < promo.minimum_pembelian) {
        return {
          isValid: false,
          message: `Minimum pembelian untuk promo ini adalah Rp ${promo.minimum_pembelian.toLocaleString()}`,
          diskonNominal: 0
        };
      }

      // Validasi promo khusus pelanggan
      if (promo.tipe_promo === 'pelanggan' && pelangganId) {
        const [pelangganPromoRows] = await connection.execute(`
          SELECT 1 FROM promo_pelanggan
          WHERE promo_id = ? AND pelanggan_id = ?
        `, [promo.id, pelangganId]) as [any[], any];

        if (pelangganPromoRows.length === 0) {
          return {
            isValid: false,
            message: 'Promo ini khusus untuk pelanggan tertentu',
            diskonNominal: 0
          };
        }
      }

      // Hitung diskon nominal
      let diskonNominal = 0;
      if (promo.tipe_diskon === 'persen') {
        diskonNominal = (subtotalTransaksi * promo.nilai_diskon) / 100;
      } else if (promo.tipe_diskon === 'nominal') {
        diskonNominal = promo.nilai_diskon;
      }

      return {
        isValid: true,
        message: `Promo "${promo.nama}" berhasil diterapkan`,
        diskonNominal,
        promoId: promo.id
      };

    } finally {
      connection.release();
    }
  }

  /**
   * Dapatkan daftar promo yang berlaku untuk cart items
   */
  static async getApplicablePromos(
    cartItems: KasirCartItem[],
    pelangganId: string | null,
    scope: AccessScope
  ): Promise<ApplicablePromo[]> {
    const connection = await this.db.getConnection();

    try {
      const produkIds = cartItems.map(item => item.produk_id);

      // Query promo berdasarkan produk dalam cart
      const [promoRows] = await connection.execute(`
        SELECT DISTINCT
          p.id, p.kode_promo, p.nama, p.tipe_promo, p.tipe_diskon,
          p.nilai_diskon, p.minimum_pembelian, p.maksimum_penggunaan,
          p.jumlah_terpakai
        FROM promo p
        LEFT JOIN promo_produk pp ON p.id = pp.promo_id
        LEFT JOIN promo_kategori pk ON p.id = pk.promo_id
        LEFT JOIN produk pr ON pp.produk_id = pr.id OR pk.kategori_id = pr.kategori_id
        WHERE p.tenant_id = ?
          AND p.toko_id = ?
          AND p.status = 'aktif'
          AND NOW() BETWEEN p.tanggal_mulai AND p.tanggal_berakhir
          AND (
            p.tipe_promo = 'transaksi'
            OR (p.tipe_promo = 'produk' AND pr.id IN (${produkIds.map(() => '?').join(',')}))
            OR (p.tipe_promo = 'kategori' AND pr.id IN (${produkIds.map(() => '?').join(',')}))
          )
        ORDER BY p.nilai_diskon DESC
      `, [scope.tenantId, scope.storeId, ...produkIds, ...produkIds]) as [any[], any];

      return promoRows;

    } finally {
      connection.release();
    }
  }

  /**
   * Record penggunaan promo setelah transaksi berhasil
   */
  static async recordPromoUsage(
    connection: PoolConnection,
    promoId: string,
    transaksiId: string,
    pelangganId: string | null,
    kodePromo: string,
    nilaiDiskon: number
  ): Promise<void> {
    // Insert ke tabel penggunaan_promo
    await connection.execute(`
      INSERT INTO penggunaan_promo (
        promo_id, transaksi_penjualan_id, pelanggan_id,
        kode_promo_digunakan, nilai_diskon_diberikan, tanggal_digunakan
      ) VALUES (?, ?, ?, ?, ?, NOW())
    `, [promoId, transaksiId, pelangganId, kodePromo, nilaiDiskon]);

    // Update jumlah terpakai
    await connection.execute(`
      UPDATE promo
      SET jumlah_terpakai = jumlah_terpakai + 1,
          diperbarui_pada = NOW()
      WHERE id = ?
    `, [promoId]);

    // Update status jika sudah mencapai maksimum
    await connection.execute(`
      UPDATE promo
      SET status = 'habis'
      WHERE id = ?
        AND maksimum_penggunaan IS NOT NULL
        AND jumlah_terpakai >= maksimum_penggunaan
    `, [promoId]);
  }

  /**
   * Validasi promo untuk item spesifik dalam cart
   */
  static async validateItemPromo(
    produkId: string,
    promoId: string,
    scope: AccessScope
  ): Promise<boolean> {
    const connection = await this.db.getConnection();

    try {
      const [rows] = await connection.execute(`
        SELECT 1
        FROM promo p
        LEFT JOIN promo_produk pp ON p.id = pp.promo_id
        LEFT JOIN promo_kategori pk ON p.id = pk.promo_id
        LEFT JOIN produk pr ON pr.id = ?
        WHERE p.id = ?
          AND p.tenant_id = ?
          AND p.toko_id = ?
          AND p.status = 'aktif'
          AND (
            (p.tipe_promo = 'produk' AND pp.produk_id = ?)
            OR (p.tipe_promo = 'kategori' AND pk.kategori_id = pr.kategori_id)
            OR p.tipe_promo = 'transaksi'
          )
        LIMIT 1
      `, [produkId, promoId, scope.tenantId, scope.storeId, produkId]) as [any[], any];

      return rows.length > 0;

    } finally {
      connection.release();
    }
  }
}