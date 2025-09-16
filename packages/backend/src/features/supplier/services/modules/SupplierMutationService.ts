/**
 * Supplier Mutation Service Module
 * Handles supplier creation, updates and management operations
 */

import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';
import { CreateSupplier, UpdateSupplier, BulkSupplierAction, ImportSupplier, CreateSupplierPaymentTerms, CreateSupplierContactLog } from '../../models/SupplierCore';

export class SupplierMutationService {
  static async create(scope: AccessScope, data: CreateSupplier) {
    // Check if email already exists (if provided)
    if (data.email) {
      const [emailRows] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM supplier WHERE email = ? AND tenant_id = ? AND toko_id = ?',
        [data.email, data.tenant_id, data.toko_id]
      );

      if (emailRows.length > 0) {
        throw new Error('Email already exists');
      }
    }

    const id = uuidv4();

    const sql = `
      INSERT INTO supplier (
        id, tenant_id, toko_id, nama, kontak_person, telepon, email,
        alamat, npwp, bank_nama, bank_rekening, bank_atas_nama,
        status, dibuat_pada, diperbarui_pada
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
      )
    `;

    const params = [
      id, data.tenant_id, data.toko_id, data.nama, data.kontak_person,
      data.telepon, data.email, data.alamat, data.npwp, data.bank_nama,
      data.bank_rekening, data.bank_atas_nama, data.status
    ];

    await pool.execute(sql, params);

    // Return created supplier
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM supplier WHERE id = ?',
      [id]
    );

    return rows[0];
  }

  static async update(scope: AccessScope, id: string, data: UpdateSupplier) {
    // Check if supplier exists and user has access
    const checkSql = `
      SELECT id FROM supplier
      WHERE id = ? AND tenant_id = ? ${scope.storeId ? 'AND toko_id = ?' : ''}
    `;
    const checkParams = scope.storeId ? [id, scope.tenantId, scope.storeId] : [id, scope.tenantId];
    const [checkRows] = await pool.execute<RowDataPacket[]>(checkSql, checkParams);

    if (checkRows.length === 0) {
      throw new Error('Supplier not found or access denied');
    }

    // Check email uniqueness if updating email
    if (data.email) {
      const [emailRows] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM supplier WHERE email = ? AND tenant_id = ? AND id != ?',
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

    if (data.kontak_person !== undefined) {
      updates.push('kontak_person = ?');
      params.push(data.kontak_person);
    }

    if (data.telepon !== undefined) {
      updates.push('telepon = ?');
      params.push(data.telepon);
    }

    if (data.email !== undefined) {
      updates.push('email = ?');
      params.push(data.email);
    }

    if (data.alamat !== undefined) {
      updates.push('alamat = ?');
      params.push(data.alamat);
    }

    if (data.npwp !== undefined) {
      updates.push('npwp = ?');
      params.push(data.npwp);
    }

    if (data.bank_nama !== undefined) {
      updates.push('bank_nama = ?');
      params.push(data.bank_nama);
    }

    if (data.bank_rekening !== undefined) {
      updates.push('bank_rekening = ?');
      params.push(data.bank_rekening);
    }

    if (data.bank_atas_nama !== undefined) {
      updates.push('bank_atas_nama = ?');
      params.push(data.bank_atas_nama);
    }

    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push('diperbarui_pada = NOW()');
    const sql = `UPDATE supplier SET ${updates.join(', ')} WHERE id = ?`;
    params.push(id);

    await pool.execute(sql, params);

    // Return updated supplier
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM supplier WHERE id = ?',
      [id]
    );

    return rows[0];
  }

  static async bulkAction(scope: AccessScope, data: BulkSupplierAction) {
    if (scope.level && scope.level > 3) {
      throw new Error('Insufficient permissions for bulk supplier actions');
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const supplierPlaceholders = data.supplier_ids.map(() => '?').join(',');
      let sql: string;
      let params: any[];

      switch (data.action) {
        case 'activate':
          sql = `UPDATE supplier SET status = 'aktif', diperbarui_pada = NOW()
                 WHERE id IN (${supplierPlaceholders}) AND tenant_id = ?`;
          params = [...data.supplier_ids, scope.tenantId];
          break;

        case 'deactivate':
          sql = `UPDATE supplier SET status = 'nonaktif', diperbarui_pada = NOW()
                 WHERE id IN (${supplierPlaceholders}) AND tenant_id = ?`;
          params = [...data.supplier_ids, scope.tenantId];
          break;

        case 'blacklist':
          sql = `UPDATE supplier SET status = 'blacklist', diperbarui_pada = NOW()
                 WHERE id IN (${supplierPlaceholders}) AND tenant_id = ?`;
          params = [...data.supplier_ids, scope.tenantId];
          break;

        case 'export_data':
          // For export, we just return the supplier data without modifying
          sql = `SELECT * FROM supplier
                 WHERE id IN (${supplierPlaceholders}) AND tenant_id = ?`;
          params = [...data.supplier_ids, scope.tenantId];

          const [exportRows] = await connection.execute<RowDataPacket[]>(sql, params);
          await connection.commit();

          return {
            success: true,
            action: 'export_data',
            data: exportRows,
            count: exportRows.length
          };

        default:
          throw new Error('Invalid bulk action');
      }

      const [result] = await connection.execute(sql, params);
      await connection.commit();

      return {
        success: true,
        affected_suppliers: (result as any).affectedRows,
        action: data.action
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async importSuppliers(scope: AccessScope, suppliers: ImportSupplier[]) {
    if (scope.level && scope.level > 3) {
      throw new Error('Insufficient permissions to import suppliers');
    }

    if (!scope.storeId) {
      throw new Error('Store ID is required for supplier import');
    }

    const connection = await pool.getConnection();
    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[]
    };

    try {
      await connection.beginTransaction();

      for (let i = 0; i < suppliers.length; i++) {
        const supplier = suppliers[i];

        try {
          // Check if email already exists (if provided)
          if (supplier.email) {
            const [emailRows] = await connection.execute<RowDataPacket[]>(
              'SELECT id FROM supplier WHERE email = ? AND tenant_id = ? AND toko_id = ?',
              [supplier.email, scope.tenantId, scope.storeId]
            );

            if (emailRows.length > 0) {
              results.skipped++;
              results.errors.push(`Row ${i + 1}: Email ${supplier.email} already exists`);
              continue;
            }
          }

          const id = uuidv4();
          const sql = `
            INSERT INTO supplier (
              id, tenant_id, toko_id, nama, kontak_person, telepon, email,
              alamat, npwp, bank_nama, bank_rekening, bank_atas_nama,
              status, dibuat_pada, diperbarui_pada
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aktif', NOW(), NOW())
          `;

          const params = [
            id, scope.tenantId, scope.storeId, supplier.nama,
            supplier.kontak_person, supplier.telepon, supplier.email,
            supplier.alamat, supplier.npwp, supplier.bank_nama,
            supplier.bank_rekening, supplier.bank_atas_nama
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

  static async createPaymentTerms(scope: AccessScope, data: CreateSupplierPaymentTerms) {
    // Verify supplier exists and access
    const [supplierRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM supplier WHERE id = ? AND tenant_id = ?',
      [data.supplier_id, scope.tenantId]
    );

    if (supplierRows.length === 0) {
      throw new Error('Supplier not found or access denied');
    }

    // Deactivate existing payment terms
    await pool.execute(
      'UPDATE supplier_payment_terms SET is_active = 0, updated_at = NOW() WHERE supplier_id = ?',
      [data.supplier_id]
    );

    const id = uuidv4();
    const sql = `
      INSERT INTO supplier_payment_terms (
        id, supplier_id, payment_method, payment_terms_days, discount_rate,
        discount_days, late_fee_rate, credit_limit, is_active,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
    `;

    const params = [
      id, data.supplier_id, data.payment_method, data.payment_terms_days,
      data.discount_rate, data.discount_days, data.late_fee_rate, data.credit_limit
    ];

    await pool.execute(sql, params);

    // Return created payment terms
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM supplier_payment_terms WHERE id = ?',
      [id]
    );

    return rows[0];
  }

  static async logSupplierContact(scope: AccessScope, data: CreateSupplierContactLog) {
    // Verify supplier exists and access
    const [supplierRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM supplier WHERE id = ? AND tenant_id = ?',
      [data.supplier_id, scope.tenantId]
    );

    if (supplierRows.length === 0) {
      throw new Error('Supplier not found or access denied');
    }

    const id = uuidv4();
    const sql = `
      INSERT INTO supplier_contact_log (
        id, supplier_id, tenant_id, user_id, contact_type, subject,
        notes, follow_up_date, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const params = [
      id, data.supplier_id, data.tenant_id, data.user_id, data.contact_type,
      data.subject, data.notes, data.follow_up_date, data.status
    ];

    await pool.execute(sql, params);

    // Return created contact log
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM supplier_contact_log WHERE id = ?',
      [id]
    );

    return rows[0];
  }

  static async deleteSupplier(scope: AccessScope, id: string) {
    if (scope.level && scope.level > 2) {
      throw new Error('Insufficient permissions to delete suppliers');
    }

    // Check if supplier has any associated transactions
    const [transactionRows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM transaksi_pembelian WHERE supplier_id = ?',
      [id]
    );

    if (Number(transactionRows[0].count) > 0) {
      // Soft delete: set status to nonaktif
      await pool.execute(
        'UPDATE supplier SET status = \'nonaktif\', diperbarui_pada = NOW() WHERE id = ?',
        [id]
      );

      return {
        success: true,
        message: 'Supplier deactivated (has transaction history)',
        soft_delete: true
      };
    }

    // Hard delete if no transactions
    await pool.execute('DELETE FROM supplier WHERE id = ?', [id]);

    return {
      success: true,
      message: 'Supplier deleted successfully',
      soft_delete: false
    };
  }

  static async updateSupplierRating(scope: AccessScope, supplierId: string, rating: number, notes?: string) {
    if (scope.level && scope.level > 3) {
      throw new Error('Insufficient permissions to rate suppliers');
    }

    // For now, we'll log this as a contact entry
    // In a full system, you might have a separate ratings table
    return this.logSupplierContact(scope, {
      supplier_id: supplierId,
      tenant_id: scope.tenantId,
      user_id: '', // Should be provided by caller
      contact_type: 'other',
      subject: 'Supplier Rating',
      notes: `Rating: ${rating}/5${notes ? ` - Notes: ${notes}` : ''}`,
      status: 'completed'
    });
  }
}