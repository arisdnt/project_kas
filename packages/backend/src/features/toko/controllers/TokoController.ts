/**
 * Store Controller
 * Handles store operations with access scope validation
 */

import { Request, Response } from 'express';
import { TokoService } from '../services/TokoService';
import { SearchTokoQuerySchema, CreateTokoSchema, UpdateTokoSchema, CreateTokoConfigSchema, UpdateTokoConfigSchema, BulkUpdateOperatingHoursSchema } from '../models/TokoCore';

export class TokoController {
  static async searchStores(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = SearchTokoQuerySchema.parse(req.query);
      const result = await TokoService.searchStores(req.accessScope, query);

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
      console.error('Search stores error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to search stores'
      });
    }
  }

  static async findStoreById(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const store = await TokoService.findStoreById(req.accessScope, id);

      return res.json({ success: true, data: store });
    } catch (error: any) {
      console.error('Find store error:', error);
      if (error.message === 'Store not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async findStoreByCode(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { kode } = req.params;
      const store = await TokoService.findStoreByCode(req.accessScope, kode);

      return res.json({ success: true, data: store });
    } catch (error: any) {
      console.error('Find store by code error:', error);
      if (error.message === 'Store not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getStoreWithFullInfo(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const info = await TokoService.getStoreWithFullInfo(req.accessScope, id);

      return res.json({ success: true, data: info });
    } catch (error: any) {
      console.error('Get store full info error:', error);
      if (error.message === 'Store not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getActiveStores(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const stores = await TokoService.getActiveStores(req.accessScope);
      return res.json({ success: true, data: stores });
    } catch (error: any) {
      console.error('Get active stores error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async createStore(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data = CreateTokoSchema.parse(req.body);
      const store = await TokoService.createStore(req.accessScope, data);

      return res.status(201).json({ success: true, data: store });
    } catch (error: any) {
      console.error('Create store error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create store'
      });
    }
  }

  static async updateStore(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const data = UpdateTokoSchema.parse(req.body);
      const result = await TokoService.updateStore(req.accessScope, id, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update store error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update store'
      });
    }
  }

  static async deleteStore(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const result = await TokoService.deleteStore(req.accessScope, id);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Delete store error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete store'
      });
    }
  }

  // Configuration endpoints
  static async getStoreConfigs(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const configs = await TokoService.getStoreConfigs(req.accessScope, id);

      return res.json({ success: true, data: configs });
    } catch (error: any) {
      console.error('Get store configs error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getStoreConfig(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id, key } = req.params;
      const config = await TokoService.getStoreConfig(req.accessScope, id, key);

      return res.json({ success: true, data: config });
    } catch (error: any) {
      console.error('Get store config error:', error);
      if (error.message === 'Store configuration not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async setStoreConfig(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const data = CreateTokoConfigSchema.parse(req.body);
      const config = await TokoService.setStoreConfig(req.accessScope, id, data);

      return res.json({ success: true, data: config });
    } catch (error: any) {
      console.error('Set store config error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to set store configuration'
      });
    }
  }

  static async updateStoreConfig(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id, key } = req.params;
      const data = UpdateTokoConfigSchema.parse(req.body);
      const result = await TokoService.updateStoreConfig(req.accessScope, id, key, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update store config error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update store configuration'
      });
    }
  }

  static async deleteStoreConfig(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id, key } = req.params;
      const result = await TokoService.deleteStoreConfig(req.accessScope, id, key);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Delete store config error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete store configuration'
      });
    }
  }

  // Operating hours endpoints
  static async getOperatingHours(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const hours = await TokoService.getOperatingHours(req.accessScope, id);

      return res.json({ success: true, data: hours });
    } catch (error: any) {
      console.error('Get operating hours error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async updateOperatingHours(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const data = BulkUpdateOperatingHoursSchema.parse(req.body);
      const result = await TokoService.updateOperatingHours(req.accessScope, id, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update operating hours error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update operating hours'
      });
    }
  }

  static async getStoreStats(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const stats = await TokoService.getStoreStats(req.accessScope, id);

      return res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('Get store stats error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}