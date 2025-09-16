/**
 * Configuration Controller
 * Handles system configuration operations with access control
 */

import { Request, Response } from 'express';
import { KonfigurasiService } from '../services/KonfigurasiService';
import { UpdateKonfigurasiSchema } from '../models/KonfigurasiCore';
import { z } from 'zod';

const TaxCalculationSchema = z.object({
  amount: z.number().min(0),
  store_id: z.string().uuid().optional()
});

export class KonfigurasiController {
  static async getConfiguration(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const config = await KonfigurasiService.getConfiguration(req.accessScope);

      if (!config) {
        return res.status(404).json({
          success: false,
          message: 'Configuration not found'
        });
      }

      return res.json({ success: true, data: config });
    } catch (error: any) {
      console.error('Get configuration error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getTenantConfiguration(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const config = await KonfigurasiService.getTenantConfiguration(req.accessScope);

      return res.json({ success: true, data: config });
    } catch (error: any) {
      console.error('Get tenant configuration error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getStoreConfiguration(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { storeId } = req.params;
      const config = await KonfigurasiService.getConfigurationByStore(req.accessScope, storeId);

      return res.json({ success: true, data: config });
    } catch (error: any) {
      console.error('Get store configuration error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getAllStoreConfigurations(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Only admins can view all store configurations
      if ((req.user.level || 5) > 2) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient privileges'
        });
      }

      const configs = await KonfigurasiService.getAllStoreConfigurations(req.accessScope);

      return res.json({ success: true, data: configs });
    } catch (error: any) {
      console.error('Get all store configurations error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getEffectiveConfiguration(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { storeId } = req.query;
      const config = await KonfigurasiService.getEffectiveConfiguration(
        req.accessScope,
        storeId as string
      );

      return res.json({ success: true, data: config });
    } catch (error: any) {
      console.error('Get effective configuration error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async updateTenantConfiguration(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Only admins can update tenant configuration
      if ((req.user.level || 5) > 2) {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can update tenant configuration'
        });
      }

      const data = UpdateKonfigurasiSchema.parse(req.body);
      const result = await KonfigurasiService.updateTenantConfiguration(req.accessScope, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update tenant configuration error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update tenant configuration'
      });
    }
  }

  static async updateStoreConfiguration(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { storeId } = req.params;
      const data = UpdateKonfigurasiSchema.parse(req.body);

      // Store managers can update their own store configuration
      if ((req.user.level || 5) >= 3 && req.accessScope.storeId !== storeId) {
        return res.status(403).json({
          success: false,
          message: 'Can only update configuration for your assigned store'
        });
      }

      const result = await KonfigurasiService.updateStoreConfiguration(req.accessScope, storeId, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update store configuration error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update store configuration'
      });
    }
  }

  static async calculateTax(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { amount, store_id } = TaxCalculationSchema.parse(req.body);
      const calculation = await KonfigurasiService.applyTaxToAmount(
        req.accessScope,
        amount,
        store_id
      );

      return res.json({ success: true, data: calculation });
    } catch (error: any) {
      console.error('Calculate tax error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to calculate tax'
      });
    }
  }
}