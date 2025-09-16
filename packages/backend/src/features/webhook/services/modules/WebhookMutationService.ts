/**
 * Webhook Mutation Service Module
 * Handles webhook creation, updates and delivery operations
 */

import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import axios from 'axios';
import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';
import { CreateWebhook, UpdateWebhook, CreateIntegration, UpdateIntegration } from '../../models/WebhookCore';

export class WebhookMutationService {
  static async createWebhook(scope: AccessScope, data: CreateWebhook) {
    const id = uuidv4();
    const secret = crypto.randomBytes(32).toString('hex');

    const sql = `
      INSERT INTO webhook (
        id, tenant_id, toko_id, user_id, nama, url, events, secret,
        is_aktif, timeout_seconds, retry_attempts, headers,
        dibuat_pada, diperbarui_pada
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
      )
    `;

    const params = [
      id, data.tenant_id, data.toko_id || null, data.user_id,
      data.nama, data.url, JSON.stringify(data.events), secret,
      data.is_aktif ? 1 : 0, data.timeout_seconds, data.retry_attempts,
      data.headers ? JSON.stringify(data.headers) : null
    ];

    await pool.execute(sql, params);

    // Return created webhook
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM webhook WHERE id = ?',
      [id]
    );

    return this.mapWebhookRow(rows[0]);
  }

  static async updateWebhook(scope: AccessScope, id: string, data: UpdateWebhook) {
    // Check if webhook exists and user has access
    const checkSql = `
      SELECT id FROM webhook
      WHERE id = ? AND tenant_id = ? ${scope.storeId ? 'AND (toko_id IS NULL OR toko_id = ?)' : ''}
    `;
    const checkParams = scope.storeId ? [id, scope.tenantId, scope.storeId] : [id, scope.tenantId];
    const [checkRows] = await pool.execute<RowDataPacket[]>(checkSql, checkParams);

    if (checkRows.length === 0) {
      throw new Error('Webhook not found or access denied');
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (data.nama !== undefined) {
      updates.push('nama = ?');
      params.push(data.nama);
    }

    if (data.url !== undefined) {
      updates.push('url = ?');
      params.push(data.url);
    }

    if (data.events !== undefined) {
      updates.push('events = ?');
      params.push(JSON.stringify(data.events));
    }

    if (data.is_aktif !== undefined) {
      updates.push('is_aktif = ?');
      params.push(data.is_aktif ? 1 : 0);
    }

    if (data.timeout_seconds !== undefined) {
      updates.push('timeout_seconds = ?');
      params.push(data.timeout_seconds);
    }

    if (data.retry_attempts !== undefined) {
      updates.push('retry_attempts = ?');
      params.push(data.retry_attempts);
    }

    if (data.headers !== undefined) {
      updates.push('headers = ?');
      params.push(data.headers ? JSON.stringify(data.headers) : null);
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push('diperbarui_pada = NOW()');
    const sql = `UPDATE webhook SET ${updates.join(', ')} WHERE id = ?`;
    params.push(id);

    await pool.execute(sql, params);

    // Return updated webhook
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM webhook WHERE id = ?',
      [id]
    );

    return this.mapWebhookRow(rows[0]);
  }

  static async deleteWebhook(scope: AccessScope, id: string) {
    const checkSql = `
      SELECT id FROM webhook
      WHERE id = ? AND tenant_id = ? ${scope.storeId ? 'AND (toko_id IS NULL OR toko_id = ?)' : ''}
    `;
    const checkParams = scope.storeId ? [id, scope.tenantId, scope.storeId] : [id, scope.tenantId];
    const [checkRows] = await pool.execute<RowDataPacket[]>(checkSql, checkParams);

    if (checkRows.length === 0) {
      throw new Error('Webhook not found or access denied');
    }

    await pool.execute('DELETE FROM webhook WHERE id = ?', [id]);
    return { success: true, message: 'Webhook deleted successfully' };
  }

  static async triggerWebhook(webhook: any, eventType: string, payload: any) {
    const deliveryId = uuidv4();
    const startTime = Date.now();

    try {
      // Create webhook signature
      const signature = this.createWebhookSignature(webhook.secret, payload);

      // Prepare headers
      const headers: any = {
        'Content-Type': 'application/json',
        'User-Agent': 'POS-System-Webhook/1.0',
        'X-Webhook-Event': eventType,
        'X-Webhook-Signature': signature,
        'X-Webhook-Delivery': deliveryId,
        ...(webhook.headers || {})
      };

      // Make HTTP request
      const response = await axios.post(webhook.url, payload, {
        headers,
        timeout: webhook.timeout_seconds * 1000,
        validateStatus: () => true // Don't throw on non-2xx status codes
      });

      const responseTime = Date.now() - startTime;

      // Log delivery
      await this.logWebhookDelivery({
        id: deliveryId,
        webhook_id: webhook.id,
        event_type: eventType,
        payload,
        response_status: response.status,
        response_body: JSON.stringify(response.data).substring(0, 1000), // Limit response body
        response_time_ms: responseTime,
        attempt_number: 1,
        delivered_at: new Date()
      });

      // Update webhook last triggered info
      await pool.execute(
        `UPDATE webhook SET last_triggered_at = NOW(), last_response_status = ?, last_error_message = NULL WHERE id = ?`,
        [response.status, webhook.id]
      );

      return {
        success: response.status >= 200 && response.status < 300,
        status: response.status,
        response_time: responseTime
      };

    } catch (error: any) {
      const responseTime = Date.now() - startTime;

      // Log failed delivery
      await this.logWebhookDelivery({
        id: deliveryId,
        webhook_id: webhook.id,
        event_type: eventType,
        payload,
        error_message: error.message,
        response_time_ms: responseTime,
        attempt_number: 1
      });

      // Update webhook error info
      await pool.execute(
        `UPDATE webhook SET last_triggered_at = NOW(), last_error_message = ? WHERE id = ?`,
        [error.message, webhook.id]
      );

      return {
        success: false,
        error: error.message,
        response_time: responseTime
      };
    }
  }

  private static async logWebhookDelivery(delivery: any) {
    const sql = `
      INSERT INTO webhook_delivery (
        id, webhook_id, event_type, payload, response_status, response_body,
        response_time_ms, error_message, attempt_number, delivered_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const params = [
      delivery.id, delivery.webhook_id, delivery.event_type,
      JSON.stringify(delivery.payload), delivery.response_status || null,
      delivery.response_body || null, delivery.response_time_ms,
      delivery.error_message || null, delivery.attempt_number,
      delivery.delivered_at || null
    ];

    await pool.execute(sql, params);
  }

  private static createWebhookSignature(secret: string, payload: any): string {
    const payloadString = JSON.stringify(payload);
    return crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
  }

  static async createIntegration(scope: AccessScope, data: CreateIntegration) {
    const id = uuidv4();

    const sql = `
      INSERT INTO integration (
        id, tenant_id, toko_id, user_id, nama, tipe, provider, config,
        credentials, is_aktif, sync_interval_minutes, dibuat_pada, diperbarui_pada
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
      )
    `;

    const params = [
      id, data.tenant_id, data.toko_id || null, data.user_id,
      data.nama, data.tipe, data.provider, JSON.stringify(data.config),
      data.credentials ? JSON.stringify(data.credentials) : null,
      data.is_aktif ? 1 : 0, data.sync_interval_minutes
    ];

    await pool.execute(sql, params);

    // Return created integration
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM integration WHERE id = ?',
      [id]
    );

    return this.mapIntegrationRow(rows[0]);
  }

  static async updateIntegration(scope: AccessScope, id: string, data: UpdateIntegration) {
    const checkSql = `
      SELECT id FROM integration
      WHERE id = ? AND tenant_id = ? ${scope.storeId ? 'AND (toko_id IS NULL OR toko_id = ?)' : ''}
    `;
    const checkParams = scope.storeId ? [id, scope.tenantId, scope.storeId] : [id, scope.tenantId];
    const [checkRows] = await pool.execute<RowDataPacket[]>(checkSql, checkParams);

    if (checkRows.length === 0) {
      throw new Error('Integration not found or access denied');
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (data.nama !== undefined) {
      updates.push('nama = ?');
      params.push(data.nama);
    }

    if (data.config !== undefined) {
      updates.push('config = ?');
      params.push(JSON.stringify(data.config));
    }

    if (data.credentials !== undefined) {
      updates.push('credentials = ?');
      params.push(data.credentials ? JSON.stringify(data.credentials) : null);
    }

    if (data.is_aktif !== undefined) {
      updates.push('is_aktif = ?');
      params.push(data.is_aktif ? 1 : 0);
    }

    if (data.sync_interval_minutes !== undefined) {
      updates.push('sync_interval_minutes = ?');
      params.push(data.sync_interval_minutes);
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push('diperbarui_pada = NOW()');
    const sql = `UPDATE integration SET ${updates.join(', ')} WHERE id = ?`;
    params.push(id);

    await pool.execute(sql, params);

    // Return updated integration
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM integration WHERE id = ?',
      [id]
    );

    return this.mapIntegrationRow(rows[0]);
  }

  private static mapWebhookRow(row: any) {
    return {
      ...row,
      events: JSON.parse(row.events || '[]'),
      headers: row.headers ? JSON.parse(row.headers) : null,
      is_aktif: Boolean(row.is_aktif)
    };
  }

  private static mapIntegrationRow(row: any) {
    return {
      ...row,
      config: JSON.parse(row.config || '{}'),
      credentials: row.credentials ? JSON.parse(row.credentials) : null,
      is_aktif: Boolean(row.is_aktif)
    };
  }
}