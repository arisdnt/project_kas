/**
 * Service untuk mutation operations berita
 * Menangani operasi create, update, delete dengan validasi dan otorisasi
 */

import { pool } from '@/core/database/connection';
import { AccessScope, getInsertScope } from '@/core/middleware/accessScope';
import {
  CreateBerita,
  UpdateBerita,
  BeritaWithUser,
  CreateBeritaSchema,
  UpdateBeritaSchema
} from '../../models/BeritaCore';
import { v4 as uuidv4 } from 'uuid';
import { BeritaRealtimeService } from '../BeritaRealtimeService';

export class BeritaMutationService {
  /**
   * Membuat berita baru
   */
  static async createBerita(
    data: CreateBerita, 
    accessScope: AccessScope
  ): Promise<BeritaWithUser> {
    // Validasi data input
    const validatedData = CreateBeritaSchema.parse(data);
    
    // Validasi otorisasi - hanya level 1-3 yang bisa membuat berita
    if (!accessScope.isGod && (accessScope.level || 5) > 3) {
      throw new Error('Anda tidak memiliki izin untuk membuat berita');
    }

    // Tentukan scope untuk insert
    const insertScope = getInsertScope(accessScope);
    const beritaId = uuidv4();

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Validasi target toko jika diperlukan
      if (validatedData.targetTampil === 'toko_tertentu' && validatedData.targetTokoIds) {
        await this.validateTargetTokos(validatedData.targetTokoIds, accessScope, connection);
      }

      // Insert berita baru
      const insertQuery = `
        INSERT INTO berita (
          id, tenant_id, toko_id, user_id, judul, konten, tipe_berita,
          target_tampil, target_toko_ids, target_tenant_ids, jadwal_mulai,
          jadwal_selesai, interval_tampil_menit, maksimal_tampil, prioritas,
          status, gambar_url, lampiran_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const insertParams = [
        beritaId,
        insertScope.tenantId,
        insertScope.storeId || null,
        accessScope.userId,
        validatedData.judul,
        validatedData.konten,
        validatedData.tipeBerita,
        validatedData.targetTampil,
        validatedData.targetTokoIds ? JSON.stringify(validatedData.targetTokoIds) : null,
        validatedData.targetTenantIds ? JSON.stringify(validatedData.targetTenantIds) : null,
        validatedData.jadwalMulai,
        validatedData.jadwalSelesai || null,
        validatedData.intervalTampilMenit,
        validatedData.maksimalTampil || null,
        validatedData.prioritas,
        validatedData.status,
        validatedData.gambarUrl || null,
        validatedData.lampiranUrl || null
      ];

      await connection.execute(insertQuery, insertParams);
      await connection.commit();

      // Ambil data berita yang baru dibuat
      const berita = await this.getBeritaById(beritaId, accessScope);
      BeritaRealtimeService.emitCreated(berita);
      return berita;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update berita
   */
  static async updateBerita(
    id: string, 
    data: UpdateBerita, 
    accessScope: AccessScope
  ): Promise<BeritaWithUser> {
    // Validasi data input
    const validatedData = UpdateBeritaSchema.parse(data);
    
    // Cek apakah berita exists dan user memiliki akses
    const existingBerita = await this.getBeritaById(id, accessScope);
    if (!existingBerita) {
      throw new Error('Berita tidak ditemukan atau Anda tidak memiliki akses');
    }

    // Validasi otorisasi - hanya pembuat atau level lebih tinggi yang bisa update
    if (!accessScope.isGod && 
        existingBerita.userId !== accessScope.userId && 
        (accessScope.level || 5) > 2) {
      throw new Error('Anda tidak memiliki izin untuk mengubah berita ini');
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Validasi target toko jika diperlukan
      if (validatedData.targetTampil === 'toko_tertentu' && validatedData.targetTokoIds) {
        await this.validateTargetTokos(validatedData.targetTokoIds, accessScope, connection);
      }

      // Build update query dinamis
      const updateFields: string[] = [];
      const updateParams: any[] = [];

      Object.entries(validatedData).forEach(([key, value]) => {
        if (value !== undefined) {
          const dbField = this.getDbFieldName(key);
          if (key === 'targetTokoIds' || key === 'targetTenantIds') {
            updateFields.push(`${dbField} = ?`);
            updateParams.push(value ? JSON.stringify(value) : null);
          } else {
            updateFields.push(`${dbField} = ?`);
            updateParams.push(value);
          }
        }
      });

      if (updateFields.length === 0) {
        throw new Error('Tidak ada data yang akan diupdate');
      }

      const updateQuery = `
        UPDATE berita 
        SET ${updateFields.join(', ')}, diperbarui_pada = NOW()
        WHERE id = ?
      `;
      updateParams.push(id);

      await connection.execute(updateQuery, updateParams);
      await connection.commit();

      // Ambil data berita yang sudah diupdate
      const berita = await this.getBeritaById(id, accessScope);
      BeritaRealtimeService.emitUpdated(berita);
      return berita;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Hapus berita
   */
  static async deleteBerita(id: string, accessScope: AccessScope): Promise<void> {
    // Cek apakah berita exists dan user memiliki akses
    const existingBerita = await this.getBeritaById(id, accessScope);
    if (!existingBerita) {
      throw new Error('Berita tidak ditemukan atau Anda tidak memiliki akses');
    }

    // Validasi otorisasi - hanya pembuat atau level lebih tinggi yang bisa hapus
    if (!accessScope.isGod && 
        existingBerita.userId !== accessScope.userId && 
        (accessScope.level || 5) > 2) {
      throw new Error('Anda tidak memiliki izin untuk menghapus berita ini');
    }

    const deleteQuery = 'DELETE FROM berita WHERE id = ?';
    await pool.execute(deleteQuery, [id]);
    BeritaRealtimeService.emitDeleted(id, existingBerita.tenantId, existingBerita.targetTenantIds ?? null);
  }

  /**
   * Mendapatkan berita berdasarkan ID (internal method)
   */
  private static async getBeritaById(id: string, accessScope: AccessScope): Promise<BeritaWithUser> {
    const query = `
      SELECT 
        b.id, b.tenant_id as tenantId, b.toko_id as tokoId, b.user_id as userId,
        b.judul, b.konten, b.tipe_berita as tipeBerita, b.target_tampil as targetTampil,
        b.target_toko_ids as targetTokoIds, b.target_tenant_ids as targetTenantIds,
        b.jadwal_mulai as jadwalMulai, b.jadwal_selesai as jadwalSelesai,
        b.interval_tampil_menit as intervalTampilMenit, b.maksimal_tampil as maksimalTampil,
        b.prioritas, b.status, b.gambar_url as gambarUrl, b.lampiran_url as lampiranUrl,
        b.dibuat_pada as dibuatPada, b.diperbarui_pada as diperbaruiPada,
        u.username as namaUser, t.nama as namaToko
      FROM berita b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN toko t ON b.toko_id = t.id
      WHERE b.id = ?
    `;

    const [rows] = await pool.execute(query, [id]);
    const result = rows as any[];

    if (result.length === 0) {
      throw new Error('Berita tidak ditemukan');
    }

    const row = result[0];
    return {
      ...row,
      targetTokoIds: row.targetTokoIds ? JSON.parse(row.targetTokoIds) : null,
      targetTenantIds: row.targetTenantIds ? JSON.parse(row.targetTenantIds) : null,
      jadwalMulai: new Date(row.jadwalMulai),
      jadwalSelesai: row.jadwalSelesai ? new Date(row.jadwalSelesai) : null,
      dibuatPada: new Date(row.dibuatPada),
      diperbaruiPada: new Date(row.diperbaruiPada)
    };
  }

  /**
   * Validasi target toko berdasarkan akses user
   */
  private static async validateTargetTokos(
    targetTokoIds: string[], 
    accessScope: AccessScope, 
    connection: any
  ): Promise<void> {
    if (accessScope.isGod) return; // God user bisa target toko manapun

    // Cek apakah semua target toko ada dalam tenant user
    const query = `
      SELECT COUNT(*) as count 
      FROM toko 
      WHERE id IN (${targetTokoIds.map(() => '?').join(',')}) 
      AND tenant_id = ?
    `;
    const params = [...targetTokoIds, accessScope.tenantId];

    const [rows] = await connection.execute(query, params);
    const result = (rows as any[])[0];

    if (result.count !== targetTokoIds.length) {
      throw new Error('Beberapa toko target tidak valid atau tidak dalam akses Anda');
    }
  }

  /**
   * Mapping nama field ke nama kolom database
   */
  private static getDbFieldName(fieldName: string): string {
    const fieldMapping: Record<string, string> = {
      'judul': 'judul',
      'konten': 'konten',
      'tipeBerita': 'tipe_berita',
      'targetTampil': 'target_tampil',
      'targetTokoIds': 'target_toko_ids',
      'targetTenantIds': 'target_tenant_ids',
      'jadwalMulai': 'jadwal_mulai',
      'jadwalSelesai': 'jadwal_selesai',
      'intervalTampilMenit': 'interval_tampil_menit',
      'maksimalTampil': 'maksimal_tampil',
      'prioritas': 'prioritas',
      'status': 'status',
      'gambarUrl': 'gambar_url',
      'lampiranUrl': 'lampiran_url'
    };

    return fieldMapping[fieldName] || fieldName;
  }
}
