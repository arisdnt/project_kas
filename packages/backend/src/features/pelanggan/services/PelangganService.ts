/**
 * Customer Service Orchestrator
 * Main service that coordinates customer operations
 */

import { AccessScope } from '@/core/middleware/accessScope';
import { SearchPelangganQuery, CreatePelanggan, UpdatePelanggan, BulkPelangganAction, ImportPelanggan, PelangganCreditLimitAdjustment } from '../models/PelangganCore';
import { PelangganQueryService } from './modules/PelangganQueryService';
import { PelangganMutationService } from './modules/PelangganMutationService';

export class PelangganService {
  // Query operations
  static async searchCustomers(scope: AccessScope, query: SearchPelangganQuery) {
    return PelangganQueryService.search(scope, query);
  }

  static async findCustomerById(scope: AccessScope, id: string) {
    const customer = await PelangganQueryService.findById(scope, id);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return customer;
  }

  static async findCustomerByCode(scope: AccessScope, kode: string) {
    const customer = await PelangganQueryService.findByCode(scope, kode);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return customer;
  }

  static async getCustomerStats(scope: AccessScope, pelangganId: string) {
    return PelangganQueryService.getPelangganStats(scope, pelangganId);
  }

  static async getTransactionHistory(scope: AccessScope, pelangganId: string, limit: number = 50) {
    return PelangganQueryService.getTransactionHistory(scope, pelangganId, limit);
  }

  static async getPointsHistory(scope: AccessScope, pelangganId: string, limit: number = 50) {
    return PelangganQueryService.getPoinLogs(scope, pelangganId, limit);
  }

  static async getCustomerSegmentation(scope: AccessScope) {
    return PelangganQueryService.getCustomerSegmentation(scope);
  }

  static async getLoyaltyReport(scope: AccessScope, limit: number = 100) {
    return PelangganQueryService.getLoyaltyReport(scope, limit);
  }

  static async getActiveCustomers(scope: AccessScope) {
    return PelangganQueryService.getActiveCustomers(scope);
  }

  // Mutation operations
  static async createCustomer(scope: AccessScope, data: CreatePelanggan) {
    if (scope.level && scope.level > 2) {
      throw new Error('Insufficient permissions to create customers');
    }

    if (!scope.storeId) {
      throw new Error('Store ID is required for customer creation');
    }

    // Auto-set tenant and store if not provided
    if (!data.tenant_id) {
      data.tenant_id = scope.tenantId;
    }
    if (!data.toko_id) {
      data.toko_id = scope.storeId;
    }

    // Validate tenant and store match
    if (data.tenant_id !== scope.tenantId || data.toko_id !== scope.storeId) {
      throw new Error('Cannot create customer for different tenant or store');
    }

    // Generate unique code if not provided
    if (!data.kode) {
      data.kode = await this.generateCustomerCode(scope);
    }

    return PelangganMutationService.create(scope, data);
  }

  static async updateCustomer(scope: AccessScope, id: string, data: UpdatePelanggan) {
    if (scope.level && scope.level > 3) {
      throw new Error('Insufficient permissions to update customers');
    }

    return PelangganMutationService.update(scope, id, data);
  }

  static async adjustCustomerPoints(scope: AccessScope, pelangganId: string, adjustment: number, reason: string, transaksiId?: string) {
    if (scope.level && scope.level > 2) {
      throw new Error('Insufficient permissions to adjust customer points');
    }

    return PelangganMutationService.adjustPoints(scope, pelangganId, adjustment, reason, transaksiId);
  }

  static async bulkCustomerAction(scope: AccessScope, data: BulkPelangganAction) {
    return PelangganMutationService.bulkAction(scope, data);
  }

  static async importCustomers(scope: AccessScope, customers: ImportPelanggan[]) {
    return PelangganMutationService.importCustomers(scope, customers);
  }

  static async adjustCreditLimit(scope: AccessScope, data: PelangganCreditLimitAdjustment) {
    return PelangganMutationService.adjustCreditLimit(scope, data);
  }

  // Helper methods
  private static async generateCustomerCode(scope: AccessScope): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    // Get next sequence number for this month
    const result = await PelangganQueryService.search(scope, {
      page: '1',
      limit: '1'
    });

    const sequence = (result.total + 1).toString().padStart(4, '0');
    return `CUST${year}${month}${sequence}`;
  }

  static async getCustomerWithFullProfile(scope: AccessScope, pelangganId: string) {
    const customer = await this.findCustomerById(scope, pelangganId);
    const stats = await this.getCustomerStats(scope, pelangganId);
    const recentTransactions = await this.getTransactionHistory(scope, pelangganId, 10);
    const recentPoints = await this.getPointsHistory(scope, pelangganId, 10);

    return {
      customer,
      stats,
      recent_transactions: recentTransactions,
      recent_points: recentPoints
    };
  }

  static async validateCustomerAccess(scope: AccessScope, customerId: string): Promise<boolean> {
    try {
      await this.findCustomerById(scope, customerId);
      return true;
    } catch {
      return false;
    }
  }

  // Point management helpers
  static async earnPoints(scope: AccessScope, pelangganId: string, transactionTotal: number, transaksiId?: string) {
    // Default: 1 point per 1000 spent
    const pointsEarned = Math.floor(transactionTotal / 1000);

    if (pointsEarned > 0) {
      return this.adjustCustomerPoints(
        scope,
        pelangganId,
        pointsEarned,
        `Points earned from transaction`,
        transaksiId
      );
    }

    return null;
  }

  static async redeemPoints(scope: AccessScope, pelangganId: string, pointsToRedeem: number, transaksiId?: string) {
    // Check if customer has enough points
    const customer = await this.findCustomerById(scope, pelangganId);

    if (customer.saldo_poin < pointsToRedeem) {
      throw new Error('Insufficient points balance');
    }

    return this.adjustCustomerPoints(
      scope,
      pelangganId,
      -pointsToRedeem,
      `Points redeemed for transaction`,
      transaksiId
    );
  }

  // Customer type management
  static async upgradeCustomerType(scope: AccessScope, pelangganId: string, newType: 'vip' | 'member' | 'wholesale', reason?: string) {
    if (scope.level && scope.level > 3) {
      throw new Error('Insufficient permissions to upgrade customer type');
    }

    const customer = await this.findCustomerById(scope, pelangganId);

    if (customer.tipe === newType) {
      throw new Error(`Customer is already ${newType} type`);
    }

    return this.updateCustomer(scope, pelangganId, {
      tipe: newType
    });
  }
}