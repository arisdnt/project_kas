/**
 * Sales Service Orchestrator
 * Main service that coordinates sales transaction operations
 */

import { AccessScope } from '@/core/middleware/accessScope';
import { SearchTransaksiQuery, CreateTransaksiPenjualan, UpdateTransaksiPenjualan } from '../models/TransaksiPenjualanCore';
import { CreateItemTransaksi } from '../models/ItemTransaksiModel';
import { TransaksiQueryService } from './modules/TransaksiQueryService';
import { TransaksiMutationService } from './modules/TransaksiMutationService';
import { PenjualanReportService } from './modules/PenjualanReportService';

export interface CreateTransaksiRequest {
  transaction: CreateTransaksiPenjualan;
  items: CreateItemTransaksi[];
}

export class PenjualanService {
  // Transaction query operations
  static async search(scope: AccessScope, query: SearchTransaksiQuery) {
    return TransaksiQueryService.search(scope, query);
  }

  static async findById(scope: AccessScope, id: string) {
    const transaction = await TransaksiQueryService.findById(scope, id);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const items = await TransaksiQueryService.getTransactionItems(scope, id);
    return { ...transaction, items };
  }

  static async getTransactionItems(scope: AccessScope, transactionId: string) {
    return TransaksiQueryService.getTransactionItems(scope, transactionId);
  }

  // Transaction mutation operations
  static async create(scope: AccessScope, request: CreateTransaksiRequest) {
    if (!scope.storeId) {
      throw new Error('Store ID is required for transaction creation');
    }

    if (!request.items || request.items.length === 0) {
      throw new Error('Transaction must have at least one item');
    }

    // Validate and calculate totals
    this.validateAndCalculateTransaction(request);

    return TransaksiMutationService.create(scope, request.transaction, request.items);
  }

  static async update(scope: AccessScope, id: string, data: UpdateTransaksiPenjualan) {
    return TransaksiMutationService.update(scope, id, data);
  }

  static async cancel(scope: AccessScope, id: string) {
    return TransaksiMutationService.delete(scope, id);
  }

  // Reporting operations
  static async getDailySales(scope: AccessScope, date: string) {
    return PenjualanReportService.getDailySales(scope, date);
  }

  static async getTopProducts(scope: AccessScope, startDate: string, endDate: string, limit?: number) {
    return PenjualanReportService.getTopProducts(scope, startDate, endDate, limit);
  }

  static async getSalesChart(scope: AccessScope, startDate: string, endDate: string) {
    return PenjualanReportService.getSalesChart(scope, startDate, endDate);
  }

  static async getPaymentMethodStats(scope: AccessScope, startDate: string, endDate: string) {
    return PenjualanReportService.getPaymentMethodStats(scope, startDate, endDate);
  }

  static async getCashierPerformance(scope: AccessScope, startDate: string, endDate: string) {
    return PenjualanReportService.getCashierPerformance(scope, startDate, endDate);
  }

  // Private helper methods
  private static validateAndCalculateTransaction(request: CreateTransaksiRequest) {
    const { transaction, items } = request;

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
    transaction.subtotal = calculatedSubtotal;

    // Calculate total discount
    const transactionDiscount = transaction.diskon_persen > 0 ?
      (calculatedSubtotal * transaction.diskon_persen / 100) :
      transaction.diskon_nominal;

    // Calculate after discount
    const afterDiscount = calculatedSubtotal - transactionDiscount;

    // Calculate tax
    const tax = afterDiscount * transaction.pajak_persen / 100;
    transaction.pajak_nominal = tax;

    // Calculate final total
    transaction.total = afterDiscount + tax;

    // Calculate change
    transaction.kembalian = Math.max(0, transaction.bayar - transaction.total);

    // Validate payment
    if (transaction.status === 'completed' && transaction.bayar < transaction.total) {
      throw new Error('Payment amount is insufficient');
    }
  }
}