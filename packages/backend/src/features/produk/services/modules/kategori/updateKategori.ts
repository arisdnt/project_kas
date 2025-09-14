/**
 * Modul untuk memperbarui kategori
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { ResultSetHeader } from 'mysql2';
import pool from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
import { AccessScope } from '@/core/middleware/accessScope';
import { UpdateKategori, Kategori } from '../../../models/Produk';

/**
 * Memperbarui kategori
 * @param data - Data kategori yang akan diperbarui
 * @param scope - Access scope untuk multi-tenant
 * @returns Promise dengan data kategori yang telah diperbarui
 */
export async function updateKategori(
  data: UpdateKategori,
  scope: AccessScope
): Promise<Kategori> {
  try {
    if (!data.id) {
      throw new Error('ID kategori harus disediakan');
    }
    
    const now = new Date();
    
    // Cek apakah kategori ada dan milik tenant yang sama
    const checkQuery = `
      SELECT id, nama 
      FROM kategori 
      WHERE id = ? AND tenant_id = ?
    `;
    
    const [checkRows] = await pool.execute(
      checkQuery,
      [data.id, scope.tenantId]
    );
    
    if ((checkRows as any[]).length === 0) {
      throw new Error('Kategori tidak ditemukan');
    }
    
    // Jika nama diubah, cek apakah nama baru sudah ada
    if (data.nama) {
      const duplicateCheckQuery = `
        SELECT COUNT(*) as count 
        FROM kategori 
        WHERE nama = ? AND tenant_id = ? AND id != ?
      `;
      
      const [duplicateRows] = await pool.execute(
        duplicateCheckQuery,
        [data.nama, scope.tenantId, data.id]
      );
      
      const duplicateCount = (duplicateRows as any[])[0]?.count || 0;
      
      if (duplicateCount > 0) {
        throw new Error('Nama kategori sudah digunakan');
      }
    }
    
    // Update kategori
    const updateQuery = `
      UPDATE kategori 
      SET 
        nama = COALESCE(?, nama),
        diperbarui_pada = ?
      WHERE id = ? AND tenant_id = ?
    `;
    
    const updateParams = [
      data.nama || null,
      now,
      data.id,
      scope.tenantId
    ];
    
    const [result] = await pool.execute<ResultSetHeader>(
      updateQuery,
      updateParams
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Gagal memperbarui kategori');
    }
    
    // Fetch updated kategori
    const selectQuery = `
      SELECT id, nama 
      FROM kategori 
      WHERE id = ? AND tenant_id = ?
    `;
    
    const [selectRows] = await pool.execute(
      selectQuery,
      [data.id, scope.tenantId]
    );
    
    const row = (selectRows as any[])[0];
    const kategori: Kategori = {
      id: row.id,
      nama: row.nama
    };
    
    logger.info({ 
      tenantId: scope.tenantId, 
      kategoriId: data.id 
    }, 'Kategori berhasil diperbarui');
    
    return kategori;
  } catch (error) {
    logger.error({ error, data, scope }, 'Error updating kategori');
    
    // Re-throw dengan pesan yang lebih spesifik jika sudah ada
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Gagal memperbarui kategori');
  }
}