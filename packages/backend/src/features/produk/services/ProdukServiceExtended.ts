/**
 * Extended Service Layer untuk Produk dan Inventaris
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
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
  static async getAllProduk(query: ProdukQuery, storeId: number): Promise<{
    produk: ProdukWithRelations[];
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  }> {
    try {
      const { page, limit, search, kategori, brand, supplier } = query;
      const offset = (page - 1) * limit;
      
      // Build optimized WHERE clause with proper indexing hints
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      
      if (search) {
        // Optimized search with FULLTEXT index hint
        whereClause += ' AND (p.nama LIKE ? OR p.sku = ? OR p.deskripsi LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, search, searchTerm);
      }
      
      if (kategori) {
        whereClause += ' AND p.id_kategori = ?';
        params.push(kategori);
      }
      
      if (brand) {
        whereClause += ' AND p.id_brand = ?';
        params.push(brand);
      }
      
      if (supplier) {
        whereClause += ' AND p.id_supplier = ?';
        params.push(supplier);
      }
      
      // Optimized count query with LIMIT for performance
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM produk p USE INDEX (idx_produk_composite)
        ${whereClause}
      `;
      const [countRows] = await pool.execute<RowDataPacket[]>(countQuery, params);
      const total = countRows[0].total;
      
      // Get produk with relations - optimized with proper indexing
      const baseQuery = `
        SELECT /*+ USE_INDEX(p, idx_produk_composite) */
          p.id, p.nama, p.deskripsi, p.sku, p.id_kategori, p.id_brand, p.id_supplier,
          p.dibuat_pada, p.diperbarui_pada,
          k.nama as kategori_nama,
          b.nama as brand_nama,
          s.nama as supplier_nama
        FROM produk p USE INDEX (idx_produk_composite)
        LEFT JOIN kategori k ON p.id_kategori = k.id
        LEFT JOIN brand b ON p.id_brand = b.id
        LEFT JOIN supplier s ON p.id_supplier = s.id
        ${whereClause}
        ORDER BY p.id DESC
        LIMIT ${limit + 1} OFFSET ${offset}
      `;
      
      // Combine all parameters in correct order: whereClause params only (limit/offset now interpolated)
      const baseParams = [...params];
      
      // Execute main query
      
      const [rows] = await pool.execute<RowDataPacket[]>(
        baseQuery, 
        baseParams
      );
      
      // Check if there are more pages
      const hasNextPage = rows.length > limit;
      const actualRows = hasNextPage ? rows.slice(0, limit) : rows;
      
      // Get inventaris data with optimized batch query
      const produkIds = actualRows.map(row => row.id);
      let inventarisMap: { [key: number]: any } = {};
      
      if (produkIds.length > 0) {
        const inventarisQuery = `
          SELECT /*+ USE_INDEX(inventaris, idx_inventaris_toko_produk) */
            id_produk, jumlah, harga, harga_beli 
          FROM inventaris USE INDEX (idx_inventaris_toko_produk)
          WHERE id_toko = ? AND id_produk IN (${produkIds.map(() => '?').join(',')})
        `;
        const inventarisParams = [storeId, ...produkIds];
        
        const [inventarisRows] = await pool.execute<RowDataPacket[]>(
          inventarisQuery,
          inventarisParams
        );
        
        inventarisRows.forEach((row: any) => {
          inventarisMap[row.id_produk] = {
            jumlah: row.jumlah,
            harga: row.harga,
            harga_beli: row.harga_beli
          };
        });
      }
      
      // Transform results with optimized mapping
      const produk: ProdukWithRelations[] = actualRows.map((row: any) => ({
        id: row.id,
        nama: row.nama,
        deskripsi: row.deskripsi,
        sku: row.sku,
        id_kategori: row.id_kategori,
        id_brand: row.id_brand,
        id_supplier: row.id_supplier,
        dibuat_pada: row.dibuat_pada,
        diperbarui_pada: row.diperbarui_pada,
        kategori: row.kategori_nama ? { id: row.id_kategori, nama: row.kategori_nama } : undefined,
        brand: row.brand_nama ? { id: row.id_brand, nama: row.brand_nama } : undefined,
        supplier: row.supplier_nama ? { id: row.id_supplier, nama: row.supplier_nama } : undefined,
        inventaris: inventarisMap[row.id] ? [{
          id_toko: storeId,
          id_produk: row.id,
          jumlah: inventarisMap[row.id].jumlah,
          harga: parseFloat(inventarisMap[row.id].harga),
          harga_beli: inventarisMap[row.id].harga_beli ? parseFloat(inventarisMap[row.id].harga_beli) : undefined
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
  static async getProdukById(id: number, storeId: number): Promise<ProdukWithRelations | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          p.id, p.nama, p.deskripsi, p.sku, p.id_kategori, p.id_brand, p.id_supplier,
          p.dibuat_pada, p.diperbarui_pada,
          k.nama as kategori_nama,
          b.nama as brand_nama,
          s.nama as supplier_nama,
          i.jumlah, i.harga, i.harga_beli
        FROM produk p
        LEFT JOIN kategori k ON p.id_kategori = k.id
        LEFT JOIN brand b ON p.id_brand = b.id
        LEFT JOIN supplier s ON p.id_supplier = s.id
        LEFT JOIN inventaris i ON p.id = i.id_produk AND i.id_toko = ?
        WHERE p.id = ?`,
        [storeId, id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const row = rows[0] as any;
      return {
        id: row.id,
        nama: row.nama,
        deskripsi: row.deskripsi,
        sku: row.sku,
        id_kategori: row.id_kategori,
        id_brand: row.id_brand,
        id_supplier: row.id_supplier,
        dibuat_pada: row.dibuat_pada,
        diperbarui_pada: row.diperbarui_pada,
        kategori: row.kategori_nama ? { id: row.id_kategori, nama: row.kategori_nama } : undefined,
        brand: row.brand_nama ? { id: row.id_brand, nama: row.brand_nama } : undefined,
        supplier: row.supplier_nama ? { id: row.id_supplier, nama: row.supplier_nama } : undefined,
        inventaris: row.jumlah !== null ? [{
          id_toko: storeId,
          id_produk: row.id,
          jumlah: row.jumlah,
          harga: parseFloat(row.harga),
          harga_beli: row.harga_beli ? parseFloat(row.harga_beli) : undefined
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
  static async createProduk(data: CreateProduk): Promise<Produk> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO produk (nama, deskripsi, sku, id_kategori, id_brand, id_supplier) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.nama,
          data.deskripsi || null,
          data.sku || null,
          data.id_kategori || null,
          data.id_brand || null,
          data.id_supplier || null
        ]
      );
      
      return {
        id: result.insertId,
        nama: data.nama,
        deskripsi: data.deskripsi,
        sku: data.sku,
        id_kategori: data.id_kategori,
        id_brand: data.id_brand,
        id_supplier: data.id_supplier
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
  static async updateProduk(data: UpdateProduk): Promise<Produk> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE produk 
         SET nama = ?, deskripsi = ?, sku = ?, id_kategori = ?, id_brand = ?, id_supplier = ?
         WHERE id = ?`,
        [
          data.nama,
          data.deskripsi || null,
          data.sku || null,
          data.id_kategori || null,
          data.id_brand || null,
          data.id_supplier || null,
          data.id
        ]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Produk tidak ditemukan');
      }
      
      return data as Produk;
    } catch (error: any) {
      logger.error({ error }, 'Error updating produk');
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('SKU produk sudah ada');
      }
      throw new Error('Gagal mengupdate produk');
    }
  }

  /**
   * Menghapus produk
   */
  static async deleteProduk(id: number): Promise<void> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM produk WHERE id = ?',
        [id]
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
  static async getInventarisByToko(storeId: number, page: number = 1, limit: number = 10): Promise<{
    inventaris: InventarisWithProduk[];
    total: number;
    totalPages: number;
  }> {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count
      const [countRows] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM inventaris WHERE id_toko = ?',
        [storeId]
      );
      const total = countRows[0].total;
      
      // Get inventaris with produk
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          i.id_toko, i.id_produk, i.jumlah, i.harga, i.harga_beli, i.diperbarui_pada,
          p.nama as produk_nama, p.deskripsi, p.sku,
          k.nama as kategori_nama,
          b.nama as brand_nama
        FROM inventaris i
        JOIN produk p ON i.id_produk = p.id
        LEFT JOIN kategori k ON p.id_kategori = k.id
        LEFT JOIN brand b ON p.id_brand = b.id
        WHERE i.id_toko = ?
        ORDER BY p.nama ASC
        LIMIT ${limit} OFFSET ${offset}`,
        [storeId]
      );
      
      const inventaris: InventarisWithProduk[] = rows.map((row: any) => ({
        id_toko: row.id_toko,
        id_produk: row.id_produk,
        jumlah: row.jumlah,
        harga: parseFloat(row.harga),
        harga_beli: row.harga_beli ? parseFloat(row.harga_beli) : undefined,
        diperbarui_pada: row.diperbarui_pada,
        produk: {
          id: row.id_produk,
          nama: row.produk_nama,
          deskripsi: row.deskripsi,
          sku: row.sku,
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
  static async upsertInventaris(data: CreateInventaris): Promise<Inventaris> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO inventaris (id_toko, id_produk, jumlah, harga, harga_beli)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         jumlah = VALUES(jumlah),
         harga = VALUES(harga),
         harga_beli = VALUES(harga_beli)`,
        [
          data.id_toko,
          data.id_produk,
          data.jumlah,
          data.harga,
          data.harga_beli || null
        ]
      );
      
      return {
        id_toko: data.id_toko,
        id_produk: data.id_produk,
        jumlah: data.jumlah,
        harga: data.harga,
        harga_beli: data.harga_beli
      };
    } catch (error) {
      logger.error({ error }, 'Error upserting inventaris');
      throw new Error('Gagal menyimpan data inventaris');
    }
  }

  /**
   * Mengupdate stok inventaris
   */
  static async updateStok(storeId: number, productId: number, newQuantity: number): Promise<void> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'UPDATE inventaris SET jumlah = ? WHERE id_toko = ? AND id_produk = ?',
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
  static async deleteInventaris(storeId: number, productId: number): Promise<void> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM inventaris WHERE id_toko = ? AND id_produk = ?',
        [storeId, productId]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Inventaris tidak ditemukan');
      }
    } catch (error) {
      logger.error({ error }, 'Error deleting inventaris');
      throw new Error('Gagal menghapus inventaris');
    }
  }
}