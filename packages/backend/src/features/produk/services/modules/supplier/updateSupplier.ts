/**
 * Modul untuk memperbarui supplier
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { ResultSetHeader } from 'mysql2';
import pool from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
import { AccessScope } from '@/core/middleware/accessScope';
import { UpdateSupplier, Supplier } from '../../../models/Produk';

/**
 * Memperbarui supplier
 * @param data - Data supplier yang akan diperbarui
 * @param scope - Access scope untuk multi-tenant
 * @returns Promise dengan data supplier yang telah diperbarui
 */
export async function updateSupplier(
  data: UpdateSupplier,
  scope: AccessScope
): Promise<Supplier> {
  try {
    if (!data.id) {
      throw new Error('ID supplier harus disediakan');
    }
    
    const now = new Date();
    
    // Cek apakah supplier ada dan milik tenant yang sama
    const checkQuery = `
      SELECT * FROM supplier 
      WHERE id = ? AND tenant_id = ?
    `;
    
    const [checkRows] = await pool.execute(
      checkQuery,
      [data.id, scope.tenantId]
    );
    
    if ((checkRows as any[]).length === 0) {
      throw new Error('Supplier tidak ditemukan');
    }
    
    // Jika nama diubah, cek apakah nama baru sudah ada
    if (data.nama) {
      const duplicateCheckQuery = `
        SELECT COUNT(*) as count 
        FROM supplier 
        WHERE nama_supplier = ? AND tenant_id = ? AND id != ?
      `;
      
      const [duplicateRows] = await pool.execute(
        duplicateCheckQuery,
        [data.nama, scope.tenantId, data.id]
      );
      
      const duplicateCount = (duplicateRows as any[])[0]?.count || 0;
      
      if (duplicateCount > 0) {
        throw new Error('Nama supplier sudah digunakan');
      }
    }
    
    // Update supplier
    const updateQuery = `
      UPDATE supplier 
      SET 
        nama_supplier = COALESCE(?, nama_supplier),
        kontak_person = COALESCE(?, kontak_person),
        email = COALESCE(?, email),
        telepon = COALESCE(?, telepon),
        alamat = COALESCE(?, alamat),
        diperbarui_pada = ?
      WHERE id = ? AND tenant_id = ?
    `;
    
    const updateParams = [
      data.nama || null,
      data.kontak_person || null,
      data.email || null,
      data.telepon || null,
      data.alamat || null,
      now,
      data.id,
      scope.tenantId
    ];
    
    const [result] = await pool.execute<ResultSetHeader>(
      updateQuery,
      updateParams
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Gagal memperbarui supplier');
    }
    
    // Fetch updated supplier
    const selectQuery = `
      SELECT 
        id,
        nama_supplier,
        kontak_person,
        email,
        telepon,
        alamat,
        dibuat_pada,
        diperbarui_pada
      FROM supplier 
      WHERE id = ? AND tenant_id = ?
    `;
    
    const [selectRows] = await pool.execute(
      selectQuery,
      [data.id, scope.tenantId]
    );
    
    const row = (selectRows as any[])[0];
    const supplier: Supplier = {
      id: row.id,
      nama: row.nama_supplier,
      kontak_person: row.kontak_person,
      email: row.email,
      telepon: row.telepon,
      alamat: row.alamat,
      dibuat_pada: row.dibuat_pada,
      diperbarui_pada: row.diperbarui_pada
    };
    
    logger.info({ 
      tenantId: scope.tenantId, 
      supplierId: data.id 
    }, 'Supplier berhasil diperbarui');
    
    return supplier;
  } catch (error) {
    logger.error({ error, data, scope }, 'Error updating supplier');
    
    // Re-throw dengan pesan yang lebih spesifik jika sudah ada
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Gagal memperbarui supplier');
  }
}