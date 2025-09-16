/**
 * Webhook Service Orchestrator
 * Main service that coordinates webhook and integration operations
 */

import { AccessScope } from '@/core/middleware/accessScope';
import { SearchWebhookQuery, CreateWebhook, UpdateWebhook, CreateIntegration, UpdateIntegration, TriggerWebhookRequest } from '../models/WebhookCore';
import { WebhookQueryService } from './modules/WebhookQueryService';
import { WebhookMutationService } from './modules/WebhookMutationService';

export class WebhookService {
  // Query operations
  static async searchWebhooks(scope: AccessScope, query: SearchWebhookQuery) {
    return WebhookQueryService.searchWebhooks(scope, query);
  }

  static async findWebhookById(scope: AccessScope, id: string) {
    const webhook = await WebhookQueryService.findWebhookById(scope, id);
    if (!webhook) {
      throw new Error('Webhook not found');
    }
    return webhook;
  }

  static async getWebhookDeliveries(scope: AccessScope, webhookId: string, limit: number = 50) {
    return WebhookQueryService.getWebhookDeliveries(scope, webhookId, limit);
  }

  static async getWebhookStats(scope: AccessScope, webhookId: string) {
    return WebhookQueryService.getWebhookStats(scope, webhookId);
  }

  static async getIntegrations(scope: AccessScope) {
    return WebhookQueryService.getIntegrations(scope);
  }

  static async findIntegrationById(scope: AccessScope, id: string) {
    const integration = await WebhookQueryService.findIntegrationById(scope, id);
    if (!integration) {
      throw new Error('Integration not found');
    }
    return integration;
  }

  // Mutation operations
  static async createWebhook(scope: AccessScope, data: CreateWebhook) {
    if ((scope.level || 5) > 3) {
      throw new Error('Insufficient permissions to create webhooks');
    }

    // Auto-set tenant and user if not provided
    if (!data.tenant_id) {
      data.tenant_id = scope.tenantId;
    }
    if (!data.user_id) {
      data.user_id = scope.tenantId!;
    }

    // Validate URL is accessible
    await this.validateWebhookUrl(data.url);

    return WebhookMutationService.createWebhook(scope, data);
  }

  static async updateWebhook(scope: AccessScope, id: string, data: UpdateWebhook) {
    if (data.url) {
      await this.validateWebhookUrl(data.url);
    }

    return WebhookMutationService.updateWebhook(scope, id, data);
  }

  static async deleteWebhook(scope: AccessScope, id: string) {
    return WebhookMutationService.deleteWebhook(scope, id);
  }

  static async testWebhook(scope: AccessScope, webhookId: string, testPayload?: any) {
    const webhook = await this.findWebhookById(scope, webhookId);

    const payload = testPayload || {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook delivery',
        webhook_id: webhookId
      }
    };

    return WebhookMutationService.triggerWebhook(webhook, 'webhook.test', payload);
  }

  static async triggerWebhooks(scope: AccessScope, request: TriggerWebhookRequest) {
    if ((scope.level || 5) > 3) {
      throw new Error('Insufficient permissions to trigger webhooks');
    }

    let webhooks;
    if (request.webhook_ids && request.webhook_ids.length > 0) {
      // Trigger specific webhooks
      webhooks = await Promise.all(
        request.webhook_ids.map(id => this.findWebhookById(scope, id))
      );
    } else {
      // Trigger all webhooks listening to this event
      webhooks = await WebhookQueryService.getWebhooksByEvent(scope, request.event_type);
    }

    const results = await Promise.all(
      webhooks.map(webhook =>
        WebhookMutationService.triggerWebhook(webhook, request.event_type, request.data)
      )
    );

    return {
      triggered: webhooks.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  static async createIntegration(scope: AccessScope, data: CreateIntegration) {
    if ((scope.level || 5) > 2) {
      throw new Error('Insufficient permissions to create integrations');
    }

    // Auto-set tenant and user if not provided
    if (!data.tenant_id) {
      data.tenant_id = scope.tenantId;
    }
    if (!data.user_id) {
      data.user_id = scope.tenantId!;
    }

    return WebhookMutationService.createIntegration(scope, data);
  }

  static async updateIntegration(scope: AccessScope, id: string, data: UpdateIntegration) {
    return WebhookMutationService.updateIntegration(scope, id, data);
  }

  // Helper methods for common webhook events
  static async notifyTransactionCreated(scope: AccessScope, transactionData: any) {
    return this.triggerWebhooks(scope, {
      event_type: 'transaction.created',
      data: {
        transaction: transactionData,
        timestamp: new Date().toISOString()
      }
    });
  }

  static async notifyInventoryLowStock(scope: AccessScope, inventoryData: any) {
    return this.triggerWebhooks(scope, {
      event_type: 'inventory.low_stock',
      data: {
        inventory: inventoryData,
        timestamp: new Date().toISOString()
      }
    });
  }

  static async notifyBackupCompleted(scope: AccessScope, backupData: any) {
    return this.triggerWebhooks(scope, {
      event_type: 'backup.completed',
      data: {
        backup: backupData,
        timestamp: new Date().toISOString()
      }
    });
  }

  static async notifySystemError(scope: AccessScope, errorData: any) {
    return this.triggerWebhooks(scope, {
      event_type: 'system.error',
      data: {
        error: errorData,
        timestamp: new Date().toISOString()
      }
    });
  }

  private static async validateWebhookUrl(url: string) {
    try {
      const urlObj = new URL(url);

      // Don't allow localhost or private IPs for security
      if (urlObj.hostname === 'localhost' ||
          urlObj.hostname.startsWith('127.') ||
          urlObj.hostname.startsWith('192.168.') ||
          urlObj.hostname.startsWith('10.') ||
          (urlObj.hostname.startsWith('172.') &&
           parseInt(urlObj.hostname.split('.')[1]) >= 16 &&
           parseInt(urlObj.hostname.split('.')[1]) <= 31)) {
        throw new Error('Private/local URLs are not allowed for webhooks');
      }

      // Only allow HTTP/HTTPS
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Only HTTP and HTTPS URLs are allowed');
      }

    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Invalid webhook URL format');
    }
  }
}