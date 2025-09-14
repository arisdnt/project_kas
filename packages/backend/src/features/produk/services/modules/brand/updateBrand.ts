/**
 * Modul untuk memperbarui brand
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { ResultSetHeader } from 'mysql2';
import pool from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
import { AccessScope } from '@/core/middleware/accessScope';
import { UpdateBrand, Brand } from '../../../models/Produk';

/**
 * Memperbarui brand
 * @param data - Data brand yang akan diperbarui
 * @param scope - Access scope untuk multi-tenant
 * @returns Promise dengan data brand yang telah diperbarui
 */
export async function updateBrand(
  data: UpdateBrand,
  scope: AccessScope
): Promise<Brand> {
  try {
    if (!data.id) {
      throw new Error('ID brand harus disediakan');
    }
    
    // Cek apakah brand ada dan milik tenant yang sama
    const checkQuery = `
      SELECT id, nama_brand 
      FROM brand 
      WHERE id = ? AND tenant_id = ?
    `;
    
    const [checkRows] = await pool.execute(
      checkQuery,
      [data.id, scope.tenantId]
    );
    
    if ((checkRows as any[]).length === 0) {
      throw new Error('Brand tidak ditemukan');
    }
    
    // Jika nama diubah, cek apakah nama baru sudah ada
    if (data.nama) {
      const duplicateCheckQuery = `
        SELECT COUNT(*) as count 
        FROM brand 
        WHERE nama_brand = ? AND tenant_id = ? AND id != ?
      `;
      
      const [duplicateRows] = await pool.execute(
        duplicateCheckQuery,
        [data.nama, scope.tenantId, data.id]
      );
      
      const duplicateCount = (duplicateRows as any[])[0]?.count || 0;
      
      if (duplicateCount > 0) {
        throw new Error('Nama brand sudah digunakan');
      }
    }
    
    // Update brand
    const updateQuery = `
      UPDATE brand 
      SET nama_brand = COALESCE(?, nama_brand)
      WHERE id = ? AND tenant_id = ?
    `;
    
    const updateParams = [
      data.nama || null,
      data.id,
      scope.tenantId
    ];
    
    const [result] = await pool.execute<ResultSetHeader>(
      updateQuery,
      updateParams
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Gagal memperbarui brand');
    }
    
    // Fetch updated brand
    const selectQuery = `
      SELECT id, nama_brand 
      FROM brand 
      WHERE id = ? AND tenant_id = ?
    `;
    
    const [selectRows] = await pool.execute(
      selectQuery,
      [data.id, scope.tenantId]
    );
    
    const row = (selectRows as any[])[0];
    const brand: Brand = {
      id: row.id,
      nama: row.nama_brand
    };
    
    logger.info({ 
      tenantId: scope.tenantId, 
      brandId: data.id 
    }, 'Brand berhasil diperbarui');
    
    return brand;
  } catch (error) {
    logger.error({ error, data, scope }, 'Error updating brand');
    
    // Re-throw dengan pesan yang lebih spesifik jika sudah ada
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Gagal memperbarui brand');
  }
}