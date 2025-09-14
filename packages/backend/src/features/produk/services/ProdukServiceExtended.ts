/**
 * Extended Service Layer untuk Produk dan Inventaris
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import {
  Produk,
  Inventaris,
  CreateProduk,
  UpdateProduk,
  CreateInventaris,
  UpdateInventaris,
  ProdukWithRelations,
  InventarisWithProduk,
  ProdukQuery
} from '../models/Produk';

export class ProdukServiceExtended {
  // ===== PRODUK METHODS =====
  
  /**
   * Mendapatkan semua produk dengan pagination dan filter (Optimized)
   */
  static async getAllProduk(query: ProdukQuery, scope: AccessScope): Promise<{
    produk: ProdukWithRelations[];
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  }> {
    try {
      const { page, limit, search, kategori, brand, supplier } = query;
      const offset = (page - 1) * limit;
      
      // Build base WHERE clause (tanpa scope)
      let whereClause = '';
      const params: any[] = [];
      
      if (search) {
        // Search by nama or kode
        whereClause += ' AND (p.nama LIKE ? OR p.kode LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }
      
      if (kategori) {
        whereClause += ' AND p.kategori_id = ?';
        params.push(kategori);
      }
      
      if (brand) {
        whereClause += ' AND p.brand_id = ?';
        params.push(brand);
      }
      
      if (supplier) {
        whereClause += ' AND p.supplier_id = ?';
        params.push(supplier);
      }
      
      // Count query + tenant scope (produk tidak memiliki toko_id, jadi enforceStore=false)
      const countBase = `
        SELECT COUNT(*) as total 
        FROM produk p
        ${whereClause}
      `;
      const scopedCount = applyScopeToSql(countBase, params, { ...scope, enforceStore: false }, { tenantColumn: 'p.tenant_id' });
      const [countRows] = await pool.execute<RowDataPacket[]>(scopedCount.sql, scopedCount.params);
      const total = countRows[0].total;
      
      // Get produk with relations - tenant scope only (no toko filter here)
      const baseQuery = `
        SELECT
          p.id, p.nama, p.satuan, p.kategori_id, p.brand_id, p.supplier_id,
          p.harga_beli, p.harga_jual, p.margin_persen,
          p.dibuat_pada, p.diperbarui_pada,
          k.nama as kategori_nama,
          b.nama as brand_nama,
          s.nama as supplier_nama
        FROM produk p
        LEFT JOIN kategori k ON p.kategori_id = k.id
        LEFT JOIN brand b ON p.brand_id = b.id
        LEFT JOIN supplier s ON p.supplier_id = s.id
        ${whereClause}
        ORDER BY p.dibuat_pada DESC
        LIMIT ${limit + 1} OFFSET ${offset}
      `;
      const scopedSelect = applyScopeToSql(baseQuery, params, { ...scope, enforceStore: false }, { tenantColumn: 'p.tenant_id' });
      
      // Execute main query
      
      const [rows] = await pool.execute<RowDataPacket[]>(scopedSelect.sql, scopedSelect.params);
      
      // Check if there are more pages
      const hasNextPage = rows.length > limit;
      const actualRows = hasNextPage ? rows.slice(0, limit) : rows;
      
      // Get inventaris data with optimized batch query
      const produkIds: string[] = actualRows.map((row: any) => row.id as string);
      let inventarisMap: { [key: string]: any } = {};
      
      const storeId = scope.storeId;
      if (produkIds.length > 0 && storeId) {
        const inventarisQuery = `
          SELECT produk_id, stok_tersedia, harga_jual_toko 
          FROM inventaris
          WHERE toko_id = ? AND produk_id IN (${produkIds.map(() => '?').join(',')})
        `;
        const inventarisParams = [storeId, ...produkIds];
        
        const [inventarisRows] = await pool.execute<RowDataPacket[]>(
          inventarisQuery,
          inventarisParams
        );
        
        inventarisRows.forEach((row: any) => {
          inventarisMap[row.produk_id] = {
            stok_tersedia: row.stok_tersedia,
            harga_jual_toko: row.harga_jual_toko
          };
        });
      }
      
      // Transform results with optimized mapping
      const produk: ProdukWithRelations[] = actualRows.map((row: any) => ({
        id: row.id,
        nama: row.nama,
        satuan: row.satuan,
        kategori_id: row.kategori_id,
        brand_id: row.brand_id,
        supplier_id: row.supplier_id,
        harga_beli: row.harga_beli ? parseFloat(row.harga_beli) : undefined,
        harga_jual: row.harga_jual ? parseFloat(row.harga_jual) : undefined,
        margin_persen: row.margin_persen ? parseFloat(row.margin_persen) : undefined,
        dibuat_pada: row.dibuat_pada,
        diperbarui_pada: row.diperbarui_pada,
        kategori: row.kategori_nama ? { id: row.kategori_id, nama: row.kategori_nama } : undefined,
        brand: row.brand_nama ? { id: row.brand_id, nama: row.brand_nama } : undefined,
        supplier: row.supplier_nama ? { id: row.supplier_id, nama: row.supplier_nama } : undefined,
        inventaris: storeId && inventarisMap[row.id] ? [{
          id_toko: storeId,
          id_produk: row.id,
          stok_tersedia: inventarisMap[row.id].stok_tersedia,
          stok_reserved: 0,
          harga_jual_toko: inventarisMap[row.id].harga_jual_toko ? parseFloat(inventarisMap[row.id].harga_jual_toko) : undefined,
          stok_minimum_toko: 0,
          lokasi_rak: undefined
        }] : []
      }));
      
      return {
        produk,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage
      };
    } catch (error) {
      logger.error({ error }, 'Error getting all produk');
      throw new Error('Gagal mengambil data produk');
    }
  }

  /**
   * Mendapatkan produk berdasarkan ID dengan relasi
   */
  static async getProdukById(id: string, scope: AccessScope): Promise<ProdukWithRelations | null> {
    try {
      const storeId = scope.storeId;
      let baseQuery = `SELECT 
          p.id, p.nama, p.satuan, p.kategori_id, p.brand_id, p.supplier_id,
          p.dibuat_pada, p.diperbarui_pada,
          k.nama as kategori_nama,
          b.nama as brand_nama,
          s.nama as supplier_nama`;
      let joinClause = `
        FROM produk p
        LEFT JOIN kategori k ON p.kategori_id = k.id
        LEFT JOIN brand b ON p.brand_id = b.id
        LEFT JOIN supplier s ON p.supplier_id = s.id`;
      const params: any[] = [id];
      if (storeId) {
        baseQuery += `,
          i.stok_tersedia, i.stok_reserved, i.harga_jual_toko, i.stok_minimum_toko, i.lokasi_rak`;
        joinClause += `
          LEFT JOIN inventaris i ON p.id = i.produk_id AND i.toko_id = ?`;
        params.unshift(storeId); // order: storeId, id
      }
      let sql = `${baseQuery}
        ${joinClause}
        WHERE p.id = ?`;
      const scoped = applyScopeToSql(sql, params, { ...scope, enforceStore: false }, { tenantColumn: 'p.tenant_id' });
      const [rows] = await pool.execute<RowDataPacket[]>(scoped.sql, scoped.params);
      
      if (rows.length === 0) {
        return null;
      }
      
      const row = rows[0] as any;
      return {
        id: row.id,
        nama: row.nama,
        satuan: row.satuan,
        kategori_id: row.kategori_id,
        brand_id: row.brand_id,
        supplier_id: row.supplier_id,
        dibuat_pada: row.dibuat_pada,
        diperbarui_pada: row.diperbarui_pada,
        kategori: row.kategori_nama ? { id: row.kategori_id, nama: row.kategori_nama } : undefined,
        brand: row.brand_nama ? { id: row.brand_id, nama: row.brand_nama } : undefined,
        supplier: row.supplier_nama ? { id: row.supplier_id, nama: row.supplier_nama } : undefined,
        inventaris: storeId && row.stok_tersedia !== null ? [{
          id_toko: storeId,
          id_produk: row.id,
          stok_tersedia: row.stok_tersedia,
          stok_reserved: 0,
          harga_jual_toko: row.harga_jual_toko ? parseFloat(row.harga_jual_toko) : undefined,
          stok_minimum_toko: 0,
          lokasi_rak: undefined
        }] : []
      };
    } catch (error) {
      logger.error({ error }, 'Error getting produk by id');
      throw new Error('Gagal mengambil data produk');
    }
  }

  /**
   * Membuat produk baru
   */
  static async createProduk(data: CreateProduk, scope: AccessScope): Promise<Produk> {
    try {
      // Generate kode produk otomatis jika tidak ada
      const kode = data.kode || `PRD-${Date.now()}`;
      
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO produk (tenant_id, nama, satuan, kategori_id, brand_id, supplier_id, kode, harga_beli, harga_jual) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          scope.tenantId,
          data.nama,
          data.satuan || 'pcs',
          data.kategori_id || '7f6c3bd6-9068-11f0-8eff-00155d24a169', // Default kategori: Makanan
          data.brand_id || '7f6cbd6d-9068-11f0-8eff-00155d24a169', // Default brand: Generic
          data.supplier_id || '7f6d5025-9068-11f0-8eff-00155d24a169', // Default supplier: Supplier Umum
          kode,
          data.harga_beli || 0,
          data.harga_jual || 0
        ]
      );
      
      // Get the created product by kode since we can't use insertId with UUID
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM produk WHERE kode = ? AND tenant_id = ? LIMIT 1',
        [kode, scope.tenantId]
      );
      
      const createdProduk = rows[0] as any;
      return {
        id: createdProduk.id,
        nama: createdProduk.nama,
        satuan: createdProduk.satuan,
        kategori_id: createdProduk.kategori_id,
        brand_id: createdProduk.brand_id,
        supplier_id: createdProduk.supplier_id,
        kode: createdProduk.kode,
        harga_beli: createdProduk.harga_beli,
        harga_jual: createdProduk.harga_jual
      };
    } catch (error: any) {
      logger.error({ error }, 'Error creating produk');
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('SKU produk sudah ada');
      }
      throw new Error('Gagal membuat produk');
    }
  }

  /**
   * Mengupdate produk
   */
  static async updateProduk(data: UpdateProduk, scope: AccessScope): Promise<Produk> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE produk 
         SET nama = ?, satuan = ?, kategori_id = ?, brand_id = ?, supplier_id = ?
         WHERE id = ? AND tenant_id = ?`,
        [
          data.nama,
          data.satuan || 'pcs',
          data.kategori_id || '7f6c3bd6-9068-11f0-8eff-00155d24a169', // Default kategori: Makanan
          data.brand_id || '7f6cbd6d-9068-11f0-8eff-00155d24a169', // Default brand: Generic
          data.supplier_id || '7f6d5025-9068-11f0-8eff-00155d24a169', // Default supplier: Supplier Umum
          data.id,
          scope.tenantId
        ]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Produk tidak ditemukan');
      }
      
      return data as Produk;
    } catch (error: any) {
      logger.error({ error }, 'Error updating produk');
      throw new Error('Gagal mengupdate produk');
    }
  }

  /**
   * Menghapus produk
   */
  static async deleteProduk(id: string, scope: AccessScope): Promise<void> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM produk WHERE id = ? AND tenant_id = ?',
        [id, scope.tenantId]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Produk tidak ditemukan');
      }
    } catch (error) {
      logger.error({ error }, 'Error deleting produk');
      throw new Error('Gagal menghapus produk');
    }
  }

  // ===== INVENTARIS METHODS =====
  
  /**
   * Mendapatkan inventaris berdasarkan toko
   */
  static async getInventarisByToko(scope: AccessScope, page: number = 1, limit: number = 10): Promise<{
    inventaris: InventarisWithProduk[];
    total: number;
    totalPages: number;
  }> {
    try {
      const storeId = scope.storeId;
      if (!storeId) throw new Error('Store ID is required');
      const offset = (page - 1) * limit;
      
      // Get total count
      const [countRows] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM inventaris WHERE toko_id = ?',
        [storeId]
      );
      const total = countRows[0].total;
      
      // Get inventaris with produk
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          i.toko_id, i.produk_id, i.stok_tersedia, i.stok_reserved, i.harga_jual_toko, i.stok_minimum_toko, i.lokasi_rak, i.terakhir_update,
          p.nama as produk_nama, p.satuan,
          k.nama as kategori_nama,
          b.nama as brand_nama
        FROM inventaris i
        JOIN produk p ON i.produk_id = p.id
        LEFT JOIN kategori k ON p.kategori_id = k.id
        LEFT JOIN brand b ON p.brand_id = b.id
        WHERE i.toko_id = ?
        ORDER BY p.nama ASC
        LIMIT ${limit} OFFSET ${offset}`,
        [storeId]
      );
      
      const inventaris: InventarisWithProduk[] = rows.map((row: any) => ({
        id_toko: row.toko_id,
        id_produk: row.produk_id,
        stok_tersedia: row.stok_tersedia,
        stok_reserved: row.stok_reserved || 0,
        harga_jual_toko: row.harga_jual_toko ? parseFloat(row.harga_jual_toko) : undefined,
        stok_minimum_toko: row.stok_minimum_toko || 0,
        lokasi_rak: row.lokasi_rak,
        terakhir_update: row.terakhir_update,
        produk: {
          id: row.produk_id,
          nama: row.produk_nama,
          satuan: row.satuan,
          kategori: row.kategori_nama ? { nama: row.kategori_nama } : undefined,
          brand: row.brand_nama ? { nama: row.brand_nama } : undefined
        }
      }));
      
      return {
        inventaris,
        total,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error({ error }, 'Error getting inventaris by toko');
      throw new Error('Gagal mengambil data inventaris');
    }
  }

  /**
   * Membuat atau mengupdate inventaris
   */
  static async upsertInventaris(data: CreateInventaris, scope: AccessScope): Promise<Inventaris> {
    try {
      if (scope.enforceStore && scope.storeId && scope.storeId !== data.id_toko) {
        throw new Error('Access denied to this store');
      }
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO inventaris (toko_id, produk_id, stok_tersedia, stok_reserved, harga_jual_toko, stok_minimum_toko, lokasi_rak)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         stok_tersedia = VALUES(stok_tersedia),
         stok_reserved = VALUES(stok_reserved),
         harga_jual_toko = VALUES(harga_jual_toko),
         stok_minimum_toko = VALUES(stok_minimum_toko),
         lokasi_rak = VALUES(lokasi_rak)`,
        [
          data.id_toko,
          data.id_produk,
          data.stok_tersedia,
          data.stok_reserved || 0,
          data.harga_jual_toko || null,
          data.stok_minimum_toko || 0,
          data.lokasi_rak || null
        ]
      );
      
      return {
        id_toko: data.id_toko,
        id_produk: data.id_produk,
        stok_tersedia: data.stok_tersedia,
        stok_reserved: data.stok_reserved || 0,
        harga_jual_toko: data.harga_jual_toko,
        stok_minimum_toko: data.stok_minimum_toko || 0,
        lokasi_rak: data.lokasi_rak
      };
    } catch (error) {
      logger.error({ error }, 'Error upserting inventaris');
      throw new Error('Gagal menyimpan data inventaris');
    }
  }

  /**
   * Mengupdate stok inventaris
   */
  static async updateStok(scope: AccessScope, productId: string, newQuantity: number): Promise<void> {
    try {
      const storeId = scope.storeId;
      if (!storeId) throw new Error('Store ID is required');
      const [result] = await pool.execute<ResultSetHeader>(
        'UPDATE inventaris SET stok_tersedia = ? WHERE toko_id = ? AND produk_id = ?',
        [newQuantity, storeId, productId]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Inventaris tidak ditemukan');
      }
    } catch (error) {
      logger.error({ error }, 'Error updating stok');
      throw new Error('Gagal mengupdate stok');
    }
  }

  /**
   * Menghapus inventaris
   */
  static async deleteInventaris(scope: AccessScope, productId: string): Promise<void> {
    try {
      const storeId = scope.storeId;
      if (!storeId) throw new Error('Store ID is required');
      const query = 'DELETE FROM inventaris WHERE toko_id = ? AND produk_id = ?';
      logger.info({ storeId, productId, query }, 'Executing delete query');
      const [result] = await pool.execute<ResultSetHeader>(
        query,
        [storeId, productId]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Inventaris tidak ditemukan');
      }
    } catch (error: any) {
      logger.error({ error: error.message || error }, 'Error deleting inventaris');
      throw error;
    }
  }
}
