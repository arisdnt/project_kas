/**
 * Transaction Mutation Service Module
 * Handles sales transaction create, update, delete operations
 */

import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';
import { CreateTransaksiPenjualan, UpdateTransaksiPenjualan, StatusTransaksi } from '../../models/TransaksiPenjualanCore';
import { CreateItemTransaksi } from '../../models/ItemTransaksiModel';
import { v4 as uuidv4 } from 'uuid';

export class TransaksiMutationService {
  static async create(
    scope: AccessScope,
    data: CreateTransaksiPenjualan,
    items: CreateItemTransaksi[]
  ) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const id = uuidv4();
      const now = new Date();

      // Generate transaction number
      const nomor_transaksi = await this.generateTransactionNumber(scope.storeId!);

      // Create transaction header
      const transactionData = {
        ...data,
        id,
        tenant_id: scope.tenantId,
        toko_id: scope.storeId!,
        pengguna_id: data.pengguna_id,
        nomor_transaksi,
        dibuat_pada: now,
        diperbarui_pada: now
      };

      const headerSql = `
        INSERT INTO transaksi_penjualan (
          id, tenant_id, toko_id, pengguna_id, pelanggan_id, nomor_transaksi,
          tanggal, subtotal, diskon_persen, diskon_nominal, pajak_persen, pajak_nominal,
          total, bayar, kembalian, metode_bayar, status, catatan, dibuat_pada, diperbarui_pada
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute<ResultSetHeader>(headerSql, [
        transactionData.id, transactionData.tenant_id, transactionData.toko_id,
        transactionData.pengguna_id, transactionData.pelanggan_id, transactionData.nomor_transaksi,
        transactionData.tanggal, transactionData.subtotal, transactionData.diskon_persen,
        transactionData.diskon_nominal, transactionData.pajak_persen, transactionData.pajak_nominal,
        transactionData.total, transactionData.bayar, transactionData.kembalian,
        transactionData.metode_bayar, transactionData.status, transactionData.catatan,
        transactionData.dibuat_pada, transactionData.diperbarui_pada
      ]);

      // Create transaction items
      for (const item of items) {
        const itemId = uuidv4();
        const itemSql = `
          INSERT INTO item_transaksi_penjualan (
            id, transaksi_penjualan_id, produk_id, kuantitas, harga_satuan,
            diskon_persen, diskon_nominal, subtotal, promo_id, catatan, dibuat_pada
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await connection.execute<ResultSetHeader>(itemSql, [
          itemId, id, item.produk_id, item.kuantitas, item.harga_satuan,
          item.diskon_persen || 0, item.diskon_nominal || 0, item.subtotal,
          item.promo_id || null, item.catatan || null, now
        ]);

        // Update inventory if transaction is completed
        if (data.status === StatusTransaksi.COMPLETED) {
          await this.updateInventoryStock(connection, item.produk_id, scope.storeId!, -item.kuantitas);
        }
      }

      await connection.commit();
      return transactionData;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(scope: AccessScope, id: string, data: UpdateTransaksiPenjualan) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get current transaction
      const [currentRows] = await connection.execute<RowDataPacket[]>(
        'SELECT status FROM transaksi_penjualan WHERE id = ?', [id]
      );
      const currentTransaction = currentRows[0];
      if (!currentTransaction) {
        throw new Error('Transaction not found');
      }

      const updates: string[] = [];
      const params: any[] = [];

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

      const sql = `UPDATE transaksi_penjualan SET ${updates.join(', ')} WHERE id = ?`;
      const [result] = await connection.execute<ResultSetHeader>(sql, params);

      // Handle inventory updates if status changed to completed
      if (data.status === StatusTransaksi.COMPLETED && currentTransaction.status !== StatusTransaksi.COMPLETED) {
        const [itemRows] = await connection.execute<RowDataPacket[]>(
          'SELECT produk_id, kuantitas FROM item_transaksi_penjualan WHERE transaksi_penjualan_id = ?', [id]
        );

        for (const item of itemRows) {
          await this.updateInventoryStock(connection, item.produk_id, scope.storeId!, -item.kuantitas);
        }
      }

      await connection.commit();

      if (result.affectedRows === 0) {
        throw new Error('Transaction not found or access denied');
      }

      return { id, updated: true };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(scope: AccessScope, id: string) {
    const sql = `UPDATE transaksi_penjualan SET status = 'cancelled', diperbarui_pada = NOW() WHERE id = ?`;
    const [result] = await pool.execute<ResultSetHeader>(sql, [id]);

    if (result.affectedRows === 0) {
      throw new Error('Transaction not found or access denied');
    }

    return { id, cancelled: true };
  }

  private static async generateTransactionNumber(storeId: string): Promise<string> {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `TJ${today}`;

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM transaksi_penjualan
       WHERE nomor_transaksi LIKE ? AND toko_id = ?`,
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