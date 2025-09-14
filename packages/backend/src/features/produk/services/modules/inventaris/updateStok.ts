/**
 * Modul untuk memperbarui stok inventaris
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { ResultSetHeader } from 'mysql2';
import pool from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
import { AccessScope } from '@/core/middleware/accessScope';

/**
 * Memperbarui stok produk dalam inventaris
 * @param scope - Access scope untuk multi-tenant
 * @param productId - ID produk yang akan diperbarui stoknya
 * @param newQuantity - Jumlah stok baru
 * @returns Promise void
 */
export async function updateStok(
  scope: AccessScope,
  productId: string,
  newQuantity: number
): Promise<void> {
  try {
    if (!scope.storeId) {
      throw new Error('Store ID tidak ditemukan dalam scope');
    }
    
    if (newQuantity < 0) {
      throw new Error('Jumlah stok tidak boleh negatif');
    }
    
    const now = new Date();
    
    // Update stok
    const updateQuery = `
      UPDATE inventaris 
      SET 
        stok_tersedia = ?,
        terakhir_update = ?
      WHERE id_toko = ? AND id_produk = ?
    `;
    
    const [result] = await pool.execute<ResultSetHeader>(
      updateQuery,
      [newQuantity, now, scope.storeId, productId]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Inventaris tidak ditemukan atau tidak dapat diperbarui');
    }
    
    logger.info({ 
      tokoId: scope.storeId, 
      produkId: productId, 
      newQuantity 
    }, 'Stok inventaris berhasil diperbarui');
  } catch (error) {
    logger.error({ 
      error, 
      scope, 
      productId, 
      newQuantity 
    }, 'Error updating stok inventaris');
    
    // Re-throw dengan pesan yang lebih spesifik jika sudah ada
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Gagal memperbarui stok inventaris');
  }
}