/**
 * Promo Mutation Service Module
 * Handles promo create, update, delete operations
 */

import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';
import { CreatePromo, UpdatePromo } from '../../models/PromoCore';
import { CreatePromoCategory, CreatePromoProduct, CreatePromoCustomer } from '../../models/PromoRelationModel';
import { v4 as uuidv4 } from 'uuid';

export interface CreatePromoRequest {
  promo: CreatePromo;
  categories?: string[];
  products?: string[];
  customers?: string[];
}

export class PromoMutationService {
  static async create(scope: AccessScope, request: CreatePromoRequest) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const id = uuidv4();
      const now = new Date();

      // Validate date range
      if (request.promo.tanggal_berakhir <= request.promo.tanggal_mulai) {
        throw new Error('End date must be after start date');
      }

      // Check if promo code already exists
      const codeExists = await this.checkPromoCodeExists(scope, request.promo.kode_promo);
      if (codeExists) {
        throw new Error('Promo code already exists');
      }

      // Create promo
      const promoData = {
        ...request.promo,
        id,
        tenant_id: scope.tenantId,
        toko_id: scope.storeId!,
        dibuat_pada: now,
        diperbarui_pada: now
      };

      const promoSql = `
        INSERT INTO promo (
          id, tenant_id, toko_id, kode_promo, nama, deskripsi, tipe_promo, tipe_diskon,
          nilai_diskon, tanggal_mulai, tanggal_berakhir, minimum_pembelian, maksimum_penggunaan,
          jumlah_terpakai, status, dibuat_pada, diperbarui_pada
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute<ResultSetHeader>(promoSql, [
        promoData.id, promoData.tenant_id, promoData.toko_id, promoData.kode_promo,
        promoData.nama, promoData.deskripsi, promoData.tipe_promo, promoData.tipe_diskon,
        promoData.nilai_diskon, promoData.tanggal_mulai, promoData.tanggal_berakhir,
        promoData.minimum_pembelian, promoData.maksimum_penggunaan, 0, promoData.status,
        promoData.dibuat_pada, promoData.diperbarui_pada
      ]);

      // Create category relations
      if (request.categories && request.categories.length > 0) {
        for (const categoryId of request.categories) {
          const categoryRelationId = uuidv4();
          await connection.execute<ResultSetHeader>(
            'INSERT INTO promo_kategori (id, promo_id, kategori_id, dibuat_pada) VALUES (?, ?, ?, ?)',
            [categoryRelationId, id, categoryId, now]
          );
        }
      }

      // Create product relations
      if (request.products && request.products.length > 0) {
        for (const productId of request.products) {
          const productRelationId = uuidv4();
          await connection.execute<ResultSetHeader>(
            'INSERT INTO promo_produk (id, promo_id, produk_id, dibuat_pada) VALUES (?, ?, ?, ?)',
            [productRelationId, id, productId, now]
          );
        }
      }

      // Create customer relations
      if (request.customers && request.customers.length > 0) {
        for (const customerId of request.customers) {
          const customerRelationId = uuidv4();
          await connection.execute<ResultSetHeader>(
            'INSERT INTO promo_pelanggan (id, promo_id, pelanggan_id, dibuat_pada) VALUES (?, ?, ?, ?)',
            [customerRelationId, id, customerId, now]
          );
        }
      }

      await connection.commit();
      return { ...promoData };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(scope: AccessScope, id: string, data: UpdatePromo) {
    const updates: string[] = [];
    const params: any[] = [];

    // Build dynamic update query
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'tenant_id' && key !== 'toko_id') {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    });

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    // Check promo code uniqueness if being updated
    if (data.kode_promo) {
      const codeExists = await this.checkPromoCodeExists(scope, data.kode_promo, id);
      if (codeExists) {
        throw new Error('Promo code already exists');
      }
    }

    // Validate date range if dates are being updated
    if (data.tanggal_mulai && data.tanggal_berakhir && data.tanggal_berakhir <= data.tanggal_mulai) {
      throw new Error('End date must be after start date');
    }

    updates.push('diperbarui_pada = NOW()');
    params.push(id);

    const sql = `UPDATE promo SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute<ResultSetHeader>(sql, params);

    if (result.affectedRows === 0) {
      throw new Error('Promo not found or access denied');
    }

    return { id, updated: true };
  }

  static async delete(scope: AccessScope, id: string) {
    const sql = `UPDATE promo SET status = 'nonaktif', diperbarui_pada = NOW() WHERE id = ?`;
    const [result] = await pool.execute<ResultSetHeader>(sql, [id]);

    if (result.affectedRows === 0) {
      throw new Error('Promo not found or access denied');
    }

    return { id, deleted: true };
  }

  private static async checkPromoCodeExists(scope: AccessScope, kodePromo: string, excludeId?: string) {
    let sql = `SELECT COUNT(*) as count FROM promo WHERE kode_promo = ? AND tenant_id = ?`;
    const params = [kodePromo, scope.tenantId];

    if (scope.storeId) {
      sql += ` AND toko_id = ?`;
      params.push(scope.storeId);
    }

    if (excludeId) {
      sql += ` AND id != ?`;
      params.push(excludeId);
    }

    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
    return Number(rows[0]?.count || 0) > 0;
  }
}