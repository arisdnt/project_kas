/**
 * Modul untuk membuat brand baru
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { ResultSetHeader } from 'mysql2';
import pool from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
import { AccessScope } from '@/core/middleware/accessScope';
import { CreateBrand, Brand } from '../../../models/Produk';
import { randomUUID } from 'crypto';

/**
 * Membuat brand baru
 * @param data - Data brand yang akan dibuat
 * @param scope - Access scope untuk multi-tenant
 * @returns Promise dengan data brand yang telah dibuat
 */
export async function createBrand(
  data: CreateBrand,
  scope: AccessScope
): Promise<Brand> {
  try {
    const id = randomUUID();
    
    // Cek apakah nama brand sudah ada untuk tenant ini
    const checkQuery = `
      SELECT COUNT(*) as count 
      FROM brand 
      WHERE nama_brand = ? AND tenant_id = ?
    `;
    
    const [checkRows] = await pool.execute(
      checkQuery,
      [data.nama, scope.tenantId]
    );
    
    const existingCount = (checkRows as any[])[0]?.count || 0;
    
    if (existingCount > 0) {
      throw new Error('Nama brand sudah digunakan');
    }
    
    // Insert brand baru
    const insertQuery = `
      INSERT INTO brand (
        id,
        nama_brand,
        tenant_id
      ) VALUES (?, ?, ?)
    `;
    
    const insertParams = [
      id,
      data.nama,
      scope.tenantId
    ];
    
    const [result] = await pool.execute<ResultSetHeader>(
      insertQuery,
      insertParams
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Gagal membuat brand');
    }
    
    const brand: Brand = {
      id,
      nama: data.nama
    };
    
    logger.info({ 
      tenantId: scope.tenantId, 
      brandId: id, 
      nama: data.nama 
    }, 'Brand berhasil dibuat');
    
    return brand;
  } catch (error) {
    logger.error({ error, data, scope }, 'Error creating brand');
    
    // Re-throw dengan pesan yang lebih spesifik jika sudah ada
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Gagal membuat brand');
  }
}