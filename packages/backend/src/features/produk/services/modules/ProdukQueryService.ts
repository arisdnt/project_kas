/**
 * Product Query Service Module
 * Handles product search and retrieval operations with scope filtering
 */

import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { SearchProdukQuery } from '../../models/ProdukCore';

export class ProdukQueryService {
  static async search(scope: AccessScope, query: SearchProdukQuery) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const offset = (page - 1) * limit;

    let baseWhere = '';
    const baseParams: any[] = [];

    // Text search across multiple fields
    if (query.search) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') +
        '(p.nama LIKE ? OR p.kode LIKE ? OR p.barcode LIKE ? OR p.deskripsi LIKE ?)';
      const like = `%${query.search}%`;
      baseParams.push(like, like, like, like);
    }

    // Filter by category
    if (query.kategori_id) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'p.kategori_id = ?';
      baseParams.push(query.kategori_id);
    }

    // Filter by brand
    if (query.brand_id) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'p.brand_id = ?';
      baseParams.push(query.brand_id);
    }

    // Filter by supplier
    if (query.supplier_id) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'p.supplier_id = ?';
      baseParams.push(query.supplier_id);
    }

    // Filter by active status
    if (query.is_aktif !== undefined) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'p.is_aktif = ?';
      baseParams.push(Number(query.is_aktif));
    }

    return this.executeSearch(scope, baseWhere, baseParams, limit, offset);
  }

  private static async executeSearch(
    scope: AccessScope,
    baseWhere: string,
    baseParams: any[],
    limit: number,
    offset: number
  ) {
    // Count query
    const countBase = `
      SELECT COUNT(*) as total
      FROM produk p
      ${baseWhere}
    `;

    const scopedCount = applyScopeToSql(countBase, baseParams, scope, {
      tenantColumn: 'p.tenant_id',
      storeColumn: 'p.toko_id'
    });

    const [countRows] = await pool.execute<RowDataPacket[]>(scopedCount.sql, scopedCount.params);
    const total = Number(countRows[0]?.total || 0);

    // Data query with joins
    const dataBase = `
      SELECT
        p.id, p.kode, p.nama, p.deskripsi, p.satuan,
        p.harga_beli, p.harga_jual, p.margin_persen, p.stok_minimum,
        p.is_aktif, p.is_dijual_online,
        k.nama as kategori_nama,
        b.nama as brand_nama,
        s.nama as supplier_nama
      FROM produk p
      LEFT JOIN kategori k ON p.kategori_id = k.id
      LEFT JOIN brand b ON p.brand_id = b.id
      LEFT JOIN supplier s ON p.supplier_id = s.id
      ${baseWhere}
    `;

    const scopedData = applyScopeToSql(dataBase, baseParams, scope, {
      tenantColumn: 'p.tenant_id',
      storeColumn: 'p.toko_id'
    });

    const finalSql = `${scopedData.sql} ORDER BY p.nama ASC LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedData.params);

    return {
      data: rows as any[],
      total,
      page: Math.ceil(offset / limit) + 1,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async findById(scope: AccessScope, id: string) {
    const sql = `
      SELECT
        p.*,
        k.nama as kategori_nama,
        b.nama as brand_nama, b.logo_url as brand_logo,
        s.nama as supplier_nama, s.kontak_person as supplier_kontak
      FROM produk p
      LEFT JOIN kategori k ON p.kategori_id = k.id
      LEFT JOIN brand b ON p.brand_id = b.id
      LEFT JOIN supplier s ON p.supplier_id = s.id
      WHERE p.id = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [id], scope, {
      tenantColumn: 'p.tenant_id',
      storeColumn: 'p.toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return rows[0] as any || null;
  }
}