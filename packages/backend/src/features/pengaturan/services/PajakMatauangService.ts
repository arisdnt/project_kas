import { pool } from '@/core/database/connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { v4 as uuidv4 } from 'uuid';
import {
  PajakSetting,
  MatauangSetting,
  CreatePajakRequest,
  UpdatePajakRequest,
  CreateMatauangRequest,
  UpdateMatauangRequest,
  PajakMatauangFilters,
  PajakMatauangStats,
  PajakListResponse,
  MatauangListResponse,
  PajakMatauangStatsResponse,
  createSuccessResponse,
  createErrorResponse,
} from '../models/PajakMatauangModel';

export class PajakMatauangService {
  // ========================================
  // Tax (Pajak) Service Methods
  // ========================================

  /**
   * Get list of tax settings with filters and pagination
   */
  static async searchPajak(
    scope: AccessScope,
    filters: PajakMatauangFilters
  ): Promise<PajakListResponse> {
    const { search = '', status = 'ALL', page = 1, limit = 25 } = filters;
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let params: any[] = [];

    // Search filter
    if (search) {
      whereConditions.push('(p.nama LIKE ? OR p.deskripsi LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    // Status filter
    if (status !== 'ALL') {
      const isActive = status === 'AKTIF' ? 1 : 0;
      whereConditions.push('p.aktif = ?');
      params.push(isActive);
    }

    const whereClause = whereConditions.length > 0 ? `AND ${whereConditions.join(' AND ')}` : '';

    // Count query
    const countSql = `
      SELECT COUNT(*) as total
      FROM pajak_setting p
      WHERE 1=1 ${whereClause}
    `;

    const scopedCountSql = applyScopeToSql(countSql, params, scope, {
      tenantColumn: 'p.tenant_id',
      storeColumn: 'p.toko_id'
    });

    // Data query
    const dataSql = `
      SELECT
        p.id,
        p.tenant_id,
        p.toko_id,
        p.nama,
        p.persentase,
        p.deskripsi,
        p.aktif,
        p.is_default,
        p.dibuat_pada,
        p.diperbarui_pada,
        p.dibuat_oleh,
        p.diperbarui_oleh
      FROM pengaturan_pajak p
      WHERE 1=1 ${whereClause}
      ORDER BY p.is_default DESC, p.nama ASC
      LIMIT ? OFFSET ?
    `;

    const scopedDataSql = applyScopeToSql(dataSql, [...params, limit, offset], scope, {
      tenantColumn: 'p.tenant_id',
      storeColumn: 'p.toko_id'
    });

    try {
      const [countResult] = await pool.execute<RowDataPacket[]>(scopedCountSql.sql, scopedCountSql.params);
      const [dataResult] = await pool.execute<RowDataPacket[]>(scopedDataSql.sql, scopedDataSql.params);

      const total = countResult[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      return createSuccessResponse(dataResult as PajakSetting[], 'Data pajak berhasil diambil') as PajakListResponse & {
        pagination: {
          total: number;
          page: number;
          totalPages: number;
          limit: number;
        };
      } & { pagination: { total: number; page: number; totalPages: number; limit: number; } };
    } catch (error) {
      console.error('Error searching pajak:', error);
      throw new Error('Gagal mengambil data pajak');
    }
  }

  /**
   * Get tax setting by ID
   */
  static async findPajakById(scope: AccessScope, id: string): Promise<PajakSetting | null> {
    const sql = `
      SELECT
        p.id,
        p.tenant_id,
        p.toko_id,
        p.nama,
        p.persentase,
        p.deskripsi,
        p.aktif,
        p.is_default,
        p.dibuat_pada,
        p.diperbarui_pada,
        p.dibuat_oleh,
        p.diperbarui_oleh
      FROM pengaturan_pajak p
      WHERE p.id = ?
    `;

    const scopedSql = applyScopeToSql(sql, [id], scope, {
      tenantColumn: 'p.tenant_id',
      storeColumn: 'p.toko_id'
    });

    try {
      const [result] = await pool.execute<RowDataPacket[]>(scopedSql.sql, scopedSql.params);
      return result[0] as PajakSetting || null;
    } catch (error) {
      console.error('Error finding pajak by ID:', error);
      throw new Error('Gagal mengambil data pajak');
    }
  }

  /**
   * Create new tax setting
   */
  static async createPajak(
    scope: AccessScope,
    data: CreatePajakRequest,
    userId: string
  ): Promise<PajakSetting> {
    const id = uuidv4();
    const now = new Date();

    // If setting as default, remove default from other taxes in the same store
    if (data.is_default) {
      await this.removeDefaultPajak(scope);
    }

    const sql = `
      INSERT INTO pajak_setting (
        id, tenant_id, toko_id, nama, persentase, deskripsi,
        aktif, is_default, dibuat_pada, diperbarui_pada, dibuat_oleh
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      id,
      scope.tenantId,
      scope.storeId,
      data.nama,
      data.persentase,
      data.deskripsi || null,
      data.aktif ? 1 : 0,
      data.is_default ? 1 : 0,
      now,
      now,
      userId
    ];

    try {
      await pool.execute<ResultSetHeader>(sql, params);
      const created = await this.findPajakById(scope, id);
      if (!created) {
        throw new Error('Gagal membuat data pajak');
      }
      return created;
    } catch (error) {
      console.error('Error creating pajak:', error);
      throw new Error('Gagal membuat data pajak');
    }
  }

  /**
   * Update tax setting
   */
  static async updatePajak(
    scope: AccessScope,
    id: string,
    data: UpdatePajakRequest,
    userId: string
  ): Promise<PajakSetting> {
    // If setting as default, remove default from other taxes in the same store
    if (data.is_default) {
      await this.removeDefaultPajak(scope, id);
    }

    const fields: string[] = [];
    const params: any[] = [];

    if (data.nama !== undefined) {
      fields.push('nama = ?');
      params.push(data.nama);
    }
    if (data.persentase !== undefined) {
      fields.push('persentase = ?');
      params.push(data.persentase);
    }
    if (data.deskripsi !== undefined) {
      fields.push('deskripsi = ?');
      params.push(data.deskripsi);
    }
    if (data.aktif !== undefined) {
      fields.push('aktif = ?');
      params.push(data.aktif ? 1 : 0);
    }
    if (data.is_default !== undefined) {
      fields.push('is_default = ?');
      params.push(data.is_default ? 1 : 0);
    }

    if (fields.length === 0) {
      throw new Error('Tidak ada data yang diubah');
    }

    fields.push('diperbarui_pada = ?', 'diperbarui_oleh = ?');
    params.push(new Date(), userId, id);

    const sql = `
      UPDATE pajak_setting
      SET ${fields.join(', ')}
      WHERE id = ?
    `;

    const scopedSql = applyScopeToSql(sql, params, scope, {
      tenantColumn: 'tenant_id',
      storeColumn: 'toko_id'
    });

    try {
      const [result] = await pool.execute<ResultSetHeader>(scopedSql.sql, scopedSql.params);
      if (result.affectedRows === 0) {
        throw new Error('Data pajak tidak ditemukan');
      }

      const updated = await this.findPajakById(scope, id);
      if (!updated) {
        throw new Error('Gagal mengupdate data pajak');
      }
      return updated;
    } catch (error) {
      console.error('Error updating pajak:', error);
      throw new Error('Gagal mengupdate data pajak');
    }
  }

  /**
   * Delete tax setting
   */
  static async deletePajak(scope: AccessScope, id: string): Promise<void> {
    // Check if this is the default tax
    const existingPajak = await this.findPajakById(scope, id);
    if (!existingPajak) {
      throw new Error('Data pajak tidak ditemukan');
    }

    if (existingPajak.is_default) {
      throw new Error('Tidak dapat menghapus pajak default');
    }

    const sql = `DELETE FROM pajak_setting WHERE id = ?`;
    const scopedSql = applyScopeToSql(sql, [id], scope, {
      tenantColumn: 'tenant_id',
      storeColumn: 'toko_id'
    });

    try {
      const [result] = await pool.execute<ResultSetHeader>(scopedSql.sql, scopedSql.params);
      if (result.affectedRows === 0) {
        throw new Error('Data pajak tidak ditemukan');
      }
    } catch (error) {
      console.error('Error deleting pajak:', error);
      throw new Error('Gagal menghapus data pajak');
    }
  }

  /**
   * Remove default flag from all taxes except the specified one
   */
  private static async removeDefaultPajak(scope: AccessScope, exceptId?: string): Promise<void> {
    let sql = `
      UPDATE pajak_setting
      SET is_default = 0
      WHERE tenant_id = ? AND toko_id = ?
    `;
    let params = [scope.tenantId, scope.storeId];

    if (exceptId) {
      sql += ' AND id != ?';
      params.push(exceptId);
    }

    try {
      await pool.execute<ResultSetHeader>(sql, params);
    } catch (error) {
      console.error('Error removing default pajak:', error);
      throw new Error('Gagal mengupdate pajak default');
    }
  }

  // ========================================
  // Currency (Mata Uang) Service Methods
  // ========================================

  /**
   * Get list of currency settings with filters and pagination
   */
  static async searchMatauang(
    scope: AccessScope,
    filters: PajakMatauangFilters
  ): Promise<MatauangListResponse> {
    const { search = '', status = 'ALL', page = 1, limit = 25 } = filters;
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let params: any[] = [];

    // Search filter
    if (search) {
      whereConditions.push('(m.nama LIKE ? OR m.kode LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    // Status filter
    if (status !== 'ALL') {
      const isActive = status === 'AKTIF' ? 1 : 0;
      whereConditions.push('m.aktif = ?');
      params.push(isActive);
    }

    const whereClause = whereConditions.length > 0 ? `AND ${whereConditions.join(' AND ')}` : '';

    // Count query
    const countSql = `
      SELECT COUNT(*) as total
      FROM pengaturan_mata_uang m
      WHERE 1=1 ${whereClause}
    `;

    const scopedCountSql = applyScopeToSql(countSql, params, scope, {
      tenantColumn: 'm.tenant_id',
      storeColumn: 'm.toko_id'
    });

    // Data query
    const dataSql = `
      SELECT
        m.id,
        m.tenant_id,
        m.toko_id,
        m.kode,
        m.nama,
        m.simbol,
        m.format_tampilan,
        m.pemisah_desimal,
        m.pemisah_ribuan,
        m.jumlah_desimal,
        m.aktif,
        m.is_default,
        m.dibuat_pada,
        m.diperbarui_pada,
        m.dibuat_oleh,
        m.diperbarui_oleh
      FROM pengaturan_mata_uang m
      WHERE 1=1 ${whereClause}
      ORDER BY m.is_default DESC, m.kode ASC
      LIMIT ? OFFSET ?
    `;

    const scopedDataSql = applyScopeToSql(dataSql, [...params, limit, offset], scope, {
      tenantColumn: 'm.tenant_id',
      storeColumn: 'm.toko_id'
    });

    try {
      const [countResult] = await pool.execute<RowDataPacket[]>(scopedCountSql.sql, scopedCountSql.params);
      const [dataResult] = await pool.execute<RowDataPacket[]>(scopedDataSql.sql, scopedDataSql.params);

      const total = countResult[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      return createSuccessResponse(dataResult as MatauangSetting[], 'Data mata uang berhasil diambil') as MatauangListResponse & {
        pagination: {
          total: number;
          page: number;
          totalPages: number;
          limit: number;
        };
      } & { pagination: { total: number; page: number; totalPages: number; limit: number; } };
    } catch (error) {
      console.error('Error searching mata uang:', error);
      throw new Error('Gagal mengambil data mata uang');
    }
  }

  /**
   * Get currency setting by ID
   */
  static async findMatauangById(scope: AccessScope, id: string): Promise<MatauangSetting | null> {
    const sql = `
      SELECT
        m.id,
        m.tenant_id,
        m.toko_id,
        m.kode,
        m.nama,
        m.simbol,
        m.format_tampilan,
        m.pemisah_desimal,
        m.pemisah_ribuan,
        m.jumlah_desimal,
        m.aktif,
        m.is_default,
        m.dibuat_pada,
        m.diperbarui_pada,
        m.dibuat_oleh,
        m.diperbarui_oleh
      FROM pengaturan_mata_uang m
      WHERE m.id = ?
    `;

    const scopedSql = applyScopeToSql(sql, [id], scope, {
      tenantColumn: 'm.tenant_id',
      storeColumn: 'm.toko_id'
    });

    try {
      const [result] = await pool.execute<RowDataPacket[]>(scopedSql.sql, scopedSql.params);
      return result[0] as MatauangSetting || null;
    } catch (error) {
      console.error('Error finding mata uang by ID:', error);
      throw new Error('Gagal mengambil data mata uang');
    }
  }

  /**
   * Create new currency setting
   */
  static async createMatauang(
    scope: AccessScope,
    data: CreateMatauangRequest,
    userId: string
  ): Promise<MatauangSetting> {
    const id = uuidv4();
    const now = new Date();

    // If setting as default, remove default from other currencies in the same store
    if (data.is_default) {
      await this.removeDefaultMatauang(scope);
    }

    const sql = `
      INSERT INTO mata_uang_setting (
        id, tenant_id, toko_id, kode, nama, simbol, format_tampilan,
        pemisah_desimal, pemisah_ribuan, jumlah_desimal,
        aktif, is_default, dibuat_pada, diperbarui_pada, dibuat_oleh
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      id,
      scope.tenantId,
      scope.storeId,
      data.kode.toUpperCase(),
      data.nama,
      data.simbol,
      data.format_tampilan,
      data.pemisah_desimal,
      data.pemisah_ribuan,
      data.jumlah_desimal,
      data.aktif ? 1 : 0,
      data.is_default ? 1 : 0,
      now,
      now,
      userId
    ];

    try {
      await pool.execute<ResultSetHeader>(sql, params);
      const created = await this.findMatauangById(scope, id);
      if (!created) {
        throw new Error('Gagal membuat data mata uang');
      }
      return created;
    } catch (error: any) {
      console.error('Error creating mata uang:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Kode mata uang sudah ada untuk toko ini');
      }
      throw new Error('Gagal membuat data mata uang');
    }
  }

  /**
   * Update currency setting
   */
  static async updateMatauang(
    scope: AccessScope,
    id: string,
    data: UpdateMatauangRequest,
    userId: string
  ): Promise<MatauangSetting> {
    // If setting as default, remove default from other currencies in the same store
    if (data.is_default) {
      await this.removeDefaultMatauang(scope, id);
    }

    const fields: string[] = [];
    const params: any[] = [];

    if (data.kode !== undefined) {
      fields.push('kode = ?');
      params.push(data.kode.toUpperCase());
    }
    if (data.nama !== undefined) {
      fields.push('nama = ?');
      params.push(data.nama);
    }
    if (data.simbol !== undefined) {
      fields.push('simbol = ?');
      params.push(data.simbol);
    }
    if (data.format_tampilan !== undefined) {
      fields.push('format_tampilan = ?');
      params.push(data.format_tampilan);
    }
    if (data.pemisah_desimal !== undefined) {
      fields.push('pemisah_desimal = ?');
      params.push(data.pemisah_desimal);
    }
    if (data.pemisah_ribuan !== undefined) {
      fields.push('pemisah_ribuan = ?');
      params.push(data.pemisah_ribuan);
    }
    if (data.jumlah_desimal !== undefined) {
      fields.push('jumlah_desimal = ?');
      params.push(data.jumlah_desimal);
    }
    if (data.aktif !== undefined) {
      fields.push('aktif = ?');
      params.push(data.aktif ? 1 : 0);
    }
    if (data.is_default !== undefined) {
      fields.push('is_default = ?');
      params.push(data.is_default ? 1 : 0);
    }

    if (fields.length === 0) {
      throw new Error('Tidak ada data yang diubah');
    }

    fields.push('diperbarui_pada = ?', 'diperbarui_oleh = ?');
    params.push(new Date(), userId, id);

    const sql = `
      UPDATE mata_uang_setting
      SET ${fields.join(', ')}
      WHERE id = ?
    `;

    const scopedSql = applyScopeToSql(sql, params, scope, {
      tenantColumn: 'tenant_id',
      storeColumn: 'toko_id'
    });

    try {
      const [result] = await pool.execute<ResultSetHeader>(scopedSql.sql, scopedSql.params);
      if (result.affectedRows === 0) {
        throw new Error('Data mata uang tidak ditemukan');
      }

      const updated = await this.findMatauangById(scope, id);
      if (!updated) {
        throw new Error('Gagal mengupdate data mata uang');
      }
      return updated;
    } catch (error: any) {
      console.error('Error updating mata uang:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Kode mata uang sudah ada untuk toko ini');
      }
      throw new Error('Gagal mengupdate data mata uang');
    }
  }

  /**
   * Delete currency setting
   */
  static async deleteMatauang(scope: AccessScope, id: string): Promise<void> {
    // Check if this is the default currency
    const existingMatauang = await this.findMatauangById(scope, id);
    if (!existingMatauang) {
      throw new Error('Data mata uang tidak ditemukan');
    }

    if (existingMatauang.is_default) {
      throw new Error('Tidak dapat menghapus mata uang default');
    }

    const sql = `DELETE FROM mata_uang_setting WHERE id = ?`;
    const scopedSql = applyScopeToSql(sql, [id], scope, {
      tenantColumn: 'tenant_id',
      storeColumn: 'toko_id'
    });

    try {
      const [result] = await pool.execute<ResultSetHeader>(scopedSql.sql, scopedSql.params);
      if (result.affectedRows === 0) {
        throw new Error('Data mata uang tidak ditemukan');
      }
    } catch (error) {
      console.error('Error deleting mata uang:', error);
      throw new Error('Gagal menghapus data mata uang');
    }
  }

  /**
   * Remove default flag from all currencies except the specified one
   */
  private static async removeDefaultMatauang(scope: AccessScope, exceptId?: string): Promise<void> {
    let sql = `
      UPDATE mata_uang_setting
      SET is_default = 0
      WHERE tenant_id = ? AND toko_id = ?
    `;
    let params = [scope.tenantId, scope.storeId];

    if (exceptId) {
      sql += ' AND id != ?';
      params.push(exceptId);
    }

    try {
      await pool.execute<ResultSetHeader>(sql, params);
    } catch (error) {
      console.error('Error removing default mata uang:', error);
      throw new Error('Gagal mengupdate mata uang default');
    }
  }

  // ========================================
  // Statistics Methods
  // ========================================

  /**
   * Get statistics for tax and currency settings
   */
  static async getStats(scope: AccessScope): Promise<PajakMatauangStats> {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM pajak_setting WHERE tenant_id = ? AND toko_id = ?) as total_pajak,
        (SELECT COUNT(*) FROM pajak_setting WHERE tenant_id = ? AND toko_id = ? AND aktif = 1) as pajak_aktif,
        (SELECT COUNT(*) FROM mata_uang_setting WHERE tenant_id = ? AND toko_id = ?) as total_mata_uang,
        (SELECT COUNT(*) FROM mata_uang_setting WHERE tenant_id = ? AND toko_id = ? AND aktif = 1) as mata_uang_aktif
    `;

    const params = [
      scope.tenantId, scope.storeId,
      scope.tenantId, scope.storeId,
      scope.tenantId, scope.storeId,
      scope.tenantId, scope.storeId
    ];

    try {
      const [result] = await pool.execute<RowDataPacket[]>(sql, params);
      return result[0] as PajakMatauangStats;
    } catch (error) {
      console.error('Error getting stats:', error);
      throw new Error('Gagal mengambil statistik');
    }
  }
}