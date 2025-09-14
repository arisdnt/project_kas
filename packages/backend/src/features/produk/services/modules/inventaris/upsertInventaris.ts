/**
 * Modul untuk membuat atau memperbarui inventaris
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
import { AccessScope } from '@/core/middleware/accessScope';
import { CreateInventaris, Inventaris } from '../../../models/Produk';

/**
 * Membuat atau memperbarui inventaris (upsert)
 * @param data - Data inventaris yang akan dibuat atau diperbarui
 * @param scope - Access scope untuk multi-tenant
 * @returns Promise dengan data inventaris yang telah dibuat/diperbarui
 */
export async function upsertInventaris(
  data: CreateInventaris, 
  scope: AccessScope
): Promise<Inventaris> {
  try {
    if (!scope.storeId) {
      throw new Error('Store ID tidak ditemukan dalam scope');
    }
    
    // Validasi bahwa produk ada dan milik tenant yang sama
    const produkCheckQuery = `
      SELECT id, tenant_id 
      FROM produk 
      WHERE id = ?
    `;
    
    const [produkRows] = await pool.execute<RowDataPacket[]>(
      produkCheckQuery,
      [data.id_produk]
    );
    
    if (produkRows.length === 0) {
      throw new Error('Produk tidak ditemukan');
    }
    
    const produk = produkRows[0];
    if (produk.tenant_id !== scope.tenantId) {
      throw new Error('Produk tidak dapat diakses');
    }
    
    const now = new Date();
    
    // Cek apakah inventaris sudah ada
    const checkQuery = `
      SELECT * FROM inventaris 
      WHERE id_toko = ? AND id_produk = ?
    `;
    
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      checkQuery,
      [scope.storeId, data.id_produk]
    );
    
    let result: ResultSetHeader;
    
    if (existingRows.length > 0) {
      // Update existing inventaris
      const updateQuery = `
        UPDATE inventaris 
        SET 
          stok_tersedia = ?,
          stok_reserved = ?,
          harga_jual_toko = ?,
          stok_minimum_toko = ?,
          lokasi_rak = ?,
          terakhir_update = ?
        WHERE id_toko = ? AND id_produk = ?
      `;
      
      const updateParams = [
        data.stok_tersedia,
        data.stok_reserved,
        data.harga_jual_toko || null,
        data.stok_minimum_toko || 0,
        data.lokasi_rak || null,
        now,
        scope.storeId,
        data.id_produk
      ];
      
      [result] = await pool.execute<ResultSetHeader>(updateQuery, updateParams);
    } else {
      // Insert new inventaris
      const insertQuery = `
        INSERT INTO inventaris (
          id_toko,
          id_produk,
          stok_tersedia,
          stok_reserved,
          harga_jual_toko,
          stok_minimum_toko,
          lokasi_rak,
          terakhir_update
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const insertParams = [
        scope.storeId,
        data.id_produk,
        data.stok_tersedia,
        data.stok_reserved,
        data.harga_jual_toko || null,
        data.stok_minimum_toko || 0,
        data.lokasi_rak || null,
        now
      ];
      
      [result] = await pool.execute<ResultSetHeader>(insertQuery, insertParams);
    }
    
    if (result.affectedRows === 0) {
      throw new Error('Gagal menyimpan inventaris');
    }
    
    // Fetch the updated/created inventaris
    const selectQuery = `
      SELECT 
        id_toko,
        id_produk,
        stok_tersedia,
        stok_reserved,
        harga_jual_toko,
        stok_minimum_toko,
        lokasi_rak,
        terakhir_update
      FROM inventaris 
      WHERE id_toko = ? AND id_produk = ?
    `;
    
    const [selectRows] = await pool.execute<RowDataPacket[]>(
      selectQuery,
      [scope.storeId, data.id_produk]
    );
    
    if (selectRows.length === 0) {
      throw new Error('Inventaris tidak ditemukan setelah upsert');
    }
    
    const row = selectRows[0];
    const inventaris: Inventaris = {
      id_toko: row.id_toko,
      id_produk: row.id_produk,
      stok_tersedia: row.stok_tersedia,
      stok_reserved: row.stok_reserved,
      harga_jual_toko: row.harga_jual_toko,
      stok_minimum_toko: row.stok_minimum_toko,
      lokasi_rak: row.lokasi_rak,
      terakhir_update: row.terakhir_update
    };
    
    logger.info({ 
      tokoId: scope.storeId, 
      produkId: data.id_produk 
    }, 'Inventaris berhasil diupsert');
    
    return inventaris;
  } catch (error) {
    logger.error({ error, data }, 'Error upserting inventaris');
    
    // Re-throw dengan pesan yang lebih spesifik jika sudah ada
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Gagal menyimpan inventaris');
  }
}