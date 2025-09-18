/**
 * Scope Service
 * Handles tenant and store scope operations
 */

import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';

export class ScopeService {
  /**
   * Get list of tenants user can access
   */
  static async getAccessibleTenants(scope: AccessScope) {
    // God user (level 1) can access all tenants
    if (scope.isGod || scope.level === 1) {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT id, nama, status FROM tenants WHERE status = ? ORDER BY nama ASC',
        ['aktif']
      );

      return (rows as any[]).map(tenant => ({
        ...tenant,
        canApplyToAll: true
      }));
    }

    // Other users can only access their own tenant
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, nama, status FROM tenants WHERE id = ? AND status = ?',
      [scope.tenantId, 'aktif']
    );

    return (rows as any[]).map(tenant => ({
      ...tenant,
      canApplyToAll: false
    }));
  }

  /**
   * Get list of stores user can access
   */
  static async getAccessibleStores(scope: AccessScope, tenantId?: string) {
    const targetTenant = tenantId || scope.tenantId;

    // God user (level 1) can access all stores
    if (scope.isGod || scope.level === 1) {
      let sql = 'SELECT id, nama, tenant_id, status FROM toko WHERE status = ?';
      let params: any[] = ['aktif'];

      if (tenantId) {
        sql += ' AND tenant_id = ?';
        params.push(tenantId);
      }

      sql += ' ORDER BY nama ASC';

      const [rows] = await pool.execute<RowDataPacket[]>(sql, params);

      return (rows as any[]).map(store => ({
        ...store,
        canApplyToAll: true
      }));
    }

    // Admin (level 2) can access all stores in their tenant
    if (scope.level === 2) {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT id, nama, tenant_id, status FROM toko WHERE tenant_id = ? AND status = ? ORDER BY nama ASC',
        [targetTenant, 'aktif']
      );

      return (rows as any[]).map(store => ({
        ...store,
        canApplyToAll: targetTenant === scope.tenantId
      }));
    }

    // Level 3+ can only access their own store
    if (scope.storeId) {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT id, nama, tenant_id, status FROM toko WHERE id = ? AND tenant_id = ? AND status = ?',
        [scope.storeId, scope.tenantId, 'aktif']
      );

      return (rows as any[]).map(store => ({
        ...store,
        canApplyToAll: false
      }));
    }

    return [];
  }

  /**
   * Get user capabilities for scope operations
   */
  static getUserCapabilities(scope: AccessScope) {
    const isGod = scope.isGod || scope.level === 1;
    const isAdmin = scope.level === 2;

    return {
      canSelectTenant: isGod,
      canSelectStore: isGod || isAdmin,
      canApplyToAllTenants: isGod,
      canApplyToAllStores: isGod || isAdmin,
      level: scope.level,
      isGod: scope.isGod,
      currentTenantId: scope.tenantId,
      currentStoreId: scope.storeId
    };
  }

  /**
   * Validate if user can create data in specified scope
   */
  static validateCreateScope(
    userScope: AccessScope,
    targetTenantId?: string,
    targetStoreId?: string,
    applyToAllTenants?: boolean,
    applyToAllStores?: boolean
  ): { valid: boolean; message?: string } {
    // God user can do anything
    if (userScope.isGod || userScope.level === 1) {
      return { valid: true };
    }

    // Check apply to all tenants (only God user allowed)
    if (applyToAllTenants) {
      return { valid: false, message: 'Only God user can apply to all tenants' };
    }

    // Check apply to all stores
    if (applyToAllStores) {
      if (userScope.level !== 2) {
        return { valid: false, message: 'Only Admin level can apply to all stores' };
      }
      // Admin can only apply to all stores in their tenant
      if (targetTenantId && targetTenantId !== userScope.tenantId) {
        return { valid: false, message: 'Cannot apply to all stores in different tenant' };
      }
    }

    // Check target tenant
    if (targetTenantId && targetTenantId !== userScope.tenantId) {
      return { valid: false, message: 'Cannot create data in different tenant' };
    }

    // Check target store for level 3+
    if (userScope.level && userScope.level >= 3) {
      if (targetStoreId && targetStoreId !== userScope.storeId) {
        return { valid: false, message: 'Cannot create data in different store' };
      }
    }

    return { valid: true };
  }
}