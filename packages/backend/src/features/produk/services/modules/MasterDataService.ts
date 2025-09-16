/**
 * Master Data Service Module
 * Handles category, brand, and supplier operations for products
 */

import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { v4 as uuidv4 } from 'uuid';

export class MasterDataService {
  // Category operations
  static async getCategories(scope: AccessScope) {
    let sql = `
      SELECT id, tenant_id, toko_id, nama, deskripsi, icon_url, urutan, status, dibuat_pada, diperbarui_pada
      FROM kategori
      WHERE status = 'aktif'
    `;
    let params: any[] = [];

    // Tambahkan filter tenant jika diperlukan
    if (scope.enforceTenant) {
      sql += ` AND tenant_id = ?`;
      params.push(scope.tenantId);
    }

    // Tambahkan filter toko jika diperlukan
    if (scope.enforceStore && scope.storeId) {
      sql += ` AND toko_id = ?`;
      params.push(scope.storeId);
    }

    sql += ` ORDER BY urutan ASC, nama ASC`;

    console.log('Generated SQL:', sql);
    console.log('SQL Params:', params);

    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
    return rows as any[];
  }

  static async createCategory(scope: AccessScope, data: {
    nama: string;
    deskripsi?: string;
    icon_url?: string;
    urutan?: number;
  }) {
    const id = uuidv4();
    const now = new Date();

    const sql = `
      INSERT INTO kategori (
        id, tenant_id, toko_id, nama, deskripsi, icon_url, urutan,
        status, dibuat_pada, diperbarui_pada
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'aktif', ?, ?)
    `;

    const params = [
      id, scope.tenantId, scope.storeId || null, data.nama,
      data.deskripsi || null, data.icon_url || null, data.urutan || 0,
      now, now
    ];

    await pool.execute<ResultSetHeader>(sql, params);

    // Return complete category data
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, tenant_id, toko_id, nama, deskripsi, icon_url, urutan, status, dibuat_pada, diperbarui_pada FROM kategori WHERE id = ?',
      [id]
    );
    return rows[0] as any;
  }

  static async updateCategory(scope: AccessScope, id: string, data: {
    nama?: string;
    deskripsi?: string;
    icon_url?: string;
    urutan?: number;
    status?: string;
  }) {
    const now = new Date();

    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];

    if (data.nama !== undefined) {
      updates.push('nama = ?');
      params.push(data.nama);
    }
    if (data.deskripsi !== undefined) {
      updates.push('deskripsi = ?');
      params.push(data.deskripsi);
    }
    if (data.icon_url !== undefined) {
      updates.push('icon_url = ?');
      params.push(data.icon_url);
    }
    if (data.urutan !== undefined) {
      updates.push('urutan = ?');
      params.push(data.urutan);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }

    updates.push('diperbarui_pada = ?');
    params.push(now);
    params.push(id);

    const baseSql = `UPDATE kategori SET ${updates.join(', ')} WHERE id = ?`;

    const scopedQuery = applyScopeToSql(baseSql, params, scope, {
      tenantColumn: 'tenant_id',
      storeColumn: 'toko_id'
    });

    await pool.execute<ResultSetHeader>(scopedQuery.sql, scopedQuery.params);

    // Return updated category data
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, tenant_id, toko_id, nama, deskripsi, icon_url, urutan, status, dibuat_pada, diperbarui_pada FROM kategori WHERE id = ?',
      [id]
    );
    return rows[0] as any;
  }

  static async deleteCategory(scope: AccessScope, id: string) {
    const sql = `DELETE FROM kategori WHERE id = ?`;

    const scopedQuery = applyScopeToSql(sql, [id], scope, {
      tenantColumn: 'tenant_id',
      storeColumn: 'toko_id'
    });

    const [result] = await pool.execute<ResultSetHeader>(scopedQuery.sql, scopedQuery.params);
    return result.affectedRows > 0;
  }

  // Brand operations
  static async getBrands(scope: AccessScope) {
    const sql = `
      SELECT id, nama, deskripsi, logo_url, website, status
      FROM brand
      WHERE status = 'aktif'
      ORDER BY nama ASC
    `;

    const scopedQuery = applyScopeToSql(sql, [], scope, {
      tenantColumn: 'tenant_id',
      storeColumn: 'toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return rows as any[];
  }

  static async createBrand(scope: AccessScope, data: {
    nama: string;
    deskripsi?: string;
    logo_url?: string;
    website?: string;
  }) {
    const id = uuidv4();
    const now = new Date();

    const sql = `
      INSERT INTO brand (
        id, tenant_id, toko_id, nama, deskripsi, logo_url, website,
        status, dibuat_pada, diperbarui_pada
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'aktif', ?, ?)
    `;

    const params = [
      id, scope.tenantId, scope.storeId || null, data.nama,
      data.deskripsi || null, data.logo_url || null, data.website || null,
      now, now
    ];

    await pool.execute<ResultSetHeader>(sql, params);
    return { id, ...data, status: 'aktif' };
  }

  static async updateBrand(scope: AccessScope, id: string, data: {
    nama?: string;
    deskripsi?: string;
    logo_url?: string;
    website?: string;
  }) {
    const now = new Date();
    const updates: string[] = [];
    const params: any[] = [];

    if (data.nama !== undefined) {
      updates.push('nama = ?');
      params.push(data.nama);
    }
    if (data.deskripsi !== undefined) {
      updates.push('deskripsi = ?');
      params.push(data.deskripsi);
    }
    if (data.logo_url !== undefined) {
      updates.push('logo_url = ?');
      params.push(data.logo_url);
    }
    if (data.website !== undefined) {
      updates.push('website = ?');
      params.push(data.website);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    updates.push('diperbarui_pada = ?');
    params.push(now);

    let sql = `UPDATE brand SET ${updates.join(', ')} WHERE id = ?`;
    params.push(id);

    const scopedQuery = applyScopeToSql(sql, params, scope, {
      tenantColumn: 'tenant_id',
      storeColumn: 'toko_id'
    });

    const [result] = await pool.execute<ResultSetHeader>(scopedQuery.sql, scopedQuery.params);

    if (result.affectedRows === 0) {
      throw new Error('Brand not found or access denied');
    }

    return { id, ...data };
  }

  static async deleteBrand(scope: AccessScope, id: string) {
    let sql = `DELETE FROM brand WHERE id = ?`;
    const params = [id];

    const scopedQuery = applyScopeToSql(sql, params, scope, {
      tenantColumn: 'tenant_id',
      storeColumn: 'toko_id'
    });

    const [result] = await pool.execute<ResultSetHeader>(scopedQuery.sql, scopedQuery.params);
    return result.affectedRows > 0;
  }

  // Supplier operations
  static async getSuppliers(scope: AccessScope) {
    const sql = `
      SELECT id, nama, kontak_person, telepon, email, status
      FROM supplier
      WHERE status = 'aktif'
      ORDER BY nama ASC
    `;

    const scopedQuery = applyScopeToSql(sql, [], scope, {
      tenantColumn: 'tenant_id',
      storeColumn: 'toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return rows as any[];
  }

  static async createSupplier(scope: AccessScope, data: {
    nama: string;
    kontak_person?: string;
    telepon?: string;
    email?: string;
    alamat?: string;
  }) {
    const id = uuidv4();
    const now = new Date();

    const sql = `
      INSERT INTO supplier (
        id, tenant_id, toko_id, nama, kontak_person, telepon, email, alamat,
        status, dibuat_pada, diperbarui_pada
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'aktif', ?, ?)
    `;

    const params = [
      id, scope.tenantId, scope.storeId || null, data.nama,
      data.kontak_person || null, data.telepon || null, data.email || null,
      data.alamat || null, now, now
    ];

    await pool.execute<ResultSetHeader>(sql, params);
    return { id, ...data };
  }
}