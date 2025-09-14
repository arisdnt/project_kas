/**
 * Modul untuk menghapus supplier
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { ResultSetHeader } from 'mysql2';
import pool from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
import { AccessScope } from '@/core/middleware/accessScope';

/**
 * Menghapus supplier
 * @param id - ID supplier yang akan dihapus
 * @param scope - Access scope untuk multi-tenant
 * @returns Promise void
 */
export async function deleteSupplier(
  id: string,
  scope: AccessScope
): Promise<void> {
  try {
    // Cek apakah supplier masih digunakan oleh produk
    const checkUsageQuery = `
      SELECT COUNT(*) as count 
      FROM produk 
      WHERE supplier_id = ? AND tenant_id = ?
    `;
    
    const [usageRows] = await pool.execute(
      checkUsageQuery,
      [id, scope.tenantId]
    );
    
    const usageCount = (usageRows as any[])[0]?.count || 0;
    
    if (usageCount > 0) {
      throw new Error('Supplier tidak dapat dihapus karena masih digunakan oleh produk');
    }
    
    // Hapus supplier
    const deleteQuery = `
      DELETE FROM supplier 
      WHERE id = ? AND tenant_id = ?
    `;
    
    const [result] = await pool.execute<ResultSetHeader>(
      deleteQuery,
      [id, scope.tenantId]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Supplier tidak ditemukan atau tidak dapat dihapus');
    }
    
    logger.info({ 
      tenantId: scope.tenantId, 
      supplierId: id 
    }, 'Supplier berhasil dihapus');
  } catch (error) {
    logger.error({ error, id, scope }, 'Error deleting supplier');
    
    // Re-throw dengan pesan yang lebih spesifik jika sudah ada
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Gagal menghapus supplier');
  }
}