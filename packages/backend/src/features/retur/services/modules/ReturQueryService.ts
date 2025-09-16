/**
 * Return Query Service Module
 * Handles return search and retrieval operations
 */

import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { SearchReturQuery } from '../../models/ReturCore';

export class ReturQueryService {
  static async search(scope: AccessScope, query: SearchReturQuery, type: 'penjualan' | 'pembelian') {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const offset = (page - 1) * limit;

    let baseWhere = '';
    const baseParams: any[] = [];

    const tableName = type === 'penjualan' ? 'retur_penjualan' : 'retur_pembelian';
    const refTable = type === 'penjualan' ? 'pelanggan' : 'supplier';
    const refColumn = type === 'penjualan' ? 'pelanggan_id' : 'supplier_id';

    // Text search
    if (query.search) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') +
        `(r.nomor_retur LIKE ? OR r.alasan_retur LIKE ? OR ref.nama LIKE ?)`;
      const like = `%${query.search}%`;
      baseParams.push(like, like, like);
    }

    // Status filter
    if (query.status) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'r.status = ?';
      baseParams.push(query.status);
    }

    // Return method filter
    if (query.metode_pengembalian) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'r.metode_pengembalian = ?';
      baseParams.push(query.metode_pengembalian);
    }

    // Date range filter
    if (query.tanggal_dari) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'r.tanggal >= ?';
      baseParams.push(query.tanggal_dari);
    }
    if (query.tanggal_sampai) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'r.tanggal <= ?';
      baseParams.push(query.tanggal_sampai + ' 23:59:59');
    }

    return this.executeSearch(scope, baseWhere, baseParams, limit, offset, type);
  }

  private static async executeSearch(
    scope: AccessScope,
    baseWhere: string,
    baseParams: any[],
    limit: number,
    offset: number,
    type: 'penjualan' | 'pembelian'
  ) {
    const page = Math.floor(offset / limit) + 1;
    const tableName = type === 'penjualan' ? 'retur_penjualan' : 'retur_pembelian';
    const refTable = type === 'penjualan' ? 'pelanggan' : 'supplier';
    const refColumn = type === 'penjualan' ? 'pelanggan_id' : 'supplier_id';

    // Count query
    const countBase = `
      SELECT COUNT(*) as total
      FROM ${tableName} r
      LEFT JOIN ${refTable} ref ON r.${refColumn} = ref.id
      ${baseWhere}
    `;

    const scopedCount = applyScopeToSql(countBase, baseParams, scope, {
      tenantColumn: 'r.tenant_id',
      storeColumn: 'r.toko_id'
    });

    const [countRows] = await pool.execute<RowDataPacket[]>(scopedCount.sql, scopedCount.params);
    const total = Number(countRows[0]?.total || 0);

    // Data query
    const dataBase = `
      SELECT
        r.id, r.nomor_retur, r.tanggal, r.alasan_retur, r.subtotal,
        r.diskon_persen, r.diskon_nominal, r.pajak_persen, r.pajak_nominal,
        r.total, r.metode_pengembalian, r.status, r.catatan,
        ref.nama as ${type === 'penjualan' ? 'pelanggan_nama' : 'supplier_nama'},
        u.nama_lengkap as pengguna_nama,
        t.nama as toko_nama
      FROM ${tableName} r
      LEFT JOIN ${refTable} ref ON r.${refColumn} = ref.id
      LEFT JOIN users u ON r.pengguna_id = u.id
      LEFT JOIN toko t ON r.toko_id = t.id
      ${baseWhere}
    `;

    const scopedData = applyScopeToSql(dataBase, baseParams, scope, {
      tenantColumn: 'r.tenant_id',
      storeColumn: 'r.toko_id'
    });

    const finalSql = `${scopedData.sql} ORDER BY r.tanggal DESC LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedData.params);

    return {
      data: rows as any[],
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async findById(scope: AccessScope, id: string, type: 'penjualan' | 'pembelian') {
    const tableName = type === 'penjualan' ? 'retur_penjualan' : 'retur_pembelian';
    const refTable = type === 'penjualan' ? 'pelanggan' : 'supplier';
    const refColumn = type === 'penjualan' ? 'pelanggan_id' : 'supplier_id';

    const sql = `
      SELECT
        r.*,
        ref.nama as ${type === 'penjualan' ? 'pelanggan_nama' : 'supplier_nama'},
        ref.${type === 'penjualan' ? 'email' : 'kontak_person'} as ${type === 'penjualan' ? 'pelanggan_email' : 'supplier_kontak'},
        u.nama_lengkap as pengguna_nama,
        t.nama as toko_nama, t.alamat as toko_alamat
      FROM ${tableName} r
      LEFT JOIN ${refTable} ref ON r.${refColumn} = ref.id
      LEFT JOIN users u ON r.pengguna_id = u.id
      LEFT JOIN toko t ON r.toko_id = t.id
      WHERE r.id = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [id], scope, {
      tenantColumn: 'r.tenant_id',
      storeColumn: 'r.toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return rows[0] as any || null;
  }

  static async getReturnItems(scope: AccessScope, returnId: string, type: 'penjualan' | 'pembelian') {
    const tableName = type === 'penjualan' ? 'item_retur_penjualan' : 'item_retur_pembelian';
    const returnIdColumn = type === 'penjualan' ? 'retur_penjualan_id' : 'retur_pembelian_id';

    const sql = `
      SELECT
        ir.*,
        p.nama as produk_nama, p.kode as produk_kode, p.satuan as produk_satuan
      FROM ${tableName} ir
      LEFT JOIN produk p ON ir.produk_id = p.id
      WHERE ir.${returnIdColumn} = ?
      ORDER BY ir.dibuat_pada ASC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [returnId]);
    return rows as any[];
  }

  static async getReturnStats(scope: AccessScope, type: 'penjualan' | 'pembelian', startDate: string, endDate: string) {
    const tableName = type === 'penjualan' ? 'retur_penjualan' : 'retur_pembelian';

    const sql = `
      SELECT
        COUNT(*) as total_retur,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as retur_selesai,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as retur_pending,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN total ELSE 0 END), 0) as total_nilai_retur,
        COALESCE(AVG(CASE WHEN status = 'completed' THEN total ELSE NULL END), 0) as rata_rata_nilai_retur
      FROM ${tableName}
      WHERE tanggal >= ? AND tanggal <= ?
    `;

    const scopedQuery = applyScopeToSql(sql, [startDate, endDate + ' 23:59:59'], scope, {
      tenantColumn: 'tenant_id',
      storeColumn: 'toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return rows[0] as any;
  }
}