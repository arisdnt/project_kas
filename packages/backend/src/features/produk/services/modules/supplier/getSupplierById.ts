/**
 * Modul untuk mendapatkan supplier berdasarkan ID
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { RowDataPacket } from 'mysql2';
import pool from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { Supplier } from '../../../models/Produk';

/**
 * Mendapatkan supplier berdasarkan ID
 * @param id - ID supplier yang akan diambil
 * @param scope - Access scope untuk multi-tenant
 * @returns Promise dengan data supplier atau null jika tidak ditemukan
 */
export async function getSupplierById(
  id: string,
  scope: AccessScope
): Promise<Supplier | null> {
  try {
    // Query dasar untuk mendapatkan supplier berdasarkan ID
    let query = `
      SELECT 
        id,
        nama,
        kontak,
        alamat,
        email,
        telepon,
        status,
        tenant_id,
        created_at,
        updated_at
      FROM supplier 
      WHERE id = ?
    `;
    
    const params: any[] = [id];
    
    // Terapkan scope untuk multi-tenant
    const scopedResult = applyScopeToSql(query, params, scope, {
      tenantColumn: 'tenant_id'
    });
    
    query = scopedResult.sql;
    const finalParams = scopedResult.params;
    
    logger.info({ query, params: finalParams }, 'Executing getSupplierById query');
    
    // Eksekusi query
    const [rows] = await pool.execute<RowDataPacket[]>(query, finalParams);
    
    if (rows.length === 0) {
      logger.info({ id, scope }, 'Supplier tidak ditemukan');
      return null;
    }
    
    const supplier = rows[0] as Supplier;
    
    logger.info({ supplierId: supplier.id }, 'Supplier berhasil diambil');
    
    return supplier;
  } catch (error) {
    logger.error({ error, id, scope }, 'Error dalam getSupplierById');
    throw new Error(`Gagal mengambil supplier: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}