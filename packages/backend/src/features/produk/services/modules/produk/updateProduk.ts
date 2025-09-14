/**
 * Modul untuk memperbarui produk
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { ResultSetHeader } from 'mysql2';
import pool from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { UpdateProduk, Produk } from '../../../models/Produk';

/**
 * Memperbarui produk berdasarkan ID
 * @param data - Data produk yang akan diperbarui
 * @param scope - Access scope untuk multi-tenant
 * @returns Promise dengan data produk yang telah diperbarui
 */
export async function updateProduk(
  data: UpdateProduk, 
  scope: AccessScope
): Promise<Produk> {
  try {
    if (!data.id) {
      throw new Error('ID produk harus disediakan');
    }

    const now = new Date();
    
    // Build dynamic update query
    const updateFields: string[] = [];
    const params: any[] = [];
    
    if (data.nama !== undefined) {
      updateFields.push('nama = ?');
      params.push(data.nama);
    }
    
    if (data.satuan !== undefined) {
      updateFields.push('satuan = ?');
      params.push(data.satuan);
    }
    
    if (data.kategori_id !== undefined) {
      updateFields.push('kategori_id = ?');
      params.push(data.kategori_id);
    }
    
    if (data.brand_id !== undefined) {
      updateFields.push('brand_id = ?');
      params.push(data.brand_id);
    }
    
    if (data.supplier_id !== undefined) {
      updateFields.push('supplier_id = ?');
      params.push(data.supplier_id);
    }
    
    if (data.kode !== undefined) {
      updateFields.push('kode = ?');
      params.push(data.kode);
    }
    
    if (data.harga_beli !== undefined) {
      updateFields.push('harga_beli = ?');
      params.push(data.harga_beli);
    }
    
    if (data.harga_jual !== undefined) {
      updateFields.push('harga_jual = ?');
      params.push(data.harga_jual);
    }
    
    if (data.margin_persen !== undefined) {
      updateFields.push('margin_persen = ?');
      params.push(data.margin_persen);
    }
    
    if (updateFields.length === 0) {
      throw new Error('Tidak ada field yang akan diperbarui');
    }
    
    // Add updated timestamp
    updateFields.push('diperbarui_pada = ?');
    params.push(now);
    
    // Add ID for WHERE clause
    params.push(data.id);
    
    const baseQuery = `
      UPDATE produk 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `;
    
    // Apply scope
    const scopedQuery = applyScopeToSql(baseQuery, params, scope);
    
    const [result] = await pool.execute<ResultSetHeader>(
      scopedQuery.sql,
      scopedQuery.params
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Produk tidak ditemukan atau tidak dapat diperbarui');
    }
    
    // Fetch updated product
    const selectQuery = `
      SELECT 
        id, nama, satuan, kategori_id, brand_id, supplier_id, 
        kode, harga_beli, harga_jual, margin_persen, 
        dibuat_pada, diperbarui_pada
      FROM produk 
      WHERE id = ?
    `;
    
    const scopedSelect = applyScopeToSql(selectQuery, [data.id], scope);
    const [rows] = await pool.execute(scopedSelect.sql, scopedSelect.params);
    
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error('Produk tidak ditemukan setelah update');
    }
    
    const row = rows[0] as any;
    const produk: Produk = {
      id: row.id,
      nama: row.nama,
      satuan: row.satuan,
      kategori_id: row.kategori_id,
      brand_id: row.brand_id,
      supplier_id: row.supplier_id,
      kode: row.kode,
      harga_beli: row.harga_beli,
      harga_jual: row.harga_jual,
      margin_persen: row.margin_persen,
      dibuat_pada: row.dibuat_pada,
      diperbarui_pada: row.diperbarui_pada
    };
    
    logger.info({ produkId: data.id }, 'Produk berhasil diperbarui');
    return produk;
  } catch (error) {
    logger.error({ error, data }, 'Error updating produk');
    throw new Error('Gagal memperbarui produk');
  }
}