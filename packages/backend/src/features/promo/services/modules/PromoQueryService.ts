/**
 * Promo Query Service Module
 * Handles promo search and retrieval operations
 */

import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { SearchPromoQuery } from '../../models/PromoCore';

export class PromoQueryService {
  static async search(scope: AccessScope, query: SearchPromoQuery) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const offset = (page - 1) * limit;

    let baseWhere = '';
    const baseParams: any[] = [];

    // Text search
    if (query.search) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') +
        '(pr.kode_promo LIKE ? OR pr.nama LIKE ? OR pr.deskripsi LIKE ?)';
      const like = `%${query.search}%`;
      baseParams.push(like, like, like);
    }

    // Filter by promo type
    if (query.tipe_promo) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'pr.tipe_promo = ?';
      baseParams.push(query.tipe_promo);
    }

    // Filter by discount type
    if (query.tipe_diskon) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'pr.tipe_diskon = ?';
      baseParams.push(query.tipe_diskon);
    }

    // Filter by status
    if (query.status) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'pr.status = ?';
      baseParams.push(query.status);
    }

    // Filter active promos only
    if (query.active_only === 'true') {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') +
        'pr.status = "aktif" AND pr.tanggal_mulai <= NOW() AND pr.tanggal_berakhir >= NOW()';
    }

    return PromoQueryService.executeSearch(scope, baseWhere, baseParams, limit, offset, page);
  }

  private static async executeSearch(
    scope: AccessScope,
    baseWhere: string,
    baseParams: any[],
    limit: number,
    offset: number,
    page: number
  ) {
    // Count query
    const countBase = `
      SELECT COUNT(*) as total
      FROM promo pr
      ${baseWhere}
    `;

    const scopedCount = applyScopeToSql(countBase, baseParams, scope, {
      tenantColumn: 'pr.tenant_id',
      storeColumn: 'pr.toko_id'
    });

    const [countRows] = await pool.execute<RowDataPacket[]>(scopedCount.sql, scopedCount.params);
    const total = Number(countRows[0]?.total || 0);

    // Data query
    const dataBase = `
      SELECT
        pr.id, pr.kode_promo, pr.nama, pr.deskripsi, pr.tipe_promo, pr.tipe_diskon,
        pr.nilai_diskon, pr.tanggal_mulai, pr.tanggal_berakhir, pr.minimum_pembelian,
        pr.maksimum_penggunaan, pr.jumlah_terpakai, pr.status,
        t.nama as toko_nama,
        (pr.maksimum_penggunaan - pr.jumlah_terpakai) as sisa_penggunaan
      FROM promo pr
      LEFT JOIN toko t ON pr.toko_id = t.id
      ${baseWhere}
    `;

    const scopedData = applyScopeToSql(dataBase, baseParams, scope, {
      tenantColumn: 'pr.tenant_id',
      storeColumn: 'pr.toko_id'
    });

    const finalSql = `${scopedData.sql} ORDER BY pr.tanggal_mulai DESC LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedData.params);

    return {
      data: rows as any[],
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async findById(scope: AccessScope, id: string) {
    const sql = `
      SELECT
        pr.*,
        t.nama as toko_nama,
        (pr.maksimum_penggunaan - pr.jumlah_terpakai) as sisa_penggunaan
      FROM promo pr
      LEFT JOIN toko t ON pr.toko_id = t.id
      WHERE pr.id = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [id], scope, {
      tenantColumn: 'pr.tenant_id',
      storeColumn: 'pr.toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return rows[0] as any || null;
  }

  static async findByCode(scope: AccessScope, kodePromo: string) {
    const sql = `
      SELECT
        pr.*,
        (pr.maksimum_penggunaan - pr.jumlah_terpakai) as sisa_penggunaan
      FROM promo pr
      WHERE pr.kode_promo = ? AND pr.status = 'aktif'
        AND pr.tanggal_mulai <= NOW() AND pr.tanggal_berakhir >= NOW()
    `;

    const scopedQuery = applyScopeToSql(sql, [kodePromo], scope, {
      tenantColumn: 'pr.tenant_id',
      storeColumn: 'pr.toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return rows[0] as any || null;
  }

  static async getPromoRelations(scope: AccessScope, promoId: string) {
    // Get categories
    const categorySql = `
      SELECT pc.*, k.nama as kategori_nama
      FROM promo_kategori pc
      LEFT JOIN kategori k ON pc.kategori_id = k.id
      WHERE pc.promo_id = ?
    `;
    const [categoryRows] = await pool.execute<RowDataPacket[]>(categorySql, [promoId]);

    // Get products
    const productSql = `
      SELECT pp.*, p.nama as produk_nama, p.kode as produk_kode
      FROM promo_produk pp
      LEFT JOIN produk p ON pp.produk_id = p.id
      WHERE pp.promo_id = ?
    `;
    const [productRows] = await pool.execute<RowDataPacket[]>(productSql, [promoId]);

    // Get customers
    const customerSql = `
      SELECT pc.*, p.nama as pelanggan_nama, p.email as pelanggan_email
      FROM promo_pelanggan pc
      LEFT JOIN pelanggan p ON pc.pelanggan_id = p.id
      WHERE pc.promo_id = ?
    `;
    const [customerRows] = await pool.execute<RowDataPacket[]>(customerSql, [promoId]);

    return {
      categories: categoryRows as any[],
      products: productRows as any[],
      customers: customerRows as any[]
    };
  }
}