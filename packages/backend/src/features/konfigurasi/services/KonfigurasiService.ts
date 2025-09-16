/**
 * Configuration Service Orchestrator
 * Main service that coordinates system configuration operations
 */

import { AccessScope } from '@/core/middleware/accessScope';
import { CreateKonfigurasi, UpdateKonfigurasi } from '../models/KonfigurasiCore';
import { KonfigurasiQueryService } from './modules/KonfigurasiQueryService';
import { KonfigurasiMutationService } from './modules/KonfigurasiMutationService';

export class KonfigurasiService {
  // Query operations
  static async getConfiguration(scope: AccessScope) {
    return KonfigurasiQueryService.getConfiguration(scope);
  }

  static async getConfigurationByStore(scope: AccessScope, storeId: string) {
    return KonfigurasiQueryService.getConfigurationByStore(scope, storeId);
  }

  static async getTenantConfiguration(scope: AccessScope) {
    return KonfigurasiQueryService.getTenantConfiguration(scope);
  }

  static async getAllStoreConfigurations(scope: AccessScope) {
    return KonfigurasiQueryService.getAllStoreConfigurations(scope);
  }

  static async getEffectiveConfiguration(scope: AccessScope, storeId?: string) {
    return KonfigurasiQueryService.getEffectiveConfiguration(scope, storeId);
  }

  // Mutation operations
  static async updateTenantConfiguration(scope: AccessScope, data: UpdateKonfigurasi) {
    this.validateConfigurationData(data);
    return KonfigurasiMutationService.updateTenantConfiguration(scope, data);
  }

  static async updateStoreConfiguration(scope: AccessScope, storeId: string, data: UpdateKonfigurasi) {
    this.validateConfigurationData(data);
    return KonfigurasiMutationService.updateStoreConfiguration(scope, storeId, data);
  }

  static async resetToDefaults(scope: AccessScope, storeId?: string) {
    return KonfigurasiMutationService.resetToDefaults(scope, storeId);
  }

  static async deleteStoreConfiguration(scope: AccessScope, storeId: string) {
    return KonfigurasiMutationService.deleteStoreConfiguration(scope, storeId);
  }

  // Configuration helpers
  static async getTaxConfiguration(scope: AccessScope, storeId?: string) {
    const config = await this.getEffectiveConfiguration(scope, storeId) as any;
    return {
      pajak: config?.pajak || 0,
      is_pajak_aktif: config?.is_pajak_aktif || false
    };
  }

  static async applyTaxToAmount(scope: AccessScope, amount: number, storeId?: string) {
    const taxConfig = await this.getTaxConfiguration(scope, storeId);

    if (!taxConfig.is_pajak_aktif) {
      return {
        subtotal: amount,
        tax_rate: 0,
        tax_amount: 0,
        total: amount
      };
    }

    const taxAmount = amount * (taxConfig.pajak / 100);
    return {
      subtotal: amount,
      tax_rate: taxConfig.pajak,
      tax_amount: taxAmount,
      total: amount + taxAmount
    };
  }

  // Private helper methods
  private static validateConfigurationData(data: UpdateKonfigurasi) {
    if (data.pajak !== undefined) {
      if (data.pajak < 0 || data.pajak > 100) {
        throw new Error('Tax percentage must be between 0 and 100');
      }
    }
  }
}