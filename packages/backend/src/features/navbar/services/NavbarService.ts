/**
 * Service untuk mengelola data navbar
 * Berisi logika bisnis untuk mengambil data toko dan tenant
 */

import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';
import { 
  NavbarInfo, 
  NavbarToko, 
  NavbarTenant,
  formatNavbarDisplayText 
} from '../models/NavbarModel';

export class NavbarService {
  /**
   * Mendapatkan informasi lengkap untuk navbar
   * @param scope - Access scope user yang sedang login
   * @returns Promise<NavbarInfo>
   */
  static async getNavbarInfo(scope: AccessScope): Promise<NavbarInfo> {
    try {
      // Ambil data tenant dan toko secara paralel
      const [tenant, toko] = await Promise.all([
        this.getTenantInfo(scope.tenantId),
        this.getTokoInfo(scope)
      ]);

      if (!tenant) {
        throw new Error('Data tenant tidak ditemukan');
      }

      // Format display text untuk navbar
      const displayText = formatNavbarDisplayText(toko?.nama || null, tenant.nama);

      return {
        toko,
        tenant,
        displayText
      };

    } catch (error) {
      console.error('Error dalam getNavbarInfo:', error);
      throw new Error('Gagal mengambil data navbar');
    }
  }

  /**
   * Mendapatkan informasi tenant untuk navbar
   * @param tenantId - ID tenant
   * @returns Promise<NavbarTenant | null>
   */
  private static async getTenantInfo(tenantId: string): Promise<NavbarTenant | null> {
    try {
      const sql = `
        SELECT 
          id,
          nama,
          status,
          paket
        FROM tenants 
        WHERE id = ?
        AND status IN ('aktif', 'nonaktif', 'suspended')
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(sql, [tenantId]);

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        id: row.id,
        nama: row.nama,
        status: row.status,
        paket: row.paket
      };

    } catch (error) {
      console.error('Error dalam getTenantInfo:', error);
      throw new Error('Gagal mengambil data tenant');
    }
  }

  /**
   * Mendapatkan informasi toko untuk navbar
   * @param scope - Access scope user
   * @returns Promise<NavbarToko | null>
   */
  private static async getTokoInfo(scope: AccessScope): Promise<NavbarToko | null> {
    try {
      // Jika user tidak memiliki toko spesifik atau god user tanpa store
      if (!scope.storeId || scope.isGod) {
        // Untuk god user atau admin level tinggi, ambil toko pertama dari tenant
        if (scope.isGod || (scope.level && scope.level <= 2)) {
          return await this.getFirstTokoFromTenant(scope.tenantId);
        }
        return null;
      }

      const sql = `
        SELECT 
          id,
          nama,
          kode,
          status
        FROM toko 
        WHERE id = ? AND tenant_id = ?
        AND status IN ('aktif', 'nonaktif', 'maintenance')
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(sql, [scope.storeId, scope.tenantId]);

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        id: row.id,
        nama: row.nama,
        kode: row.kode,
        status: row.status
      };

    } catch (error) {
      console.error('Error dalam getTokoInfo:', error);
      throw new Error('Gagal mengambil data toko');
    }
  }

  /**
   * Mendapatkan toko pertama dari tenant (untuk admin/god user)
   * @param tenantId - ID tenant
   * @returns Promise<NavbarToko | null>
   */
  private static async getFirstTokoFromTenant(tenantId: string): Promise<NavbarToko | null> {
    try {
      const sql = `
        SELECT 
          id,
          nama,
          kode,
          status
        FROM toko 
        WHERE tenant_id = ?
        AND status = 'aktif'
        ORDER BY nama ASC
        LIMIT 1
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(sql, [tenantId]);

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        id: row.id,
        nama: row.nama,
        kode: row.kode,
        status: row.status
      };

    } catch (error) {
      console.error('Error dalam getFirstTokoFromTenant:', error);
      return null;
    }
  }
}