/**
 * Modul untuk membuat produk baru
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { ResultSetHeader } from 'mysql2';
import pool from '@/core/database/connection';
import { logger } from '@/core/utils/logger';
import { AccessScope } from '@/core/middleware/accessScope';
import { CreateProduk, Produk } from '../../../models/Produk';
import { randomUUID } from 'crypto';

/**
 * Membuat produk baru
 * @param data - Data produk yang akan dibuat
 * @param scope - Access scope untuk multi-tenant
 * @returns Promise dengan data produk yang telah dibuat
 */
export async function createProduk(
  data: CreateProduk, 
  scope: AccessScope
): Promise<Produk> {
  try {
    const id = randomUUID();
    const now = new Date();
    
    // Validasi tenant_id dari scope
    if (!scope.tenantId) {
      throw new Error('Tenant ID tidak ditemukan dalam scope');
    }

    const query = `
      INSERT INTO produk (
        id, 
        nama, 
        satuan, 
        kategori_id, 
        brand_id, 
        supplier_id, 
        kode, 
        harga_beli, 
        harga_jual, 
        margin_persen, 
        tenant_id, 
        dibuat_pada, 
        diperbarui_pada
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      id,
      data.nama,
      data.satuan || null,
      data.kategori_id || null,
      data.brand_id || null,
      data.supplier_id || null,
      data.kode || null,
      data.harga_beli || null,
      data.harga_jual || null,
      data.margin_persen || null,
      scope.tenantId,
      now,
      now
    ];

    const [result] = await pool.execute<ResultSetHeader>(query, params);

    if (result.affectedRows === 0) {
      throw new Error('Gagal membuat produk');
    }

    // Return produk yang baru dibuat
    const produk: Produk = {
      id,
      nama: data.nama,
      satuan: data.satuan,
      kategori_id: data.kategori_id,
      brand_id: data.brand_id,
      supplier_id: data.supplier_id,
      kode: data.kode,
      harga_beli: data.harga_beli,
      harga_jual: data.harga_jual,
      margin_persen: data.margin_persen,
      dibuat_pada: now,
      diperbarui_pada: now
    };

    logger.info({ produkId: id, tenantId: scope.tenantId }, 'Produk berhasil dibuat');
    return produk;
  } catch (error) {
    logger.error({ error, data }, 'Error creating produk');
    throw new Error('Gagal membuat produk');
  }
}