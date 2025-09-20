/**
 * Service untuk operasi mutasi (create, update, delete) catatan
 * Menangani validasi, transaksi database, dan otorisasi
 */

import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';
import { 
  CreateCatatan, 
  UpdateCatatan, 
  Catatan
} from '../../models/CatatanCore';
import { v4 as uuidv4 } from 'uuid';

export class CatatanMutationService {
  /**
   * Membuat catatan baru
   */
  static async createCatatan(
    data: CreateCatatan,
    accessScope: AccessScope
  ): Promise<Catatan> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const id = uuidv4();
      const now = new Date();

      // Tentukan tenant_id dan toko_id berdasarkan visibilitas
      let tenantId: string | null = accessScope.tenantId;
      let tokoId: string | null = accessScope.storeId || null;

      if (data.visibilitas === 'publik') {
        // Catatan publik tidak terikat tenant/toko
        tenantId = null;
        tokoId = null;
      } else if (data.visibilitas === 'tenant') {
        // Catatan tenant tidak terikat toko spesifik
        tokoId = null;
      }

      const query = `
        INSERT INTO catatan (
          id, judul, konten, visibilitas, kategori, tags, prioritas,
          status, user_id, tenant_id, toko_id, reminder_pada,
          lampiran_url, dibuat_pada, diperbarui_pada
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        id,
        data.judul,
        data.konten,
        data.visibilitas,
        data.kategori || null,
        data.tags ? JSON.stringify(data.tags) : null,
        data.prioritas || 'normal',
        data.status || 'aktif',
        accessScope.userId,
        tenantId,
        tokoId,
        data.reminder_pada || null,
        data.lampiran_url || null,
        now,
        now
      ];

      await connection.execute(query, params);
      await connection.commit();

      // Ambil data catatan yang baru dibuat
      const result = await this.getCatatanById(id, accessScope);
      if (!result) {
        throw new Error('Gagal membuat catatan');
      }
      return result;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update catatan berdasarkan ID
   */
  static async updateCatatan(
    id: string,
    data: UpdateCatatan,
    accessScope: AccessScope
  ): Promise<Catatan> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Cek apakah catatan ada dan user memiliki akses
      const existingCatatan = await this.getCatatanById(id, accessScope);
      if (!existingCatatan) {
        throw new Error('Catatan tidak ditemukan atau tidak memiliki akses');
      }

      // Hanya pemilik atau god user yang bisa update
      if (!accessScope.isGod && existingCatatan.user_id !== accessScope.userId) {
        throw new Error('Tidak memiliki izin untuk mengubah catatan ini');
      }

      const updateFields: string[] = [];
      const params: any[] = [];

      // Build dynamic update query
      if (data.judul !== undefined) {
        updateFields.push('judul = ?');
        params.push(data.judul);
      }

      if (data.konten !== undefined) {
        updateFields.push('konten = ?');
        params.push(data.konten);
      }

      if (data.visibilitas !== undefined) {
        updateFields.push('visibilitas = ?');
        params.push(data.visibilitas);
      }

      if (data.kategori !== undefined) {
        updateFields.push('kategori = ?');
        params.push(data.kategori);
      }

      if (data.tags !== undefined) {
        updateFields.push('tags = ?');
        params.push(data.tags ? JSON.stringify(data.tags) : null);
      }

      if (data.prioritas !== undefined) {
        updateFields.push('prioritas = ?');
        params.push(data.prioritas);
      }

      if (data.status !== undefined) {
        updateFields.push('status = ?');
        params.push(data.status);
      }

      if (data.reminder_pada !== undefined) {
        updateFields.push('reminder_pada = ?');
        params.push(data.reminder_pada);
      }

      if (data.lampiran_url !== undefined) {
        updateFields.push('lampiran_url = ?');
        params.push(data.lampiran_url);
      }

      if (updateFields.length === 0) {
        throw new Error('Tidak ada data yang akan diupdate');
      }

      // Tambahkan timestamp update
      updateFields.push('diperbarui_pada = ?');
      params.push(new Date());

      // Tambahkan WHERE clause
      params.push(id);

      const query = `
        UPDATE catatan 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;

      const [result] = await connection.execute(query, params) as any;
      
      if (result.affectedRows === 0) {
        throw new Error('Gagal mengupdate catatan');
      }

      await connection.commit();

      // Return updated catatan
      const updatedCatatan = await this.getCatatanById(id, accessScope);
      if (!updatedCatatan) {
        throw new Error('Gagal mengambil data catatan yang diupdate');
      }
      return updatedCatatan;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Hapus catatan berdasarkan ID
   */
  static async deleteCatatan(
    id: string,
    accessScope: AccessScope
  ): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Cek apakah catatan ada dan user memiliki akses
      const existingCatatan = await this.getCatatanById(id, accessScope);
      if (!existingCatatan) {
        throw new Error('Catatan tidak ditemukan atau tidak memiliki akses');
      }

      // Hanya pemilik atau god user yang bisa delete
      if (!accessScope.isGod && existingCatatan.user_id !== accessScope.userId) {
        throw new Error('Tidak memiliki izin untuk menghapus catatan ini');
      }

      const query = 'DELETE FROM catatan WHERE id = ?';
      const [result] = await connection.execute(query, [id]) as any;

      if (result.affectedRows === 0) {
        throw new Error('Gagal menghapus catatan');
      }

      await connection.commit();
      return true;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Helper method untuk mendapatkan catatan by ID
   */
  private static async getCatatanById(
    id: string,
    accessScope: AccessScope
  ): Promise<Catatan | null> {
    const connection = await pool.getConnection();
    
    try {
      const query = `
        SELECT * FROM catatan 
        WHERE id = ? AND (${this.buildVisibilityFilter(accessScope)})
      `;

      const [rows] = await connection.execute(query, [id]) as any;
      
      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        ...row,
        tags: row.tags ? JSON.parse(row.tags) : null
      };

    } finally {
      connection.release();
    }
  }

  /**
   * Build filter visibilitas untuk query
   */
  private static buildVisibilityFilter(accessScope: AccessScope): string {
    const conditions: string[] = [];

    // User dapat melihat catatan pribadi mereka sendiri
    conditions.push(`(visibilitas = 'pribadi' AND user_id = '${accessScope.userId}')`);

    // User dapat melihat catatan publik
    conditions.push(`visibilitas = 'publik'`);

    // User dapat melihat catatan tenant jika dalam tenant yang sama
    if (accessScope.tenantId) {
      conditions.push(`(visibilitas = 'tenant' AND tenant_id = '${accessScope.tenantId}')`);
    }

    // User dapat melihat catatan toko jika dalam toko yang sama
    if (accessScope.storeId) {
      conditions.push(`(visibilitas = 'toko' AND toko_id = '${accessScope.storeId}')`);
    }

    // God user dapat melihat semua
    if (accessScope.isGod) {
      return '1=1'; // No restriction
    }

    return `(${conditions.join(' OR ')})`;
  }
}