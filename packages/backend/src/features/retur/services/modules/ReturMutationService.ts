/**
 * Return Mutation Service Module
 * Handles return create, update, delete operations
 */

import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';
import { CreateReturPenjualan, CreateReturPembelian, UpdateRetur, StatusRetur } from '../../models/ReturCore';
import { CreateItemReturPenjualan, CreateItemReturPembelian } from '../../models/ItemReturModel';
import { v4 as uuidv4 } from 'uuid';

export interface CreateReturPenjualanRequest {
  retur: CreateReturPenjualan;
  items: CreateItemReturPenjualan[];
}

export interface CreateReturPembelianRequest {
  retur: CreateReturPembelian;
  items: CreateItemReturPembelian[];
}

export class ReturMutationService {
  static async createSalesReturn(scope: AccessScope, request: CreateReturPenjualanRequest) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const id = uuidv4();
      const now = new Date();

      // Generate return number
      const nomorRetur = await this.generateReturnNumber('penjualan', scope.storeId!);

      // Create return header
      const returData = {
        ...request.retur,
        id,
        tenant_id: scope.tenantId,
        toko_id: scope.storeId!,
        pengguna_id: request.retur.pengguna_id,
        nomor_retur: nomorRetur,
        dibuat_pada: now,
        diperbarui_pada: now
      };

      const headerSql = `
        INSERT INTO retur_penjualan (
          id, tenant_id, toko_id, pengguna_id, transaksi_penjualan_id, pelanggan_id,
          nomor_retur, tanggal, alasan_retur, subtotal, diskon_persen, diskon_nominal,
          pajak_persen, pajak_nominal, total, metode_pengembalian, status, catatan,
          dibuat_pada, diperbarui_pada
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute<ResultSetHeader>(headerSql, [
        returData.id, returData.tenant_id, returData.toko_id, returData.pengguna_id,
        returData.transaksi_penjualan_id, returData.pelanggan_id || null,
        returData.nomor_retur, returData.tanggal, returData.alasan_retur,
        returData.subtotal, returData.diskon_persen, returData.diskon_nominal,
        returData.pajak_persen, returData.pajak_nominal, returData.total,
        returData.metode_pengembalian, returData.status, returData.catatan || null,
        returData.dibuat_pada, returData.diperbarui_pada
      ]);

      // Create return items
      for (const item of request.items) {
        const itemId = uuidv4();
        const itemSql = `
          INSERT INTO item_retur_penjualan (
            id, retur_penjualan_id, produk_id, kuantitas, harga_satuan,
            diskon_persen, diskon_nominal, subtotal, catatan, dibuat_pada
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await connection.execute<ResultSetHeader>(itemSql, [
          itemId, id, item.produk_id, item.kuantitas, item.harga_satuan,
          item.diskon_persen || 0, item.diskon_nominal || 0, item.subtotal,
          item.catatan || null, now
        ]);

        // Update inventory when return is completed
        if (request.retur.status === StatusRetur.COMPLETED) {
          await this.updateInventoryStock(connection, item.produk_id, scope.storeId!, item.kuantitas);
        }
      }

      await connection.commit();
      return returData;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async createPurchaseReturn(scope: AccessScope, request: CreateReturPembelianRequest) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const id = uuidv4();
      const now = new Date();

      // Generate return number
      const nomorRetur = await this.generateReturnNumber('pembelian', scope.storeId!);

      // Create return header
      const returData = {
        ...request.retur,
        id,
        tenant_id: scope.tenantId,
        toko_id: scope.storeId!,
        pengguna_id: request.retur.pengguna_id,
        nomor_retur: nomorRetur,
        dibuat_pada: now,
        diperbarui_pada: now
      };

      const headerSql = `
        INSERT INTO retur_pembelian (
          id, tenant_id, toko_id, pengguna_id, transaksi_pembelian_id, supplier_id,
          nomor_retur, tanggal, alasan_retur, subtotal, diskon_persen, diskon_nominal,
          pajak_persen, pajak_nominal, total, metode_pengembalian, status, catatan,
          dibuat_pada, diperbarui_pada
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute<ResultSetHeader>(headerSql, [
        returData.id, returData.tenant_id, returData.toko_id, returData.pengguna_id,
        returData.transaksi_pembelian_id, returData.supplier_id,
        returData.nomor_retur, returData.tanggal, returData.alasan_retur,
        returData.subtotal, returData.diskon_persen, returData.diskon_nominal,
        returData.pajak_persen, returData.pajak_nominal, returData.total,
        returData.metode_pengembalian, returData.status, returData.catatan || null,
        returData.dibuat_pada, returData.diperbarui_pada
      ]);

      // Create return items
      for (const item of request.items) {
        const itemId = uuidv4();
        const itemSql = `
          INSERT INTO item_retur_pembelian (
            id, retur_pembelian_id, produk_id, kuantitas, harga_satuan,
            diskon_persen, diskon_nominal, subtotal, catatan, dibuat_pada
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await connection.execute<ResultSetHeader>(itemSql, [
          itemId, id, item.produk_id, item.kuantitas, item.harga_satuan,
          item.diskon_persen || 0, item.diskon_nominal || 0, item.subtotal,
          item.catatan || null, now
        ]);

        // Reduce inventory when purchase return is completed
        if (request.retur.status === StatusRetur.COMPLETED) {
          await this.updateInventoryStock(connection, item.produk_id, scope.storeId!, -item.kuantitas);
        }
      }

      await connection.commit();
      return returData;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateReturn(scope: AccessScope, id: string, data: UpdateRetur, type: 'penjualan' | 'pembelian') {
    const tableName = type === 'penjualan' ? 'retur_penjualan' : 'retur_pembelian';

    const updates: string[] = [];
    const params: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    });

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    updates.push('diperbarui_pada = NOW()');
    params.push(id);

    const sql = `UPDATE ${tableName} SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute<ResultSetHeader>(sql, params);

    if (result.affectedRows === 0) {
      throw new Error('Return not found or access denied');
    }

    return { id, updated: true };
  }

  private static async generateReturnNumber(type: 'penjualan' | 'pembelian', storeId: string): Promise<string> {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = type === 'penjualan' ? `RJ${today}` : `RB${today}`;
    const tableName = type === 'penjualan' ? 'retur_penjualan' : 'retur_pembelian';

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM ${tableName}
       WHERE nomor_retur LIKE ? AND toko_id = ?`,
      [`${prefix}%`, storeId]
    );

    const sequence = (Number(rows[0]?.count || 0) + 1).toString().padStart(4, '0');
    return `${prefix}${sequence}`;
  }

  private static async updateInventoryStock(connection: any, produkId: string, tokoId: string, quantity: number) {
    await connection.execute(
      `UPDATE inventaris SET
         stok_tersedia = stok_tersedia + ?,
         terakhir_update = NOW()
       WHERE produk_id = ? AND toko_id = ?`,
      [quantity, produkId, tokoId]
    );
  }
}