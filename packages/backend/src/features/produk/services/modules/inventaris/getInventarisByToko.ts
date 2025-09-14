/**
 * Modul untuk mendapatkan inventaris berdasarkan toko
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { RowDataPacket } from 'mysql2';
import pool from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { InventarisWithProduk } from '../../../models/Produk';

/**
 * Interface untuk hasil getInventarisByToko
 */
export interface GetInventarisByTokoResult {
  inventaris: InventarisWithProduk[];
  total: number;
  totalPages: number;
}

/**
 * Mendapatkan inventaris berdasarkan toko dengan pagination
 * @param scope - Access scope untuk multi-tenant
 * @param page - Halaman yang diminta (default: 1)
 * @param limit - Jumlah item per halaman (default: 10)
 * @returns Promise dengan hasil inventaris dan metadata pagination
 */
export async function getInventarisByToko(
  scope: AccessScope,
  page: number = 1,
  limit: number = 10
): Promise<GetInventarisByTokoResult> {
  try {
    const offset = (page - 1) * limit;
    
    if (!scope.storeId) {
      throw new Error('Store ID tidak ditemukan dalam scope');
    }
    
    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM inventaris i
      INNER JOIN produk p ON i.produk_id = p.id
      WHERE i.toko_id = ?
    `;
    
    const modifiedScope = {
      ...scope,
      enforceStore: false
    };
    
    const scopedCount = applyScopeToSql(
      countQuery, 
      [scope.storeId], 
      modifiedScope,
      { tenantColumn: 'p.tenant_id' }
    );
    
    const [countResult] = await pool.execute<RowDataPacket[]>(
      scopedCount.sql,
      scopedCount.params
    );
    
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    // Main query
    const mainQuery = `
      SELECT 
        i.toko_id,
        i.produk_id,
        i.stok_tersedia,
        i.stok_reserved,
        i.harga_jual_toko,
        i.stok_minimum_toko,
        i.lokasi_rak,
        i.terakhir_update,
        p.id as produk_id,
        p.nama as produk_nama,
        p.satuan as produk_satuan,
        p.kode as produk_kode,
        p.harga_beli as produk_harga_beli,
        p.harga_jual as produk_harga_jual,
        k.nama as kategori_nama,
        b.nama as brand_nama,
        s.nama as supplier_nama
      FROM inventaris i
      INNER JOIN produk p ON i.produk_id = p.id
      LEFT JOIN kategori k ON p.kategori_id = k.id
      LEFT JOIN brand b ON p.brand_id = b.id
      LEFT JOIN supplier s ON p.supplier_id = s.id
      WHERE i.toko_id = ?
    `;
    
    const scopedMain = applyScopeToSql(
      mainQuery, 
      [scope.storeId], 
      modifiedScope,
      { tenantColumn: 'p.tenant_id' }
    );
    
    // Tambahkan ORDER BY, LIMIT dan OFFSET setelah scope
    scopedMain.sql += ` ORDER BY p.nama ASC LIMIT ${limit} OFFSET ${offset}`;
    
    const [rows] = await pool.execute<RowDataPacket[]>(
      scopedMain.sql,
      scopedMain.params
    );
    
    const inventaris: InventarisWithProduk[] = rows.map(row => ({
      id_toko: row.toko_id,
      id_produk: row.produk_id,
      stok_tersedia: row.stok_tersedia,
      stok_reserved: row.stok_reserved,
      harga_jual_toko: row.harga_jual_toko,
      stok_minimum_toko: row.stok_minimum_toko,
      lokasi_rak: row.lokasi_rak,
      terakhir_update: row.terakhir_update,
      produk: {
        id: row.produk_id,
        nama: row.produk_nama,
        satuan: row.produk_satuan,
        kode: row.produk_kode,
        harga_beli: row.produk_harga_beli,
        harga_jual: row.produk_harga_jual,
        kategori: row.kategori_nama ? {
          nama: row.kategori_nama
        } : undefined,
        brand: row.brand_nama ? {
          nama: row.brand_nama
        } : undefined,
        supplier: row.supplier_nama ? {
          nama: row.supplier_nama
        } : undefined
      }
    }));
    
    return {
      inventaris,
      total,
      totalPages
    };
  } catch (error) {
    logger.error({ error, scope }, 'Error getting inventaris by toko');
    throw new Error('Gagal mengambil data inventaris');
  }
}