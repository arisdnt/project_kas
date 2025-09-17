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

    // Data query with joins including inventory data
    const dataBase = `
      SELECT
        p.id, p.kode, p.nama, p.deskripsi, p.satuan,
        p.harga_beli, p.harga_jual, p.margin_persen, p.stok_minimum,
        p.is_aktif, p.is_dijual_online,
        k.nama as kategori_nama,
        b.nama as brand_nama,
        s.nama as supplier_nama,
        i.stok_tersedia, i.stok_reserved, i.harga_jual_toko,
        i.stok_minimum_toko, i.lokasi_rak, i.terakhir_update as stok_terakhir_update
      FROM produk p
      LEFT JOIN kategori k ON p.kategori_id = k.id
      LEFT JOIN brand b ON p.brand_id = b.id
      LEFT JOIN supplier s ON p.supplier_id = s.id
      LEFT JOIN inventaris i ON p.id = i.produk_id ${scope.storeId ? 'AND i.toko_id = ?' : ''}
      ${baseWhere}
    `;

    // Add store parameter if filtering by specific store
    const finalParams = [...baseParams];
    if (scope.storeId) {
      finalParams.splice(-baseParams.length, 0, scope.storeId);
    }

    const scopedData = applyScopeToSql(dataBase, finalParams, scope, {
      tenantColumn: 'p.tenant_id',
      storeColumn: 'p.toko_id'
    });

    const finalSql = `${scopedData.sql} ORDER BY p.nama ASC LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedData.params);

    // Transform data to include inventaris array format expected by frontend
    const transformedData = rows.map((row: any) => {
      const inventaris = [];
      // Always include inventory data - use 0 for stock if no inventory record exists
      inventaris.push({
        stok_tersedia: row.stok_tersedia || 0,
        stok_reserved: row.stok_reserved || 0,
        harga_jual_toko: row.harga_jual_toko || row.harga_jual,
        stok_minimum_toko: row.stok_minimum_toko || row.stok_minimum || 0,
        lokasi_rak: row.lokasi_rak || null,
        terakhir_update: row.stok_terakhir_update || new Date().toISOString()
      });

      // Remove inventory fields from main object
      const { 
        stok_tersedia, stok_reserved, harga_jual_toko, 
        stok_minimum_toko, lokasi_rak, stok_terakhir_update,
        ...produkData 
      } = row;

      return {
        ...produkData,
        inventaris
      };
    });

    return {
      data: transformedData,
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
        s.nama as supplier_nama, s.kontak_person as supplier_kontak,
        i.stok_tersedia, i.stok_reserved, i.harga_jual_toko,
        i.stok_minimum_toko, i.lokasi_rak, i.terakhir_update as stok_terakhir_update
      FROM produk p
      LEFT JOIN kategori k ON p.kategori_id = k.id
      LEFT JOIN brand b ON p.brand_id = b.id
      LEFT JOIN supplier s ON p.supplier_id = s.id
      LEFT JOIN inventaris i ON p.id = i.produk_id ${scope.storeId ? 'AND i.toko_id = ?' : ''}
      WHERE p.id = ?
    `;

    const params = scope.storeId ? [scope.storeId, id] : [id];
    const scopedQuery = applyScopeToSql(sql, params, scope, {
      tenantColumn: 'p.tenant_id',
      storeColumn: 'p.toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    const row = rows[0] as any;
    
    if (!row) return null;

    // Transform data to include inventaris array format
    const inventaris = [];
    // Always include inventory data - use 0 for stock if no inventory record exists
    inventaris.push({
      stok_tersedia: row.stok_tersedia || 0,
      stok_reserved: row.stok_reserved || 0,
      harga_jual_toko: row.harga_jual_toko || row.harga_jual,
      stok_minimum_toko: row.stok_minimum_toko || row.stok_minimum || 0,
      lokasi_rak: row.lokasi_rak || null,
      terakhir_update: row.stok_terakhir_update || new Date().toISOString()
    });

    // Remove inventory fields from main object
    const { 
      stok_tersedia, stok_reserved, harga_jual_toko, 
      stok_minimum_toko, lokasi_rak, stok_terakhir_update,
      ...produkData 
    } = row;

    return {
      ...produkData,
      inventaris
    };
  }
}