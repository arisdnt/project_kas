/**
 * Integration Tests untuk Restock Operations
 * Memvalidasi end-to-end flow dari frontend request hingga database update
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { RestockPembelianService } from '../services/modules/RestockPembelianService';
import { RestockValidationService } from '../services/modules/RestockValidationService';
import { AccessScope } from '@/core/middleware/accessScope';
import { RestockItem } from '../models/RestockPembelianModel';

// Mock AccessScope
const mockScope: AccessScope = {
  tenantId: 'tenant-123',
  storeId: 'store-123',
  enforceTenant: true,
  canAccessStore: jest.fn().mockReturnValue(true),
  getAccessibleStores: jest.fn().mockReturnValue(['store-123'])
};

// Mock database connection
const mockConnection = {
  execute: jest.fn(),
  beginTransaction: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),
  release: jest.fn()
};

// Mock pool
jest.mock('@/core/database/connection', () => ({
  pool: {
    getConnection: jest.fn().mockResolvedValue(mockConnection)
  }
}));

describe('Restock Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('RestockValidationService', () => {
    test('should validate valid restock items', async () => {
      // Mock product data
      mockConnection.execute.mockResolvedValue([
        [
          {
            id: 'prod-1',
            nama: 'Test Product',
            kode: 'TEST001',
            is_aktif: true,
            harga_beli: 10000,
            current_stock: 50
          }
        ]
      ]);

      const items: RestockItem[] = [
        {
          produkId: 'prod-1',
          qty: 10,
          hargaBeli: 12000
        }
      ];

      const result = await RestockValidationService.validateRestockItems(items, mockScope);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.validatedItems).toHaveLength(1);
      expect(result.validatedItems[0].productName).toBe('Test Product');
    });

    test('should detect invalid product ID', async () => {
      // Mock empty product result
      mockConnection.execute.mockResolvedValue([[]]);

      const items: RestockItem[] = [
        {
          produkId: 'invalid-id',
          qty: 10,
          hargaBeli: 12000
        }
      ];

      const result = await RestockValidationService.validateRestockItems(items, mockScope);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Product invalid-id not found or not accessible');
    });

    test('should warn about price changes', async () => {
      mockConnection.execute.mockResolvedValue([
        [
          {
            id: 'prod-1',
            nama: 'Test Product',
            kode: 'TEST001',
            is_aktif: true,
            harga_beli: 10000,
            current_stock: 50
          }
        ]
      ]);

      const items: RestockItem[] = [
        {
          produkId: 'prod-1',
          qty: 10,
          hargaBeli: 20000 // 100% increase
        }
      ];

      const result = await RestockValidationService.validateRestockItems(items, mockScope);

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('Price change');
    });

    test('should detect duplicate products', async () => {
      const items: RestockItem[] = [
        { produkId: 'prod-1', qty: 10, hargaBeli: 12000 },
        { produkId: 'prod-1', qty: 5, hargaBeli: 12000 }
      ];

      const result = await RestockValidationService.validateRestockItems(items, mockScope);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duplicate products found in request: prod-1');
    });
  });

  describe('RestockPembelianService', () => {
    test('should execute successful restock', async () => {
      // Mock validation success
      jest.spyOn(RestockValidationService, 'validateRestockItems').mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
        validatedItems: [
          {
            produkId: 'prod-1',
            qty: 10,
            hargaBeli: 12000,
            productName: 'Test Product',
            currentStock: 50,
            sku: 'TEST001',
            isActive: true
          }
        ]
      });

      // Mock database operations
      mockConnection.execute
        .mockResolvedValueOnce([[ // Product exists check
          { id: 'prod-1', tenant_id: 'tenant-123' }
        ]])
        .mockResolvedValueOnce({ insertId: 'insert-result' }) // Inventory insert/update
        .mockResolvedValueOnce({ affectedRows: 1 }) // Product price update
        .mockResolvedValueOnce([[ // Final inventory check
          { stok_tersedia: 60 }
        ]])
        .mockResolvedValueOnce({ insertId: 'audit-log' }); // Audit log

      const items: RestockItem[] = [
        {
          produkId: 'prod-1',
          qty: 10,
          hargaBeli: 12000
        }
      ];

      const result = await RestockPembelianService.executeRestock(
        mockScope,
        'user-123',
        items,
        { note: 'Test restock' }
      );

      expect(result.success).toBe(true);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].qtyAdded).toBe(10);
      expect(result.items[0].newStock).toBe(60);
      expect(result.summary.totalItems).toBe(1);
      expect(result.summary.totalQuantity).toBe(10);

      // Verify database calls
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.rollback).not.toHaveBeenCalled();
    });

    test('should rollback on validation failure', async () => {
      // Mock validation failure
      jest.spyOn(RestockValidationService, 'validateRestockItems').mockResolvedValue({
        isValid: false,
        errors: ['Product not found'],
        warnings: [],
        validatedItems: []
      });

      const items: RestockItem[] = [
        {
          produkId: 'invalid-id',
          qty: 10,
          hargaBeli: 12000
        }
      ];

      await expect(
        RestockPembelianService.executeRestock(mockScope, 'user-123', items)
      ).rejects.toThrow('Validation failed: Product not found');

      expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
    });

    test('should rollback on database error', async () => {
      // Mock validation success
      jest.spyOn(RestockValidationService, 'validateRestockItems').mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
        validatedItems: [
          {
            produkId: 'prod-1',
            qty: 10,
            hargaBeli: 12000,
            productName: 'Test Product',
            currentStock: 50,
            sku: 'TEST001',
            isActive: true
          }
        ]
      });

      // Mock database error
      mockConnection.execute.mockRejectedValue(new Error('Database connection failed'));

      const items: RestockItem[] = [
        {
          produkId: 'prod-1',
          qty: 10,
          hargaBeli: 12000
        }
      ];

      await expect(
        RestockPembelianService.executeRestock(mockScope, 'user-123', items)
      ).rejects.toThrow('Database connection failed');

      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.commit).not.toHaveBeenCalled();
    });
  });

  describe('End-to-End Integration', () => {
    test('should handle complete restock flow with multiple items', async () => {
      // Mock successful validation
      jest.spyOn(RestockValidationService, 'validateRestockItems').mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: ['Price change for Product B'],
        validatedItems: [
          {
            produkId: 'prod-1',
            qty: 10,
            hargaBeli: 12000,
            productName: 'Product A',
            currentStock: 50,
            sku: 'PROD-A',
            isActive: true
          },
          {
            produkId: 'prod-2',
            qty: 5,
            hargaBeli: 8000,
            productName: 'Product B',
            currentStock: 20,
            sku: 'PROD-B',
            isActive: true
          }
        ]
      });

      // Mock database operations for multiple items
      mockConnection.execute
        .mockResolvedValueOnce([[ // Product 1 check
          { id: 'prod-1', tenant_id: 'tenant-123' }
        ]])
        .mockResolvedValueOnce({ insertId: 'inv-1' }) // Inventory 1 update
        .mockResolvedValueOnce({ affectedRows: 1 }) // Price 1 update
        .mockResolvedValueOnce([[ // Final inventory 1 check
          { stok_tersedia: 60 }
        ]])
        .mockResolvedValueOnce([[ // Product 2 check
          { id: 'prod-2', tenant_id: 'tenant-123' }
        ]])
        .mockResolvedValueOnce({ insertId: 'inv-2' }) // Inventory 2 update
        .mockResolvedValueOnce({ affectedRows: 1 }) // Price 2 update
        .mockResolvedValueOnce([[ // Final inventory 2 check
          { stok_tersedia: 25 }
        ]])
        .mockResolvedValueOnce({ insertId: 'audit' }); // Audit log

      const items: RestockItem[] = [
        { produkId: 'prod-1', qty: 10, hargaBeli: 12000 },
        { produkId: 'prod-2', qty: 5, hargaBeli: 8000 }
      ];

      const result = await RestockPembelianService.executeRestock(
        mockScope,
        'user-123',
        items,
        {
          supplierId: 'supplier-123',
          note: 'Monthly restock'
        }
      );

      expect(result.items).toHaveLength(2);
      expect(result.summary.totalItems).toBe(2);
      expect(result.summary.totalQuantity).toBe(15);
      expect(result.summary.totalValue).toBe(160000); // (10 * 12000) + (5 * 8000)
      expect(result.summary.warnings).toContain('Price change for Product B');

      // Verify transaction was committed
      expect(mockConnection.commit).toHaveBeenCalled();
    });
  });

  describe('Frontend-Backend Schema Compatibility', () => {
    test('should handle frontend RestokItem format', () => {
      // Frontend format (after our fixes)
      const frontendItems = [
        {
          id: 'prod-1', // String UUID
          nama: 'Product A',
          sku: 'PROD-A',
          qty: 10,
          hargaBeli: 12000
        }
      ];

      // Convert to backend format
      const backendItems: RestockItem[] = frontendItems.map(item => ({
        produkId: item.id,
        qty: item.qty,
        hargaBeli: item.hargaBeli
      }));

      expect(backendItems[0].produkId).toBe('prod-1');
      expect(backendItems[0].qty).toBe(10);
      expect(backendItems[0].hargaBeli).toBe(12000);
    });
  });
});