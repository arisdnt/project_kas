/**
 * Tax Calculation Service - Service untuk perhitungan pajak yang akurat
 * Mengintegrasikan dengan data produk dan konfigurasi pajak
 */

import { Pool } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';
import { KasirCartItem } from '../models/KasirCore';

export interface TaxConfiguration {
  defaultTaxRate: number; // PPN default (misal 11%)
  includesTax: boolean; // Apakah harga sudah termasuk pajak
  roundingMethod: 'round' | 'ceil' | 'floor';
}

export interface ItemTaxCalculation {
  produkId: string;
  subtotalSebelumPajak: number;
  pajakPersen: number;
  pajakNominal: number;
  subtotalSetelahPajak: number;
  isPajakIncluded: boolean;
}

export interface TransactionTaxSummary {
  totalSebelumPajak: number;
  totalPajakNominal: number;
  totalSetelahPajak: number;
  itemDetails: ItemTaxCalculation[];
  averageTaxRate: number;
}

export class TaxCalculationService {
  private static db: Pool = pool;

  // Konfigurasi default pajak
  private static readonly DEFAULT_CONFIG: TaxConfiguration = {
    defaultTaxRate: 11.0, // PPN 11%
    includesTax: false, // Harga belum termasuk pajak
    roundingMethod: 'round'
  };

  /**
   * Dapatkan konfigurasi pajak untuk toko
   */
  static async getTaxConfiguration(scope: AccessScope): Promise<TaxConfiguration> {
    const connection = await this.db.getConnection();

    try {
      // Cek konfigurasi pajak di tabel pengaturan atau toko
      const [rows] = await connection.execute(`
        SELECT
          COALESCE(k.pajak_default, ?) as defaultTaxRate,
          COALESCE(k.harga_include_pajak, ?) as includesTax,
          COALESCE(k.metode_pembulatan, ?) as roundingMethod
        FROM toko t
        LEFT JOIN konfigurasi k ON t.id = k.toko_id
        WHERE t.id = ? AND t.tenant_id = ?
        LIMIT 1
      `, [
        this.DEFAULT_CONFIG.defaultTaxRate,
        this.DEFAULT_CONFIG.includesTax,
        this.DEFAULT_CONFIG.roundingMethod,
        scope.storeId,
        scope.tenantId
      ]) as [any[], any];

      if (rows.length > 0) {
        return {
          defaultTaxRate: rows[0].defaultTaxRate,
          includesTax: Boolean(rows[0].includesTax),
          roundingMethod: rows[0].roundingMethod || 'round'
        };
      }

      return this.DEFAULT_CONFIG;

    } finally {
      connection.release();
    }
  }

  /**
   * Hitung pajak untuk item individual
   */
  static calculateItemTax(
    cartItem: KasirCartItem,
    produkPajakPersen: number,
    config: TaxConfiguration
  ): ItemTaxCalculation {
    const subtotalItem = cartItem.harga_satuan * cartItem.kuantitas;
    const diskonItem = (cartItem.diskon_nominal || 0) +
                      (subtotalItem * (cartItem.diskon_persen || 0) / 100);
    const subtotalSetelahDiskon = subtotalItem - diskonItem;

    // Gunakan pajak produk jika ada, kalau tidak gunakan default
    const pajakPersen = produkPajakPersen > 0 ? produkPajakPersen : config.defaultTaxRate;

    let subtotalSebelumPajak: number;
    let pajakNominal: number;
    let subtotalSetelahPajak: number;

    if (config.includesTax) {
      // Harga sudah termasuk pajak, hitung mundur
      subtotalSetelahPajak = subtotalSetelahDiskon;
      subtotalSebelumPajak = subtotalSetelahPajak / (1 + (pajakPersen / 100));
      pajakNominal = subtotalSetelahPajak - subtotalSebelumPajak;
    } else {
      // Harga belum termasuk pajak, hitung maju
      subtotalSebelumPajak = subtotalSetelahDiskon;
      pajakNominal = (subtotalSebelumPajak * pajakPersen) / 100;
      subtotalSetelahPajak = subtotalSebelumPajak + pajakNominal;
    }

    // Apply rounding method
    pajakNominal = this.applyRounding(pajakNominal, config.roundingMethod);
    subtotalSetelahPajak = this.applyRounding(subtotalSetelahPajak, config.roundingMethod);

    return {
      produkId: cartItem.produk_id,
      subtotalSebelumPajak: this.applyRounding(subtotalSebelumPajak, config.roundingMethod),
      pajakPersen,
      pajakNominal,
      subtotalSetelahPajak,
      isPajakIncluded: config.includesTax
    };
  }

  /**
   * Hitung total pajak untuk seluruh transaksi
   */
  static async calculateTransactionTax(
    cartItems: KasirCartItem[],
    scope: AccessScope
  ): Promise<TransactionTaxSummary> {
    const config = await this.getTaxConfiguration(scope);
    const connection = await this.db.getConnection();

    try {
      // Ambil data pajak produk
      const produkIds = cartItems.map(item => item.produk_id);
      const [produkRows] = await connection.execute(`
        SELECT id, pajak_persen
        FROM produk
        WHERE id IN (${produkIds.map(() => '?').join(',')})
      `, produkIds) as [any[], any];

      const produkTaxMap = new Map<string, number>();
      produkRows.forEach((row: any) => {
        produkTaxMap.set(row.id, row.pajak_persen || 0);
      });

      // Hitung pajak per item
      const itemDetails: ItemTaxCalculation[] = [];
      let totalSebelumPajak = 0;
      let totalPajakNominal = 0;
      let totalSetelahPajak = 0;

      for (const cartItem of cartItems) {
        const produkPajakPersen = produkTaxMap.get(cartItem.produk_id) || 0;
        const itemTax = this.calculateItemTax(cartItem, produkPajakPersen, config);

        itemDetails.push(itemTax);
        totalSebelumPajak += itemTax.subtotalSebelumPajak;
        totalPajakNominal += itemTax.pajakNominal;
        totalSetelahPajak += itemTax.subtotalSetelahPajak;
      }

      // Hitung rata-rata pajak
      const averageTaxRate = totalSebelumPajak > 0
        ? (totalPajakNominal / totalSebelumPajak) * 100
        : 0;

      return {
        totalSebelumPajak: this.applyRounding(totalSebelumPajak, config.roundingMethod),
        totalPajakNominal: this.applyRounding(totalPajakNominal, config.roundingMethod),
        totalSetelahPajak: this.applyRounding(totalSetelahPajak, config.roundingMethod),
        itemDetails,
        averageTaxRate: this.applyRounding(averageTaxRate, config.roundingMethod)
      };

    } finally {
      connection.release();
    }
  }

  /**
   * Apply metode pembulatan
   */
  private static applyRounding(value: number, method: string): number {
    switch (method) {
      case 'ceil':
        return Math.ceil(value);
      case 'floor':
        return Math.floor(value);
      case 'round':
      default:
        return Math.round(value);
    }
  }

  /**
   * Validasi konsistensi pajak dalam transaksi
   */
  static validateTaxConsistency(
    subtotal: number,
    pajakPersen: number,
    pajakNominal: number,
    total: number,
    tolerance: number = 1 // Toleransi 1 rupiah untuk pembulatan
  ): { isValid: boolean; message: string; expectedValues: any } {
    const expectedPajakNominal = Math.round((subtotal * pajakPersen) / 100);
    const expectedTotal = subtotal + expectedPajakNominal;

    const pajakDiff = Math.abs(pajakNominal - expectedPajakNominal);
    const totalDiff = Math.abs(total - expectedTotal);

    const isValid = pajakDiff <= tolerance && totalDiff <= tolerance;

    return {
      isValid,
      message: isValid
        ? 'Perhitungan pajak konsisten'
        : `Perhitungan pajak tidak konsisten. Pajak diff: ${pajakDiff}, Total diff: ${totalDiff}`,
      expectedValues: {
        expectedPajakNominal,
        expectedTotal,
        actualPajakNominal: pajakNominal,
        actualTotal: total,
        pajakDifference: pajakDiff,
        totalDifference: totalDiff
      }
    };
  }
}