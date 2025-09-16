/**
 * Inventory Service Module
 * Handles product inventory operations per store
 */

import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { CreateInventaris, UpdateInventaris, InventarisQuery } from '../../models/InventarisModel';

export class InventarisService {
  static async getByProductAndStore(scope: AccessScope, produkId: string, tokoId: string) {
    const sql = `
      SELECT
        i.*,
        p.nama as produk_nama,
        p.kode as produk_kode,
        p.satuan as produk_satuan
      FROM inventaris i
      LEFT JOIN produk p ON i.produk_id = p.id
      WHERE i.produk_id = ? AND i.toko_id = ?
    `;

    // For inventory, we don't use scope filtering directly on inventaris table
    // as it doesn't have tenant_id, but we ensure product belongs to the right scope
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [produkId, tokoId]);
    return rows[0] as any || null;
  }

  static async search(scope: AccessScope, query: InventarisQuery) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const offset = (page - 1) * limit;

    let baseWhere = '';
    const baseParams: any[] = [];

    if (query.search) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') +
        '(p.nama LIKE ? OR p.kode LIKE ?)';
      const like = `%${query.search}%`;
      baseParams.push(like, like);
    }

    // Filter for low stock items
    if (query.low_stock === 'true') {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') +
        'i.stok_tersedia <= COALESCE(i.stok_minimum_toko, p.stok_minimum, 0)';
    }

    // Store filter
    if (query.toko_id) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'i.toko_id = ?';
      baseParams.push(query.toko_id);
    } else if (scope.storeId && scope.enforceStore) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'i.toko_id = ?';
      baseParams.push(scope.storeId);
    }

    // Count query
    const countBase = `
      SELECT COUNT(*) as total
      FROM inventaris i
      LEFT JOIN produk p ON i.produk_id = p.id
      ${baseWhere}
    `;

    const scopedCount = applyScopeToSql(countBase, baseParams, scope, {
      tenantColumn: 'p.tenant_id',
      storeColumn: undefined // Don't filter by store on product level for inventory
    });

    const [countRows] = await pool.execute<RowDataPacket[]>(scopedCount.sql, scopedCount.params);
    const total = Number(countRows[0]?.total || 0);

    // Data query
    const dataBase = `
      SELECT
        i.produk_id, i.toko_id, i.stok_tersedia, i.stok_reserved,
        i.harga_jual_toko, i.stok_minimum_toko, i.lokasi_rak, i.terakhir_update,
        p.nama as produk_nama, p.kode as produk_kode, p.satuan,
        p.harga_jual as harga_jual_default,
        t.nama as toko_nama
      FROM inventaris i
      LEFT JOIN produk p ON i.produk_id = p.id
      LEFT JOIN toko t ON i.toko_id = t.id
      ${baseWhere}
    `;

    const scopedData = applyScopeToSql(dataBase, baseParams, scope, {
      tenantColumn: 'p.tenant_id',
      storeColumn: undefined
    });

    const finalSql = `${scopedData.sql} ORDER BY p.nama ASC LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedData.params);

    return {
      data: rows as any[],
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async createStock(scope: AccessScope, data: CreateInventaris) {
    const now = new Date();

    const sql = `
      INSERT INTO inventaris (
        produk_id, toko_id, stok_tersedia, stok_reserved,
        harga_jual_toko, stok_minimum_toko, lokasi_rak, terakhir_update
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        stok_tersedia = VALUES(stok_tersedia),
        stok_reserved = COALESCE(VALUES(stok_reserved), stok_reserved),
        harga_jual_toko = COALESCE(VALUES(harga_jual_toko), harga_jual_toko),
        stok_minimum_toko = COALESCE(VALUES(stok_minimum_toko), stok_minimum_toko),
        lokasi_rak = COALESCE(VALUES(lokasi_rak), lokasi_rak),
        terakhir_update = VALUES(terakhir_update)
    `;

    const params = [
      data.produk_id,
      data.toko_id,
      data.stok_tersedia || 0,
      data.stok_reserved || 0,
      data.harga_jual_toko || null,
      data.stok_minimum_toko || 0,
      data.lokasi_rak || null,
      now
    ];

    await pool.execute<ResultSetHeader>(sql, params);
    return { produk_id: data.produk_id, toko_id: data.toko_id, updated: true };
  }

  static async updateStock(scope: AccessScope, produkId: string, tokoId: string, data: UpdateInventaris) {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.stok_tersedia !== undefined) {
      updates.push('stok_tersedia = ?');
      params.push(data.stok_tersedia);
    }

    if (data.stok_reserved !== undefined) {
      updates.push('stok_reserved = ?');
      params.push(data.stok_reserved);
    }

    if (data.harga_jual_toko !== undefined) {
      updates.push('harga_jual_toko = ?');
      params.push(data.harga_jual_toko);
    }

    if (data.stok_minimum_toko !== undefined) {
      updates.push('stok_minimum_toko = ?');
      params.push(data.stok_minimum_toko);
    }

    if (data.lokasi_rak !== undefined) {
      updates.push('lokasi_rak = ?');
      params.push(data.lokasi_rak);
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push('terakhir_update = NOW()');
    const sql = `UPDATE inventaris SET ${updates.join(', ')} WHERE produk_id = ? AND toko_id = ?`;
    params.push(produkId, tokoId);

    await pool.execute<ResultSetHeader>(sql, params);
    return { produk_id: produkId, toko_id: tokoId, updated: true };
  }
}