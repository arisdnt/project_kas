/**
 * Service untuk query operations berita
 * Menangani pencarian, filter, dan news tracker functionality
 */

import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';
import { 
  Berita, 
  BeritaWithUser, 
  SearchBeritaQuery, 
  BeritaStats,
  TipeBerita,
  TargetTampil,
  PrioritasBerita,
  StatusBerita
} from '../../models/BeritaCore';

export class BeritaQueryService {
  /**
   * Pencarian berita dengan filter dan pagination
   */
  static async searchBerita(
    query: SearchBeritaQuery, 
    accessScope: AccessScope
  ): Promise<{ data: BeritaWithUser[]; total: number }> {
    const { q, tipeBerita, targetTampil, prioritas, status, jadwalMulaiDari, jadwalMulaiSampai, page, limit, sortBy, sortOrder } = query;
    
    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const params: any[] = [];

    // Base query dengan JOIN untuk mendapatkan nama user dan toko
    let baseQuery = `
      FROM berita b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN toko t ON b.toko_id = t.id
      WHERE 1=1
    `;

    // Filter berdasarkan access scope
    const visibilityFilter = this.buildVisibilityFilter(accessScope);
    if (visibilityFilter.clause) {
      baseQuery += ` AND ${visibilityFilter.clause}`;
      params.push(...visibilityFilter.params);
    }

    // Filter pencarian teks
    if (q) {
      conditions.push(`(b.judul LIKE ? OR b.konten LIKE ?)`);
      params.push(`%${q}%`, `%${q}%`);
    }

    // Filter berdasarkan tipe berita
    if (tipeBerita) {
      conditions.push(`b.tipe_berita = ?`);
      params.push(tipeBerita);
    }

    // Filter berdasarkan target tampil
    if (targetTampil) {
      conditions.push(`b.target_tampil = ?`);
      params.push(targetTampil);
    }

    // Filter berdasarkan prioritas
    if (prioritas) {
      conditions.push(`b.prioritas = ?`);
      params.push(prioritas);
    }

    // Filter berdasarkan status
    if (status) {
      conditions.push(`b.status = ?`);
      params.push(status);
    }

    // Filter berdasarkan jadwal mulai
    if (jadwalMulaiDari) {
      conditions.push(`b.jadwal_mulai >= ?`);
      params.push(new Date(jadwalMulaiDari));
    }

    if (jadwalMulaiSampai) {
      conditions.push(`b.jadwal_mulai <= ?`);
      params.push(new Date(jadwalMulaiSampai));
    }

    // Tambahkan kondisi ke query
    if (conditions.length > 0) {
      baseQuery += ` AND ${conditions.join(' AND ')}`;
    }

    // Query untuk menghitung total
    const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
    const [countResult] = await pool.execute(countQuery, params);
    const total = (countResult as any)[0].total;

    // Query untuk mendapatkan data dengan pagination
    const sortColumn = this.getSortColumn(sortBy);
    const dataQuery = `
      SELECT 
        b.id,
        b.tenant_id as tenantId,
        b.toko_id as tokoId,
        b.user_id as userId,
        b.judul,
        b.konten,
        b.tipe_berita as tipeBerita,
        b.target_tampil as targetTampil,
        b.target_toko_ids as targetTokoIds,
        b.target_tenant_ids as targetTenantIds,
        b.jadwal_mulai as jadwalMulai,
        b.jadwal_selesai as jadwalSelesai,
        b.interval_tampil_menit as intervalTampilMenit,
        b.maksimal_tampil as maksimalTampil,
        b.prioritas,
        b.status,
        b.gambar_url as gambarUrl,
        b.lampiran_url as lampiranUrl,
        b.dibuat_pada as dibuatPada,
        b.diperbarui_pada as diperbaruiPada,
        u.username as namaUser,
        t.nama as namaToko
      ${baseQuery}
      ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [rows] = await pool.execute(dataQuery, params);
    const data = (rows as any[]).map(row => ({
      ...row,
      targetTokoIds: row.targetTokoIds ? JSON.parse(row.targetTokoIds) : null,
      targetTenantIds: row.targetTenantIds ? JSON.parse(row.targetTenantIds) : null,
      jadwalMulai: new Date(row.jadwalMulai),
      jadwalSelesai: row.jadwalSelesai ? new Date(row.jadwalSelesai) : null,
      dibuatPada: new Date(row.dibuatPada),
      diperbaruiPada: new Date(row.diperbaruiPada)
    }));

    return { data, total };
  }

  /**
   * Mencari berita berdasarkan ID
   */
  static async findById(id: string, accessScope: AccessScope): Promise<BeritaWithUser | null> {
    const visibilityFilter = this.buildVisibilityFilter(accessScope);
    let whereClause = 'WHERE b.id = ?';
    const params = [id];

    if (visibilityFilter.clause) {
      whereClause += ` AND ${visibilityFilter.clause}`;
      params.push(...visibilityFilter.params);
    }

    const query = `
      SELECT 
        b.id,
        b.tenant_id as tenantId,
        b.toko_id as tokoId,
        b.user_id as userId,
        b.judul,
        b.konten,
        b.tipe_berita as tipeBerita,
        b.target_tampil as targetTampil,
        b.target_toko_ids as targetTokoIds,
        b.target_tenant_ids as targetTenantIds,
        b.jadwal_mulai as jadwalMulai,
        b.jadwal_selesai as jadwalSelesai,
        b.interval_tampil_menit as intervalTampilMenit,
        b.maksimal_tampil as maksimalTampil,
        b.prioritas,
        b.status,
        b.gambar_url as gambarUrl,
        b.lampiran_url as lampiranUrl,
        b.dibuat_pada as dibuatPada,
        b.diperbarui_pada as diperbaruiPada,
        u.username as namaUser,
        t.nama as namaToko
      FROM berita b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN toko t ON b.toko_id = t.id
      ${whereClause}
    `;

    const [rows] = await pool.execute(query, params);
    const result = rows as any[];

    if (result.length === 0) return null;

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
   * Mendapatkan statistik berita
   */
  static async getStats(accessScope: AccessScope): Promise<BeritaStats> {
    const visibilityFilter = this.buildVisibilityFilter(accessScope);
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (visibilityFilter.clause) {
      whereClause += ` AND ${visibilityFilter.clause}`;
      params.push(...visibilityFilter.params);
    }

    const query = `
      SELECT 
        COUNT(*) as totalBerita,
        SUM(CASE WHEN status = 'aktif' THEN 1 ELSE 0 END) as totalAktif,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as totalDraft,
        SUM(CASE WHEN status = 'kedaluwarsa' THEN 1 ELSE 0 END) as totalKedaluwarsa,
        SUM(CASE WHEN prioritas = 'urgent' THEN 1 ELSE 0 END) as beritaUrgent,
        SUM(CASE WHEN DATE(dibuat_pada) = CURDATE() THEN 1 ELSE 0 END) as beritaHariIni
      FROM berita b
      ${whereClause}
    `;

    const [rows] = await pool.execute(query, params);
    const result = (rows as any[])[0];

    return {
      totalBerita: result.totalBerita || 0,
      totalAktif: result.totalAktif || 0,
      totalDraft: result.totalDraft || 0,
      totalKedaluwarsa: result.totalKedaluwarsa || 0,
      beritaUrgent: result.beritaUrgent || 0,
      beritaHariIni: result.beritaHariIni || 0
    };
  }

  /**
   * Mendapatkan berita aktif untuk news tracker
   */
  static async getActiveNews(accessScope: AccessScope): Promise<BeritaWithUser[]> {
    const visibilityFilter = this.buildVisibilityFilter(accessScope);
    let whereClause = `
      WHERE b.status = 'aktif' 
      AND b.jadwal_mulai <= NOW() 
      AND (b.jadwal_selesai IS NULL OR b.jadwal_selesai >= NOW())
    `;
    const params: any[] = [];

    if (visibilityFilter.clause) {
      whereClause += ` AND ${visibilityFilter.clause}`;
      params.push(...visibilityFilter.params);
    }

    const query = `
      SELECT 
        b.id,
        b.tenant_id as tenantId,
        b.toko_id as tokoId,
        b.user_id as userId,
        b.judul,
        b.konten,
        b.tipe_berita as tipeBerita,
        b.target_tampil as targetTampil,
        b.target_toko_ids as targetTokoIds,
        b.target_tenant_ids as targetTenantIds,
        b.jadwal_mulai as jadwalMulai,
        b.jadwal_selesai as jadwalSelesai,
        b.interval_tampil_menit as intervalTampilMenit,
        b.maksimal_tampil as maksimalTampil,
        b.prioritas,
        b.status,
        b.gambar_url as gambarUrl,
        b.lampiran_url as lampiranUrl,
        b.dibuat_pada as dibuatPada,
        b.diperbarui_pada as diperbaruiPada,
        u.username as namaUser,
        t.nama as namaToko
      FROM berita b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN toko t ON b.toko_id = t.id
      ${whereClause}
      ORDER BY 
        CASE b.prioritas 
          WHEN 'urgent' THEN 1 
          WHEN 'tinggi' THEN 2 
          WHEN 'normal' THEN 3 
          WHEN 'rendah' THEN 4 
        END,
        b.jadwal_mulai DESC
    `;

    const [rows] = await pool.execute(query, params);
    return (rows as any[]).map(row => ({
      ...row,
      targetTokoIds: row.targetTokoIds ? JSON.parse(row.targetTokoIds) : null,
      targetTenantIds: row.targetTenantIds ? JSON.parse(row.targetTenantIds) : null,
      jadwalMulai: new Date(row.jadwalMulai),
      jadwalSelesai: row.jadwalSelesai ? new Date(row.jadwalSelesai) : null,
      dibuatPada: new Date(row.dibuatPada),
      diperbaruiPada: new Date(row.diperbaruiPada)
    }));
  }

  /**
   * Membangun filter visibilitas berdasarkan access scope
   */
  private static buildVisibilityFilter(accessScope: AccessScope): { clause: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];

    // God user bisa melihat semua berita
    if (accessScope.isGod) {
      return { clause: '', params: [] };
    }

    // Filter berdasarkan tenant
    conditions.push('b.tenant_id = ?');
    params.push(accessScope.tenantId);

    // Filter berdasarkan target tampil dan akses user
    const targetConditions: string[] = [];

    // Berita untuk semua tenant (hanya God user yang bisa buat)
    if (accessScope.isGod) {
      targetConditions.push("b.target_tampil = 'semua_tenant'");
    }

    // Berita untuk semua toko dalam tenant
    targetConditions.push("b.target_tampil = 'semua_toko_tenant'");

    // Berita untuk toko tertentu
    if (accessScope.storeId) {
      targetConditions.push(`
        (b.target_tampil = 'toko_tertentu' AND 
         (b.toko_id = ? OR JSON_CONTAINS(b.target_toko_ids, JSON_QUOTE(?))))
      `);
      params.push(accessScope.storeId, accessScope.storeId);
    }

    if (targetConditions.length > 0) {
      conditions.push(`(${targetConditions.join(' OR ')})`);
    }

    return {
      clause: conditions.join(' AND '),
      params
    };
  }

  /**
   * Mendapatkan kolom untuk sorting
   */
  private static getSortColumn(sortBy: string): string {
    const sortColumns: Record<string, string> = {
      'dibuat_pada': 'b.dibuat_pada',
      'jadwal_mulai': 'b.jadwal_mulai',
      'prioritas': `CASE b.prioritas 
        WHEN 'urgent' THEN 1 
        WHEN 'tinggi' THEN 2 
        WHEN 'normal' THEN 3 
        WHEN 'rendah' THEN 4 
      END`,
      'judul': 'b.judul'
    };

    return sortColumns[sortBy] || 'b.dibuat_pada';
  }
}