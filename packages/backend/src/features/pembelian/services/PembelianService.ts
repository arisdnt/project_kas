/**
 * Purchase Service Orchestrator
 * Main service that coordinates purchase transaction operations
 */

import { AccessScope } from '@/core/middleware/accessScope';
import { SearchPembelianQuery, CreateTransaksiPembelian, UpdateTransaksiPembelian } from '../models/TransaksiPembelianCore';
import { CreateItemPembelian } from '../models/ItemPembelianModel';
import { PembelianQueryService } from './modules/PembelianQueryService';
import { PembelianMutationService } from './modules/PembelianMutationService';

export interface CreatePembelianRequest {
  transaction: CreateTransaksiPembelian;
  items: CreateItemPembelian[];
}

export class PembelianService {
  // Transaction query operations
  static async search(scope: AccessScope, query: SearchPembelianQuery) {
    return PembelianQueryService.search(scope, query);
  }

  static async findById(scope: AccessScope, id: string) {
    const transaction = await PembelianQueryService.findById(scope, id);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const items = await PembelianQueryService.getPurchaseItems(scope, id);
    return { ...transaction, items };
  }

  static async getPurchaseItems(scope: AccessScope, transactionId: string) {
    return PembelianQueryService.getPurchaseItems(scope, transactionId);
  }

  // Transaction mutation operations
  static async create(scope: AccessScope, request: CreatePembelianRequest) {
    if (!scope.storeId) {
      throw new Error('Store ID is required for purchase transaction creation');
    }

    if (!request.items || request.items.length === 0) {
      throw new Error('Purchase transaction must have at least one item');
    }

    // Validate and calculate totals
    this.validateAndCalculateTransaction(request);

    return PembelianMutationService.create(scope, request.transaction, request.items);
  }

  static async update(scope: AccessScope, id: string, data: UpdateTransaksiPembelian) {
    return PembelianMutationService.update(scope, id, data);
  }

  static async cancel(scope: AccessScope, id: string) {
    return PembelianMutationService.delete(scope, id);
  }

  // Private helper methods
  private static validateAndCalculateTransaction(request: CreatePembelianRequest) {
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
  }
}