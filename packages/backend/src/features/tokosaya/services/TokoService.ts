/**
 * Service untuk mengelola business logic toko
 * Berisi fungsi-fungsi untuk operasi database dan validasi
 */

import { RowDataPacket } from 'mysql2';
import { pool as db } from '@/core/database/connection';
import { 
  Toko, 
  TokoQueryParams, 
  TokoFilter,
  StatusToko,
  isValidStatus,
  createSuccessResponse,
  createErrorResponse
} from '../models/TokoModel';

/**
 * Service class untuk mengelola operasi toko
 */
export class TokoService {
  
  /**
   * Mengambil semua toko berdasarkan tenant_id
   * @param tenantId - ID tenant yang sedang login
   * @param filter - Filter tambahan untuk query
   * @returns Promise dengan data toko atau error
   */
  static async getTokoByTenantId(
    tenantId: string, 
    filter: TokoFilter = {}
  ): Promise<Toko[]> {
    try {
      // Validasi input tenant_id
      if (!tenantId || typeof tenantId !== 'string') {
        throw new Error('Tenant ID tidak valid');
      }

      // Base query untuk mengambil semua kolom toko
      let query = `
        SELECT 
          id,
          tenant_id,
          nama,
          kode,
          alamat,
          telepon,
          email,
          status,
          timezone,
          mata_uang,
          logo_url,
          dibuat_pada,
          diperbarui_pada
        FROM toko 
        WHERE tenant_id = ?
      `;

      const queryParams: any[] = [tenantId];

      // Tambahkan filter status jika ada
      if (filter.status && isValidStatus(filter.status)) {
        query += ' AND status = ?';
        queryParams.push(filter.status);
      }

      // Tambahkan filter nama jika ada
      if (filter.nama) {
        query += ' AND nama LIKE ?';
        queryParams.push(`%${filter.nama}%`);
      }

      // Tambahkan filter kode jika ada
      if (filter.kode) {
        query += ' AND kode LIKE ?';
        queryParams.push(`%${filter.kode}%`);
      }

      // Urutkan berdasarkan nama
      query += ' ORDER BY nama ASC';

      // Eksekusi query
      const [rows] = await db.execute<RowDataPacket[]>(query, queryParams);

      // Format hasil query menjadi array Toko
      const tokoList: Toko[] = rows.map((row: RowDataPacket) => ({
        id: row.id,
        tenant_id: row.tenant_id,
        nama: row.nama,
        kode: row.kode,
        alamat: row.alamat,
        telepon: row.telepon,
        email: row.email,
        status: row.status as StatusToko,
        timezone: row.timezone,
        mata_uang: row.mata_uang,
        logo_url: row.logo_url,
        dibuat_pada: row.dibuat_pada,
        diperbarui_pada: row.diperbarui_pada
      }));

      return tokoList;

    } catch (error) {
      console.error('Error dalam TokoService.getTokoByTenantId:', error);
      throw new Error('Gagal mengambil data toko');
    }
  }

  /**
   * Mengambil toko berdasarkan ID dan tenant_id
   * @param tokoId - ID toko yang dicari
   * @param tenantId - ID tenant untuk validasi akses
   * @returns Promise dengan data toko atau null
   */
  static async getTokoById(tokoId: string, tenantId: string): Promise<Toko | null> {
    try {
      // Validasi input
      if (!tokoId || !tenantId) {
        throw new Error('ID toko dan tenant ID harus diisi');
      }

      const query = `
        SELECT 
          id, tenant_id, nama, kode, alamat, telepon, email,
          status, timezone, mata_uang, logo_url,
          dibuat_pada, diperbarui_pada
        FROM toko 
        WHERE id = ? AND tenant_id = ?
      `;

      const [rows] = await db.execute<RowDataPacket[]>(query, [tokoId, tenantId]);

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        id: row.id,
        tenant_id: row.tenant_id,
        nama: row.nama,
        kode: row.kode,
        alamat: row.alamat,
        telepon: row.telepon,
        email: row.email,
        status: row.status as StatusToko,
        timezone: row.timezone,
        mata_uang: row.mata_uang,
        logo_url: row.logo_url,
        dibuat_pada: row.dibuat_pada,
        diperbarui_pada: row.diperbarui_pada
      };

    } catch (error) {
      console.error('Error dalam TokoService.getTokoById:', error);
      throw new Error('Gagal mengambil data toko');
    }
  }

  /**
   * Validasi akses user ke toko
   * @param userId - ID user yang sedang login
   * @param tenantId - ID tenant yang akan diakses
   * @returns Promise boolean untuk validasi akses
   */
  static async validateUserAccess(userId: string, tenantId: string): Promise<boolean> {
    try {
      if (!userId || !tenantId) {
        return false;
      }

      // Query untuk cek apakah user memiliki akses ke tenant
      const query = `
        SELECT COUNT(*) as count 
        FROM users u
        WHERE u.id = ? AND u.tenant_id = ?
      `;

      const [rows] = await db.execute<RowDataPacket[]>(query, [userId, tenantId]);
      
      return rows[0].count > 0;

    } catch (error) {
      console.error('Error dalam TokoService.validateUserAccess:', error);
      return false;
    }
  }

  /**
   * Mengambil statistik toko untuk tenant
   * @param tenantId - ID tenant
   * @returns Promise dengan statistik toko
   */
  static async getTokoStats(tenantId: string): Promise<any> {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_toko,
          SUM(CASE WHEN status = 'aktif' THEN 1 ELSE 0 END) as toko_aktif,
          SUM(CASE WHEN status = 'nonaktif' THEN 1 ELSE 0 END) as toko_nonaktif,
          SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as toko_maintenance
        FROM toko 
        WHERE tenant_id = ?
      `;

      const [rows] = await db.execute<RowDataPacket[]>(query, [tenantId]);
      
      return rows[0];

    } catch (error) {
      console.error('Error dalam TokoService.getTokoStats:', error);
      throw new Error('Gagal mengambil statistik toko');
    }
  }
}