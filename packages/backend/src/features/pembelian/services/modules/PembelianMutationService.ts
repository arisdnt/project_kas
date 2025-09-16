/**
 * Purchase Mutation Service Module
 * Handles purchase transaction create, update, delete operations
 */

import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';
import { CreateTransaksiPembelian, UpdateTransaksiPembelian, StatusPembelian } from '../../models/TransaksiPembelianCore';
import { CreateItemPembelian } from '../../models/ItemPembelianModel';
import { v4 as uuidv4 } from 'uuid';

export class PembelianMutationService {
  static async create(
    scope: AccessScope,
    data: CreateTransaksiPembelian,
    items: CreateItemPembelian[]
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
        pengguna_id: data.pengguna_id, // Should be provided by caller
        nomor_transaksi,
        dibuat_pada: now,
        diperbarui_pada: now
      };

      const headerSql = `
        INSERT INTO transaksi_pembelian (
          id, tenant_id, toko_id, pengguna_id, supplier_id, nomor_transaksi, nomor_po,
          tanggal, jatuh_tempo, subtotal, diskon_persen, diskon_nominal,
          pajak_persen, pajak_nominal, total, status, status_pembayaran, catatan,
          dibuat_pada, diperbarui_pada
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute<ResultSetHeader>(headerSql, [
        transactionData.id, transactionData.tenant_id, transactionData.toko_id,
        transactionData.pengguna_id, transactionData.supplier_id, transactionData.nomor_transaksi,
        transactionData.nomor_po, transactionData.tanggal, transactionData.jatuh_tempo,
        transactionData.subtotal, transactionData.diskon_persen, transactionData.diskon_nominal,
        transactionData.pajak_persen, transactionData.pajak_nominal, transactionData.total,
        transactionData.status, transactionData.status_pembayaran, transactionData.catatan,
        transactionData.dibuat_pada, transactionData.diperbarui_pada
      ]);

      // Create transaction items
      for (const item of items) {
        const itemId = uuidv4();
        const itemSql = `
          INSERT INTO item_transaksi_pembelian (
            id, transaksi_pembelian_id, produk_id, kuantitas, harga_satuan,
            diskon_persen, diskon_nominal, subtotal, catatan, dibuat_pada
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await connection.execute<ResultSetHeader>(itemSql, [
          itemId, id, item.produk_id, item.kuantitas, item.harga_satuan,
          item.diskon_persen || 0, item.diskon_nominal || 0, item.subtotal,
          item.catatan || null, now
        ]);

        // Update inventory if purchase is received
        if (data.status === StatusPembelian.RECEIVED) {
          await this.updateInventoryStock(connection, item.produk_id, scope.storeId!, item.kuantitas);
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

  static async update(scope: AccessScope, id: string, data: UpdateTransaksiPembelian) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get current transaction
      const [currentRows] = await connection.execute<RowDataPacket[]>(
        'SELECT status FROM transaksi_pembelian WHERE id = ?', [id]
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

      const sql = `UPDATE transaksi_pembelian SET ${updates.join(', ')} WHERE id = ?`;
      const [result] = await connection.execute<ResultSetHeader>(sql, params);

      // Handle inventory updates if status changed to received
      if (data.status === StatusPembelian.RECEIVED && currentTransaction.status !== StatusPembelian.RECEIVED) {
        const [itemRows] = await connection.execute<RowDataPacket[]>(
          'SELECT produk_id, kuantitas FROM item_transaksi_pembelian WHERE transaksi_pembelian_id = ?', [id]
        );

        for (const item of itemRows) {
          await this.updateInventoryStock(connection, item.produk_id, scope.storeId!, item.kuantitas);
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
    const sql = `UPDATE transaksi_pembelian SET status = 'cancelled', diperbarui_pada = NOW() WHERE id = ?`;
    const [result] = await pool.execute<ResultSetHeader>(sql, [id]);

    if (result.affectedRows === 0) {
      throw new Error('Transaction not found or access denied');
    }

    return { id, cancelled: true };
  }

  private static async generateTransactionNumber(storeId: string): Promise<string> {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `TB${today}`;

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM transaksi_pembelian
       WHERE nomor_transaksi LIKE ? AND toko_id = ?`,
      [`${prefix}%`, storeId]
    );

    const sequence = (Number(rows[0]?.count || 0) + 1).toString().padStart(4, '0');
    return `${prefix}${sequence}`;
  }

  private static async updateInventoryStock(connection: any, produkId: string, tokoId: string, quantity: number) {
    await connection.execute(
      `INSERT INTO inventaris (produk_id, toko_id, stok_tersedia, terakhir_update)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         stok_tersedia = stok_tersedia + ?,
         terakhir_update = NOW()`,
      [produkId, tokoId, quantity, quantity]
    );
  }
}