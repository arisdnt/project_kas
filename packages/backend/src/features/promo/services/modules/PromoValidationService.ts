/**
 * Promo Validation Service Module
 * Handles promo validation and application logic
 */

import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';
import { TipePromo, TipeDiskon } from '../../models/PromoCore';

export interface PromoValidationResult {
  valid: boolean;
  promo?: any;
  discount: number;
  message?: string;
}

export class PromoValidationService {
  static async validatePromo(
    scope: AccessScope,
    kodePromo: string,
    subtotal: number,
    pelangganId?: string,
    items?: Array<{ produk_id: string; kategori_id: string }>
  ): Promise<PromoValidationResult> {
    // Get promo by code
    const sql = `
      SELECT *
      FROM promo
      WHERE kode_promo = ? AND status = 'aktif' AND tenant_id = ? AND toko_id = ?
        AND tanggal_mulai <= NOW() AND tanggal_berakhir >= NOW()
    `;

    const [promoRows] = await pool.execute<RowDataPacket[]>(sql, [
      kodePromo,
      scope.tenantId,
      scope.storeId
    ]);

    const promo = promoRows[0];
    if (!promo) {
      return {
        valid: false,
        discount: 0,
        message: 'Promo code not found or expired'
      };
    }

    // Check minimum purchase
    if (subtotal < promo.minimum_pembelian) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum purchase amount is ${promo.minimum_pembelian}`
      };
    }

    // Check usage limit
    if (promo.maksimum_penggunaan && promo.jumlah_terpakai >= promo.maksimum_penggunaan) {
      return {
        valid: false,
        discount: 0,
        message: 'Promo usage limit exceeded'
      };
    }

    // Validate promo type specific rules
    const typeValidation = await this.validatePromoType(promo, pelangganId, items);
    if (!typeValidation.valid) {
      return typeValidation;
    }

    // Calculate discount
    const discount = this.calculateDiscount(promo, subtotal);

    return {
      valid: true,
      promo,
      discount,
      message: 'Promo applied successfully'
    };
  }

  static async applyPromo(
    scope: AccessScope,
    promoId: string,
    transaksiId: string,
    pelangganId: string | undefined,
    kodePromo: string,
    nilaiDiskon: number
  ) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Record promo usage
      const usageId = require('uuid').v4();
      const now = new Date();

      await connection.execute<ResultSetHeader>(
        `INSERT INTO penggunaan_promo
         (id, promo_id, transaksi_penjualan_id, pelanggan_id, kode_promo_digunakan, nilai_diskon_diberikan, tanggal_digunakan, dibuat_pada)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [usageId, promoId, transaksiId, pelangganId || null, kodePromo, nilaiDiskon, now, now]
      );

      // Update promo usage counter
      await connection.execute<ResultSetHeader>(
        'UPDATE promo SET jumlah_terpakai = jumlah_terpakai + 1 WHERE id = ?',
        [promoId]
      );

      await connection.commit();
      return { success: true, usageId };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  private static async validatePromoType(
    promo: any,
    pelangganId?: string,
    items?: Array<{ produk_id: string; kategori_id: string }>
  ): Promise<PromoValidationResult> {
    switch (promo.tipe_promo) {
      case TipePromo.UMUM:
        return { valid: true, discount: 0 };

      case TipePromo.PELANGGAN:
        if (!pelangganId) {
          return {
            valid: false,
            discount: 0,
            message: 'Customer required for this promo'
          };
        }

        // Check if customer is eligible
        const [customerRows] = await pool.execute<RowDataPacket[]>(
          'SELECT COUNT(*) as count FROM promo_pelanggan WHERE promo_id = ? AND pelanggan_id = ?',
          [promo.id, pelangganId]
        );

        if (Number(customerRows[0]?.count || 0) === 0) {
          return {
            valid: false,
            discount: 0,
            message: 'Customer not eligible for this promo'
          };
        }
        break;

      case TipePromo.KATEGORI:
        if (!items || items.length === 0) {
          return {
            valid: false,
            discount: 0,
            message: 'No eligible items for category promo'
          };
        }

        // Check if any item belongs to eligible categories
        const categoryIds = items.map(item => item.kategori_id);
        const [categoryRows] = await pool.execute<RowDataPacket[]>(
          `SELECT COUNT(*) as count FROM promo_kategori
           WHERE promo_id = ? AND kategori_id IN (${categoryIds.map(() => '?').join(',')})`,
          [promo.id, ...categoryIds]
        );

        if (Number(categoryRows[0]?.count || 0) === 0) {
          return {
            valid: false,
            discount: 0,
            message: 'No eligible categories for this promo'
          };
        }
        break;

      case TipePromo.PRODUK:
        if (!items || items.length === 0) {
          return {
            valid: false,
            discount: 0,
            message: 'No eligible items for product promo'
          };
        }

        // Check if any item is eligible
        const productIds = items.map(item => item.produk_id);
        const [productRows] = await pool.execute<RowDataPacket[]>(
          `SELECT COUNT(*) as count FROM promo_produk
           WHERE promo_id = ? AND produk_id IN (${productIds.map(() => '?').join(',')})`,
          [promo.id, ...productIds]
        );

        if (Number(productRows[0]?.count || 0) === 0) {
          return {
            valid: false,
            discount: 0,
            message: 'No eligible products for this promo'
          };
        }
        break;
    }

    return { valid: true, discount: 0 };
  }

  private static calculateDiscount(promo: any, subtotal: number): number {
    if (promo.tipe_diskon === TipeDiskon.PERSEN) {
      return subtotal * (promo.nilai_diskon / 100);
    } else {
      return Math.min(promo.nilai_diskon, subtotal);
    }
  }
}