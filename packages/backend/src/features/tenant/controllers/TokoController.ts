/**
 * Store Controller
 * Handles store operations with proper access control
 */

import { Request, Response } from 'express';
import { TenantService } from '../services/TenantService';
import { CreateTokoSchema, UpdateTokoSchema } from '../models/TenantCore';

export class TokoController {
  static async getTenantStores(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Admins can view all tenant stores, store managers only their assigned store
      const tenantId = req.params.tenantId || req.user.tenantId;

      if ((req.user.level || 5) > 2 && req.user.tenantId !== tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Can only view stores from your own tenant'
        });
      }

      const stores = await TenantService.getTenantStores(tenantId);

      // Filter stores for store-level users
      let filteredStores = stores;
      if (req.user && (req.user.level || 5) >= 3 && req.user.tokoId) {
        filteredStores = stores.filter(store => store.id === req.user!.tokoId);
      }

      return res.json({ success: true, data: filteredStores });
    } catch (error: any) {
      console.error('Get tenant stores error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Only admins (level 2) and above can create stores
      if ((req.user.level || 5) > 2) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient privileges to create stores'
        });
      }

      const data = CreateTokoSchema.parse(req.body);

      // Ensure store is created under the user's tenant
      if ((req.user.level || 5) !== 1) {
        data.tenant_id = req.user.tenantId;
      }

      // Check if tenant can add more stores
      const canAdd = await TenantService.canAddStore(data.tenant_id);
      if (!canAdd) {
        return res.status(400).json({
          success: false,
          message: 'Maximum store limit reached for this tenant'
        });
      }

      const store = await TenantService.createStore(data);

      return res.status(201).json({ success: true, data: store });
    } catch (error: any) {
      console.error('Create store error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create store'
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const data = UpdateTokoSchema.parse(req.body);

      // Store managers can only update their own store
      if ((req.user.level || 5) >= 3 && req.user.tokoId !== id) {
        return res.status(403).json({
          success: false,
          message: 'Can only update your assigned store'
        });
      }

      const result = await TenantService.updateStore(id, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update store error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update store'
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Only admins and above can delete stores
      if ((req.user.level || 5) > 2) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient privileges to delete stores'
        });
      }

      const { id } = req.params;
      const tenantId = req.user.tenantId;

      const result = await TenantService.deleteStore(id, tenantId);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Delete store error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete store'
      });
    }
  }
}