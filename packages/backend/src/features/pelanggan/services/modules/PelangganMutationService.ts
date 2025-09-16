/**
 * Customer Mutation Service Module
 * Handles customer creation, updates and management operations
 */

import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';
import { CreatePelanggan, UpdatePelanggan, CreatePelangganPoinLog, BulkPelangganAction, ImportPelanggan, PelangganCreditLimitAdjustment } from '../../models/PelangganCore';

export class PelangganMutationService {
  static async create(scope: AccessScope, data: CreatePelanggan) {
    // Check if code already exists
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM pelanggan WHERE kode = ? AND tenant_id = ? AND toko_id = ?',
      [data.kode, data.tenant_id, data.toko_id]
    );

    if (existingRows.length > 0) {
      throw new Error('Customer code already exists');
    }

    // Check if email already exists (if provided)
    if (data.email) {
      const [emailRows] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM pelanggan WHERE email = ? AND tenant_id = ? AND toko_id = ?',
        [data.email, data.tenant_id, data.toko_id]
      );

      if (emailRows.length > 0) {
        throw new Error('Email already exists');
      }
    }

    const id = uuidv4();

    const sql = `
      INSERT INTO pelanggan (
        id, tenant_id, toko_id, kode, nama, email, telepon, alamat,
        tanggal_lahir, jenis_kelamin, pekerjaan, tipe, diskon_persen,
        limit_kredit, saldo_poin, status, dibuat_pada, diperbarui_pada
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, NOW(), NOW()
      )
    `;

    const params = [
      id, data.tenant_id, data.toko_id, data.kode, data.nama,
      data.email, data.telepon, data.alamat, data.tanggal_lahir,
      data.jenis_kelamin, data.pekerjaan, data.tipe, data.diskon_persen,
      data.limit_kredit, data.status
    ];

    await pool.execute(sql, params);

    // Return created customer
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM pelanggan WHERE id = ?',
      [id]
    );

    const customer = rows[0];
    return {
      ...customer,
      diskon_persen: Number(customer.diskon_persen),
      limit_kredit: Number(customer.limit_kredit),
      saldo_poin: Number(customer.saldo_poin)
    };
  }

  static async update(scope: AccessScope, id: string, data: UpdatePelanggan) {
    // Check if customer exists and user has access
    const checkSql = `
      SELECT id FROM pelanggan
      WHERE id = ? AND tenant_id = ? ${scope.storeId ? 'AND toko_id = ?' : ''}
    `;
    const checkParams = scope.storeId ? [id, scope.tenantId, scope.storeId] : [id, scope.tenantId];
    const [checkRows] = await pool.execute<RowDataPacket[]>(checkSql, checkParams);

    if (checkRows.length === 0) {
      throw new Error('Customer not found or access denied');
    }

    // Check email uniqueness if updating email
    if (data.email) {
      const [emailRows] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM pelanggan WHERE email = ? AND tenant_id = ? AND id != ?',
        [data.email, scope.tenantId, id]
      );

      if (emailRows.length > 0) {
        throw new Error('Email already exists');
      }
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (data.nama !== undefined) {
      updates.push('nama = ?');
      params.push(data.nama);
    }

    if (data.email !== undefined) {
      updates.push('email = ?');
      params.push(data.email);
    }

    if (data.telepon !== undefined) {
      updates.push('telepon = ?');
      params.push(data.telepon);
    }

    if (data.alamat !== undefined) {
      updates.push('alamat = ?');
      params.push(data.alamat);
    }

    if (data.tanggal_lahir !== undefined) {
      updates.push('tanggal_lahir = ?');
      params.push(data.tanggal_lahir);
    }

    if (data.jenis_kelamin !== undefined) {
      updates.push('jenis_kelamin = ?');
      params.push(data.jenis_kelamin);
    }

    if (data.pekerjaan !== undefined) {
      updates.push('pekerjaan = ?');
      params.push(data.pekerjaan);
    }

    if (data.tipe !== undefined) {
      updates.push('tipe = ?');
      params.push(data.tipe);
    }

    if (data.diskon_persen !== undefined) {
      updates.push('diskon_persen = ?');
      params.push(data.diskon_persen);
    }

    if (data.limit_kredit !== undefined) {
      updates.push('limit_kredit = ?');
      params.push(data.limit_kredit);
    }

    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push('diperbarui_pada = NOW()');
    const sql = `UPDATE pelanggan SET ${updates.join(', ')} WHERE id = ?`;
    params.push(id);

    await pool.execute(sql, params);

    // Return updated customer
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM pelanggan WHERE id = ?',
      [id]
    );

    const customer = rows[0];
    return {
      ...customer,
      diskon_persen: Number(customer.diskon_persen),
      limit_kredit: Number(customer.limit_kredit),
      saldo_poin: Number(customer.saldo_poin)
    };
  }

  static async adjustPoints(scope: AccessScope, pelangganId: string, adjustment: number, reason: string, transaksiId?: string) {
    // Get current customer data
    const [customerRows] = await pool.execute<RowDataPacket[]>(
      'SELECT saldo_poin FROM pelanggan WHERE id = ? AND tenant_id = ?',
      [pelangganId, scope.tenantId]
    );

    if (customerRows.length === 0) {
      throw new Error('Customer not found');
    }

    const currentBalance = Number(customerRows[0].saldo_poin);
    const newBalance = Math.max(0, currentBalance + adjustment);

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Update customer balance
      await connection.execute(
        'UPDATE pelanggan SET saldo_poin = ?, diperbarui_pada = NOW() WHERE id = ?',
        [newBalance, pelangganId]
      );

      // Log the points adjustment
      await this.logPointsTransaction({
        pelanggan_id: pelangganId,
        tenant_id: scope.tenantId,
        toko_id: scope.storeId!,
        transaksi_id: transaksiId,
        tipe: adjustment > 0 ? 'earned' : 'used',
        jumlah: Math.abs(adjustment),
        saldo_sebelum: currentBalance,
        saldo_sesudah: newBalance,
        keterangan: reason
      }, connection);

      await connection.commit();

      return {
        pelanggan_id: pelangganId,
        adjustment,
        previous_balance: currentBalance,
        new_balance: newBalance,
        reason
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async logPointsTransaction(data: CreatePelangganPoinLog, connection?: any) {
    const conn = connection || pool;

    const id = uuidv4();
    const sql = `
      INSERT INTO pelanggan_poin_log (
        id, pelanggan_id, tenant_id, toko_id, transaksi_id, tipe, jumlah,
        saldo_sebelum, saldo_sesudah, keterangan, expired_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const params = [
      id, data.pelanggan_id, data.tenant_id, data.toko_id, data.transaksi_id,
      data.tipe, data.jumlah, data.saldo_sebelum, data.saldo_sesudah,
      data.keterangan, data.expired_at
    ];

    await conn.execute(sql, params);
  }

  static async bulkAction(scope: AccessScope, data: BulkPelangganAction) {
    if (scope.level && scope.level > 3) {
      throw new Error('Insufficient permissions for bulk customer actions');
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const customerPlaceholders = data.pelanggan_ids.map(() => '?').join(',');
      let sql: string;
      let params: any[];

      switch (data.action) {
        case 'activate':
          sql = `UPDATE pelanggan SET status = 'aktif', diperbarui_pada = NOW()
                 WHERE id IN (${customerPlaceholders}) AND tenant_id = ?`;
          params = [...data.pelanggan_ids, scope.tenantId];
          break;

        case 'deactivate':
          sql = `UPDATE pelanggan SET status = 'nonaktif', diperbarui_pada = NOW()
                 WHERE id IN (${customerPlaceholders}) AND tenant_id = ?`;
          params = [...data.pelanggan_ids, scope.tenantId];
          break;

        case 'blacklist':
          sql = `UPDATE pelanggan SET status = 'blacklist', diperbarui_pada = NOW()
                 WHERE id IN (${customerPlaceholders}) AND tenant_id = ?`;
          params = [...data.pelanggan_ids, scope.tenantId];
          break;

        case 'upgrade_to_vip':
          sql = `UPDATE pelanggan SET tipe = 'vip', diperbarui_pada = NOW()
                 WHERE id IN (${customerPlaceholders}) AND tenant_id = ?`;
          params = [...data.pelanggan_ids, scope.tenantId];
          break;

        case 'downgrade_to_reguler':
          sql = `UPDATE pelanggan SET tipe = 'reguler', diperbarui_pada = NOW()
                 WHERE id IN (${customerPlaceholders}) AND tenant_id = ?`;
          params = [...data.pelanggan_ids, scope.tenantId];
          break;

        case 'reset_points':
          // Get current balances first
          const balanceQuery = `SELECT id, saldo_poin FROM pelanggan
                               WHERE id IN (${customerPlaceholders}) AND tenant_id = ?`;
          const [balanceRows] = await connection.execute<RowDataPacket[]>(balanceQuery, [...data.pelanggan_ids, scope.tenantId]);

          // Reset points
          sql = `UPDATE pelanggan SET saldo_poin = 0, diperbarui_pada = NOW()
                 WHERE id IN (${customerPlaceholders}) AND tenant_id = ?`;
          params = [...data.pelanggan_ids, scope.tenantId];

          // Log point resets
          for (const customer of balanceRows) {
            if (customer.saldo_poin > 0) {
              await this.logPointsTransaction({
                pelanggan_id: customer.id,
                tenant_id: scope.tenantId,
                toko_id: scope.storeId!,
                tipe: 'adjustment',
                jumlah: Number(customer.saldo_poin),
                saldo_sebelum: Number(customer.saldo_poin),
                saldo_sesudah: 0,
                keterangan: `Bulk reset points - ${data.reason || 'No reason provided'}`
              }, connection);
            }
          }
          break;

        default:
          throw new Error('Invalid bulk action');
      }

      const [result] = await connection.execute(sql, params);
      await connection.commit();

      return {
        success: true,
        affected_customers: (result as any).affectedRows,
        action: data.action
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async importCustomers(scope: AccessScope, customers: ImportPelanggan[]) {
    if (scope.level && scope.level > 3) {
      throw new Error('Insufficient permissions to import customers');
    }

    if (!scope.storeId) {
      throw new Error('Store ID is required for customer import');
    }

    const connection = await pool.getConnection();
    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[]
    };

    try {
      await connection.beginTransaction();

      for (let i = 0; i < customers.length; i++) {
        const customer = customers[i];

        try {
          // Generate unique code
          const customerCode = `CUST-${Date.now()}-${i + 1}`;

          // Check if email already exists (if provided)
          if (customer.email) {
            const [emailRows] = await connection.execute<RowDataPacket[]>(
              'SELECT id FROM pelanggan WHERE email = ? AND tenant_id = ? AND toko_id = ?',
              [customer.email, scope.tenantId, scope.storeId]
            );

            if (emailRows.length > 0) {
              results.skipped++;
              results.errors.push(`Row ${i + 1}: Email ${customer.email} already exists`);
              continue;
            }
          }

          const id = uuidv4();
          const sql = `
            INSERT INTO pelanggan (
              id, tenant_id, toko_id, kode, nama, email, telepon, alamat,
              tanggal_lahir, jenis_kelamin, tipe, saldo_poin, status,
              dibuat_pada, diperbarui_pada
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'aktif', NOW(), NOW())
          `;

          const params = [
            id, scope.tenantId, scope.storeId, customerCode, customer.nama,
            customer.email, customer.telepon, customer.alamat,
            customer.tanggal_lahir ? new Date(customer.tanggal_lahir) : null,
            customer.jenis_kelamin, customer.tipe
          ];

          await connection.execute(sql, params);
          results.imported++;

        } catch (error: any) {
          results.skipped++;
          results.errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }

      await connection.commit();
      return results;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async adjustCreditLimit(scope: AccessScope, data: PelangganCreditLimitAdjustment) {
    if (scope.level && scope.level > 2) {
      throw new Error('Insufficient permissions to adjust credit limits');
    }

    // Check if customer exists and get current limit
    const [customerRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, limit_kredit FROM pelanggan WHERE id = ? AND tenant_id = ?',
      [data.pelanggan_id, scope.tenantId]
    );

    if (customerRows.length === 0) {
      throw new Error('Customer not found');
    }

    const currentLimit = Number(customerRows[0].limit_kredit);

    // Update credit limit
    await pool.execute(
      'UPDATE pelanggan SET limit_kredit = ?, diperbarui_pada = NOW() WHERE id = ?',
      [data.new_limit, data.pelanggan_id]
    );

    // Log the adjustment (you might want to create a credit_limit_adjustments table)
    // For now, we'll use points log with adjustment type
    await this.logPointsTransaction({
      pelanggan_id: data.pelanggan_id,
      tenant_id: scope.tenantId,
      toko_id: scope.storeId!,
      tipe: 'adjustment',
      jumlah: 0, // Not applicable for credit limit
      saldo_sebelum: 0,
      saldo_sesudah: 0,
      keterangan: `Credit limit adjusted from ${currentLimit} to ${data.new_limit}. Reason: ${data.reason}. Approved by: ${data.approved_by}`
    });

    return {
      pelanggan_id: data.pelanggan_id,
      previous_limit: currentLimit,
      new_limit: data.new_limit,
      reason: data.reason,
      approved_by: data.approved_by
    };
  }
}