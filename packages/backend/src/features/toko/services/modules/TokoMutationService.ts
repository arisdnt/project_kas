/**
 * Store Mutation Service Module
 * Handles store creation, updates and configuration operations
 */

import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { CreateToko, UpdateToko, CreateTokoConfig, UpdateTokoConfig, BulkUpdateOperatingHours } from '../../models/TokoCore';

export class TokoMutationService {
  static async create(scope: AccessScope, data: CreateToko) {
    // Check if code already exists
    const [existingRows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM toko WHERE kode = ? AND tenant_id = ?',
      [data.kode, data.tenant_id]
    );

    if (existingRows.length > 0) {
      throw new Error('Store code already exists');
    }

    const id = uuidv4();

    const sql = `
      INSERT INTO toko (
        id, tenant_id, nama, kode, alamat, telepon, email, status,
        timezone, mata_uang, logo_url, dibuat_pada, diperbarui_pada
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
      )
    `;

    const params = [
      id, data.tenant_id, data.nama, data.kode, data.alamat,
      data.telepon, data.email, data.status, data.timezone,
      data.mata_uang, data.logo_url
    ];

    await pool.query(sql, params);

    // TODO: Create default operating hours when table exists
    // await this.createDefaultOperatingHours(id);

    // TODO: Create default configurations when table exists
    // await this.createDefaultConfigurations(id);

    // Return created store
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM toko WHERE id = ?',
      [id]
    );

    return rows[0];
  }

  static async update(scope: AccessScope, id: string, data: UpdateToko) {
    // Check if store exists and user has access
    const checkSql = `
      SELECT id FROM toko
      WHERE id = ? AND tenant_id = ?
    `;
    const [checkRows] = await pool.execute<RowDataPacket[]>(checkSql, [id, scope.tenantId]);

    if (checkRows.length === 0) {
      throw new Error('Store not found or access denied');
    }

    // Check if code already exists (if updating code)
    if (data.kode) {
      const [existingRows] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM toko WHERE kode = ? AND tenant_id = ? AND id != ?',
        [data.kode, scope.tenantId, id]
      );

      if (existingRows.length > 0) {
        throw new Error('Store code already exists');
      }
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (data.nama !== undefined) {
      updates.push('nama = ?');
      params.push(data.nama);
    }

    if (data.kode !== undefined) {
      updates.push('kode = ?');
      params.push(data.kode);
    }

    if (data.alamat !== undefined) {
      updates.push('alamat = ?');
      params.push(data.alamat);
    }

    if (data.telepon !== undefined) {
      updates.push('telepon = ?');
      params.push(data.telepon);
    }

    if (data.email !== undefined) {
      updates.push('email = ?');
      params.push(data.email);
    }

    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }

    if (data.timezone !== undefined) {
      updates.push('timezone = ?');
      params.push(data.timezone);
    }

    if (data.mata_uang !== undefined) {
      updates.push('mata_uang = ?');
      params.push(data.mata_uang);
    }

    if (data.logo_url !== undefined) {
      updates.push('logo_url = ?');
      params.push(data.logo_url);
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push('diperbarui_pada = NOW()');
    const sql = `UPDATE toko SET ${updates.join(', ')} WHERE id = ?`;
    params.push(id);

    await pool.execute(sql, params);

    // Return updated store
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM toko WHERE id = ?',
      [id]
    );

    return rows[0];
  }

  static async delete(scope: AccessScope, id: string) {
    // Soft delete - set status to nonaktif
    const sql = `UPDATE toko SET status = 'nonaktif', diperbarui_pada = NOW() WHERE id = ?`;
    
    const scopedQuery = applyScopeToSql(sql, [id], scope, {
      tenantColumn: 'tenant_id',
      storeColumn: undefined // Allow deletion across stores for admins
    });

    const [result] = await pool.query<ResultSetHeader>(scopedQuery.sql, scopedQuery.params);

    if (result.affectedRows === 0) {
      throw new Error('Store not found or access denied');
    }

    return { id, deleted: true };
  }

  static async setConfig(scope: AccessScope, tokoId: string, data: CreateTokoConfig) {
    // Verify store access
    const [storeRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM toko WHERE id = ? AND tenant_id = ?',
      [tokoId, scope.tenantId]
    );

    if (storeRows.length === 0) {
      throw new Error('Store not found or access denied');
    }

    // Check if config already exists
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM toko_config WHERE toko_id = ? AND key = ?',
      [tokoId, data.key]
    );

    if (existingRows.length > 0) {
      // Update existing config
      const sql = `
        UPDATE toko_config
        SET value = ?, deskripsi = ?, diperbarui_pada = NOW()
        WHERE toko_id = ? AND key = ?
      `;
      await pool.execute(sql, [data.value, data.deskripsi, tokoId, data.key]);
    } else {
      // Create new config
      const id = uuidv4();
      const sql = `
        INSERT INTO toko_config (
          id, toko_id, key, value, tipe, deskripsi, is_public,
          dibuat_pada, diperbarui_pada
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      await pool.execute(sql, [
        id, tokoId, data.key, data.value, data.tipe,
        data.deskripsi, data.is_public ? 1 : 0
      ]);
    }

    // Return updated config
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM toko_config WHERE toko_id = ? AND key = ?',
      [tokoId, data.key]
    );

    return rows[0];
  }

  static async updateConfig(scope: AccessScope, tokoId: string, key: string, data: UpdateTokoConfig) {
    // Verify store access and config exists
    const [configRows] = await pool.execute<RowDataPacket[]>(
      `SELECT tc.id FROM toko_config tc
       JOIN toko t ON tc.toko_id = t.id
       WHERE tc.toko_id = ? AND tc.key = ? AND t.tenant_id = ?`,
      [tokoId, key, scope.tenantId]
    );

    if (configRows.length === 0) {
      throw new Error('Store configuration not found or access denied');
    }

    const sql = `
      UPDATE toko_config
      SET value = ?, deskripsi = ?, diperbarui_pada = NOW()
      WHERE toko_id = ? AND key = ?
    `;

    await pool.execute(sql, [data.value, data.deskripsi, tokoId, key]);

    // Return updated config
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM toko_config WHERE toko_id = ? AND key = ?',
      [tokoId, key]
    );

    return rows[0];
  }

  static async deleteConfig(scope: AccessScope, tokoId: string, key: string) {
    // Verify store access and config exists
    const [configRows] = await pool.execute<RowDataPacket[]>(
      `SELECT tc.id FROM toko_config tc
       JOIN toko t ON tc.toko_id = t.id
       WHERE tc.toko_id = ? AND tc.key = ? AND t.tenant_id = ?`,
      [tokoId, key, scope.tenantId]
    );

    if (configRows.length === 0) {
      throw new Error('Store configuration not found or access denied');
    }

    await pool.execute('DELETE FROM toko_config WHERE toko_id = ? AND key = ?', [tokoId, key]);
    return { success: true, message: 'Configuration deleted successfully' };
  }

  static async updateOperatingHours(scope: AccessScope, tokoId: string, data: BulkUpdateOperatingHours) {
    // Verify store access
    const [storeRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM toko WHERE id = ? AND tenant_id = ?',
      [tokoId, scope.tenantId]
    );

    if (storeRows.length === 0) {
      throw new Error('Store not found or access denied');
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Delete existing operating hours
      await connection.execute('DELETE FROM toko_operating_hours WHERE toko_id = ?', [tokoId]);

      // Insert new operating hours
      for (const hours of data.operating_hours) {
        const id = uuidv4();
        const sql = `
          INSERT INTO toko_operating_hours (
            id, toko_id, hari, jam_buka, jam_tutup, is_buka, catatan,
            dibuat_pada, diperbarui_pada
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        await connection.execute(sql, [
          id, tokoId, hours.hari, hours.jam_buka, hours.jam_tutup,
          hours.is_buka ? 1 : 0, hours.catatan
        ]);
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return { success: true, message: 'Operating hours updated successfully' };
  }

  private static async createDefaultOperatingHours(tokoId: string) {
    const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];
    const defaultHours = {
      jam_buka: '08:00',
      jam_tutup: '22:00',
      is_buka: true
    };

    for (const hari of days) {
      const id = uuidv4();
      const sql = `
        INSERT INTO toko_operating_hours (
          id, toko_id, hari, jam_buka, jam_tutup, is_buka,
          dibuat_pada, diperbarui_pada
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      await pool.execute(sql, [
        id, tokoId, hari, defaultHours.jam_buka, defaultHours.jam_tutup,
        defaultHours.is_buka ? 1 : 0
      ]);
    }
  }

  private static async createDefaultConfigurations(tokoId: string) {
    const defaultConfigs = [
      { key: 'print_receipt', value: 'true', tipe: 'boolean', deskripsi: 'Auto print receipt after transaction' },
      { key: 'tax_rate', value: '0.11', tipe: 'number', deskripsi: 'Default tax rate (11%)' },
      { key: 'currency_symbol', value: 'Rp', tipe: 'string', deskripsi: 'Currency symbol' },
      { key: 'low_stock_threshold', value: '10', tipe: 'number', deskripsi: 'Default low stock threshold' }
    ];

    for (const config of defaultConfigs) {
      const id = uuidv4();
      const sql = `
        INSERT INTO toko_config (
          id, toko_id, key, value, tipe, deskripsi, is_public,
          dibuat_pada, diperbarui_pada
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      await pool.execute(sql, [
        id, tokoId, config.key, config.value, config.tipe,
        config.deskripsi, 1
      ]);
    }
  }
}