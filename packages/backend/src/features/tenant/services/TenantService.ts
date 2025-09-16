/**
 * Tenant Service Orchestrator
 * Main service that coordinates tenant and store operations
 */

import { SearchTenantQuery, CreateTenant, UpdateTenant, CreateToko, UpdateToko } from '../models/TenantCore';
import { TenantQueryService } from './modules/TenantQueryService';
import { TenantMutationService } from './modules/TenantMutationService';

export class TenantService {
  // Tenant operations
  static async search(query: SearchTenantQuery) {
    return TenantQueryService.search(query);
  }

  static async findById(id: string) {
    const tenant = await TenantQueryService.findById(id);
    if (!tenant) {
      throw new Error('Tenant not found');
    }
    return tenant;
  }

  static async getTenantStats() {
    return TenantQueryService.getTenantStats();
  }

  static async createTenant(data: CreateTenant) {
    this.validateTenantData(data);
    return TenantMutationService.createTenant(data);
  }

  static async updateTenant(id: string, data: UpdateTenant) {
    if (Object.keys(data).length === 0) {
      throw new Error('No data to update');
    }
    return TenantMutationService.updateTenant(id, data);
  }

  // Store operations
  static async getTenantStores(tenantId: string) {
    return TenantQueryService.getTenantStores(tenantId);
  }

  static async createStore(data: CreateToko) {
    this.validateStoreData(data);
    return TenantMutationService.createStore(data);
  }

  static async updateStore(id: string, data: UpdateToko) {
    if (Object.keys(data).length === 0) {
      throw new Error('No data to update');
    }
    return TenantMutationService.updateStore(id, data);
  }

  static async deleteStore(storeId: string, tenantId: string) {
    return TenantMutationService.deleteStore(storeId, tenantId);
  }

  // Utility operations
  static async checkTenantLimits(tenantId: string) {
    return TenantQueryService.checkTenantLimits(tenantId);
  }

  static async canAddStore(tenantId: string): Promise<boolean> {
    const limits = await this.checkTenantLimits(tenantId);
    return limits.can_add_toko;
  }

  static async canAddUser(tenantId: string): Promise<boolean> {
    const limits = await this.checkTenantLimits(tenantId);
    return limits.can_add_pengguna;
  }

  // Validation helpers
  private static validateTenantData(data: CreateTenant) {
    if (!data.nama?.trim()) {
      throw new Error('Tenant name is required');
    }
    if (!data.email?.trim()) {
      throw new Error('Email is required');
    }
    if (data.max_toko && data.max_toko < 1) {
      throw new Error('Maximum stores must be at least 1');
    }
    if (data.max_pengguna && data.max_pengguna < 1) {
      throw new Error('Maximum users must be at least 1');
    }
  }

  private static validateStoreData(data: CreateToko) {
    if (!data.nama?.trim()) {
      throw new Error('Store name is required');
    }
    if (!data.kode?.trim()) {
      throw new Error('Store code is required');
    }
    if (!data.tenant_id?.trim()) {
      throw new Error('Tenant ID is required');
    }
    if (data.kode && (data.kode.length < 2 || data.kode.length > 10)) {
      throw new Error('Store code must be between 2 and 10 characters');
    }
  }
}