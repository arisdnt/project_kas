/**
 * Configuration Query Service Module
 * Handles system configuration retrieval operations
 */

import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';

export class KonfigurasiQueryService {
  static async getConfiguration(scope: AccessScope) {
    const sql = `
      SELECT *
      FROM konfigurasi_sistem
      WHERE 1=1
    `;

    const scopedQuery = applyScopeToSql(sql, [], scope, {
      tenantColumn: 'tenant_id',
      storeColumn: 'toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return rows[0] as any || null;
  }

  static async getConfigurationByStore(scope: AccessScope, storeId: string) {
    const sql = `
      SELECT *
      FROM konfigurasi_sistem
      WHERE toko_id = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [storeId], scope, {
      tenantColumn: 'tenant_id',
      storeColumn: undefined // Don't double-filter by store since we're explicitly querying by store
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return rows[0] as any || null;
  }

  static async getTenantConfiguration(scope: AccessScope) {
    // Get tenant-wide configuration (where toko_id is NULL)
    const sql = `
      SELECT *
      FROM konfigurasi_sistem
      WHERE tenant_id = ? AND toko_id IS NULL
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [scope.tenantId]);
    return rows[0] as any || null;
  }

  static async getAllStoreConfigurations(scope: AccessScope) {
    const sql = `
      SELECT
        ks.*,
        t.nama as toko_nama
      FROM konfigurasi_sistem ks
      LEFT JOIN toko t ON ks.toko_id = t.id
      WHERE ks.toko_id IS NOT NULL
    `;

    const scopedQuery = applyScopeToSql(sql, [], scope, {
      tenantColumn: 'ks.tenant_id',
      storeColumn: undefined // We want all stores for this tenant
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return rows as any[];
  }

  static async getEffectiveConfiguration(scope: AccessScope, storeId?: string) {
    // Get effective configuration by merging tenant and store configurations
    // Store configuration overrides tenant configuration

    let tenantConfig = {};
    let storeConfig = {};

    // Get tenant-wide configuration
    const tenantConfigData = await this.getTenantConfiguration(scope);
    if (tenantConfigData) {
      tenantConfig = tenantConfigData;
    }

    // Get store-specific configuration if store is specified
    if (storeId) {
      const storeConfigData = await this.getConfigurationByStore(scope, storeId);
      if (storeConfigData) {
        storeConfig = storeConfigData;
      }
    }

    // Merge configurations (store config overrides tenant config)
    const effectiveConfig = {
      ...tenantConfig,
      ...storeConfig
    };

    return Object.keys(effectiveConfig).length > 0 ? effectiveConfig : null;
  }
}