/**
 * Store Service Orchestrator
 * Main service that coordinates store operations
 */

import { AccessScope } from '@/core/middleware/accessScope';
import { SearchTokoQuery, CreateToko, UpdateToko, CreateTokoConfig, UpdateTokoConfig, BulkUpdateOperatingHours } from '../models/TokoCore';
import { TokoQueryService } from './modules/TokoQueryService';
import { TokoMutationService } from './modules/TokoMutationService';

export class TokoService {
  // Query operations
  static async searchStores(scope: AccessScope, query: SearchTokoQuery) {
    return TokoQueryService.search(scope, query);
  }

  static async findStoreById(scope: AccessScope, id: string) {
    const store = await TokoQueryService.findById(scope, id);
    if (!store) {
      throw new Error('Store not found');
    }
    return store;
  }

  static async findStoreByCode(scope: AccessScope, kode: string) {
    const store = await TokoQueryService.findByCode(scope, kode);
    if (!store) {
      throw new Error('Store not found');
    }
    return store;
  }

  static async getStoreConfigs(scope: AccessScope, tokoId: string) {
    return TokoQueryService.getTokoConfigs(scope, tokoId);
  }

  static async getStoreConfig(scope: AccessScope, tokoId: string, key: string) {
    const config = await TokoQueryService.getTokoConfig(scope, tokoId, key);
    if (!config) {
      throw new Error('Store configuration not found');
    }
    return config;
  }

  static async getOperatingHours(scope: AccessScope, tokoId: string) {
    return TokoQueryService.getOperatingHours(scope, tokoId);
  }

  static async getStoreStats(scope: AccessScope, tokoId: string) {
    return TokoQueryService.getTokoStats(scope, tokoId);
  }

  static async getActiveStores(scope: AccessScope) {
    return TokoQueryService.getActiveStores(scope);
  }

  // Mutation operations
  static async createStore(scope: AccessScope, data: CreateToko) {
    if (scope.level && scope.level > 2) {
      throw new Error('Insufficient permissions to create stores');
    }

    // Auto-set tenant if tidak dikirim dan scope masih dipaksa tenant-nya
    if (!data.tenant_id) {
      data.tenant_id = scope.tenantId;
    }

    // Validasi tenant hanya berlaku jika scope masih menegakkan batas tenant
    if (scope.enforceTenant && data.tenant_id !== scope.tenantId) {
      throw new Error('Cannot create store for different tenant');
    }

    return TokoMutationService.create(scope, data);
  }

  static async updateStore(scope: AccessScope, id: string, data: UpdateToko) {
    if (scope.level && scope.level > 2) {
      throw new Error('Insufficient permissions to update stores');
    }

    return TokoMutationService.update(scope, id, data);
  }

  static async deleteStore(scope: AccessScope, id: string) {
    return TokoMutationService.delete(scope, id);
  }

  static async setStoreConfig(scope: AccessScope, tokoId: string, data: CreateTokoConfig) {
    if (scope.level && scope.level > 3) {
      throw new Error('Insufficient permissions to manage store configurations');
    }

    return TokoMutationService.setConfig(scope, tokoId, data);
  }

  static async updateStoreConfig(scope: AccessScope, tokoId: string, key: string, data: UpdateTokoConfig) {
    if (scope.level && scope.level > 3) {
      throw new Error('Insufficient permissions to manage store configurations');
    }

    return TokoMutationService.updateConfig(scope, tokoId, key, data);
  }

  static async deleteStoreConfig(scope: AccessScope, tokoId: string, key: string) {
    if (scope.level && scope.level > 2) {
      throw new Error('Insufficient permissions to delete store configurations');
    }

    return TokoMutationService.deleteConfig(scope, tokoId, key);
  }

  static async updateOperatingHours(scope: AccessScope, tokoId: string, data: BulkUpdateOperatingHours) {
    if (scope.level && scope.level > 3) {
      throw new Error('Insufficient permissions to update operating hours');
    }

    // Validate operating hours
    this.validateOperatingHours(data);

    return TokoMutationService.updateOperatingHours(scope, tokoId, data);
  }

  // Helper methods
  private static validateOperatingHours(data: BulkUpdateOperatingHours) {
    const validDays = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];
    const daySet = new Set();

    for (const hours of data.operating_hours) {
      // Check for duplicate days
      if (daySet.has(hours.hari)) {
        throw new Error(`Duplicate day found: ${hours.hari}`);
      }
      daySet.add(hours.hari);

      // Validate day
      if (!validDays.includes(hours.hari)) {
        throw new Error(`Invalid day: ${hours.hari}`);
      }

      // Validate time format and logic
      if (hours.is_buka) {
        const [openHour, openMinute] = hours.jam_buka.split(':').map(Number);
        const [closeHour, closeMinute] = hours.jam_tutup.split(':').map(Number);

        const openTime = openHour * 60 + openMinute;
        const closeTime = closeHour * 60 + closeMinute;

        if (openTime >= closeTime) {
          throw new Error(`Invalid operating hours for ${hours.hari}: closing time must be after opening time`);
        }
      }
    }
  }

  static async getStoreWithFullInfo(scope: AccessScope, tokoId: string) {
    const store = await this.findStoreById(scope, tokoId);
    const configs = await this.getStoreConfigs(scope, tokoId);
    const operatingHours = await this.getOperatingHours(scope, tokoId);
    const stats = await this.getStoreStats(scope, tokoId);

    return {
      store,
      configs,
      operating_hours: operatingHours,
      stats
    };
  }
}
