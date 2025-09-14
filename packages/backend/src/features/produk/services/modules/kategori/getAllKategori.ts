/**
 * Modul untuk mendapatkan semua kategori
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { RowDataPacket } from 'mysql2';
import pool from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
import { AccessScope } from '@/core/middleware/accessScope';
import { Kategori } from '../../../models/Produk';

interface GetAllKategoriOptions {
  search?: string;
  limit?: number;
  offset?: number;
}

interface GetAllKategoriResult {
  data: Kategori[];
  total: number;
  hasMore: boolean;
}

/**
 * Mendapatkan semua kategori dengan pagination dan pencarian
 * @param scope - Access scope untuk multi-tenant
 * @param options - Opsi untuk filtering dan pagination
 * @returns Promise dengan data kategori dan informasi pagination
 */
export async function getAllKategori(
  scope: AccessScope,
  options: GetAllKategoriOptions = {}
): Promise<GetAllKategoriResult> {
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
      FROM kategori 
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
      FROM kategori 
      WHERE ${whereClause}
      ORDER BY nama ASC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const [dataRows] = await pool.execute<RowDataPacket[]>(
      dataQuery,
      queryParams
    );
    
    const data: Kategori[] = dataRows.map(row => ({
      id: row.id,
      nama: row.nama
    }));
    
    const hasMore = offset + limit < total;
    
    logger.info({ 
      tenantId: scope.tenantId, 
      total, 
      returned: data.length,
      search: search || null
    }, 'Kategori berhasil diambil');
    
    return {
      data,
      total,
      hasMore
    };
  } catch (error) {
    logger.error({ error, scope, options }, 'Error getting all kategori');
    
    // Re-throw dengan pesan yang lebih spesifik jika sudah ada
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Gagal mengambil data kategori');
  }
}