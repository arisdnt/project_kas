/**
 * Enhanced Kasir Service - Integrasi lengkap untuk stok, pajak, promo, dan loyalty
 * Patch untuk KasirService yang existing dengan validasi database yang ketat
 */

import { Pool, PoolConnection } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AuthenticatedUser } from '@/features/auth/models/User';
import { AccessScope } from '@/core/middleware/accessScope';
import { KasirCartItem, TransaksiPenjualanData, MetodeBayar } from '../models/KasirCore';
import { PromoIntegrationService } from './PromoIntegrationService';
import { CustomerLoyaltyService } from './CustomerLoyaltyService';
import { TaxCalculationService } from './TaxCalculationService';

export interface ProcessTransactionRequest {
  cartItems: KasirCartItem[];
  pelangganId?: string;
  metodeBayar: MetodeBayar;
  jumlahBayar: number;
  diskonPersen?: number;
  diskonNominal?: number;
  kodePromo?: string;
  poinDigunakan?: number;
  catatan?: string;
}

export interface TransactionResult {
  transaksi: TransaksiPenjualanData;
  stokUpdates: Array<{ produk_id: string; stok_lama: number; stok_baru: number }>;
  loyaltyUpdate?: { pelanggan_id: string; poin_lama: number; poin_baru: number };
  promoUsed?: { promo_id: string; kode_promo: string; diskon_nominal: number };
}

export class EnhancedKasirService {
  private static db: Pool = pool;

  /**
   * Proses transaksi dengan validasi lengkap untuk stok, pajak, promo, dan loyalty
   */
  static async processTransactionAtomic(
    sessionId: string,
    user: AuthenticatedUser,
    scope: AccessScope,
    request: ProcessTransactionRequest
  ): Promise<TransactionResult> {
    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      // 1. VALIDASI STOK ATOMIK
      const stokValidation = await this.validateAndReserveStock(
        connection,
        request.cartItems,
        scope
      );

      if (!stokValidation.isValid) {
        throw new Error(`Stok tidak mencukupi: ${stokValidation.message}`);
      }

      // 2. HITUNG PAJAK
      const taxCalculation = await TaxCalculationService.calculateTransactionTax(
        request.cartItems,
        scope
      );

      // 3. VALIDASI DAN APPLY PROMO
      let promoResult = null;
      let diskonPromoNominal = 0;

      if (request.kodePromo) {
        promoResult = await PromoIntegrationService.validatePromoCode(
          request.kodePromo,
          taxCalculation.totalSebelumPajak,
          request.pelangganId || null,
          scope
        );

        if (!promoResult.isValid) {
          throw new Error(promoResult.message);
        }

        diskonPromoNominal = promoResult.diskonNominal;
      }

      // 4. HITUNG LOYALTY BENEFITS
      let loyaltyBenefits = null;
      if (request.pelangganId) {
        // Validasi limit kredit jika bayar kredit
        if (request.metodeBayar === MetodeBayar.KREDIT) {
          const creditValidation = await CustomerLoyaltyService.validateCreditLimit(
            request.pelangganId,
            taxCalculation.totalSetelahPajak,
            scope
          );

          if (!creditValidation.isValid) {
            throw new Error(creditValidation.message);
          }
        }

        loyaltyBenefits = await CustomerLoyaltyService.calculateLoyaltyBenefits(
          request.pelangganId,
          taxCalculation.totalSebelumPajak,
          request.poinDigunakan || 0,
          scope
        );

        // Validasi penggunaan poin
        if (request.poinDigunakan && request.poinDigunakan > 0) {
          if (!loyaltyBenefits.canUsePoints) {
            throw new Error('Saldo poin tidak mencukupi untuk digunakan');
          }
        }
      }

      // 5. HITUNG FINAL TOTALS
      const subtotal = taxCalculation.totalSebelumPajak;
      const diskonMemberNominal = loyaltyBenefits?.diskonMemberNominal || 0;
      const diskonManualNominal = (request.diskonNominal || 0) +
                                 (subtotal * (request.diskonPersen || 0) / 100);
      const poinDiskonNominal = loyaltyBenefits?.pointValue || 0;

      const totalDiskon = diskonMemberNominal + diskonManualNominal + diskonPromoNominal + poinDiskonNominal;
      const subtotalSetelahDiskon = subtotal - totalDiskon;
      const pajakNominal = (subtotalSetelahDiskon * taxCalculation.averageTaxRate) / 100;
      const totalAkhir = subtotalSetelahDiskon + pajakNominal;

      // Validasi pembayaran
      if (request.metodeBayar === MetodeBayar.TUNAI && request.jumlahBayar < totalAkhir) {
        throw new Error(`Jumlah bayar tidak mencukupi. Total: ${totalAkhir}, Bayar: ${request.jumlahBayar}`);
      }

      const kembalian = request.metodeBayar === MetodeBayar.TUNAI
        ? Math.max(0, request.jumlahBayar - totalAkhir)
        : 0;

      // 6. GENERATE NOMOR TRANSAKSI
      const nomorTransaksi = await this.generateNomorTransaksi(
        connection,
        scope.storeId!,
        scope.tenantId
      );

      // 7. INSERT TRANSAKSI
      const [transaksiResult] = await connection.execute(`
        INSERT INTO transaksi_penjualan (
          tenant_id, toko_id, pengguna_id, pelanggan_id, nomor_transaksi,
          tanggal, subtotal, diskon_persen, diskon_nominal,
          pajak_persen, pajak_nominal, total, bayar, kembalian,
          metode_bayar, status, catatan
        ) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, 'selesai', ?)
      `, [
        scope.tenantId,
        scope.storeId,
        user.id,
        request.pelangganId || null,
        nomorTransaksi,
        subtotal,
        request.diskonPersen || 0,
        totalDiskon,
        taxCalculation.averageTaxRate,
        pajakNominal,
        totalAkhir,
        request.jumlahBayar,
        kembalian,
        request.metodeBayar,
        request.catatan || null
      ]) as [any, any];

      const transaksiId = (transaksiResult as any).insertId;

      // 8. INSERT ITEM TRANSAKSI
      for (const item of request.cartItems) {
        await connection.execute(`
          INSERT INTO item_transaksi_penjualan (
            transaksi_penjualan_id, produk_id, kuantitas, harga_satuan,
            diskon_persen, diskon_nominal, subtotal, promo_id, catatan
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          transaksiId,
          item.produk_id,
          item.kuantitas,
          item.harga_satuan,
          item.diskon_persen || 0,
          item.diskon_nominal || 0,
          item.subtotal,
          item.promo_id || null,
          item.catatan || null
        ]);
      }

      // 9. UPDATE STOK FINAL
      const stokUpdates = await this.updateStockFinal(
        connection,
        request.cartItems,
        scope
      );

      // 10. RECORD PROMO USAGE
      if (promoResult && promoResult.promoId) {
        await PromoIntegrationService.recordPromoUsage(
          connection,
          promoResult.promoId,
          transaksiId,
          request.pelangganId || null,
          request.kodePromo!,
          diskonPromoNominal
        );
      }

      // 11. UPDATE CUSTOMER LOYALTY
      let loyaltyUpdate = null;
      if (loyaltyBenefits && request.pelangganId) {
        const saldoPoinLama = (await CustomerLoyaltyService.getCustomerLoyaltyData(
          request.pelangganId,
          scope
        ))?.saldo_poin || 0;

        await CustomerLoyaltyService.updateCustomerPoints(
          connection,
          request.pelangganId,
          loyaltyBenefits
        );

        // Log point activities
        if (loyaltyBenefits.poinEarned > 0) {
          await CustomerLoyaltyService.logPointActivity(
            connection,
            request.pelangganId,
            transaksiId,
            'earned',
            loyaltyBenefits.poinEarned,
            `Poin dari transaksi ${nomorTransaksi}`
          );
        }

        if (loyaltyBenefits.poinUsed > 0) {
          await CustomerLoyaltyService.logPointActivity(
            connection,
            request.pelangganId,
            transaksiId,
            'used',
            loyaltyBenefits.poinUsed,
            `Penggunaan poin untuk transaksi ${nomorTransaksi}`
          );
        }

        // Check member upgrade
        await CustomerLoyaltyService.checkMemberUpgrade(
          connection,
          request.pelangganId
        );

        loyaltyUpdate = {
          pelanggan_id: request.pelangganId,
          poin_lama: saldoPoinLama,
          poin_baru: loyaltyBenefits.saldoPoinBaru
        };
      }

      await connection.commit();

      // Return hasil transaksi
      const transaksi: TransaksiPenjualanData = {
        id: transaksiId,
        tenant_id: scope.tenantId,
        toko_id: scope.storeId!,
        pengguna_id: user.id,
        pelanggan_id: request.pelangganId,
        nomor_transaksi: nomorTransaksi,
        tanggal: new Date(),
        subtotal,
        diskon_persen: request.diskonPersen || 0,
        diskon_nominal: totalDiskon,
        pajak_persen: taxCalculation.averageTaxRate,
        pajak_nominal: pajakNominal,
        total: totalAkhir,
        bayar: request.jumlahBayar,
        kembalian,
        metode_bayar: request.metodeBayar,
        status: 'selesai' as any,
        catatan: request.catatan,
        items: request.cartItems.map(item => ({
          id: '',
          transaksi_penjualan_id: transaksiId,
          produk_id: item.produk_id,
          kuantitas: item.kuantitas,
          harga_satuan: item.harga_satuan,
          diskon_persen: item.diskon_persen || 0,
          diskon_nominal: item.diskon_nominal || 0,
          subtotal: item.subtotal,
          promo_id: item.promo_id,
          catatan: item.catatan
        }))
      };

      return {
        transaksi,
        stokUpdates,
        loyaltyUpdate,
        promoUsed: promoResult && promoResult.promoId ? {
          promo_id: promoResult.promoId,
          kode_promo: request.kodePromo!,
          diskon_nominal: diskonPromoNominal
        } : undefined
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Validasi dan reserve stok secara atomik
   */
  private static async validateAndReserveStock(
    connection: PoolConnection,
    cartItems: KasirCartItem[],
    scope: AccessScope
  ): Promise<{ isValid: boolean; message: string; details: any[] }> {
    const details = [];

    for (const item of cartItems) {
      // Lock row untuk mencegah race condition
      const [stokRows] = await connection.execute(`
        SELECT stok_tersedia, stok_reserved, stok_minimum_toko
        FROM inventaris
        WHERE produk_id = ? AND toko_id = ?
        FOR UPDATE
      `, [item.produk_id, scope.storeId]) as [any[], any];

      if (stokRows.length === 0) {
        return {
          isValid: false,
          message: `Produk ${item.nama_produk} tidak ditemukan di inventaris`,
          details
        };
      }

      const stok = stokRows[0];
      const stokTersedia = stok.stok_tersedia - stok.stok_reserved;

      if (stokTersedia < item.kuantitas) {
        return {
          isValid: false,
          message: `Stok ${item.nama_produk} tidak mencukupi. Tersedia: ${stokTersedia}, Diminta: ${item.kuantitas}`,
          details
        };
      }

      // Reserve stok
      await connection.execute(`
        UPDATE inventaris
        SET stok_reserved = stok_reserved + ?
        WHERE produk_id = ? AND toko_id = ?
      `, [item.kuantitas, item.produk_id, scope.storeId]);

      details.push({
        produk_id: item.produk_id,
        nama_produk: item.nama_produk,
        kuantitas_diminta: item.kuantitas,
        stok_sebelum: stokTersedia,
        stok_reserved: item.kuantitas
      });
    }

    return { isValid: true, message: 'Stok valid dan direserve', details };
  }

  /**
   * Update stok final setelah transaksi berhasil
   */
  private static async updateStockFinal(
    connection: PoolConnection,
    cartItems: KasirCartItem[],
    scope: AccessScope
  ): Promise<Array<{ produk_id: string; stok_lama: number; stok_baru: number }>> {
    const updates = [];

    for (const item of cartItems) {
      const [beforeUpdate] = await connection.execute(`
        SELECT stok_tersedia FROM inventaris
        WHERE produk_id = ? AND toko_id = ?
      `, [item.produk_id, scope.storeId]) as [any[], any];

      const stokLama = beforeUpdate[0]?.stok_tersedia || 0;

      await connection.execute(`
        UPDATE inventaris
        SET stok_tersedia = stok_tersedia - ?,
            stok_reserved = stok_reserved - ?
        WHERE produk_id = ? AND toko_id = ?
      `, [item.kuantitas, item.kuantitas, item.produk_id, scope.storeId]);

      updates.push({
        produk_id: item.produk_id,
        stok_lama: stokLama,
        stok_baru: stokLama - item.kuantitas
      });
    }

    return updates;
  }

  /**
   * Generate nomor transaksi dengan format yang konsisten
   */
  private static async generateNomorTransaksi(
    connection: PoolConnection,
    toko_id: string,
    tenant_id: string
  ): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    // Get toko code
    const [tokoRows] = await connection.execute(
      'SELECT kode FROM toko WHERE id = ? AND tenant_id = ?',
      [toko_id, tenant_id]
    ) as [any[], any];

    const tokoCode = tokoRows[0]?.kode || 'TKO';

    // Get next sequence
    const [countRows] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM transaksi_penjualan
      WHERE toko_id = ? AND tenant_id = ?
      AND DATE(tanggal) = CURDATE()
    `, [toko_id, tenant_id]) as [any[], any];

    const sequence = (countRows[0]?.count || 0) + 1;
    const seqStr = sequence.toString().padStart(4, '0');

    return `${tokoCode}-${dateStr}-${seqStr}`;
  }
}