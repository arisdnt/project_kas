/**
 * Kasir Service - Business Logic untuk Operasi Point of Sales
 * Mendukung multi-tenant, real-time inventory tracking, dan session management
 */

import { Pool, PoolConnection } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AuthenticatedUser } from '@/features/auth/models/User';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import {
  KasirSession,
  KasirCartItem,
  ProdukKasir,
  PelangganKasir,
  TransaksiPenjualanData,
  ItemTransaksiPenjualanData,
  SearchProdukParams,
  SearchProdukResponse,
  SummaryKasir,
  StatusTransaksi,
  MetodeBayar
} from '../models/KasirCore';

export class KasirService {
  private static db: Pool = pool;

  /**
   * Generate nomor transaksi otomatis
   */
  private static async generateNomorTransaksi(
    connection: PoolConnection,
    toko_id: string,
    tenant_id: string
  ): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    // Get toko code untuk prefix
    const [tokoRows] = await connection.execute(
      'SELECT kode FROM toko WHERE id = ? AND tenant_id = ?',
      [toko_id, tenant_id]
    ) as [any[], any];

    const tokoCode = tokoRows[0]?.kode || 'TKO';

    // Get next sequence number untuk hari ini
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

  /**
   * Membuat session kasir baru atau mendapatkan session yang sudah ada
   */
  static async createOrGetSession(
    user: AuthenticatedUser,
    scope: AccessScope
  ): Promise<KasirSession> {
    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      // Cek session aktif yang sudah ada
      const [sessionRows] = await connection.execute(`
        SELECT * FROM user_sessions
        WHERE user_id = ? AND toko_id = ? AND tenant_id = ?
        AND expires_at > NOW() AND is_active = 1
        ORDER BY dibuat_pada DESC
        LIMIT 1
      `, [user.id, scope.storeId, scope.tenantId]) as [any[], any];

      let sessionId: string;

      if (sessionRows.length > 0) {
        sessionId = sessionRows[0].id;
      } else {
        // Buat session baru
        const [result] = await connection.execute(`
          INSERT INTO user_sessions (
            user_id, toko_id, tenant_id, session_token,
            expires_at, ip_address, user_agent
          ) VALUES (?, ?, ?, ?,
            DATE_ADD(NOW(), INTERVAL 8 HOUR),
            '127.0.0.1', 'POS-System')
        `, [
          user.id,
          scope.storeId,
          scope.tenantId,
          `kasir_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        ]) as [any, any];

        sessionId = (result as any).insertId;
      }

      // Return session kosong untuk session baru
      const session: KasirSession = {
        id: sessionId,
        user_id: user.id,
        toko_id: scope.storeId!,
        tenant_id: scope.tenantId,
        cart_items: [],
        total_items: 0,
        subtotal: 0,
        diskon_persen: 0,
        diskon_nominal: 0,
        pajak_persen: 0,
        pajak_nominal: 0,
        total_akhir: 0,
        metode_bayar: MetodeBayar.TUNAI,
        jumlah_bayar: 0,
        kembalian: 0,
        dibuat_pada: new Date(),
        diperbarui_pada: new Date()
      };

      await connection.commit();
      return session;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Pencarian produk untuk kasir dengan real-time inventory
   */
  static async searchProduk(
    params: SearchProdukParams,
    scope: AccessScope
  ): Promise<SearchProdukResponse> {
    const connection = await this.db.getConnection();

    try {
      let whereClause = 'WHERE p.is_aktif = 1';
      let queryParams: any[] = [];

      // Apply tenant/store scope
      const scopedWhere = applyScopeToSql(whereClause, queryParams, scope, {
        tenantColumn: 'p.tenant_id',
        storeColumn: 'i.toko_id'
      });

      let conditions: string[] = [scopedWhere.sql];
      queryParams = [...scopedWhere.params];
      if (params.query) {
        conditions.push(`(
          p.nama LIKE ? OR
          p.kode LIKE ? OR
          p.barcode LIKE ? OR
          k.nama LIKE ? OR
          b.nama LIKE ?
        )`);
        const searchTerm = `%${params.query}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }

      // Barcode exact match
      if (params.barcode) {
        conditions.push('p.barcode = ?');
        queryParams.push(params.barcode);
      }

      // Category filter
      if (params.kategori_id) {
        conditions.push('p.kategori_id = ?');
        queryParams.push(params.kategori_id);
      }

      // Brand filter
      if (params.brand_id) {
        conditions.push('p.brand_id = ?');
        queryParams.push(params.brand_id);
      }

      // Stock minimum filter
      if (params.stok_minimum) {
        conditions.push('i.stok_tersedia <= p.stok_minimum');
      }

      const whereCondition = conditions.join(' AND ');

      // Query utama
      const query = `
        SELECT
          p.id,
          p.tenant_id,
          p.kode,
          p.barcode,
          p.nama,
          p.deskripsi,
          p.satuan,
          p.harga_jual,
          p.pajak_persen,
          p.gambar_url,
          p.is_aktif,
          p.stok_minimum,
          k.id as kategori_id,
          k.nama as kategori_nama,
          b.id as brand_id,
          b.nama as brand_nama,
          i.toko_id,
          COALESCE(i.stok_tersedia, 0) as stok_tersedia,
          COALESCE(i.stok_reserved, 0) as stok_reserved,
          COALESCE(i.harga_jual_toko, p.harga_jual) as harga_jual_toko,
          i.lokasi_rak
        FROM produk p
        LEFT JOIN inventaris i ON p.id = i.produk_id
        LEFT JOIN kategori k ON p.kategori_id = k.id
        LEFT JOIN brand b ON p.brand_id = b.id
        ${whereCondition}
        ORDER BY p.nama ASC
        LIMIT ? OFFSET ?
      `;

      queryParams.push(params.limit || 20, params.offset || 0);

      const [rows] = await connection.execute(query, queryParams) as [any[], any];

      // Count total
      const countQuery = `
        SELECT COUNT(DISTINCT p.id) as total
        FROM produk p
        LEFT JOIN inventaris i ON p.id = i.produk_id
        LEFT JOIN kategori k ON p.kategori_id = k.id
        LEFT JOIN brand b ON p.brand_id = b.id
        ${whereCondition}
      `;

      const [countRows] = await connection.execute(
        countQuery,
        queryParams.slice(0, -2) // Remove limit and offset
      ) as [any[], any];

      const products: ProdukKasir[] = rows.map((row: any) => ({
        id: row.id,
        tenant_id: row.tenant_id,
        toko_id: row.toko_id || scope.storeId!,
        kategori_id: row.kategori_id,
        kategori_nama: row.kategori_nama || 'Tanpa Kategori',
        brand_id: row.brand_id,
        brand_nama: row.brand_nama || 'Tanpa Brand',
        kode: row.kode,
        barcode: row.barcode,
        nama: row.nama,
        deskripsi: row.deskripsi,
        satuan: row.satuan || 'pcs',
        harga_jual: Number(row.harga_jual),
        pajak_persen: Number(row.pajak_persen || 0),
        gambar_url: row.gambar_url,
        is_aktif: Boolean(row.is_aktif),
        stok_tersedia: Number(row.stok_tersedia || 0),
        stok_reserved: Number(row.stok_reserved || 0),
        stok_minimum: Number(row.stok_minimum || 0),
        harga_jual_toko: Number(row.harga_jual_toko),
        lokasi_rak: row.lokasi_rak
      }));

      const total = countRows[0]?.total || 0;
      const limit = params.limit || 20;
      const offset = params.offset || 0;

      return {
        products,
        total,
        limit,
        offset,
        has_more: offset + limit < total
      };

    } finally {
      connection.release();
    }
  }

  /**
   * Get produk by barcode untuk scan
   */
  static async getProdukByBarcode(
    barcode: string,
    scope: AccessScope
  ): Promise<ProdukKasir | null> {
    const result = await this.searchProduk(
      { barcode, limit: 1, aktif_only: true },
      scope
    );

    return result.products.length > 0 ? result.products[0] : null;
  }

  /**
   * Tambah item ke cart session
   */
  static async addItemToCart(
    sessionId: string,
    produkId: string,
    kuantitas: number,
    scope: AccessScope,
    hargaSatuan?: number,
    diskonPersen?: number,
    diskonNominal?: number,
    catatan?: string
  ): Promise<KasirCartItem> {
    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      // Get produk dengan inventory check
      const [produkRows] = await connection.execute(`
        SELECT
          p.id, p.nama, p.kode, p.barcode, p.harga_jual, p.pajak_persen,
          i.stok_tersedia, i.stok_reserved, i.harga_jual_toko
        FROM produk p
        LEFT JOIN inventaris i ON p.id = i.produk_id AND i.toko_id = ?
        WHERE p.id = ? AND p.tenant_id = ? AND p.is_aktif = 1
      `, [scope.storeId, produkId, scope.tenantId]) as [any[], any];

      if (produkRows.length === 0) {
        throw new Error('Produk tidak ditemukan atau tidak aktif');
      }

      const produk = produkRows[0];
      const stokTersedia = Number(produk.stok_tersedia || 0);
      const stokReserved = Number(produk.stok_reserved || 0);

      // Cek ketersediaan stok
      if (stokTersedia < kuantitas) {
        throw new Error(`Stok tidak mencukupi. Tersedia: ${stokTersedia}, diminta: ${kuantitas}`);
      }

      // Hitung harga dan diskon
      const harga = hargaSatuan || Number(produk.harga_jual_toko || produk.harga_jual);
      const subtotal = harga * kuantitas;
      const diskon = (diskonNominal || 0) + (subtotal * (diskonPersen || 0) / 100);
      const subtotalAkhir = Math.max(0, subtotal - diskon);

      // Create cart item
      const cartItem: KasirCartItem = {
        produk_id: produk.id,
        nama_produk: produk.nama,
        kode_produk: produk.kode,
        barcode: produk.barcode,
        harga_satuan: harga,
        kuantitas,
        subtotal: subtotalAkhir,
        diskon_persen: diskonPersen || 0,
        diskon_nominal: diskonNominal || 0,
        catatan,
        stok_tersedia: stokTersedia,
        stok_reserved: stokReserved
      };

      // Reserve stok sementara (di implementasi lengkap, simpan ke tabel temporary)
      await connection.execute(`
        UPDATE inventaris
        SET stok_reserved = stok_reserved + ?,
            terakhir_update = NOW()
        WHERE produk_id = ? AND toko_id = ?
      `, [kuantitas, produkId, scope.storeId]);

      await connection.commit();
      return cartItem;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update kuantitas item di cart
   */
  static async updateCartItem(
    sessionId: string,
    produkId: string,
    newKuantitas: number,
    scope: AccessScope
  ): Promise<KasirCartItem> {
    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      // Get current reserved stock
      const [inventarisRows] = await connection.execute(`
        SELECT stok_tersedia, stok_reserved
        FROM inventaris
        WHERE produk_id = ? AND toko_id = ?
      `, [produkId, scope.storeId]) as [any[], any];

      if (inventarisRows.length === 0) {
        throw new Error('Data inventaris tidak ditemukan');
      }

      const stokTersedia = Number(inventarisRows[0].stok_tersedia);
      const stokReserved = Number(inventarisRows[0].stok_reserved);

      // Validasi ketersediaan stok untuk kuantitas baru
      const availableStock = stokTersedia + stokReserved; // Include currently reserved
      if (availableStock < newKuantitas) {
        throw new Error(`Stok tidak mencukupi. Tersedia: ${availableStock}, diminta: ${newKuantitas}`);
      }

      // Update reserved stock (asumsi kuantitas lama sudah di-reserve sebelumnya)
      // Dalam implementasi lengkap, track kuantitas lama dari temporary cart table
      await connection.execute(`
        UPDATE inventaris
        SET stok_reserved = ?,
            terakhir_update = NOW()
        WHERE produk_id = ? AND toko_id = ?
      `, [newKuantitas, produkId, scope.storeId]);

      // Get updated product info and create cart item
      const [produkRows] = await connection.execute(`
        SELECT p.*, i.harga_jual_toko
        FROM produk p
        LEFT JOIN inventaris i ON p.id = i.produk_id AND i.toko_id = ?
        WHERE p.id = ? AND p.tenant_id = ?
      `, [scope.storeId, produkId, scope.tenantId]) as [any[], any];

      const produk = produkRows[0];
      const harga = Number(produk.harga_jual_toko || produk.harga_jual);

      const updatedItem: KasirCartItem = {
        produk_id: produk.id,
        nama_produk: produk.nama,
        kode_produk: produk.kode,
        barcode: produk.barcode,
        harga_satuan: harga,
        kuantitas: newKuantitas,
        subtotal: harga * newKuantitas,
        stok_tersedia: availableStock - newKuantitas,
        stok_reserved: newKuantitas
      };

      await connection.commit();
      return updatedItem;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Hapus item dari cart
   */
  static async removeItemFromCart(
    sessionId: string,
    produkId: string,
    scope: AccessScope
  ): Promise<void> {
    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      // Release reserved stock
      await connection.execute(`
        UPDATE inventaris
        SET stok_reserved = GREATEST(0, stok_reserved -
          (SELECT kuantitas FROM cart_temp WHERE session_id = ? AND produk_id = ?)
        ),
        terakhir_update = NOW()
        WHERE produk_id = ? AND toko_id = ?
      `, [sessionId, produkId, produkId, scope.storeId]);

      // Dalam implementasi lengkap, hapus dari cart_temp table
      // DELETE FROM cart_temp WHERE session_id = ? AND produk_id = ?

      await connection.commit();

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Kosongkan cart
   */
  static async clearCart(sessionId: string, scope: AccessScope): Promise<void> {
    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      // Release all reserved stock untuk session ini
      await connection.execute(`
        UPDATE inventaris i
        JOIN cart_temp ct ON i.produk_id = ct.produk_id
        SET i.stok_reserved = GREATEST(0, i.stok_reserved - ct.kuantitas),
            i.terakhir_update = NOW()
        WHERE ct.session_id = ? AND i.toko_id = ?
      `, [sessionId, scope.storeId]);

      // Clear cart items
      // DELETE FROM cart_temp WHERE session_id = ?

      await connection.commit();

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Set pelanggan untuk transaksi
   */
  static async setPelanggan(
    sessionId: string,
    pelangganId: string,
    scope: AccessScope
  ): Promise<PelangganKasir> {
    const connection = await this.db.getConnection();

    try {
      // Validasi pelanggan exists dan aktif
      const [pelangganRows] = await connection.execute(`
        SELECT * FROM pelanggan
        WHERE id = ? AND tenant_id = ? AND toko_id = ? AND status = 'aktif'
      `, [pelangganId, scope.tenantId, scope.storeId]) as [any[], any];

      if (pelangganRows.length === 0) {
        throw new Error('Pelanggan tidak ditemukan atau tidak aktif');
      }

      const pelanggan = pelangganRows[0];

      return {
        id: pelanggan.id,
        kode: pelanggan.kode,
        nama: pelanggan.nama,
        email: pelanggan.email,
        telepon: pelanggan.telepon,
        tipe: pelanggan.tipe,
        diskon_persen: Number(pelanggan.diskon_persen || 0),
        limit_kredit: Number(pelanggan.limit_kredit || 0),
        saldo_poin: Number(pelanggan.saldo_poin || 0),
        status: pelanggan.status
      };

    } finally {
      connection.release();
    }
  }

  /**
   * Proses pembayaran dan simpan transaksi
   */
  static async prosesTransaksi(
    sessionId: string,
    user: AuthenticatedUser,
    scope: AccessScope,
    cartItems: KasirCartItem[],
    pelangganId: string | undefined,
    metodeBayar: MetodeBayar,
    jumlahBayar: number,
    diskonPersen: number = 0,
    diskonNominal: number = 0,
    catatan?: string
  ): Promise<TransaksiPenjualanData> {
    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      if (cartItems.length === 0) {
        throw new Error('Keranjang kosong');
      }

      // Generate nomor transaksi
      const nomorTransaksi = await this.generateNomorTransaksi(
        connection,
        scope.storeId!,
        scope.tenantId
      );

      // Hitung total
      const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
      const totalDiskon = diskonNominal + (subtotal * diskonPersen / 100);
      const afterDiscount = Math.max(0, subtotal - totalDiskon);

      // Get pajak dari konfigurasi toko
      const [configRows] = await connection.execute(`
        SELECT pajak, is_pajak_aktif
        FROM konfigurasi_sistem
        WHERE tenant_id = ? AND (toko_id = ? OR toko_id IS NULL)
        ORDER BY toko_id DESC LIMIT 1
      `, [scope.tenantId, scope.storeId]) as [any[], any];

      const pajakPersen = configRows.length > 0 && configRows[0].is_pajak_aktif ?
        Number(configRows[0].pajak || 0) : 0;
      const pajakNominal = afterDiscount * (pajakPersen / 100);
      const totalAkhir = afterDiscount + pajakNominal;

      // Validasi pembayaran
      if (metodeBayar === MetodeBayar.TUNAI && jumlahBayar < totalAkhir) {
        throw new Error(`Pembayaran kurang. Total: ${totalAkhir}, Dibayar: ${jumlahBayar}`);
      }

      const kembalian = metodeBayar === MetodeBayar.TUNAI ?
        Math.max(0, jumlahBayar - totalAkhir) : 0;

      // Insert transaksi
      const [transaksiResult] = await connection.execute(`
        INSERT INTO transaksi_penjualan (
          tenant_id, toko_id, pengguna_id, pelanggan_id,
          nomor_transaksi, tanggal, subtotal, diskon_persen, diskon_nominal,
          pajak_persen, pajak_nominal, total, bayar, kembalian,
          metode_bayar, status, catatan
        ) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, 'selesai', ?)
      `, [
        scope.tenantId, scope.storeId, user.id, pelangganId,
        nomorTransaksi, subtotal, diskonPersen, diskonNominal,
        pajakPersen, pajakNominal, totalAkhir, jumlahBayar, kembalian,
        metodeBayar, catatan
      ]) as [any, any];

      const transaksiId = (transaksiResult as any).insertId;

      // Insert item transaksi dan update stok
      const itemTransaksi: ItemTransaksiPenjualanData[] = [];

      for (const item of cartItems) {
        // Insert item
        const [itemResult] = await connection.execute(`
          INSERT INTO item_transaksi_penjualan (
            transaksi_penjualan_id, produk_id, kuantitas, harga_satuan,
            diskon_persen, diskon_nominal, subtotal, catatan
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          transaksiId, item.produk_id, item.kuantitas, item.harga_satuan,
          item.diskon_persen || 0, item.diskon_nominal || 0, item.subtotal,
          item.catatan
        ]) as [any, any];

        // Update stok: kurangi stok_tersedia, kurangi stok_reserved
        await connection.execute(`
          UPDATE inventaris
          SET stok_tersedia = GREATEST(0, stok_tersedia - ?),
              stok_reserved = GREATEST(0, stok_reserved - ?),
              terakhir_update = NOW()
          WHERE produk_id = ? AND toko_id = ?
        `, [item.kuantitas, item.kuantitas, item.produk_id, scope.storeId]);

        itemTransaksi.push({
          id: (itemResult as any).insertId,
          produk_id: item.produk_id,
          kuantitas: item.kuantitas,
          harga_satuan: item.harga_satuan,
          diskon_persen: item.diskon_persen || 0,
          diskon_nominal: item.diskon_nominal || 0,
          subtotal: item.subtotal,
          catatan: item.catatan
        });
      }

      // Clear cart session
      await this.clearCart(sessionId, scope);

      const transaksi: TransaksiPenjualanData = {
        id: transaksiId,
        tenant_id: scope.tenantId,
        toko_id: scope.storeId!,
        pengguna_id: user.id,
        pelanggan_id: pelangganId,
        nomor_transaksi: nomorTransaksi,
        tanggal: new Date(),
        subtotal,
        diskon_persen: diskonPersen,
        diskon_nominal: diskonNominal,
        pajak_persen: pajakPersen,
        pajak_nominal: pajakNominal,
        total: totalAkhir,
        bayar: jumlahBayar,
        kembalian,
        metode_bayar: metodeBayar,
        status: StatusTransaksi.SELESAI,
        catatan,
        items: itemTransaksi
      };

      await connection.commit();
      return transaksi;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get summary penjualan kasir untuk hari ini
   */
  static async getSummaryHariIni(scope: AccessScope): Promise<SummaryKasir> {
    const connection = await this.db.getConnection();

    try {
      // Total transaksi hari ini
      const [summaryRows] = await connection.execute(`
        SELECT
          COUNT(*) as total_transaksi,
          SUM(total) as total_pendapatan,
          AVG(total) as rata_rata_transaksi,
          SUM(CASE WHEN metode_bayar = 'tunai' THEN total ELSE 0 END) as total_tunai,
          SUM(CASE WHEN metode_bayar != 'tunai' THEN total ELSE 0 END) as total_non_tunai,
          SUM((SELECT SUM(kuantitas) FROM item_transaksi_penjualan WHERE transaksi_penjualan_id = tp.id)) as total_item_terjual
        FROM transaksi_penjualan tp
        WHERE tp.tenant_id = ? AND tp.toko_id = ?
        AND DATE(tp.tanggal) = CURDATE()
        AND tp.status = 'selesai'
      `, [scope.tenantId, scope.storeId]) as [any[], any];

      // Transaksi per jam
      const [hourlyRows] = await connection.execute(`
        SELECT
          HOUR(tanggal) as jam,
          COUNT(*) as count,
          SUM(total) as total
        FROM transaksi_penjualan
        WHERE tenant_id = ? AND toko_id = ?
        AND DATE(tanggal) = CURDATE()
        AND status = 'selesai'
        GROUP BY HOUR(tanggal)
        ORDER BY jam
      `, [scope.tenantId, scope.storeId]) as [any[], any];

      const summary = summaryRows[0] || {};
      const transaksiPerJam = hourlyRows.map((row: any) => ({
        jam: `${row.jam}:00`,
        count: Number(row.count),
        total: Number(row.total || 0)
      }));

      return {
        tanggal: new Date().toISOString().split('T')[0],
        total_transaksi: Number(summary.total_transaksi || 0),
        total_item_terjual: Number(summary.total_item_terjual || 0),
        total_pendapatan: Number(summary.total_pendapatan || 0),
        total_tunai: Number(summary.total_tunai || 0),
        total_non_tunai: Number(summary.total_non_tunai || 0),
        rata_rata_transaksi: Number(summary.rata_rata_transaksi || 0),
        transaksi_per_jam: transaksiPerJam
      };

    } finally {
      connection.release();
    }
  }

  /**
   * Get transaksi berdasarkan ID
   */
  static async getTransaksiById(
    transaksiId: string,
    scope: AccessScope
  ): Promise<TransaksiPenjualanData | null> {
    const connection = await this.db.getConnection();

    try {
      const [transaksiRows] = await connection.execute(`
        SELECT * FROM transaksi_penjualan
        WHERE id = ? AND tenant_id = ? AND toko_id = ?
      `, [transaksiId, scope.tenantId, scope.storeId]) as [any[], any];

      if (transaksiRows.length === 0) {
        return null;
      }

      const transaksi = transaksiRows[0];

      // Get items
      const [itemRows] = await connection.execute(`
        SELECT * FROM item_transaksi_penjualan
        WHERE transaksi_penjualan_id = ?
      `, [transaksiId]) as [any[], any];

      const items: ItemTransaksiPenjualanData[] = itemRows.map((item: any) => ({
        id: item.id,
        produk_id: item.produk_id,
        kuantitas: Number(item.kuantitas),
        harga_satuan: Number(item.harga_satuan),
        diskon_persen: Number(item.diskon_persen || 0),
        diskon_nominal: Number(item.diskon_nominal || 0),
        subtotal: Number(item.subtotal),
        promo_id: item.promo_id,
        catatan: item.catatan
      }));

      return {
        id: transaksi.id,
        tenant_id: transaksi.tenant_id,
        toko_id: transaksi.toko_id,
        pengguna_id: transaksi.pengguna_id,
        pelanggan_id: transaksi.pelanggan_id,
        nomor_transaksi: transaksi.nomor_transaksi,
        tanggal: new Date(transaksi.tanggal),
        subtotal: Number(transaksi.subtotal),
        diskon_persen: Number(transaksi.diskon_persen || 0),
        diskon_nominal: Number(transaksi.diskon_nominal || 0),
        pajak_persen: Number(transaksi.pajak_persen || 0),
        pajak_nominal: Number(transaksi.pajak_nominal || 0),
        total: Number(transaksi.total),
        bayar: Number(transaksi.bayar),
        kembalian: Number(transaksi.kembalian || 0),
        metode_bayar: transaksi.metode_bayar as MetodeBayar,
        status: transaksi.status as StatusTransaksi,
        catatan: transaksi.catatan,
        items
      };

    } finally {
      connection.release();
    }
  }
}