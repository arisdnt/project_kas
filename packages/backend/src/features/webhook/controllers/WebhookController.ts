/**
 * Webhook Controller
 * Handles webhook and integration operations with access scope validation
 */

import { Request, Response } from 'express';
import { WebhookService } from '../services/WebhookService';
import { SearchWebhookQuerySchema, CreateWebhookSchema, UpdateWebhookSchema, CreateIntegrationSchema, UpdateIntegrationSchema, TriggerWebhookRequestSchema, WebhookTestRequestSchema } from '../models/WebhookCore';

export class WebhookController {
  static async searchWebhooks(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = SearchWebhookQuerySchema.parse(req.query);
      const result = await WebhookService.searchWebhooks(req.accessScope, query);

      return res.json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit: Number(query.limit)
        }
      });
    } catch (error: any) {
      console.error('Search webhooks error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to search webhooks'
      });
    }
  }

  static async findWebhookById(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const webhook = await WebhookService.findWebhookById(req.accessScope, id);

      return res.json({ success: true, data: webhook });
    } catch (error: any) {
      console.error('Find webhook error:', error);
      if (error.message === 'Webhook not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getWebhookDeliveries(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const limit = Number(req.query.limit) || 50;
      const deliveries = await WebhookService.getWebhookDeliveries(req.accessScope, id, limit);

      return res.json({ success: true, data: deliveries });
    } catch (error: any) {
      console.error('Get webhook deliveries error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getWebhookStats(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const stats = await WebhookService.getWebhookStats(req.accessScope, id);

      return res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('Get webhook stats error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async createWebhook(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data = CreateWebhookSchema.parse(req.body);
      const webhook = await WebhookService.createWebhook(req.accessScope, data);

      return res.status(201).json({ success: true, data: webhook });
    } catch (error: any) {
      console.error('Create webhook error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create webhook'
      });
    }
  }

  static async updateWebhook(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const data = UpdateWebhookSchema.parse(req.body);
      const result = await WebhookService.updateWebhook(req.accessScope, id, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update webhook error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update webhook'
      });
    }
  }

  static async deleteWebhook(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const result = await WebhookService.deleteWebhook(req.accessScope, id);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Delete webhook error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete webhook'
      });
    }
  }

  static async testWebhook(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const request = WebhookTestRequestSchema.parse(req.body);
      const result = await WebhookService.testWebhook(
        req.accessScope,
        request.webhook_id,
        request.test_payload
      );

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Test webhook error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to test webhook'
      });
    }
  }

  static async triggerWebhooks(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const request = TriggerWebhookRequestSchema.parse(req.body);
      const result = await WebhookService.triggerWebhooks(req.accessScope, request);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Trigger webhooks error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to trigger webhooks'
      });
    }
  }

  // Integration endpoints
  static async getIntegrations(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const integrations = await WebhookService.getIntegrations(req.accessScope);
      return res.json({ success: true, data: integrations });
    } catch (error: any) {
      console.error('Get integrations error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async findIntegrationById(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const integration = await WebhookService.findIntegrationById(req.accessScope, id);

      return res.json({ success: true, data: integration });
    } catch (error: any) {
      console.error('Find integration error:', error);
      if (error.message === 'Integration not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async createIntegration(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data = CreateIntegrationSchema.parse(req.body);
      const integration = await WebhookService.createIntegration(req.accessScope, data);

      return res.status(201).json({ success: true, data: integration });
    } catch (error: any) {
      console.error('Create integration error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create integration'
      });
    }
  }

  static async updateIntegration(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const data = UpdateIntegrationSchema.parse(req.body);
      const result = await WebhookService.updateIntegration(req.accessScope, id, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update integration error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update integration'
      });
    }
  }
}