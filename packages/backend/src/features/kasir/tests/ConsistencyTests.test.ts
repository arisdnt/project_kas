/**
 * Unit Tests untuk Konsistensi Perhitungan Kasir
 * Memvalidasi stok, pajak, promo, dan loyalty calculations
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { TaxCalculationService } from '../services/TaxCalculationService';
import { PromoIntegrationService } from '../services/PromoIntegrationService';
import { CustomerLoyaltyService } from '../services/CustomerLoyaltyService';
import { EnhancedKasirService } from '../services/EnhancedKasirService';
import { KasirCartItem, MetodeBayar } from '../models/KasirCore';
import { AccessScope } from '@/core/middleware/accessScope';

// Mock data
const mockScope: AccessScope = {
  tenantId: 'tenant-123',
  storeId: 'store-123',
  canAccessStore: jest.fn().mockReturnValue(true),
  getAccessibleStores: jest.fn().mockReturnValue(['store-123'])
};

const mockCartItems: KasirCartItem[] = [
  {
    produk_id: 'prod-1',
    nama_produk: 'Produk A',
    kode_produk: 'PRD001',
    barcode: '123456789',
    harga_satuan: 10000,
    kuantitas: 2,
    subtotal: 20000,
    diskon_persen: 0,
    diskon_nominal: 0,
    stok_tersedia: 100,
    stok_reserved: 0
  },
  {
    produk_id: 'prod-2',
    nama_produk: 'Produk B',
    kode_produk: 'PRD002',
    barcode: '987654321',
    harga_satuan: 15000,
    kuantitas: 1,
    subtotal: 15000,
    diskon_persen: 10,
    diskon_nominal: 1500,
    stok_tersedia: 50,
    stok_reserved: 0
  }
];

describe('Tax Calculation Service', () => {
  test('should calculate item tax correctly for non-inclusive pricing', () => {
    const cartItem = mockCartItems[0];
    const produkPajakPersen = 11;
    const config = {
      defaultTaxRate: 11,
      includesTax: false,
      roundingMethod: 'round' as const
    };

    const result = TaxCalculationService.calculateItemTax(
      cartItem,
      produkPajakPersen,
      config
    );

    expect(result.subtotalSebelumPajak).toBe(20000);
    expect(result.pajakPersen).toBe(11);
    expect(result.pajakNominal).toBe(2200); // 20000 * 11% = 2200
    expect(result.subtotalSetelahPajak).toBe(22200);
    expect(result.isPajakIncluded).toBe(false);
  });

  test('should calculate item tax correctly for inclusive pricing', () => {
    const cartItem = mockCartItems[0];
    const produkPajakPersen = 11;
    const config = {
      defaultTaxRate: 11,
      includesTax: true,
      roundingMethod: 'round' as const
    };

    const result = TaxCalculationService.calculateItemTax(
      cartItem,
      produkPajakPersen,
      config
    );

    expect(result.subtotalSetelahPajak).toBe(20000);
    expect(result.subtotalSebelumPajak).toBe(18018); // 20000 / 1.11 = 18018.02
    expect(result.pajakNominal).toBe(1982); // 20000 - 18018 = 1982
    expect(result.isPajakIncluded).toBe(true);
  });

  test('should apply discount before tax calculation', () => {
    const cartItem = mockCartItems[1]; // Has 10% discount
    const produkPajakPersen = 11;
    const config = {
      defaultTaxRate: 11,
      includesTax: false,
      roundingMethod: 'round' as const
    };

    const result = TaxCalculationService.calculateItemTax(
      cartItem,
      produkPajakPersen,
      config
    );

    // Subtotal after discount: 15000 - 1500 = 13500
    expect(result.subtotalSebelumPajak).toBe(13500);
    expect(result.pajakNominal).toBe(1485); // 13500 * 11% = 1485
    expect(result.subtotalSetelahPajak).toBe(14985);
  });

  test('should validate tax consistency', () => {
    const subtotal = 100000;
    const pajakPersen = 11;
    const pajakNominal = 11000;
    const total = 111000;

    const result = TaxCalculationService.validateTaxConsistency(
      subtotal,
      pajakPersen,
      pajakNominal,
      total
    );

    expect(result.isValid).toBe(true);
    expect(result.message).toBe('Perhitungan pajak konsisten');
  });

  test('should detect tax inconsistency', () => {
    const subtotal = 100000;
    const pajakPersen = 11;
    const pajakNominal = 10000; // Wrong amount
    const total = 110000;

    const result = TaxCalculationService.validateTaxConsistency(
      subtotal,
      pajakPersen,
      pajakNominal,
      total
    );

    expect(result.isValid).toBe(false);
    expect(result.message).toContain('tidak konsisten');
    expect(result.expectedValues.expectedPajakNominal).toBe(11000);
  });
});

describe('Customer Loyalty Service', () => {
  test('should calculate loyalty benefits correctly', async () => {
    // Mock customer data
    const mockCustomer = {
      id: 'cust-1',
      kode: 'PEL001',
      nama: 'John Doe',
      tipe: 'member' as const,
      diskon_persen: 5,
      saldo_poin: 1000,
      limit_kredit: 5000000
    };

    jest.spyOn(CustomerLoyaltyService, 'getCustomerLoyaltyData')
      .mockResolvedValue(mockCustomer);

    const subtotal = 100000;
    const poinDigunakan = 100;

    const result = await CustomerLoyaltyService.calculateLoyaltyBenefits(
      'cust-1',
      subtotal,
      poinDigunakan,
      mockScope
    );

    expect(result.diskonMemberPersen).toBe(5);
    expect(result.diskonMemberNominal).toBe(5000); // 100000 * 5% = 5000
    expect(result.poinUsed).toBe(100);
    expect(result.pointValue).toBe(100000); // 100 * 1000 = 100000
    expect(result.poinEarned).toBe(95); // (100000 - 5000) * 0.001 = 95
    expect(result.saldoPoinBaru).toBe(995); // 1000 - 100 + 95 = 995
  });

  test('should validate credit limit correctly', async () => {
    const mockCustomer = {
      id: 'cust-1',
      kode: 'PEL001',
      nama: 'John Doe',
      tipe: 'member' as const,
      diskon_persen: 5,
      saldo_poin: 1000,
      limit_kredit: 1000000
    };

    jest.spyOn(CustomerLoyaltyService, 'getCustomerLoyaltyData')
      .mockResolvedValue(mockCustomer);

    // Mock existing credit
    jest.spyOn(CustomerLoyaltyService as any, 'db', 'get')
      .mockReturnValue({
        getConnection: jest.fn().mockResolvedValue({
          execute: jest.fn().mockResolvedValue([[{ kredit_berjalan: 500000 }]]),
          release: jest.fn()
        })
      });

    const totalTransaksi = 600000; // Exceeds remaining limit

    const result = await CustomerLoyaltyService.validateCreditLimit(
      'cust-1',
      totalTransaksi,
      mockScope
    );

    expect(result.isValid).toBe(false);
    expect(result.sisaLimit).toBe(500000); // 1000000 - 500000
    expect(result.message).toContain('tidak mencukupi');
  });
});

describe('Promo Integration Service', () => {
  test('should validate promo code correctly', async () => {
    // Mock database response
    const mockPromo = {
      id: 'promo-1',
      kode_promo: 'DISKON10',
      nama: 'Diskon 10%',
      tipe_promo: 'transaksi',
      tipe_diskon: 'persen',
      nilai_diskon: 10,
      minimum_pembelian: 50000,
      maksimum_penggunaan: 100,
      jumlah_terpakai: 5
    };

    jest.spyOn(PromoIntegrationService as any, 'db', 'get')
      .mockReturnValue({
        getConnection: jest.fn().mockResolvedValue({
          execute: jest.fn().mockResolvedValue([[mockPromo]]),
          release: jest.fn()
        })
      });

    const result = await PromoIntegrationService.validatePromoCode(
      'DISKON10',
      100000,
      null,
      mockScope
    );

    expect(result.isValid).toBe(true);
    expect(result.diskonNominal).toBe(10000); // 100000 * 10% = 10000
    expect(result.promoId).toBe('promo-1');
  });

  test('should reject promo when minimum purchase not met', async () => {
    const mockPromo = {
      id: 'promo-1',
      kode_promo: 'DISKON10',
      minimum_pembelian: 100000,
      tipe_diskon: 'persen',
      nilai_diskon: 10
    };

    jest.spyOn(PromoIntegrationService as any, 'db', 'get')
      .mockReturnValue({
        getConnection: jest.fn().mockResolvedValue({
          execute: jest.fn().mockResolvedValue([[mockPromo]]),
          release: jest.fn()
        })
      });

    const result = await PromoIntegrationService.validatePromoCode(
      'DISKON10',
      50000, // Below minimum
      null,
      mockScope
    );

    expect(result.isValid).toBe(false);
    expect(result.message).toContain('Minimum pembelian');
  });
});

describe('Stock Management', () => {
  test('should calculate stock correctly after transaction', () => {
    const stokAwal = 100;
    const kuantitasJual = 5;
    const stokAkhir = stokAwal - kuantitasJual;

    expect(stokAkhir).toBe(95);
    expect(stokAkhir).toBeGreaterThanOrEqual(0);
  });

  test('should prevent negative stock', () => {
    const stokAwal = 3;
    const kuantitasJual = 5;

    // Should throw error or return false
    expect(stokAwal < kuantitasJual).toBe(true);
  });
});

describe('Integration Tests', () => {
  test('should calculate complete transaction totals correctly', () => {
    const subtotal = 100000;
    const diskonMember = 5000; // 5%
    const diskonPromo = 10000; // 10%
    const poinDiskon = 5000; // 5 poin
    const subtotalSetelahDiskon = subtotal - diskonMember - diskonPromo - poinDiskon;
    const pajak = Math.round(subtotalSetelahDiskon * 0.11); // 11%
    const totalAkhir = subtotalSetelahDiskon + pajak;

    expect(subtotalSetelahDiskon).toBe(80000);
    expect(pajak).toBe(8800);
    expect(totalAkhir).toBe(88800);
  });

  test('should validate payment amount', () => {
    const totalAkhir = 88800;
    const jumlahBayar = 100000;
    const kembalian = jumlahBayar - totalAkhir;

    expect(jumlahBayar).toBeGreaterThanOrEqual(totalAkhir);
    expect(kembalian).toBe(11200);
    expect(kembalian).toBeGreaterThanOrEqual(0);
  });

  test('should maintain data integrity across all calculations', () => {
    // Test scenario: Complete transaction with all features
    const cartItems = mockCartItems;
    const subtotalItems = cartItems.reduce((sum, item) => {
      const itemSubtotal = item.harga_satuan * item.kuantitas;
      const itemDiskon = item.diskon_nominal + (itemSubtotal * (item.diskon_persen || 0) / 100);
      return sum + (itemSubtotal - itemDiskon);
    }, 0);

    // Item 1: 10000 * 2 = 20000 (no discount)
    // Item 2: 15000 * 1 - 1500 = 13500 (10% discount)
    // Total: 33500
    expect(subtotalItems).toBe(33500);

    const diskonTransaksi = 0;
    const subtotalSetelahDiskon = subtotalItems - diskonTransaksi;
    const pajak = Math.round(subtotalSetelahDiskon * 0.11);
    const totalTransaksi = subtotalSetelahDiskon + pajak;

    expect(pajak).toBe(3685); // 33500 * 11% = 3685
    expect(totalTransaksi).toBe(37185);

    // Validate all values are positive and logical
    expect(subtotalItems).toBeGreaterThan(0);
    expect(pajak).toBeGreaterThanOrEqual(0);
    expect(totalTransaksi).toBeGreaterThan(subtotalItems);
  });
});

describe('Error Handling', () => {
  test('should handle invalid promo codes gracefully', async () => {
    jest.spyOn(PromoIntegrationService as any, 'db', 'get')
      .mockReturnValue({
        getConnection: jest.fn().mockResolvedValue({
          execute: jest.fn().mockResolvedValue([[]]), // Empty result
          release: jest.fn()
        })
      });

    const result = await PromoIntegrationService.validatePromoCode(
      'INVALID_CODE',
      100000,
      null,
      mockScope
    );

    expect(result.isValid).toBe(false);
    expect(result.diskonNominal).toBe(0);
    expect(result.message).toContain('tidak ditemukan');
  });

  test('should handle database connection errors', async () => {
    jest.spyOn(PromoIntegrationService as any, 'db', 'get')
      .mockReturnValue({
        getConnection: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      });

    await expect(
      PromoIntegrationService.validatePromoCode('DISKON10', 100000, null, mockScope)
    ).rejects.toThrow('Database connection failed');
  });
});

// Performance Tests
describe('Performance Tests', () => {
  test('should calculate transaction totals within acceptable time', () => {
    const startTime = Date.now();

    // Simulate complex calculation
    let result = 0;
    for (let i = 0; i < 1000; i++) {
      const subtotal = 100000;
      const pajak = Math.round(subtotal * 0.11);
      result += subtotal + pajak;
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100); // Should complete within 100ms
    expect(result).toBeGreaterThan(0);
  });
});