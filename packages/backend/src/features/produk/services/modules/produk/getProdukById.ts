/**
 * Modul untuk mendapatkan produk berdasarkan ID
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { RowDataPacket } from 'mysql2';
import pool from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { ProdukWithRelations } from '../../../models/Produk';

/**
 * Mendapatkan produk berdasarkan ID dengan relasi kategori, brand, dan supplier
 * @param id - ID produk yang akan dicari
 * @param scope - Access scope untuk multi-tenant
 * @returns Promise dengan data produk atau null jika tidak ditemukan
 */
export async function getProdukById(
  id: string, 
  scope: AccessScope
): Promise<ProdukWithRelations | null> {
  try {
    const baseQuery = `
      SELECT 
        p.id,
        p.kode,
        p.nama,
        p.deskripsi,
        p.harga_beli,
        p.harga_jual,
        p.stok,
        p.stok_minimum,
        p.satuan,
        p.kategori_id,
        p.brand_id,
        p.supplier_id,
        p.status,
        p.created_at,
        p.updated_at,
        k.nama as kategori_nama,
        k.deskripsi as kategori_deskripsi,
        b.nama as brand_nama,
        b.deskripsi as brand_deskripsi,
        s.nama as supplier_nama,
        s.kontak as supplier_kontak,
        s.alamat as supplier_alamat
      FROM produk p
      LEFT JOIN kategori k ON p.kategori_id = k.id
      LEFT JOIN brand b ON p.brand_id = b.id
      LEFT JOIN supplier s ON p.supplier_id = s.id
      WHERE p.id = ?
    `;

    // Apply scope
    const scopedQuery = applyScopeToSql(baseQuery, [id], scope);
    
    const [rows] = await pool.execute<RowDataPacket[]>(
      scopedQuery.sql,
      scopedQuery.params
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    const produk: ProdukWithRelations = {
      id: row.id,
      nama: row.nama,
      satuan: row.satuan,
      kategori_id: row.kategori_id,
      brand_id: row.brand_id,
      supplier_id: row.supplier_id,
      kode: row.kode,
      harga_beli: row.harga_beli,
      harga_jual: row.harga_jual,
      margin_persen: row.margin_persen,
      dibuat_pada: row.created_at,
      diperbarui_pada: row.updated_at,
      kategori: row.kategori_nama ? {
        nama: row.kategori_nama,
        id: row.kategori_id
      } : undefined,
      brand: row.brand_nama ? {
        nama: row.brand_nama,
        id: row.brand_id
      } : undefined,
      supplier: row.supplier_nama ? {
        nama: row.supplier_nama,
        id: row.supplier_id,
        alamat: row.supplier_alamat
      } : undefined
    };

    return produk;
  } catch (error) {
    logger.error({ error, id }, 'Error getting produk by id');
    throw new Error('Gagal mengambil data produk');
  }
}