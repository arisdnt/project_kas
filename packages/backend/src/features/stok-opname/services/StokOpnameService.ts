/**
 * Service untuk Stok Opname
 * Menangani operasi CRUD dan business logic untuk stok opname
 */

import { pool } from '@/core/database/connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { v4 as uuidv4 } from 'uuid';
import {
  StokOpname,
  StokOpnameWithItems,
  StokOpnameItem,
  StokOpnameItemWithProduk,
  StokOpnameFilter,
  StokOpnameCreateData,
  StokOpnameUpdateData,
  StokOpnameListResponse
} from '../models/StokOpnameCore';

export class StokOpnameService {
  /**
   * Mencari stok opname dengan filter dan pagination
   */
  static async searchStokOpname(
    scope: AccessScope,
    filters: StokOpnameFilter
  ): Promise<StokOpnameListResponse> {
    const {
      search = '',
      status = 'all',
      page = 1,
      limit = 25
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions: string[] = [];
    let params: any[] = [];

    // Filter pencarian
    if (search) {
      whereConditions.push('so.nomor_opname LIKE ?');
      params.push(`%${search}%`);
    }

    // Filter status
    if (status !== 'all') {
      whereConditions.push('so.status = ?');
      params.push(status);
    }

    const whereClause = whereConditions.length > 0 ? `AND ${whereConditions.join(' AND ')}` : '';

    // Query untuk menghitung total
    const countSql = `
      SELECT COUNT(*) as total
      FROM stock_opname so
      WHERE 1=1 ${whereClause}
    `;

    const scopedCount = applyScopeToSql(countSql, params, scope, {
      tenantColumn: 'so.tenant_id',
      storeColumn: 'so.toko_id'
    });

    const [countResult] = await pool.execute<RowDataPacket[]>(scopedCount.sql, scopedCount.params);
    const total = countResult[0]?.total || 0;

    // Query untuk data dengan items
    const dataSql = `
      SELECT 
        so.*,
        COUNT(soi.id) as total_item_count
      FROM stock_opname so
      LEFT JOIN stock_opname_items soi ON so.id = soi.stock_opname_id
      WHERE 1=1 ${whereClause}
      GROUP BY so.id
      ORDER BY so.dibuat_pada DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const scopedData = applyScopeToSql(dataSql, params, scope, {
      tenantColumn: 'so.tenant_id',
      storeColumn: 'so.toko_id'
    });

    const [dataResult] = await pool.execute<RowDataPacket[]>(scopedData.sql, scopedData.params);

    // Ambil items untuk setiap stok opname
    const stokOpnameList: StokOpnameWithItems[] = [];
    for (const row of dataResult) {
      const items = await this.getItemsByStokOpnameId(row.id);
      const stokOpname: StokOpname = {
        id: row.id,
        tenant_id: row.tenant_id,
        toko_id: row.toko_id,
        pengguna_id: row.pengguna_id,
        nomor_opname: row.nomor_opname,
        tanggal: row.tanggal,
        keterangan: row.keterangan,
        status: row.status,
        total_item: row.total_item,
        total_selisih_nilai: row.total_selisih_nilai,
        dibuat_pada: row.dibuat_pada,
        diperbarui_pada: row.diperbarui_pada
      };
      
      stokOpnameList.push({
        ...stokOpname,
        items
      });
    }

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;

    return {
      success: true,
      data: stokOpnameList,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage
      }
    };
  }

  /**
   * Mencari stok opname berdasarkan ID
   */
  static async findById(scope: AccessScope, id: string): Promise<StokOpnameWithItems | null> {
    const sql = `
      SELECT so.*
      FROM stock_opname so
      WHERE so.id = ?
    `;

    const scopedSql = applyScopeToSql(sql, [id], scope, {
      tenantColumn: 'so.tenant_id',
      storeColumn: 'so.toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedSql.sql, scopedSql.params);
    
    if (rows.length === 0) return null;

    const stokOpname = rows[0] as StokOpname;
    const items = await this.getItemsByStokOpnameId(id);

    return {
      ...stokOpname,
      items
    };
  }

  /**
   * Membuat stok opname baru
   */
  static async create(
    scope: AccessScope,
    data: StokOpnameCreateData,
    userId: string
  ): Promise<StokOpnameWithItems> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Generate nomor opname otomatis
      const nomorOpname = await this.generateNomorOpname(scope);
      const stokOpnameId = uuidv4();

      // Hitung total item dan total selisih nilai
      let totalItem = data.items.length;
      let totalSelisihNilai = 0;

      // Insert header stok opname
      const headerSql = `
        INSERT INTO stock_opname (
          id, tenant_id, toko_id, pengguna_id, nomor_opname, tanggal,
          keterangan, status, total_item, total_selisih_nilai,
          dibuat_pada, diperbarui_pada
        ) VALUES (?, ?, ?, ?, ?, NOW(), ?, 'draft', ?, ?, NOW(), NOW())
      `;

      await connection.execute(headerSql, [
        stokOpnameId,
        scope.tenantId,
        scope.storeId || null,
        userId,
        nomorOpname,
        data.catatan || null,
        totalItem,
        0 // akan diupdate setelah insert items
      ]);

      // Insert setiap item
      for (const item of data.items) {
        // Ambil data produk dan harga
        const produkSql = `SELECT harga_jual FROM produk WHERE id = ?`;
        const [produkRows] = await connection.execute<RowDataPacket[]>(produkSql, [item.id_produk]);
        const hargaSatuan = produkRows[0]?.harga_jual || 0;

        // Ambil stok sistem dari inventaris
        const stokSistemSql = `
          SELECT stok_tersedia 
          FROM inventaris 
          WHERE produk_id = ? ${scope.storeId ? 'AND toko_id = ?' : ''}
        `;
        
        const stokParams = [item.id_produk];
        if (scope.storeId) stokParams.push(scope.storeId);

        const [stokRows] = await connection.execute<RowDataPacket[]>(stokSistemSql, stokParams);
        const stokSistem = stokRows[0]?.stok_tersedia || 0;

        const stokFisik = item.stok_fisik || 0;

        // Insert item stok opname (tanpa selisih dan nilai_selisih karena generated column)
        const itemSql = `
          INSERT INTO stock_opname_items (
            stock_opname_id, produk_id, stok_sistem, stok_fisik,
            harga_satuan, keterangan
          ) VALUES (?, ?, ?, ?, ?, ?)
        `;

        await connection.execute(itemSql, [
          stokOpnameId,
          item.id_produk,
          stokSistem,
          stokFisik,
          hargaSatuan,
          item.catatan || null
        ]);
      }

      // Hitung total selisih nilai dari database setelah insert
      const totalSql = `
        SELECT SUM(nilai_selisih) as total_selisih
        FROM stock_opname_items 
        WHERE stock_opname_id = ?
      `;
      const [totalRows] = await connection.execute<RowDataPacket[]>(totalSql, [stokOpnameId]);
      totalSelisihNilai = totalRows[0]?.total_selisih || 0;

      // Update total selisih nilai di header
      const updateHeaderSql = `
        UPDATE stock_opname 
        SET total_selisih_nilai = ?, diperbarui_pada = NOW()
        WHERE id = ?
      `;
      await connection.execute(updateHeaderSql, [totalSelisihNilai, stokOpnameId]);

      await connection.commit();

      const created = await this.findById(scope, stokOpnameId);
      if (!created) throw new Error('Gagal membuat stok opname');

      return created;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Generate nomor opname otomatis
   */
  private static async generateNomorOpname(scope: AccessScope): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `SO${year}${month}`;

    const sql = `
      SELECT nomor_opname 
      FROM stock_opname 
      WHERE nomor_opname LIKE ? AND tenant_id = ?
      ORDER BY nomor_opname DESC 
      LIMIT 1
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [`${prefix}%`, scope.tenantId]);
    
    let nextNumber = 1;
    if (rows.length > 0) {
      const lastNumber = rows[0].nomor_opname.substring(prefix.length);
      nextNumber = parseInt(lastNumber) + 1;
    }

    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
  }

  /**
   * Mengambil items berdasarkan stok opname ID
   */
  private static async getItemsByStokOpnameId(stokOpnameId: string): Promise<StokOpnameItemWithProduk[]> {
    const sql = `
      SELECT 
        soi.*,
        p.nama as produk_nama,
        p.kode as produk_kode
      FROM stock_opname_items soi
      LEFT JOIN produk p ON soi.produk_id = p.id
      WHERE soi.stock_opname_id = ?
      ORDER BY soi.dibuat_pada
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [stokOpnameId]);

    return rows.map(row => ({
      id: row.id,
      stock_opname_id: row.stock_opname_id,
      produk_id: row.produk_id,
      stok_sistem: row.stok_sistem,
      stok_fisik: row.stok_fisik,
      selisih: row.selisih,
      harga_satuan: row.harga_satuan,
      nilai_selisih: row.nilai_selisih,
      keterangan: row.keterangan,
      dibuat_pada: row.dibuat_pada,
      diperbarui_pada: row.diperbarui_pada,
      produk: row.produk_nama ? {
        id: row.produk_id,
        nama: row.produk_nama,
        kode: row.produk_kode
      } : undefined
    }));
  }
}