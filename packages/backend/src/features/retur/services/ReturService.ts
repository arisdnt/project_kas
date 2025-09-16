/**
 * Return Service Orchestrator
 * Main service that coordinates return operations
 */

import { AccessScope } from '@/core/middleware/accessScope';
import { SearchReturQuery, UpdateRetur } from '../models/ReturCore';
import { ReturQueryService } from './modules/ReturQueryService';
import { ReturMutationService, CreateReturPenjualanRequest, CreateReturPembelianRequest } from './modules/ReturMutationService';

export class ReturService {
  // Query operations
  static async searchSalesReturns(scope: AccessScope, query: SearchReturQuery) {
    return ReturQueryService.search(scope, query, 'penjualan');
  }

  static async searchPurchaseReturns(scope: AccessScope, query: SearchReturQuery) {
    return ReturQueryService.search(scope, query, 'pembelian');
  }

  static async findSalesReturnById(scope: AccessScope, id: string) {
    const retur = await ReturQueryService.findById(scope, id, 'penjualan');
    if (!retur) {
      throw new Error('Sales return not found');
    }

    const items = await ReturQueryService.getReturnItems(scope, id, 'penjualan');
    return { ...retur, items };
  }

  static async findPurchaseReturnById(scope: AccessScope, id: string) {
    const retur = await ReturQueryService.findById(scope, id, 'pembelian');
    if (!retur) {
      throw new Error('Purchase return not found');
    }

    const items = await ReturQueryService.getReturnItems(scope, id, 'pembelian');
    return { ...retur, items };
  }

  static async getReturnStats(scope: AccessScope, type: 'penjualan' | 'pembelian', startDate: string, endDate: string) {
    return ReturQueryService.getReturnStats(scope, type, startDate, endDate);
  }

  // Mutation operations
  static async createSalesReturn(scope: AccessScope, request: CreateReturPenjualanRequest) {
    if (!scope.storeId) {
      throw new Error('Store ID is required for return creation');
    }

    if (!request.items || request.items.length === 0) {
      throw new Error('Return must have at least one item');
    }

    // Validate and calculate totals
    this.validateAndCalculateReturn(request);

    return ReturMutationService.createSalesReturn(scope, request);
  }

  static async createPurchaseReturn(scope: AccessScope, request: CreateReturPembelianRequest) {
    if (!scope.storeId) {
      throw new Error('Store ID is required for return creation');
    }

    if (!request.items || request.items.length === 0) {
      throw new Error('Return must have at least one item');
    }

    // Validate and calculate totals
    this.validateAndCalculatePurchaseReturn(request);

    return ReturMutationService.createPurchaseReturn(scope, request);
  }

  static async updateSalesReturn(scope: AccessScope, id: string, data: UpdateRetur) {
    return ReturMutationService.updateReturn(scope, id, data, 'penjualan');
  }

  static async updatePurchaseReturn(scope: AccessScope, id: string, data: UpdateRetur) {
    return ReturMutationService.updateReturn(scope, id, data, 'pembelian');
  }

  // Private helper methods
  private static validateAndCalculateReturn(request: CreateReturPenjualanRequest) {
    const { retur, items } = request;

    // Calculate subtotal from items
    let calculatedSubtotal = 0;
    items.forEach(item => {
      const itemSubtotal = item.kuantitas * item.harga_satuan;
      const itemDiscount = item.diskon_persen > 0 ?
        (itemSubtotal * item.diskon_persen / 100) :
        item.diskon_nominal;

      item.subtotal = itemSubtotal - itemDiscount;
      calculatedSubtotal += item.subtotal;
    });

    // Set calculated subtotal
    retur.subtotal = calculatedSubtotal;

    // Calculate total discount
    const returDiscount = retur.diskon_persen > 0 ?
      (calculatedSubtotal * retur.diskon_persen / 100) :
      retur.diskon_nominal;

    // Calculate after discount
    const afterDiscount = calculatedSubtotal - returDiscount;

    // Calculate tax
    const tax = afterDiscount * retur.pajak_persen / 100;
    retur.pajak_nominal = tax;

    // Calculate final total
    retur.total = afterDiscount + tax;
  }

  private static validateAndCalculatePurchaseReturn(request: CreateReturPembelianRequest) {
    const { retur, items } = request;

    // Same calculation logic for purchase returns
    let calculatedSubtotal = 0;
    items.forEach(item => {
      const itemSubtotal = item.kuantitas * item.harga_satuan;
      const itemDiscount = item.diskon_persen > 0 ?
        (itemSubtotal * item.diskon_persen / 100) :
        item.diskon_nominal;

      item.subtotal = itemSubtotal - itemDiscount;
      calculatedSubtotal += item.subtotal;
    });

    retur.subtotal = calculatedSubtotal;

    const returDiscount = retur.diskon_persen > 0 ?
      (calculatedSubtotal * retur.diskon_persen / 100) :
      retur.diskon_nominal;

    const afterDiscount = calculatedSubtotal - returDiscount;
    const tax = afterDiscount * retur.pajak_persen / 100;
    retur.pajak_nominal = tax;
    retur.total = afterDiscount + tax;
  }
}