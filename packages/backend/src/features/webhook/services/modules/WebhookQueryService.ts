/**
 * Webhook Query Service Module
 * Handles webhook search and retrieval operations
 */

import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope';
import { SearchWebhookQuery, Webhook, WebhookDelivery } from '../../models/WebhookCore';

export class WebhookQueryService {
  static async searchWebhooks(scope: AccessScope, query: SearchWebhookQuery) {
    const offset = (Number(query.page) - 1) * Number(query.limit);

    let sql = `
      SELECT w.*
      FROM webhook w
      WHERE 1=1
    `;

    const params: any[] = [];

    // Search filter
    if (query.search) {
      sql += ` AND (w.nama LIKE ? OR w.url LIKE ?)`;
      const searchPattern = `%${query.search}%`;
      params.push(searchPattern, searchPattern);
    }

    // Active status filter
    if (query.is_aktif !== undefined) {
      sql += ` AND w.is_aktif = ?`;
      params.push(query.is_aktif ? 1 : 0);
    }

    // Event filter
    if (query.event) {
      sql += ` AND JSON_CONTAINS(w.events, JSON_QUOTE(?))`;
      params.push(query.event);
    }

    // Apply access scope
    const scopedQuery = applyScopeToSql(sql, params, scope, {
      tenantColumn: 'w.tenant_id',
      storeColumn: 'w.toko_id'
    });

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM (${scopedQuery.sql}) as filtered`;
    const [countRows] = await pool.execute<RowDataPacket[]>(countSql, scopedQuery.params);
    const total = countRows[0].total;

    // Get paginated results
    const finalSql = `${scopedQuery.sql} ORDER BY w.dibuat_pada DESC LIMIT ? OFFSET ?`;
    const finalParams = [...scopedQuery.params, Number(query.limit), offset];

    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, finalParams);

    return {
      data: rows.map(this.mapWebhookRow) as Webhook[],
      total,
      page: Number(query.page),
      totalPages: Math.ceil(total / Number(query.limit))
    };
  }

  static async findWebhookById(scope: AccessScope, id: string): Promise<Webhook | null> {
    const sql = `
      SELECT w.*
      FROM webhook w
      WHERE w.id = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [id], scope, {
      tenantColumn: 'w.tenant_id',
      storeColumn: 'w.toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return rows[0] ? this.mapWebhookRow(rows[0]) : null;
  }

  static async getWebhooksByEvent(scope: AccessScope, eventType: string) {
    const sql = `
      SELECT w.*
      FROM webhook w
      WHERE w.is_aktif = 1 AND JSON_CONTAINS(w.events, JSON_QUOTE(?))
    `;

    const scopedQuery = applyScopeToSql(sql, [eventType], scope, {
      tenantColumn: 'w.tenant_id',
      storeColumn: 'w.toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);
    return rows.map(this.mapWebhookRow) as Webhook[];
  }

  static async getWebhookDeliveries(scope: AccessScope, webhookId: string, limit: number = 50) {
    const sql = `
      SELECT wd.*
      FROM webhook_delivery wd
      JOIN webhook w ON wd.webhook_id = w.id
      WHERE wd.webhook_id = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [webhookId], scope, {
      tenantColumn: 'w.tenant_id',
      storeColumn: 'w.toko_id'
    });

    const finalSql = `${scopedQuery.sql} ORDER BY wd.created_at DESC LIMIT ?`;
    const finalParams = [...scopedQuery.params, limit];

    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, finalParams);

    return rows.map(row => ({
      ...row,
      payload: JSON.parse(row.payload || '{}')
    })) as WebhookDelivery[];
  }

  static async getWebhookStats(scope: AccessScope, webhookId: string) {
    const sql = `
      SELECT
        COUNT(*) as total_deliveries,
        SUM(CASE WHEN wd.response_status BETWEEN 200 AND 299 THEN 1 ELSE 0 END) as successful_deliveries,
        SUM(CASE WHEN wd.response_status NOT BETWEEN 200 AND 299 OR wd.response_status IS NULL THEN 1 ELSE 0 END) as failed_deliveries,
        AVG(wd.response_time_ms) as average_response_time,
        MAX(wd.delivered_at) as last_delivery_at
      FROM webhook_delivery wd
      JOIN webhook w ON wd.webhook_id = w.id
      WHERE wd.webhook_id = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [webhookId], scope, {
      tenantColumn: 'w.tenant_id',
      storeColumn: 'w.toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);

    if (rows.length === 0) {
      return {
        webhook_id: webhookId,
        total_deliveries: 0,
        successful_deliveries: 0,
        failed_deliveries: 0,
        average_response_time: 0,
        last_delivery_at: null
      };
    }

    const stats = rows[0];
    return {
      webhook_id: webhookId,
      total_deliveries: Number(stats.total_deliveries),
      successful_deliveries: Number(stats.successful_deliveries),
      failed_deliveries: Number(stats.failed_deliveries),
      average_response_time: Number(stats.average_response_time || 0),
      last_delivery_at: stats.last_delivery_at
    };
  }

  static async getIntegrations(scope: AccessScope) {
    const sql = `
      SELECT i.*
      FROM integration i
      WHERE 1=1
    `;

    const scopedQuery = applyScopeToSql(sql, [], scope, {
      tenantColumn: 'i.tenant_id',
      storeColumn: 'i.toko_id'
    });

    const finalSql = `${scopedQuery.sql} ORDER BY i.dibuat_pada DESC`;
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedQuery.params);

    return rows.map(row => ({
      ...row,
      config: JSON.parse(row.config || '{}'),
      credentials: row.credentials ? JSON.parse(row.credentials) : null
    }));
  }

  static async findIntegrationById(scope: AccessScope, id: string) {
    const sql = `
      SELECT i.*
      FROM integration i
      WHERE i.id = ?
    `;

    const scopedQuery = applyScopeToSql(sql, [id], scope, {
      tenantColumn: 'i.tenant_id',
      storeColumn: 'i.toko_id'
    });

    const [rows] = await pool.execute<RowDataPacket[]>(scopedQuery.sql, scopedQuery.params);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      ...row,
      config: JSON.parse(row.config || '{}'),
      credentials: row.credentials ? JSON.parse(row.credentials) : null
    };
  }

  private static mapWebhookRow(row: any): Webhook {
    return {
      ...row,
      events: JSON.parse(row.events || '[]'),
      headers: row.headers ? JSON.parse(row.headers) : null,
      is_aktif: Boolean(row.is_aktif)
    };
  }
}