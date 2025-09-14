/**
 * Modul untuk menghapus inventaris
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { ResultSetHeader } from 'mysql2';
import pool from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
import { AccessScope } from '@/core/middleware/accessScope';

/**
 * Menghapus inventaris berdasarkan produk ID
 * @param scope - Access scope untuk multi-tenant
 * @param productId - ID produk yang inventarisnya akan dihapus
 * @returns Promise void
 */
export async function deleteInventaris(
  scope: AccessScope,
  productId: string
): Promise<void> {
  try {
    if (!scope.storeId) {
      throw new Error('Store ID tidak ditemukan dalam scope');
    }
    
    // Cek apakah inventaris masih digunakan dalam transaksi aktif
    const checkTransaksiQuery = `
      SELECT COUNT(*) as count 
      FROM detail_transaksi dt
      INNER JOIN transaksi t ON dt.transaksi_id = t.id
      WHERE dt.produk_id = ? 
        AND t.toko_id = ? 
        AND t.status IN ('pending', 'processing')
    `;
    
    const [transaksiRows] = await pool.execute(
      checkTransaksiQuery,
      [productId, scope.storeId]
    );
    
    const transaksiCount = (transaksiRows as any[])[0]?.count || 0;
    
    if (transaksiCount > 0) {
      throw new Error('Inventaris tidak dapat dihapus karena masih digunakan dalam transaksi aktif');
    }
    
    // Hapus inventaris
    const deleteQuery = `
      DELETE FROM inventaris 
      WHERE id_toko = ? AND id_produk = ?
    `;
    
    const [result] = await pool.execute<ResultSetHeader>(
      deleteQuery,
      [scope.storeId, productId]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Inventaris tidak ditemukan atau tidak dapat dihapus');
    }
    
    logger.info({ 
      tokoId: scope.storeId, 
      produkId: productId 
    }, 'Inventaris berhasil dihapus');
  } catch (error) {
    logger.error({ 
      error, 
      scope, 
      productId 
    }, 'Error deleting inventaris');
    
    // Re-throw dengan pesan yang lebih spesifik jika sudah ada
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Gagal menghapus inventaris');
  }
}