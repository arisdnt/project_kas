/**
 * Tenant Mutation Service Module
 * Handles tenant create, update, delete operations
 */

import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { CreateTenant, UpdateTenant, CreateToko, UpdateToko } from '../../models/TenantCore';
import { v4 as uuidv4 } from 'uuid';

export class TenantMutationService {
  // Tenant operations --------------------------------------------------
  static async createTenant(data: CreateTenant) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const id = uuidv4();
      const now = new Date();

      // Check if email already exists
      const [existingRows] = await connection.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as count FROM tenants WHERE email = ?',
        [data.email]
      );

      if (Number(existingRows[0]?.count || 0) > 0) {
        throw new Error('Email already exists');
      }

      const tenantData = {
        ...data,
        id,
        dibuat_pada: now,
        diperbarui_pada: now
      };

      const sql = `
        INSERT INTO tenants (
          id, nama, email, telepon, alamat, status, paket,
          max_toko, max_pengguna, dibuat_pada, diperbarui_pada
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute<ResultSetHeader>(sql, [
        tenantData.id, tenantData.nama, tenantData.email, tenantData.telepon || null,
        tenantData.alamat || null, tenantData.status, tenantData.paket,
        tenantData.max_toko, tenantData.max_pengguna, tenantData.dibuat_pada,
        tenantData.diperbarui_pada
      ]);

      await connection.commit();
      return tenantData;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateTenant(id: string, data: UpdateTenant) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check if email already exists for other tenants
      if (data.email) {
        const [existingRows] = await connection.execute<RowDataPacket[]>(
          'SELECT COUNT(*) as count FROM tenants WHERE email = ? AND id != ?',
          [data.email, id]
        );

        if (Number(existingRows[0]?.count || 0) > 0) {
          throw new Error('Email already exists');
        }
      }

      const updates: string[] = [];
      const params: any[] = [];

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          updates.push(`${key} = ?`);
          params.push(value);
        }
      });

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      updates.push('diperbarui_pada = NOW()');
      params.push(id);

      const sql = `UPDATE tenants SET ${updates.join(', ')} WHERE id = ?`;
      const [result] = await connection.execute<ResultSetHeader>(sql, params);

      if (result.affectedRows === 0) {
        throw new Error('Tenant not found');
      }

      await connection.commit();
      return { id, updated: true };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

    // deleteTenant moved to standalone function below to avoid TS static recognition issue

  static async createStore(data: CreateToko) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check tenant limits
      const [limitRows] = await connection.execute<RowDataPacket[]>(
        `SELECT t.max_toko, COUNT(tk.id) as current_toko
         FROM tenants t
         LEFT JOIN toko tk ON t.id = tk.tenant_id AND tk.status = 'aktif'
         WHERE t.id = ?
         GROUP BY t.id`,
        [data.tenant_id]
      );

      const limits = limitRows[0];
      if (!limits) {
        throw new Error('Tenant not found');
      }

      if (limits.current_toko >= limits.max_toko) {
        throw new Error('Maximum store limit reached for this tenant');
      }

      // Check if store code already exists for this tenant
      const [codeRows] = await connection.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as count FROM toko WHERE kode = ? AND tenant_id = ?',
        [data.kode, data.tenant_id]
      );

      if (Number(codeRows[0]?.count || 0) > 0) {
        throw new Error('Store code already exists for this tenant');
      }

      const id = uuidv4();
      const now = new Date();

      const storeData = {
        ...data,
        id,
        dibuat_pada: now,
        diperbarui_pada: now
      };

      const sql = `
        INSERT INTO toko (
          id, tenant_id, nama, kode, alamat, telepon, email, status,
          timezone, mata_uang, logo_url, dibuat_pada, diperbarui_pada
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute<ResultSetHeader>(sql, [
        storeData.id, storeData.tenant_id, storeData.nama, storeData.kode,
        storeData.alamat || null, storeData.telepon || null, storeData.email || null,
        storeData.status, storeData.timezone, storeData.mata_uang,
        storeData.logo_url || null, storeData.dibuat_pada, storeData.diperbarui_pada
      ]);

      await connection.commit();
      return storeData;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateStore(id: string, data: UpdateToko) {
    const updates: string[] = [];
    const params: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'tenant_id') {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    });

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    updates.push('diperbarui_pada = NOW()');
    params.push(id);

    const sql = `UPDATE toko SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute<ResultSetHeader>(sql, params);

    if (result.affectedRows === 0) {
      throw new Error('Store not found');
    }

    return { id, updated: true };
  }

  static async deleteStore(storeId: string, tenantId: string) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check if store has active users
      const [userRows] = await connection.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as count FROM users WHERE toko_id = ? AND status = "aktif"',
        [storeId]
      );

      if (Number(userRows[0]?.count || 0) > 0) {
        throw new Error('Cannot delete store with active users');
      }

      // Soft delete - set status to nonaktif
      const [result] = await connection.execute<ResultSetHeader>(
        'UPDATE toko SET status = "nonaktif", diperbarui_pada = NOW() WHERE id = ? AND tenant_id = ?',
        [storeId, tenantId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Store not found');
      }

      await connection.commit();
      return { id: storeId, deleted: true };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

// Ensure TypeScript recognizes all static methods (workaround for any build caching issue)
export interface TenantMutationService {
  // declaration merging placeholder
}

// Standalone delete tenant (soft delete) used by TenantService
export async function deleteTenantMutation(id: string) {
  const connection = await pool.getConnection();

  console.log(`🔴 [TENANT DELETE] Starting deletion process for tenant ID: ${id}`);

  try {
    await connection.beginTransaction();

    console.log(`🔍 [TENANT DELETE] Checking dependencies for tenant: ${id}`);

    // Get current tenant info before deletion
    const [tenantRows] = await connection.execute<RowDataPacket[]>(
      'SELECT nama, email, status FROM tenants WHERE id = ?',
      [id]
    );

    if (tenantRows.length === 0) {
      console.log(`❌ [TENANT DELETE] Tenant not found: ${id}`);
      throw new Error('Tenant not found');
    }

    const tenant = tenantRows[0];
    console.log(`📋 [TENANT DELETE] Found tenant: ${tenant.nama} (${tenant.email}) - Status: ${tenant.status}`);

    const [depRows] = await connection.execute<RowDataPacket[]>(
      `SELECT
         (SELECT COUNT(*) FROM toko WHERE tenant_id = ? AND status = 'aktif') as aktif_toko,
         (SELECT COUNT(*) FROM users WHERE tenant_id = ? AND status = 'aktif') as aktif_pengguna
       `,
      [id, id]
    );

    const deps = depRows[0];
    console.log(`📊 [TENANT DELETE] Dependencies check - Active stores: ${deps?.aktif_toko}, Active users: ${deps?.aktif_pengguna}`);

    if (deps?.aktif_toko > 0) {
      console.log(`⚠️ [TENANT DELETE] Cannot delete tenant ${id} - has ${deps.aktif_toko} active stores`);
      throw new Error('Cannot delete tenant with active stores');
    }
    if (deps?.aktif_pengguna > 0) {
      console.log(`⚠️ [TENANT DELETE] Cannot delete tenant ${id} - has ${deps.aktif_pengguna} active users`);
      throw new Error('Cannot delete tenant with active users');
    }

    console.log(`✅ [TENANT DELETE] No dependencies found, proceeding with soft delete for tenant: ${id}`);

    const [result] = await connection.execute<ResultSetHeader>(
      'UPDATE tenants SET status = "nonaktif", diperbarui_pada = NOW() WHERE id = ?',
      [id]
    );

    console.log(`📝 [TENANT DELETE] Update query executed - Affected rows: ${result.affectedRows}`);

    if (result.affectedRows === 0) {
      console.log(`❌ [TENANT DELETE] No rows updated for tenant: ${id}`);
      throw new Error('Tenant not found or already deleted');
    }

    await connection.commit();
    console.log(`✅ [TENANT DELETE] Successfully soft-deleted tenant: ${id} (${tenant.nama})`);

    return {
      id,
      deleted: true,
      affectedRows: result.affectedRows,
      tenantName: tenant.nama,
      previousStatus: tenant.status
    };

  } catch (error) {
    await connection.rollback();
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.log(`❌ [TENANT DELETE] Error deleting tenant ${id}: ${errorMsg}`);
    console.error(`🔥 [TENANT DELETE] Full error details:`, error);
    throw error;
  } finally {
    connection.release();
    console.log(`🔚 [TENANT DELETE] Database connection released for tenant: ${id}`);
  }
}