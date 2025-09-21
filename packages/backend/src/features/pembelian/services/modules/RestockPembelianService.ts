import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';
import { RestockItem } from '../../models/RestockPembelianModel';
import { RestockValidationService } from './RestockValidationService';

export interface RestockOptions {
  supplierId?: string;
  note?: string;
}

export interface RestockResultItem {
  produkId: string;
  qtyAdded: number;
  newStock: number;
  hargaBeli?: number;
}

export interface RestockResult {
  storeId: string;
  tenantId: string;
  items: RestockResultItem[];
  summary: {
    totalItems: number;
    totalQuantity: number;
    totalValue: number;
    warnings?: string[];
  };
}

export class RestockPembelianService {
  /**
   * Naikkan stok inventaris berdasarkan daftar produk yang dipilih.
   * Operasi dilakukan dalam transaksi tunggal agar atomik.
   */
  static async executeRestock(
    scope: AccessScope,
    userId: string,
    items: RestockItem[],
    options: RestockOptions = {}
  ): Promise<RestockResult> {
    if (!scope.storeId) {
      throw new Error('Store ID is required for restok barang');
    }

    // Comprehensive validation
    const validation = await RestockValidationService.validateRestockItems(items, scope);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join('; ')}`);
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const results: RestockResultItem[] = [];

      for (const item of items) {
        const productParams: any[] = [item.produkId];
        let productSql = 'SELECT id, tenant_id FROM produk WHERE id = ?';

        if (scope.enforceTenant) {
          productSql += ' AND tenant_id = ?';
          productParams.push(scope.tenantId);
        }

        const [productRows] = await connection.execute<RowDataPacket[]>(productSql, productParams);
        if (productRows.length === 0) {
          throw new Error('Produk tidak ditemukan atau tidak dapat diakses');
        }

        await connection.execute<ResultSetHeader>(
          `INSERT INTO inventaris (produk_id, toko_id, stok_tersedia, terakhir_update)
           VALUES (?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE
             stok_tersedia = stok_tersedia + VALUES(stok_tersedia),
             terakhir_update = NOW()`,
          [item.produkId, scope.storeId, item.qty]
        );

        if (item.hargaBeli !== undefined) {
          const updateParams: any[] = [item.hargaBeli, item.produkId];
          let updateSql = 'UPDATE produk SET harga_beli = ?, diperbarui_pada = NOW() WHERE id = ?';
          if (scope.enforceTenant) {
            updateSql += ' AND tenant_id = ?';
            updateParams.push(scope.tenantId);
          }
          await connection.execute<ResultSetHeader>(updateSql, updateParams);
        }

        const [inventoryRows] = await connection.execute<RowDataPacket[]>(
          'SELECT stok_tersedia FROM inventaris WHERE produk_id = ? AND toko_id = ? LIMIT 1',
          [item.produkId, scope.storeId]
        );

        results.push({
          produkId: item.produkId,
          qtyAdded: item.qty,
          newStock: Number(inventoryRows[0]?.stok_tersedia ?? item.qty),
          hargaBeli: item.hargaBeli,
        });
      }

      // Create audit log for restock operation
      if (options.note) {
        await connection.execute<ResultSetHeader>(
          `INSERT INTO audit_log (
            tenant_id, user_id, tabel, record_id, aksi,
            data_baru, ip_address, user_agent, dibuat_pada
          ) VALUES (?, ?, 'inventaris', 'restock_batch', 'CREATE', ?, '127.0.0.1', 'POS-System', NOW())`,
          [
            scope.tenantId,
            userId,
            JSON.stringify({
              operation: 'bulk_restock',
              items_count: items.length,
              total_quantity: items.reduce((sum, item) => sum + item.qty, 0),
              note: options.note,
              supplier_id: options.supplierId || null,
              timestamp: new Date().toISOString()
            })
          ]
        );
      }

      await connection.commit();

      // Generate summary
      const summary = RestockValidationService.generateRestockSummary(validation.validatedItems);

      return {
        storeId: scope.storeId,
        tenantId: scope.tenantId,
        items: results,
        summary: {
          totalItems: summary.totalItems,
          totalQuantity: summary.totalQuantity,
          totalValue: summary.totalValue,
          warnings: validation.warnings.length > 0 ? validation.warnings : undefined
        }
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
