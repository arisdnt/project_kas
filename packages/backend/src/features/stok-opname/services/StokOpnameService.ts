/**
 * Service StokOpname
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '@/core/database/connection';
import { StokOpname, StokOpnameCreateRequest, StokOpnameUpdateRequest, StokOpnameFilters } from '../models/StokOpname';
import { logger } from '@/core/utils/logger';

export class StokOpnameService {
  /**
   * Helper function to get store ID from tenant ID
   */
  private static async getStoreIdFromTenant(tenantId: string): Promise<string | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM toko WHERE tenant_id = ? AND status = "aktif" LIMIT 1',
        [tenantId]
      );
      return rows.length > 0 ? rows[0].id : null;
    } catch (error) {
      logger.error({ error }, 'Error getting store ID from tenant');
      return null;
    }
  }

  /**
   * Get all stok opname with pagination and filters
   */
  static async getAll(
    tenantId: string,
    page: number = 1,
    limit: number = 25,
    filters: StokOpnameFilters = {}
  ): Promise<{ data: StokOpname[]; total: number }> {
    const connection = await pool.getConnection();
    const offset = (page - 1) * limit;

    // Get store ID from tenant ID
    const storeId = await StokOpnameService.getStoreIdFromTenant(tenantId);
    if (!storeId) {
      throw new Error('Toko tidak ditemukan untuk tenant ini');
    }

    let whereClause = 'WHERE i.toko_id = ?';
    const params: any[] = [storeId];

    // Build WHERE clause based on filters
    if (filters.kategoriId) {
      whereClause += ' AND k.uuid = ?';
      params.push(filters.kategoriId);
    }

    if (filters.brandId) {
      whereClause += ' AND b.uuid = ?';
      params.push(filters.brandId);
    }

    if (filters.supplierId) {
      whereClause += ' AND s.uuid = ?';
      params.push(filters.supplierId);
    }

    if (filters.status && filters.status !== 'all') {
      whereClause += ' AND so.status = ?';
      params.push(filters.status);
    }

    if (filters.tanggal) {
      whereClause += ' AND DATE(so.tanggal_opname) = ?';
      params.push(filters.tanggal);
    }

    if (filters.search) {
      whereClause += ' AND (p.nama LIKE ? OR p.kode LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    // Temporary: Use inventaris table as base for stok opname until stok_opname table is created
    const query = `
      SELECT 
        i.produk_id as id,
        i.produk_id,
        p.nama as nama_produk,
        p.kode as sku,
        JSON_OBJECT('id', k.id, 'nama', k.nama) as kategori,
        JSON_OBJECT('id', b.id, 'nama', b.nama) as brand,
        JSON_OBJECT('id', s.id, 'nama', s.nama) as supplier,
        i.stok_tersedia as stok_sistem,
        i.stok_tersedia as stok_fisik,
        0 as selisih,
        'pending' as status,
        NOW() as tanggal_opname,
        'system' as dibuat_oleh,
        NOW() as dibuat_pada,
        i.terakhir_update as diperbarui_pada,
        'Data dari inventaris' as catatan
      FROM inventaris i
      LEFT JOIN produk p ON i.produk_id = p.id
      LEFT JOIN toko t ON i.toko_id = t.id
      LEFT JOIN kategori k ON p.kategori_id = k.id
      LEFT JOIN brand b ON p.brand_id = b.id
      LEFT JOIN supplier s ON p.supplier_id = s.id
      ${whereClause}
      ORDER BY i.terakhir_update DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM inventaris i
      LEFT JOIN produk p ON i.produk_id = p.id
      LEFT JOIN toko t ON i.toko_id = t.id
      LEFT JOIN kategori k ON p.kategori_id = k.id
      LEFT JOIN brand b ON p.brand_id = b.id
      LEFT JOIN supplier s ON p.supplier_id = s.id
      ${whereClause}
    `;

    try {
      logger.info('Executing stok opname query:', { 
        tenantId, 
        query: query.substring(0, 200) + '...', 
        countQuery: countQuery.substring(0, 200) + '...' 
      });
      const [rows] = await connection.execute(query, params) as [RowDataPacket[], any];
      const [countRows] = await connection.execute(countQuery, params) as [RowDataPacket[], any];

      const data: StokOpname[] = rows.map(row => ({
        id: row.id,
        id_produk: row.id_produk,
        nama_produk: row.nama_produk,
        sku: row.sku,
        kategori: row.kategori || null,
        brand: row.brand || null,
        supplier: row.supplier || null,
        stok_sistem: row.stok_sistem,
        stok_fisik: row.stok_fisik,
        selisih: row.selisih,
        status: row.status,
        tanggal_opname: row.tanggal_opname,
        dibuat_oleh: row.dibuat_oleh,
        dibuat_pada: row.dibuat_pada,
        diperbarui_pada: row.diperbarui_pada,
        catatan: row.catatan
      }));

      return {
        data,
        total: countRows[0]?.total || 0
      };
    } catch (error) {
      logger.error('Error getting stok opname:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        tenantId,
        query: query.substring(0, 500),
        countQuery: countQuery.substring(0, 500)
      });
      console.error('Full error details:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get stok opname by ID
   */
  static async getById(id: number): Promise<StokOpname | null> {
    const connection = await pool.getConnection();

    const query = `
      SELECT 
        so.id,
        so.id_produk,
        p.nama as nama_produk,
        p.sku,
        JSON_OBJECT('id', k.id, 'nama', k.nama) as kategori,
        JSON_OBJECT('id', b.id, 'nama', b.nama) as brand,
        JSON_OBJECT('id', s.id, 'nama', s.nama) as supplier,
        so.stok_sistem,
        so.stok_fisik,
        so.selisih,
        so.status,
        so.tanggal_opname,
        so.dibuat_oleh,
        so.dibuat_pada,
        so.diperbarui_pada,
        so.catatan
      FROM stok_opname so
      LEFT JOIN produk p ON so.id_produk = p.uuid
      LEFT JOIN kategori k ON p.kategori_id = k.uuid
      LEFT JOIN brand b ON p.brand_id = b.uuid
      LEFT JOIN supplier s ON p.supplier_id = s.uuid
      WHERE so.id = ?
    `;

    try {
      const [rows] = await connection.execute(query, [id]) as [RowDataPacket[], any];
      
      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        id: row.id,
        id_produk: row.id_produk,
        nama_produk: row.nama_produk,
        sku: row.sku,
        kategori: row.kategori ? JSON.parse(row.kategori) : null,
        brand: row.brand ? JSON.parse(row.brand) : null,
        supplier: row.supplier ? JSON.parse(row.supplier) : null,
        stok_sistem: row.stok_sistem,
        stok_fisik: row.stok_fisik,
        selisih: row.selisih,
        status: row.status,
        tanggal_opname: row.tanggal_opname,
        dibuat_oleh: row.dibuat_oleh,
        dibuat_pada: row.dibuat_pada,
        diperbarui_pada: row.diperbarui_pada,
        catatan: row.catatan
      };
    } catch (error) {
      logger.error('Error getting stok opname by ID:', error);
      throw new Error('Gagal mengambil data stok opname');
    } finally {
      connection.release();
    }
  }

  /**
   * Create new stok opname
   */
  static async create(data: StokOpnameCreateRequest, userId: string): Promise<StokOpname> {
    const connection = await pool.getConnection();

    // Get current stock from inventaris
    const [inventarisRows] = await connection.execute(
      'SELECT jumlah as stok FROM inventaris WHERE id_produk = ?',
      [data.id_produk]
    ) as [RowDataPacket[], any];

    const stokSistem = inventarisRows[0]?.stok || 0;
    const selisih = data.stok_fisik - stokSistem;

    const query = `
      INSERT INTO stok_opname (
        id_produk, stok_sistem, stok_fisik, selisih, 
        status, tanggal_opname, dibuat_oleh, catatan
      ) VALUES (?, ?, ?, ?, 'pending', NOW(), ?, ?)
    `;

    try {
      const [result] = await connection.execute(query, [
        data.id_produk,
        stokSistem,
        data.stok_fisik,
        selisih,
        userId,
        data.catatan || null
      ]) as [ResultSetHeader, any];

      const newStokOpname = await this.getById(result.insertId);
      if (!newStokOpname) {
        throw new Error('Gagal membuat stok opname');
      }

      return newStokOpname;
    } catch (error) {
      logger.error('Error creating stok opname:', error);
      throw new Error('Gagal membuat stok opname');
    } finally {
      connection.release();
    }
  }

  /**
   * Update stok opname
   */
  static async update(id: number, data: StokOpnameUpdateRequest): Promise<StokOpname> {
    const connection = await pool.getConnection();

    const updates: string[] = [];
    const params: any[] = [];

    if (data.stok_fisik !== undefined) {
      // Recalculate selisih if stok_fisik is updated
      const [stokOpnameRows] = await connection.execute(
        'SELECT stok_sistem FROM stok_opname WHERE id = ?',
        [id]
      ) as [RowDataPacket[], any];

      if (stokOpnameRows.length === 0) {
        throw new Error('Stok opname tidak ditemukan');
      }

      const stokSistem = stokOpnameRows[0].stok_sistem;
      const selisih = data.stok_fisik - stokSistem;

      updates.push('stok_fisik = ?', 'selisih = ?');
      params.push(data.stok_fisik, selisih);
    }

    if (data.status) {
      updates.push('status = ?');
      params.push(data.status);
    }

    if (data.catatan !== undefined) {
      updates.push('catatan = ?');
      params.push(data.catatan);
    }

    if (updates.length === 0) {
      throw new Error('Tidak ada data yang diupdate');
    }

    updates.push('diperbarui_pada = NOW()');
    params.push(id);

    const query = `UPDATE stok_opname SET ${updates.join(', ')} WHERE id = ?`;

    try {
      await connection.execute(query, params);

      const updatedStokOpname = await this.getById(id);
      if (!updatedStokOpname) {
        throw new Error('Gagal mengupdate stok opname');
      }

      return updatedStokOpname;
    } catch (error) {
      logger.error('Error updating stok opname:', error);
      throw new Error('Gagal mengupdate stok opname');
    } finally {
      connection.release();
    }
  }

  /**
   * Delete stok opname
   */
  static async delete(id: number): Promise<void> {
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute(
        'DELETE FROM stok_opname WHERE id = ?',
        [id]
      ) as [ResultSetHeader, any];

      if (result.affectedRows === 0) {
        throw new Error('Stok opname tidak ditemukan');
      }
    } catch (error) {
      logger.error('Error deleting stok opname:', error);
      throw new Error('Gagal menghapus stok opname');
    } finally {
      connection.release();
    }
  }
}
