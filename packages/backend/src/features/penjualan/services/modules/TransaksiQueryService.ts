/**
 * Transaction Query Service Module
 * Handles sales transaction search and retrieval operations
 */

import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { SearchTransaksiQuery } from '../../models/TransaksiPenjualanCore';

export class TransaksiQueryService {
  static async search(scope: AccessScope, query: SearchTransaksiQuery) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const offset = (page - 1) * limit;

    let baseWhere = '';
    const baseParams: any[] = [];

    // Text search
    if (query.search) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') +
        '(tp.nomor_transaksi LIKE ? OR p.nama LIKE ? OR tp.catatan LIKE ?)';
      const like = `%${query.search}%`;
      baseParams.push(like, like, like);
    }

    // Customer filter
    if (query.pelanggan_id) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'tp.pelanggan_id = ?';
      baseParams.push(query.pelanggan_id);
    }

    // Status filter
    if (query.status) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'tp.status = ?';
      baseParams.push(query.status);
    }

    // Payment method filter
    if (query.metode_bayar) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'tp.metode_bayar = ?';
      baseParams.push(query.metode_bayar);
    }

    // Date range filter
    if (query.tanggal_dari) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'tp.tanggal >= ?';
      baseParams.push(query.tanggal_dari);
    }
    if (query.tanggal_sampai) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'tp.tanggal <= ?';
      baseParams.push(query.tanggal_sampai + ' 23:59:59');
    }

    return this.executeSearch(scope, baseWhere, baseParams, limit, offset, page);
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
      FROM transaksi_penjualan tp
      LEFT JOIN pelanggan p ON tp.pelanggan_id = p.id
      ${baseWhere}
    `;

    const scopedCount = applyScopeToSql(countBase, baseParams, scope, {
      tenantColumn: 'tp.tenant_id',
      storeColumn: 'tp.toko_id'
    });

    const [countRows] = await pool.execute<RowDataPacket[]>(scopedCount.sql, scopedCount.params);
    const total = Number(countRows[0]?.total || 0);

    // Data query
    const dataBase = `
      SELECT
        tp.id, tp.nomor_transaksi, tp.tanggal, tp.subtotal, tp.diskon_persen,
        tp.diskon_nominal, tp.pajak_persen, tp.pajak_nominal, tp.total,
        tp.bayar, tp.kembalian, tp.metode_bayar, tp.status, tp.catatan,
        p.nama as pelanggan_nama, p.telepon as pelanggan_telepon,
        u.nama_lengkap as kasir_nama,
        t.nama as toko_nama
      FROM transaksi_penjualan tp
      LEFT JOIN pelanggan p ON tp.pelanggan_id = p.id
      LEFT JOIN users u ON tp.pengguna_id = u.id
      LEFT JOIN toko t ON tp.toko_id = t.id
      ${baseWhere}
    `;

    const scopedData = applyScopeToSql(dataBase, baseParams, scope, {
      tenantColumn: 'tp.tenant_id',
      storeColumn: 'tp.toko_id'
    });

    const finalSql = `${scopedData.sql} ORDER BY tp.tanggal DESC LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedData.params);

    return {
      data: rows as any[],
      total,
      page: page,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async findById(scope: AccessScope, id: string) {
    const sql = `
      SELECT
        tp.*,
        p.nama as pelanggan_nama, p.email as pelanggan_email, p.telepon as pelanggan_telepon,
        u.nama_lengkap as kasir_nama,
        t.nama as toko_nama, t.alamat as toko_alamat
      FROM transaksi_penjualan tp
      LEFT JOIN pelanggan p ON tp.pelanggan_id = p.id
      LEFT JOIN users u ON tp.pengguna_id = u.id
      LEFT JOIN toko t ON tp.toko_id = t.id
      WHERE tp.id = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [id], scope, {
      tenantColumn: 'tp.tenant_id',
      storeColumn: 'tp.toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return rows[0] as any || null;
  }

  static async getTransactionItems(scope: AccessScope, transactionId: string) {
    const sql = `
      SELECT
        itp.*,
        p.nama as produk_nama, p.kode as produk_kode, p.satuan as produk_satuan,
        pr.nama as promo_nama
      FROM item_transaksi_penjualan itp
      LEFT JOIN produk p ON itp.produk_id = p.id
      LEFT JOIN promo pr ON itp.promo_id = pr.id
      WHERE itp.transaksi_penjualan_id = ?
      ORDER BY itp.dibuat_pada ASC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [transactionId]);
    return rows as any[];
  }
}