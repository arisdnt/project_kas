/**
 * Configuration Mutation Service Module
 * Handles system configuration create, update operations
 */

import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';
import { CreateKonfigurasi, UpdateKonfigurasi } from '../../models/KonfigurasiCore';
import { v4 as uuidv4 } from 'uuid';

export class KonfigurasiMutationService {
  static async createOrUpdate(scope: AccessScope, data: CreateKonfigurasi | UpdateKonfigurasi) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check if configuration already exists
      const checkSql = `
        SELECT id FROM konfigurasi_sistem
        WHERE tenant_id = ? AND (toko_id = ? OR (toko_id IS NULL AND ? IS NULL))
      `;

      const [existingRows] = await connection.execute<RowDataPacket[]>(
        checkSql,
        [scope.tenantId, data.toko_id || null, data.toko_id || null]
      );

      const now = new Date();

      if (existingRows.length > 0) {
        // Update existing configuration
        const existingId = existingRows[0].id;
        const updates: string[] = [];
        const params: any[] = [];

        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && key !== 'tenant_id') {
            updates.push(`${key} = ?`);
            params.push(value);
          }
        });

        if (updates.length > 0) {
          updates.push('diperbarui_pada = ?');
          params.push(now);
          params.push(existingId);

          const updateSql = `UPDATE konfigurasi_sistem SET ${updates.join(', ')} WHERE id = ?`;
          await connection.execute<ResultSetHeader>(updateSql, params);
        }

        await connection.commit();
        return { id: existingId, updated: true };

      } else {
        // Create new configuration
        const id = uuidv4();
        const configData = {
          ...data,
          id,
          tenant_id: scope.tenantId,
          dibuat_pada: now,
          diperbarui_pada: now
        };

        const insertSql = `
          INSERT INTO konfigurasi_sistem (
            id, tenant_id, toko_id, pajak, is_pajak_aktif, dibuat_pada, diperbarui_pada
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await connection.execute<ResultSetHeader>(insertSql, [
          configData.id,
          configData.tenant_id,
          configData.toko_id || null,
          configData.pajak || 0,
          configData.is_pajak_aktif || false,
          configData.dibuat_pada,
          configData.diperbarui_pada
        ]);

        await connection.commit();
        return { ...configData, created: true };
      }

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateTenantConfiguration(scope: AccessScope, data: UpdateKonfigurasi) {
    // Update tenant-wide configuration (toko_id = NULL)
    return this.createOrUpdate(scope, { ...data, toko_id: undefined });
  }

  static async updateStoreConfiguration(scope: AccessScope, storeId: string, data: UpdateKonfigurasi) {
    // Update store-specific configuration
    return this.createOrUpdate(scope, { ...data, toko_id: storeId });
  }

  static async resetToDefaults(scope: AccessScope, storeId?: string) {
    const defaultConfig = {
      pajak: 0,
      is_pajak_aktif: false,
      toko_id: storeId
    };

    return this.createOrUpdate(scope, defaultConfig);
  }

  static async deleteStoreConfiguration(scope: AccessScope, storeId: string) {
    const sql = `
      DELETE FROM konfigurasi_sistem
      WHERE tenant_id = ? AND toko_id = ?
    `;

    const [result] = await pool.execute<ResultSetHeader>(sql, [scope.tenantId, storeId]);

    if (result.affectedRows === 0) {
      throw new Error('Store configuration not found');
    }

    return { deleted: true, storeId };
  }
}