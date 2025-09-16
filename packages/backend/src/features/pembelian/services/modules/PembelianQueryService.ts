/**
 * Purchase Query Service Module
 * Handles purchase transaction search and retrieval operations
 */

import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { SearchPembelianQuery } from '../../models/TransaksiPembelianCore';

export class PembelianQueryService {
  static async search(scope: AccessScope, query: SearchPembelianQuery) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const offset = (page - 1) * limit;

    let baseWhere = '';
    const baseParams: any[] = [];

    // Text search
    if (query.search) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') +
        '(tp.nomor_transaksi LIKE ? OR tp.nomor_po LIKE ? OR s.nama LIKE ? OR tp.catatan LIKE ?)';
      const like = `%${query.search}%`;
      baseParams.push(like, like, like, like);
    }

    // Supplier filter
    if (query.supplier_id) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'tp.supplier_id = ?';
      baseParams.push(query.supplier_id);
    }

    // Status filter
    if (query.status) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'tp.status = ?';
      baseParams.push(query.status);
    }

    // Payment status filter
    if (query.status_pembayaran) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + 'tp.status_pembayaran = ?';
      baseParams.push(query.status_pembayaran);
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

    return this.executeSearch(scope, baseWhere, baseParams, limit, offset);
  }

  private static async executeSearch(
    scope: AccessScope,
    baseWhere: string,
    baseParams: any[],
    limit: number,
    offset: number
  ) {
    const page = Math.floor(offset / limit) + 1;
    // Count query
    const countBase = `
      SELECT COUNT(*) as total
      FROM transaksi_pembelian tp
      LEFT JOIN supplier s ON tp.supplier_id = s.id
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
        tp.id, tp.nomor_transaksi, tp.nomor_po, tp.tanggal, tp.jatuh_tempo,
        tp.subtotal, tp.diskon_persen, tp.diskon_nominal, tp.pajak_persen,
        tp.pajak_nominal, tp.total, tp.status, tp.status_pembayaran, tp.catatan,
        s.nama as supplier_nama, s.kontak_person as supplier_kontak,
        u.nama_lengkap as pembeli_nama,
        t.nama as toko_nama
      FROM transaksi_pembelian tp
      LEFT JOIN supplier s ON tp.supplier_id = s.id
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
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async findById(scope: AccessScope, id: string) {
    const sql = `
      SELECT
        tp.*,
        s.nama as supplier_nama, s.kontak_person as supplier_kontak,
        s.telepon as supplier_telepon, s.email as supplier_email,
        u.nama_lengkap as pembeli_nama,
        t.nama as toko_nama, t.alamat as toko_alamat
      FROM transaksi_pembelian tp
      LEFT JOIN supplier s ON tp.supplier_id = s.id
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

  static async getPurchaseItems(scope: AccessScope, transactionId: string) {
    const sql = `
      SELECT
        itp.*,
        p.nama as produk_nama, p.kode as produk_kode, p.satuan as produk_satuan
      FROM item_transaksi_pembelian itp
      LEFT JOIN produk p ON itp.produk_id = p.id
      WHERE itp.transaksi_pembelian_id = ?
      ORDER BY itp.dibuat_pada ASC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [transactionId]);
    return rows as any[];
  }
}