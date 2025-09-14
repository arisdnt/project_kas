/**
 * Modul untuk mendapatkan semua supplier
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { RowDataPacket } from 'mysql2';
import pool from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
import { AccessScope } from '@/core/middleware/accessScope';
import { Supplier } from '../../../models/Produk';

interface GetAllSupplierOptions {
  search?: string;
  limit?: number;
  offset?: number;
}

interface GetAllSupplierResult {
  data: Supplier[];
  total: number;
  hasMore: boolean;
}

/**
 * Mendapatkan semua supplier dengan pagination dan pencarian
 * @param scope - Access scope untuk multi-tenant
 * @param options - Opsi untuk filtering dan pagination
 * @returns Promise dengan data supplier dan informasi pagination
 */
export async function getAllSupplier(
  scope: AccessScope,
  options: GetAllSupplierOptions = {}
): Promise<GetAllSupplierResult> {
  try {
    const { search, limit = 50, offset = 0 } = options;
    
    // Base query
    let whereConditions = ['tenant_id = ?'];
    let queryParams: any[] = [scope.tenantId];
    
    // Tambahkan kondisi pencarian jika ada
    if (search && search.trim()) {
      whereConditions.push('(nama LIKE ? OR kontak_person LIKE ? OR email LIKE ?)');
      const searchTerm = `%${search.trim()}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Query untuk mendapatkan total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM supplier 
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
        kontak_person,
        email,
        telepon,
        alamat,
        dibuat_pada,
        diperbarui_pada
      FROM supplier 
      WHERE ${whereClause}
      ORDER BY nama ASC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const [dataRows] = await pool.execute<RowDataPacket[]>(
      dataQuery,
      queryParams
    );
    
    const data: Supplier[] = dataRows.map(row => ({
      id: row.id,
      nama: row.nama,
      kontak_person: row.kontak_person,
      email: row.email,
      telepon: row.telepon,
      alamat: row.alamat,
      dibuat_pada: row.dibuat_pada,
      diperbarui_pada: row.diperbarui_pada
    }));
    
    const hasMore = offset + limit < total;
    
    logger.info({ 
      tenantId: scope.tenantId, 
      total, 
      returned: data.length,
      search: search || null
    }, 'Supplier berhasil diambil');
    
    return {
      data,
      total,
      hasMore
    };
  } catch (error) {
    logger.error({ error, scope, options }, 'Error getting all supplier');
    
    // Re-throw dengan pesan yang lebih spesifik jika sudah ada
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Gagal mengambil data supplier');
  }
}