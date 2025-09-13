/**
 * Service Layer untuk Manajemen Produk dan Inventaris
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
import {
  Produk,
  Kategori,
  Brand,
  Supplier,
  Inventaris,
  CreateProduk,
  UpdateProduk,
  CreateKategori,
  UpdateKategori,
  CreateBrand,
  UpdateBrand,
  CreateSupplier,
  UpdateSupplier,
  CreateInventaris,
  UpdateInventaris,
  ProdukWithRelations,
  InventarisWithProduk,
  ProdukQuery
} from '../models/Produk';

export class ProdukService {
  // ===== KATEGORI METHODS =====
  
  /**
   * Mendapatkan semua kategori
   */
  static async getAllKategori(): Promise<Kategori[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT id, nama, deskripsi FROM kategori WHERE status = "aktif" ORDER BY nama ASC'
      );
      return rows as Kategori[];
    } catch (error) {
      logger.error({ error }, 'Error getting all kategori');
      throw new Error('Gagal mengambil data kategori');
    }
  }

  /**
   * Membuat kategori baru
   */
  static async createKategori(data: CreateKategori, tenantId: string): Promise<Kategori> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO kategori (nama, tenant_id) VALUES (?, ?)',
        [data.nama, tenantId]
      );
      const [newRows] = await pool.execute<RowDataPacket[]>(
        'SELECT id, nama, deskripsi FROM kategori WHERE id = LAST_INSERT_ID() LIMIT 1'
      );
      return newRows[0] as Kategori;
    } catch (error: any) {
      logger.error({ error }, 'Error creating kategori');
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Kategori dengan nama tersebut sudah ada');
      }
      throw new Error('Gagal membuat kategori');
    }
  }

  /**
   * Mengupdate kategori
   */
  static async updateKategori(data: UpdateKategori): Promise<Kategori> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'UPDATE kategori SET nama = ? WHERE id = ?',
        [data.nama, data.id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Kategori tidak ditemukan');
      }
      
      return data as Kategori;
    } catch (error: any) {
      logger.error({ error }, 'Error updating kategori');
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Kategori dengan nama tersebut sudah ada');
      }
      throw new Error('Gagal mengupdate kategori');
    }
  }

  /**
   * Menghapus kategori
   */
  static async deleteKategori(id: string): Promise<void> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM kategori WHERE id = ?',
        [id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Kategori tidak ditemukan');
      }
    } catch (error) {
      logger.error({ error }, 'Error deleting kategori');
      throw new Error('Gagal menghapus kategori');
    }
  }

  // ===== BRAND METHODS =====
  
  /**
   * Mendapatkan semua brand
   */
  static async getAllBrand(): Promise<Brand[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT id, nama, deskripsi FROM brand WHERE status = "aktif" ORDER BY nama ASC'
      );
      return rows as Brand[];
    } catch (error) {
      logger.error({ error }, 'Error getting all brand');
      throw new Error('Gagal mengambil data brand');
    }
  }

  /**
   * Membuat brand baru
   */
  static async createBrand(data: CreateBrand, tenantId: string): Promise<Brand> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO brand (nama, tenant_id) VALUES (?, ?)',
        [data.nama, tenantId]
      );
      const [newRows] = await pool.execute<RowDataPacket[]>(
        'SELECT id, nama, deskripsi FROM brand WHERE id = LAST_INSERT_ID() LIMIT 1'
      );
      return newRows[0] as Brand;
    } catch (error: any) {
      logger.error({ error }, 'Error creating brand');
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Brand dengan nama tersebut sudah ada');
      }
      throw new Error('Gagal membuat brand');
    }
  }

  /**
   * Mengupdate brand
   */
  static async updateBrand(data: UpdateBrand): Promise<Brand> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'UPDATE brand SET nama = ? WHERE id = ?',
        [data.nama, data.id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Brand tidak ditemukan');
      }
      
      return data as Brand;
    } catch (error: any) {
      logger.error({ error }, 'Error updating brand');
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Brand dengan nama tersebut sudah ada');
      }
      throw new Error('Gagal mengupdate brand');
    }
  }

  /**
   * Menghapus brand
   */
  static async deleteBrand(id: string): Promise<void> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM brand WHERE id = ?',
        [id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Brand tidak ditemukan');
      }
    } catch (error) {
      logger.error({ error }, 'Error deleting brand');
      throw new Error('Gagal menghapus brand');
    }
  }

  // ===== SUPPLIER METHODS =====
  
  /**
   * Mendapatkan semua supplier dengan pagination
   */
  static async getAllSupplier(page: number = 1, limit: number = 10): Promise<{
    suppliers: Supplier[];
    total: number;
    totalPages: number;
  }> {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count
      const [countRows] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM supplier WHERE status = "aktif"'
      );
      const total = countRows[0].total;
      
      // Get suppliers with pagination
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT id, nama, kontak_person, email, telepon, alamat, 
                dibuat_pada, diperbarui_pada 
         FROM supplier 
         WHERE status = "aktif"
         ORDER BY nama ASC 
         LIMIT ${limit} OFFSET ${offset}`
      );
      
      return {
        suppliers: rows as Supplier[],
        total,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error({ error }, 'Error getting all supplier');
      throw new Error('Gagal mengambil data supplier');
    }
  }

  /**
   * Mendapatkan supplier berdasarkan ID
   */
  static async getSupplierById(id: string): Promise<Supplier | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT id, nama, kontak_person, email, telepon, alamat, 
                dibuat_pada, diperbarui_pada 
         FROM supplier WHERE id = ?`,
        [id]
      );
      
      return rows.length > 0 ? (rows[0] as Supplier) : null;
    } catch (error) {
      logger.error({ error }, 'Error getting supplier by id');
      throw new Error('Gagal mengambil data supplier');
    }
  }

  /**
   * Membuat supplier baru
   */
  static async createSupplier(data: CreateSupplier): Promise<Supplier> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO supplier (nama, kontak_person, email, telepon, alamat) 
         VALUES (?, ?, ?, ?, ?)`,
        [data.nama, data.kontak_person || null, data.email || null, 
         data.telepon || null, data.alamat || null]
      );
      const [uuidRows] = await pool.execute<RowDataPacket[]>(
        'SELECT uuid FROM supplier WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      const newSupplier = await this.getSupplierById((uuidRows as any)[0].uuid);
      if (!newSupplier) {
        throw new Error('Gagal mengambil data supplier yang baru dibuat');
      }
      
      return newSupplier;
    } catch (error) {
      logger.error({ error }, 'Error creating supplier');
      throw new Error('Gagal membuat supplier');
    }
  }

  /**
   * Mengupdate supplier
   */
  static async updateSupplier(data: UpdateSupplier): Promise<Supplier> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE supplier 
         SET nama = ?, kontak_person = ?, email = ?, telepon = ?, alamat = ? 
         WHERE uuid = ?`,
        [data.nama, data.kontak_person || null, data.email || null,
         data.telepon || null, data.alamat || null, data.id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Supplier tidak ditemukan');
      }
      
      const updatedSupplier = await this.getSupplierById(data.id!);
      if (!updatedSupplier) {
        throw new Error('Gagal mengambil data supplier yang diupdate');
      }
      
      return updatedSupplier;
    } catch (error) {
      logger.error({ error }, 'Error updating supplier');
      throw new Error('Gagal mengupdate supplier');
    }
  }

  /**
   * Menghapus supplier
   */
  static async deleteSupplier(id: string): Promise<void> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM supplier WHERE uuid = ?',
        [id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Supplier tidak ditemukan');
      }
    } catch (error) {
      logger.error({ error }, 'Error deleting supplier');
      throw new Error('Gagal menghapus supplier');
    }
  }
}
