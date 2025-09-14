/**
 * Modul untuk mendapatkan semua produk dengan pagination dan filter
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { RowDataPacket } from 'mysql2';
import pool from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import {
  ProdukWithRelations,
  ProdukQuery
} from '../../../models/Produk';

/**
 * Interface untuk hasil getAllProduk
 */
export interface GetAllProdukResult {
  produk: ProdukWithRelations[];
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

/**
 * Mendapatkan semua produk dengan pagination dan filter (Optimized)
 * @param query - Parameter query untuk filter dan pagination
 * @param scope - Access scope untuk multi-tenant
 * @returns Promise dengan hasil produk dan metadata pagination
 */
export async function getAllProduk(
  query: ProdukQuery, 
  scope: AccessScope
): Promise<GetAllProdukResult> {
  try {
    const { page, limit, search, kategori, brand, supplier } = query;
    const offset = (page - 1) * limit;
    
    // Build base WHERE clause (tanpa scope)
    let whereConditions: string[] = [];
    const params: any[] = [];
    
    if (search) {
      // Search by nama or kode
      whereConditions.push('(p.nama LIKE ? OR p.kode LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    if (kategori) {
      whereConditions.push('p.kategori_id = ?');
      params.push(kategori);
    }
    
    if (brand) {
      whereConditions.push('p.brand_id = ?');
      params.push(brand);
    }
    
    if (supplier) {
      whereConditions.push('p.supplier_id = ?');
      params.push(supplier);
    }

    // Build count query
    let countBase = `
      SELECT COUNT(*) as total
      FROM produk p
      LEFT JOIN kategori k ON p.kategori_id = k.id
      LEFT JOIN brand b ON p.brand_id = b.id
      LEFT JOIN supplier s ON p.supplier_id = s.id
    `;

    // Apply WHERE conditions if any
    if (whereConditions.length > 0) {
      countBase += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    // Apply scope untuk count - produk hanya dibatasi tenant, bukan toko
    const modifiedScope = { ...scope, enforceStore: false };
    const scopedCount = applyScopeToSql(countBase, params, modifiedScope, {
      tenantColumn: 'p.tenant_id'
    });
    console.log('Count SQL:', scopedCount.sql);
    console.log('Count Params:', scopedCount.params);
    
    const [countResult] = await pool.execute<RowDataPacket[]>(
      scopedCount.sql,
      scopedCount.params
    );
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;

    // Build main query
    let baseQuery = `
      SELECT 
        p.id,
        p.kode,
        p.nama,
        p.deskripsi,
        p.harga_beli,
        p.harga_jual,
        p.stok_minimum,
        p.satuan,
        p.kategori_id,
        p.brand_id,
        p.supplier_id,
        p.is_aktif,
        p.dibuat_pada,
        p.diperbarui_pada,
        k.nama as kategori_nama,
        b.nama as brand_nama,
        s.nama as supplier_nama
      FROM produk p
      LEFT JOIN kategori k ON p.kategori_id = k.id
      LEFT JOIN brand b ON p.brand_id = b.id
      LEFT JOIN supplier s ON p.supplier_id = s.id
    `;

    // Apply WHERE conditions if any
    if (whereConditions.length > 0) {
      baseQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    // Apply scope untuk main query - produk hanya dibatasi tenant, bukan toko
    const scopedQuery = applyScopeToSql(baseQuery, params, modifiedScope, {
      tenantColumn: 'p.tenant_id'
    });
    
    // Tambahkan ORDER BY dan LIMIT setelah scope
    scopedQuery.sql += ` ORDER BY p.dibuat_pada DESC LIMIT ${limit} OFFSET ${offset}`;
    
    const [rows] = await pool.execute<RowDataPacket[]>(
      scopedQuery.sql,
      scopedQuery.params
    );

    const produk = rows.map(row => ({
      id: row.id,
      kode: row.kode,
      nama: row.nama,
      deskripsi: row.deskripsi,
      harga_beli: row.harga_beli,
      harga_jual: row.harga_jual,
      stok_minimum: row.stok_minimum,
      satuan: row.satuan,
      kategori_id: row.kategori_id,
      brand_id: row.brand_id,
      supplier_id: row.supplier_id,
      is_aktif: row.is_aktif,
      dibuat_pada: row.dibuat_pada,
      diperbarui_pada: row.diperbarui_pada,
      kategori: row.kategori_nama ? {
        id: row.kategori_id,
        nama: row.kategori_nama
      } : null,
      brand: row.brand_nama ? {
        id: row.brand_id,
        nama: row.brand_nama
      } : null,
      supplier: row.supplier_nama ? {
        id: row.supplier_id,
        nama: row.supplier_nama
      } : null
    })) as ProdukWithRelations[];

    return {
      produk,
      total,
      totalPages,
      hasNextPage
    };
  } catch (error) {
    logger.error({ error }, 'Error getting all produk');
    throw new Error('Gagal mengambil data produk');
  }
}