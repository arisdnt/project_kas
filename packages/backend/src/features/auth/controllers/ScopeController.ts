
import { Request, Response } from 'express';
import { ScopeService } from '../services/ScopeService';
import { logger } from '@/core/utils/logger';

export class ScopeController {
  static async getAccessibleTenants(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const tenants = await ScopeService.getAccessibleTenants(req.accessScope);

      return res.json({
        success: true,
        data: tenants
      });
    } catch (error: any) {
      console.error('Get accessible tenants error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get accessible tenants'
      });
    }
  }

  
  static async getAccessibleStores(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { tenantId } = req.query;
      const stores = await ScopeService.getAccessibleStores(req.accessScope, tenantId as string);

      return res.json({
        success: true,
        data: stores
      });
    } catch (error: any) {
      console.error('Get accessible stores error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get accessible stores'
      });
    }
  }

  
  static async getScopeCapabilities(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const capabilities = ScopeService.getUserCapabilities(req.accessScope);

      return res.json({
        success: true,
        data: capabilities
      });
    } catch (error: any) {
      console.error('Get scope capabilities error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get scope capabilities'
      });
    }
  }
}