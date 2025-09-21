/**
 * Restock Validation Service - Comprehensive validation for restocking operations
 * Memastikan data konsisten dan aman sebelum mengupdate inventaris
 */

import { Pool, RowDataPacket, PoolConnection } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';
import { RestockItem } from '../../models/RestockPembelianModel';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validatedItems: ValidatedRestockItem[];
}

export interface ValidatedRestockItem extends RestockItem {
  productName: string;
  currentStock: number;
  sku?: string;
  isActive: boolean;
}

export class RestockValidationService {
  private static db: Pool = pool;

  /**
   * Comprehensive validation for restock items
   */
  static async validateRestockItems(
    items: RestockItem[],
    scope: AccessScope
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const validatedItems: ValidatedRestockItem[] = [];

    if (!scope.storeId) {
      errors.push('Store ID is required for restocking operations');
      return { isValid: false, errors, warnings, validatedItems };
    }

    // Check for duplicate products in request
    const produkIds = items.map(item => item.produkId);
    const duplicates = produkIds.filter((id, index) => produkIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate products found in request: ${duplicates.join(', ')}`);
    }

    const connection = await this.db.getConnection();
    try {
      for (const item of items) {
        // Validate individual item
        const itemValidation = await this.validateSingleItem(connection, item, scope);

        if (itemValidation.errors.length > 0) {
          errors.push(...itemValidation.errors);
        }

        if (itemValidation.warnings.length > 0) {
          warnings.push(...itemValidation.warnings);
        }

        if (itemValidation.validatedItem) {
          validatedItems.push(itemValidation.validatedItem);
        }
      }

      // Business logic validations
      this.validateBusinessRules(items, validatedItems, errors, warnings);

    } finally {
      connection.release();
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      validatedItems
    };
  }

  /**
   * Validate a single restock item
   */
  private static async validateSingleItem(
    connection: PoolConnection,
    item: RestockItem,
    scope: AccessScope
  ): Promise<{
    errors: string[];
    warnings: string[];
    validatedItem?: ValidatedRestockItem;
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate product exists and is accessible
    const productParams: any[] = [item.produkId];
    let productSql = `
      SELECT p.id, p.nama, p.kode as sku, p.is_aktif, p.harga_beli,
             COALESCE(i.stok_tersedia, 0) as current_stock
      FROM produk p
      LEFT JOIN inventaris i ON p.id = i.produk_id AND i.toko_id = ?
      WHERE p.id = ?
    `;
    const queryParams = [scope.storeId, item.produkId];

    if (scope.enforceTenant) {
      productSql += ' AND p.tenant_id = ?';
      queryParams.push(scope.tenantId);
    }

    const [productRows] = await connection.execute(productSql, queryParams) as [RowDataPacket[], any];

    if (productRows.length === 0) {
      errors.push(`Product ${item.produkId} not found or not accessible`);
      return { errors, warnings };
    }

    const product = productRows[0];

    // Check if product is active
    if (!product.is_aktif) {
      errors.push(`Product "${product.nama}" is inactive and cannot be restocked`);
    }

    // Validate quantity
    if (item.qty <= 0) {
      errors.push(`Invalid quantity ${item.qty} for product "${product.nama}"`);
    }

    if (item.qty > 10000) {
      warnings.push(`Large quantity ${item.qty} for product "${product.nama}" - please verify`);
    }

    // Validate purchase price
    if (item.hargaBeli !== undefined) {
      if (item.hargaBeli < 0) {
        errors.push(`Invalid purchase price ${item.hargaBeli} for product "${product.nama}"`);
      }

      // Warning if price is significantly different from current price
      const currentPrice = Number(product.harga_beli || 0);
      if (currentPrice > 0 && item.hargaBeli > 0) {
        const priceDiff = Math.abs(item.hargaBeli - currentPrice) / currentPrice;
        if (priceDiff > 0.5) { // 50% difference
          warnings.push(
            `Price change for "${product.nama}": ${currentPrice.toLocaleString()} → ${item.hargaBeli.toLocaleString()}`
          );
        }
      }
    }

    const validatedItem: ValidatedRestockItem = {
      produkId: item.produkId,
      qty: item.qty,
      hargaBeli: item.hargaBeli,
      productName: product.nama,
      currentStock: Number(product.current_stock),
      sku: product.sku,
      isActive: Boolean(product.is_aktif)
    };

    return { errors, warnings, validatedItem };
  }

  /**
   * Apply business rules validation
   */
  private static validateBusinessRules(
    originalItems: RestockItem[],
    validatedItems: ValidatedRestockItem[],
    errors: string[],
    warnings: string[]
  ): void {
    // Check total value of restock
    const totalValue = validatedItems.reduce((sum, item) => {
      const price = item.hargaBeli || 0;
      return sum + (price * item.qty);
    }, 0);

    if (totalValue > 1000000000) { // 1 billion rupiah
      warnings.push(`Very large restock value: Rp ${totalValue.toLocaleString()} - please verify authorization`);
    }

    // Check for unusual patterns
    const highQuantityItems = validatedItems.filter(item => item.qty > 1000);
    if (highQuantityItems.length > 0) {
      warnings.push(
        `High quantity items detected: ${highQuantityItems.map(item =>
          `${item.productName} (${item.qty})`
        ).join(', ')}`
      );
    }

    // Validate total items count
    if (originalItems.length > 100) {
      warnings.push(`Large number of items in single restock: ${originalItems.length}`);
    }
  }

  /**
   * Generate restock summary for audit purposes
   */
  static generateRestockSummary(validatedItems: ValidatedRestockItem[]): {
    totalItems: number;
    totalQuantity: number;
    totalValue: number;
    affectedProducts: string[];
    stockChanges: Array<{
      productName: string;
      beforeStock: number;
      addedQuantity: number;
      afterStock: number;
    }>;
  } {
    const totalItems = validatedItems.length;
    const totalQuantity = validatedItems.reduce((sum, item) => sum + item.qty, 0);
    const totalValue = validatedItems.reduce((sum, item) => {
      const price = item.hargaBeli || 0;
      return sum + (price * item.qty);
    }, 0);

    const affectedProducts = validatedItems.map(item => item.productName);
    const stockChanges = validatedItems.map(item => ({
      productName: item.productName,
      beforeStock: item.currentStock,
      addedQuantity: item.qty,
      afterStock: item.currentStock + item.qty
    }));

    return {
      totalItems,
      totalQuantity,
      totalValue,
      affectedProducts,
      stockChanges
    };
  }
}