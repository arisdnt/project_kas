/**
 * Product Mutation Service Module
 * Handles product create, update, delete operations with scope validation
 */

import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { CreateProduk, UpdateProduk } from '../../models/ProdukCore';
import { v4 as uuidv4 } from 'uuid';

export class ProdukMutationService {
  static async create(scope: AccessScope, data: CreateProduk) {
    const id = uuidv4();
    const now = new Date();

    // Ensure tenant isolation
    const produkData = {
      ...data,
      id,
      tenant_id: scope.tenantId,
      toko_id: data.toko_id || scope.storeId,
      dibuat_pada: now,
      diperbarui_pada: now
    };

    const sql = `
      INSERT INTO produk (
        id, tenant_id, toko_id, kategori_id, brand_id, supplier_id,
        kode, barcode, nama, deskripsi, satuan,
        harga_beli, harga_jual, margin_persen, stok_minimum,
        berat, dimensi, gambar_url, is_aktif, is_dijual_online,
        pajak_persen, dibuat_pada, diperbarui_pada
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      produkData.id, produkData.tenant_id, (produkData.toko_id ?? null),
      produkData.kategori_id, produkData.brand_id, produkData.supplier_id,
      produkData.kode, (produkData.barcode ?? null), produkData.nama,
      (produkData.deskripsi ?? null), produkData.satuan, (produkData.harga_beli ?? 0),
      (produkData.harga_jual ?? 0), (produkData.margin_persen ?? 0), (produkData.stok_minimum ?? 0),
      (produkData.berat ?? 0), (produkData.dimensi ?? null), (produkData.gambar_url ?? null),
      (produkData.is_aktif ?? 1), (produkData.is_dijual_online ?? 0),
      (produkData.pajak_persen ?? 0), produkData.dibuat_pada, produkData.diperbarui_pada
    ];

    await pool.execute<ResultSetHeader>(sql, params);
    return produkData;
  }

  static async update(scope: AccessScope, id: string, data: UpdateProduk) {
    const updates: string[] = [];
    const params: any[] = [];

    // Build dynamic update query
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'tenant_id') {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    });

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    updates.push('diperbarui_pada = NOW()');
    params.push(id);

    const sql = `UPDATE produk SET ${updates.join(', ')} WHERE id = ?`;

    const scopedQuery = applyScopeToSql(sql, params, scope, {
      tenantColumn: 'tenant_id',
      storeColumn: 'toko_id'
    });

    const [result] = await pool.execute<ResultSetHeader>(scopedQuery.sql, scopedQuery.params);

    if (result.affectedRows === 0) {
      throw new Error('Product not found or access denied');
    }

    return { id, updated: true };
  }

  static async delete(scope: AccessScope, id: string) {
    // Soft delete by setting is_aktif to 0
    const sql = `UPDATE produk SET is_aktif = 0, diperbarui_pada = NOW() WHERE id = ?`;

    const scopedQuery = applyScopeToSql(sql, [id], scope, {
      tenantColumn: 'tenant_id',
      storeColumn: 'toko_id'
    });

    const [result] = await pool.execute<ResultSetHeader>(scopedQuery.sql, scopedQuery.params);

    if (result.affectedRows === 0) {
      throw new Error('Product not found or access denied');
    }

    return { id, deleted: true };
  }

  static async checkCodeExists(scope: AccessScope, kode: string, excludeId?: string) {
    let sql = `SELECT COUNT(*) as count FROM produk WHERE kode = ?`;
    const params = [kode];

    if (excludeId) {
      sql += ` AND id != ?`;
      params.push(excludeId);
    }

    const scopedQuery = applyScopeToSql(sql, params, scope, {
      tenantColumn: 'tenant_id',
      storeColumn: 'toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return Number(rows[0]?.count || 0) > 0;
  }
}