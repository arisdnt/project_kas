/**
 * Tenant Service
 * Service untuk mengelola data tenant terkait user yang sedang login
 */

import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';
import { 
  Tenant, 
  TenantResponse, 
  TenantErrorResponse,
  TenantQueryParams 
} from '../models/TenantModel';

export class TenantService {
  /**
   * Mendapatkan data tenant berdasarkan user yang sedang login
   * @param scope - Access scope yang berisi informasi user dan tenant
   * @returns Promise<Tenant | null>
   */
  static async getTenantByUserId(scope: AccessScope): Promise<Tenant | null> {
    try {
      // Query untuk mendapatkan data tenant berdasarkan tenant_id dari scope
      const sql = `
        SELECT 
          id,
          nama,
          email,
          telepon,
          alamat,
          status,
          paket,
          max_toko,
          max_pengguna,
          dibuat_pada,
          diperbarui_pada
        FROM tenants 
        WHERE id = ?
        AND status IN ('aktif', 'nonaktif', 'suspended')
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(sql, [scope.tenantId]);

      if (rows.length === 0) {
        return null;
      }

      const tenant = rows[0] as Tenant;
      return tenant;

    } catch (error) {
      console.error('Error dalam getTenantByUserId:', error);
      throw new Error('Gagal mengambil data tenant');
    }
  }

  /**
   * Validasi apakah user memiliki akses ke tenant
   * @param userId - ID user yang akan divalidasi
   * @param tenantId - ID tenant yang akan divalidasi
   * @returns Promise<boolean>
   */
  static async validateUserTenantAccess(userId: string, tenantId: string): Promise<boolean> {
    try {
      const sql = `
        SELECT COUNT(*) as count
        FROM users u
        INNER JOIN tenants t ON u.tenant_id = t.id
        WHERE u.id = ? AND t.id = ? AND t.status = 'aktif'
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(sql, [userId, tenantId]);
      const result = rows[0] as { count: number };

      return result.count > 0;

    } catch (error) {
      console.error('Error dalam validateUserTenantAccess:', error);
      return false;
    }
  }

  /**
   * Mendapatkan informasi statistik tenant
   * @param tenantId - ID tenant
   * @returns Promise<any>
   */
  static async getTenantStats(tenantId: string): Promise<any> {
    try {
      const sql = `
        SELECT 
          (SELECT COUNT(*) FROM toko WHERE tenant_id = ?) as total_toko,
          (SELECT COUNT(*) FROM users WHERE tenant_id = ?) as total_pengguna,
          (SELECT COUNT(*) FROM transaksi WHERE tenant_id = ?) as total_transaksi
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(sql, [tenantId, tenantId, tenantId]);
      return rows[0];

    } catch (error) {
      console.error('Error dalam getTenantStats:', error);
      throw new Error('Gagal mengambil statistik tenant');
    }
  }

  /**
   * Format response sukses untuk API
   * @param data - Data tenant
   * @param message - Pesan response
   * @returns TenantResponse
   */
  static formatSuccessResponse(data: Tenant, message: string = 'Data tenant berhasil diambil'): TenantResponse {
    return {
      success: true,
      message,
      data
    };
  }

  /**
   * Format response error untuk API
   * @param message - Pesan error
   * @param error - Detail error (opsional)
   * @returns TenantErrorResponse
   */
  static formatErrorResponse(message: string, error?: string): TenantErrorResponse {
    return {
      success: false,
      message,
      error
    };
  }

  /**
   * Mendapatkan data tenant khusus untuk navbar
   * @param scope - Access scope user
   * @returns Promise<{id: string, nama: string, status: string} | null>
   */
  static async getTenantForNavbar(scope: AccessScope): Promise<{id: string, nama: string, status: string} | null> {
    try {
      const sql = `
        SELECT 
          id,
          nama,
          status
        FROM tenants 
        WHERE id = ?
        AND status IN ('aktif', 'nonaktif', 'suspended')
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(sql, [scope.tenantId]);

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        id: row.id,
        nama: row.nama,
        status: row.status
      };

    } catch (error) {
      console.error('Error dalam getTenantForNavbar:', error);
      throw new Error('Gagal mengambil data tenant untuk navbar');
    }
  }
}