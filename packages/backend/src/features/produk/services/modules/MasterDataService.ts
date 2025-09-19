/**
 * Master Data Service Module
 * Handles category, brand, and supplier operations for products
 */

import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope, applyScopeToSql, getInsertScope } from '@/core/middleware/accessScope';
import { v4 as uuidv4 } from 'uuid';

export class MasterDataService {
  // Category operations
  static async getCategories(scope: AccessScope) {
    let sql = `
      SELECT
        k.id,
        k.tenant_id,
        k.toko_id,
        k.nama,
        k.deskripsi,
        k.icon_url,
        k.urutan,
        k.status,
        k.dibuat_pada,
        k.diperbarui_pada,
        COUNT(p.id) as jumlah_produk
      FROM kategori k
      LEFT JOIN produk p ON k.id = p.kategori_id AND p.is_aktif = 1
      WHERE k.status = 'aktif'
    `;
    let params: any[] = [];

    // Tambahkan filter tenant jika diperlukan
    if (scope.enforceTenant) {
      sql += ` AND k.tenant_id = ?`;
      params.push(scope.tenantId);

      // Juga filter produk berdasarkan tenant yang sama
      sql += ` AND (p.tenant_id = ? OR p.tenant_id IS NULL)`;
      params.push(scope.tenantId);
    }

    // Tambahkan filter toko jika diperlukan
    if (scope.enforceStore && scope.storeId) {
      sql += ` AND k.toko_id = ?`;
      params.push(scope.storeId);

      // Juga filter produk berdasarkan toko yang sama
      sql += ` AND (p.toko_id = ? OR p.toko_id IS NULL)`;
      params.push(scope.storeId);
    }

    sql += ` GROUP BY k.id, k.tenant_id, k.toko_id, k.nama, k.deskripsi, k.icon_url, k.urutan, k.status, k.dibuat_pada, k.diperbarui_pada`;
    sql += ` ORDER BY k.urutan ASC, k.nama ASC`;

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
    const insertScope = getInsertScope(scope);

    // Jika apply to all tenants, buat entry terpisah untuk setiap tenant
    if (scope.applyToAllTenants) {
      return await this.createCategoryForAllTenants(id, data, now);
    }

    // Jika apply to all stores dalam tenant, buat entry dengan toko_id = null
    if (scope.applyToAllStores) {
      return await this.createCategoryForAllStores(id, data, insertScope.tenantId, now);
    }

    // Create normal category
    const sql = `
      INSERT INTO kategori (
        id, tenant_id, toko_id, nama, deskripsi, icon_url, urutan,
        status, dibuat_pada, diperbarui_pada
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'aktif', ?, ?)
    `;

    const params = [
      id, insertScope.tenantId, insertScope.storeId, data.nama,
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

  private static async createCategoryForAllTenants(id: string, data: any, now: Date) {
    // Ambil semua tenant aktif
    const [tenants] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM tenants WHERE status = \"aktif\"'
    );

    const sql = `
      INSERT INTO kategori (
        id, tenant_id, toko_id, nama, deskripsi, icon_url, urutan,
        status, dibuat_pada, diperbarui_pada
      ) VALUES (?, ?, NULL, ?, ?, ?, ?, 'aktif', ?, ?)
    `;

    // Insert untuk setiap tenant
    for (const tenant of tenants) {
      const categoryId = `${id}-${tenant.id}`;
      const params = [
        categoryId, tenant.id, data.nama,
        data.deskripsi || null, data.icon_url || null, data.urutan || 0,
        now, now
      ];
      await pool.execute<ResultSetHeader>(sql, params);
    }

    return { id, message: `Category created for ${tenants.length} tenants` };
  }

  private static async createCategoryForAllStores(id: string, data: any, tenantId: string, now: Date) {
    const sql = `
      INSERT INTO kategori (
        id, tenant_id, toko_id, nama, deskripsi, icon_url, urutan,
        status, dibuat_pada, diperbarui_pada
      ) VALUES (?, ?, NULL, ?, ?, ?, ?, 'aktif', ?, ?)
    `;

    const params = [
      id, tenantId, data.nama,
      data.deskripsi || null, data.icon_url || null, data.urutan || 0,
      now, now
    ];

    await pool.execute<ResultSetHeader>(sql, params);
    return { id, message: 'Category created for all stores in tenant' };
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

  static async getProductsByCategory(scope: AccessScope, categoryId: string, options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}) {
    const { page = 1, limit = 50, search } = options;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT
        p.id,
        p.kode,
        p.barcode,
        p.nama,
        p.deskripsi,
        p.satuan,
        p.harga_beli,
        p.harga_jual,
        p.margin_persen,
        p.stok_minimum,
        p.berat,
        p.dimensi,
        p.gambar_url,
        p.is_aktif,
        p.is_dijual_online,
        p.pajak_persen,
        p.dibuat_pada,
        p.diperbarui_pada,
        k.nama as kategori_nama,
        b.nama as brand_nama,
        s.nama as supplier_nama,
        COALESCE(SUM(i.stok_tersedia), 0) as total_stok
      FROM produk p
      LEFT JOIN kategori k ON p.kategori_id = k.id
      LEFT JOIN brand b ON p.brand_id = b.id
      LEFT JOIN supplier s ON p.supplier_id = s.id
      LEFT JOIN inventaris i ON p.id = i.produk_id
      WHERE p.kategori_id = ? AND p.is_aktif = 1
    `;

    let params: any[] = [categoryId];

    // Filter by tenant
    if (scope.enforceTenant) {
      sql += ` AND p.tenant_id = ?`;
      params.push(scope.tenantId);
    }

    // Filter by store
    if (scope.enforceStore && scope.storeId) {
      sql += ` AND p.toko_id = ?`;
      params.push(scope.storeId);
    }

    // Search filter
    if (search && search.trim()) {
      sql += ` AND (p.nama LIKE ? OR p.kode LIKE ? OR p.barcode LIKE ?)`;
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    sql += ` GROUP BY p.id`;
    sql += ` ORDER BY p.nama ASC`;
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    console.log('Generated SQL for products by category:', sql);
    console.log('SQL Params:', params);

    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);

    // Get total count for pagination
    let countSql = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM produk p
      WHERE p.kategori_id = ? AND p.is_aktif = 1
    `;

    let countParams: any[] = [categoryId];

    if (scope.enforceTenant) {
      countSql += ` AND p.tenant_id = ?`;
      countParams.push(scope.tenantId);
    }

    if (scope.enforceStore && scope.storeId) {
      countSql += ` AND p.toko_id = ?`;
      countParams.push(scope.storeId);
    }

    if (search && search.trim()) {
      countSql += ` AND (p.nama LIKE ? OR p.kode LIKE ? OR p.barcode LIKE ?)`;
      const searchPattern = `%${search.trim()}%`;
      countParams.push(searchPattern, searchPattern, searchPattern);
    }

    const [countRows] = await pool.execute<RowDataPacket[]>(countSql, countParams);
    const total = (countRows[0] as any).total;

    return {
      data: rows as any[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Brand operations
  // Brand operations
  static async getBrands(scope: AccessScope) {
    let sql = `
      SELECT id, tenant_id, toko_id, nama, deskripsi, logo_url, website, status, dibuat_pada, diperbarui_pada
      FROM brand
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

    sql += ` ORDER BY nama ASC`;

    console.log('Generated SQL for brands:', sql);
    console.log('SQL Params for brands:', params);

    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
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
    const insertScope = getInsertScope(scope);

    // Jika apply to all tenants, buat entry terpisah untuk setiap tenant
    if (scope.applyToAllTenants) {
      return await this.createBrandForAllTenants(id, data, now);
    }

    // Jika apply to all stores dalam tenant, buat entry dengan toko_id = null
    if (scope.applyToAllStores) {
      return await this.createBrandForAllStores(id, data, insertScope.tenantId, now);
    }

    // Create normal brand
    const sql = `
      INSERT INTO brand (
        id, tenant_id, toko_id, nama, deskripsi, logo_url, website,
        status, dibuat_pada, diperbarui_pada
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'aktif', ?, ?)
    `;

    const params = [
      id, insertScope.tenantId, insertScope.storeId, data.nama,
      data.deskripsi || null, data.logo_url || null, data.website || null,
      now, now
    ];

    await pool.execute<ResultSetHeader>(sql, params);
    return { id, ...data, status: 'aktif' };
  }

  private static async createBrandForAllTenants(id: string, data: any, now: Date) {
    // Ambil semua tenant aktif
    const [tenants] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM tenants WHERE status = \"aktif\"'
    );

    // Karena kolom toko_id NOT NULL, kita buat entri per toko untuk setiap tenant
    const insertSql = `
      INSERT INTO brand (
        id, tenant_id, toko_id, nama, deskripsi, logo_url, website,
        status, dibuat_pada, diperbarui_pada
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'aktif', ?, ?)
    `;

    let inserted = 0;
    for (const tenant of tenants) {
      // Ambil semua toko aktif untuk tenant ini
      const [stores] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM toko WHERE tenant_id = ? AND (status = "aktif" OR status IS NULL)',
        [tenant.id]
      );

      for (const store of stores) {
        const brandIdPerStore = uuidv4();
        const params = [
          brandIdPerStore, tenant.id, store.id, data.nama,
          data.deskripsi || null, data.logo_url || null, data.website || null,
          now, now
        ];
        await pool.execute<ResultSetHeader>(insertSql, params);
        inserted++;
      }
    }

    return { id, message: `Brand created across ${inserted} stores for all tenants` };
  }

  private static async createBrandForAllStores(id: string, data: any, tenantId: string, now: Date) {
    // Karena toko_id NOT NULL, buat entri untuk setiap toko aktif dalam tenant
    const [stores] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM toko WHERE tenant_id = ? AND (status = "aktif" OR status IS NULL)',
      [tenantId]
    );

    const insertSql = `
      INSERT INTO brand (
        id, tenant_id, toko_id, nama, deskripsi, logo_url, website,
        status, dibuat_pada, diperbarui_pada
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'aktif', ?, ?)
    `;

    let inserted = 0;
    for (const store of stores) {
      const brandIdPerStore = uuidv4();
      const params = [
        brandIdPerStore, tenantId, store.id, data.nama,
        data.deskripsi || null, data.logo_url || null, data.website || null,
        now, now
      ];
      await pool.execute<ResultSetHeader>(insertSql, params);
      inserted++;
    }

    return { id, message: `Brand created for all ${inserted} stores in tenant` };
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
    let sql = `
      SELECT id, tenant_id, toko_id, nama, kontak_person, telepon, email, alamat, status, dibuat_pada, diperbarui_pada
      FROM supplier
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

    sql += ` ORDER BY nama ASC`;

    console.log('Generated SQL for suppliers:', sql);
    console.log('SQL Params for suppliers:', params);

    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
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
    const insertScope = getInsertScope(scope);

    // Jika apply to all tenants, buat entry terpisah untuk setiap tenant
    if (scope.applyToAllTenants) {
      return await this.createSupplierForAllTenants(id, data, now);
    }

    // Jika apply to all stores dalam tenant, buat entry dengan toko_id = null
    if (scope.applyToAllStores) {
      return await this.createSupplierForAllStores(id, data, insertScope.tenantId, now);
    }

    // Create normal supplier
    const sql = `
      INSERT INTO supplier (
        id, tenant_id, toko_id, nama, kontak_person, telepon, email, alamat,
        status, dibuat_pada, diperbarui_pada
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'aktif', ?, ?)
    `;

    const params = [
      id, insertScope.tenantId, insertScope.storeId, data.nama,
      data.kontak_person || null, data.telepon || null, data.email || null,
      data.alamat || null, now, now
    ];

    await pool.execute<ResultSetHeader>(sql, params);
    return { id, ...data };
  }

  private static async createSupplierForAllTenants(id: string, data: any, now: Date) {
    // Ambil semua tenant aktif
    const [tenants] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM tenants WHERE status = \"aktif\"'
    );

    const sql = `
      INSERT INTO supplier (
        id, tenant_id, toko_id, nama, kontak_person, telepon, email, alamat,
        status, dibuat_pada, diperbarui_pada
      ) VALUES (?, ?, NULL, ?, ?, ?, ?, ?, 'aktif', ?, ?)
    `;

    // Insert untuk setiap tenant
    for (const tenant of tenants) {
      const supplierId = `${id}-${tenant.id}`;
      const params = [
        supplierId, tenant.id, data.nama,
        data.kontak_person || null, data.telepon || null, data.email || null,
        data.alamat || null, now, now
      ];
      await pool.execute<ResultSetHeader>(sql, params);
    }

    return { id, message: `Supplier created for ${tenants.length} tenants` };
  }

  private static async createSupplierForAllStores(id: string, data: any, tenantId: string, now: Date) {
    const sql = `
      INSERT INTO supplier (
        id, tenant_id, toko_id, nama, kontak_person, telepon, email, alamat,
        status, dibuat_pada, diperbarui_pada
      ) VALUES (?, ?, NULL, ?, ?, ?, ?, ?, 'aktif', ?, ?)
    `;

    const params = [
      id, tenantId, data.nama,
      data.kontak_person || null, data.telepon || null, data.email || null,
      data.alamat || null, now, now
    ];

    await pool.execute<ResultSetHeader>(sql, params);
    return { id, message: 'Supplier created for all stores in tenant' };
  }
}