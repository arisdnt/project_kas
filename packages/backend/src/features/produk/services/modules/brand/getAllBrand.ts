/**
 * Modul untuk mendapatkan semua brand
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { RowDataPacket } from 'mysql2';
import pool from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
import { AccessScope } from '@/core/middleware/accessScope';
import { Brand } from '../../../models/Produk';

interface GetAllBrandOptions {
  search?: string;
  limit?: number;
  offset?: number;
}

interface GetAllBrandResult {
  data: Brand[];
  total: number;
  hasMore: boolean;
}

/**
 * Mendapatkan semua brand dengan pagination dan pencarian
 * @param scope - Access scope untuk multi-tenant
 * @param options - Opsi untuk filtering dan pagination
 * @returns Promise dengan data brand dan informasi pagination
 */
export async function getAllBrand(
  scope: AccessScope,
  options: GetAllBrandOptions = {}
): Promise<GetAllBrandResult> {
  try {
    const { search, limit = 50, offset = 0 } = options;
    
    // Base query
    let whereConditions = ['tenant_id = ?'];
    let queryParams: any[] = [scope.tenantId];
    
    // Tambahkan kondisi pencarian jika ada
    if (search && search.trim()) {
      whereConditions.push('nama LIKE ?');
      queryParams.push(`%${search.trim()}%`);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Query untuk mendapatkan total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM brand 
      WHERE ${whereClause}
    `;
    
    const [countRows] = await pool.execute<RowDataPacket[]>(
      countQuery,
      queryParams
    );
    
    const total = countRows[0]?.total || 0;
    
    // Query untuk mendapatkan data dengan pagination
    const dataQuery = `
      SELECT 
        id,
        nama,
        deskripsi,
        tenant_id,
        dibuat_pada,
        diperbarui_pada
      FROM brand 
      WHERE ${whereClause}
      ORDER BY nama ASC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const [dataRows] = await pool.execute<RowDataPacket[]>(
      dataQuery,
      queryParams
    );
    
    const data: Brand[] = dataRows.map(row => ({
      id: row.id,
      nama: row.nama
    }));
    
    const hasMore = offset + limit < total;
    
    logger.info({ 
      tenantId: scope.tenantId, 
      total, 
      returned: data.length,
      search: search || null
    }, 'Brand berhasil diambil');
    
    return {
      data,
      total,
      hasMore
    };
  } catch (error) {
    logger.error({ error, scope, options }, 'Error getting all brand');
    
    // Re-throw dengan pesan yang lebih spesifik jika sudah ada
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Gagal mengambil data brand');
  }
}