/**
 * Modul untuk menghapus produk
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { ResultSetHeader } from 'mysql2';
import pool from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';

/**
 * Menghapus produk berdasarkan ID
 * @param id - ID produk yang akan dihapus
 * @param scope - Access scope untuk multi-tenant
 * @returns Promise void
 */
export async function deleteProduk(
  id: string, 
  scope: AccessScope
): Promise<void> {
  try {
    // Cek apakah produk masih digunakan dalam inventaris
    const checkInventarisQuery = `
      SELECT COUNT(*) as count 
      FROM inventaris 
      WHERE id_produk = ?
    `;
    
    const [inventarisRows] = await pool.execute(
      checkInventarisQuery, 
      [id]
    );
    
    const inventarisCount = (inventarisRows as any[])[0]?.count || 0;
    
    if (inventarisCount > 0) {
      throw new Error('Produk tidak dapat dihapus karena masih digunakan dalam inventaris');
    }
    
    // Cek apakah produk masih digunakan dalam transaksi
    const checkTransaksiQuery = `
      SELECT COUNT(*) as count 
      FROM detail_transaksi 
      WHERE produk_id = ?
    `;
    
    const [transaksiRows] = await pool.execute(
      checkTransaksiQuery, 
      [id]
    );
    
    const transaksiCount = (transaksiRows as any[])[0]?.count || 0;
    
    if (transaksiCount > 0) {
      throw new Error('Produk tidak dapat dihapus karena masih digunakan dalam transaksi');
    }
    
    // Hapus produk
    const deleteQuery = `
      DELETE FROM produk 
      WHERE id = ?
    `;
    
    // Apply scope
    const scopedQuery = applyScopeToSql(deleteQuery, [id], scope);
    
    const [result] = await pool.execute<ResultSetHeader>(
      scopedQuery.sql,
      scopedQuery.params
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Produk tidak ditemukan atau tidak dapat dihapus');
    }
    
    logger.info({ produkId: id }, 'Produk berhasil dihapus');
  } catch (error) {
    logger.error({ error, id }, 'Error deleting produk');
    
    // Re-throw dengan pesan yang lebih spesifik jika sudah ada
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Gagal menghapus produk');
  }
}