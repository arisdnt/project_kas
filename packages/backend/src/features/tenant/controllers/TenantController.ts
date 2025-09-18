/**
 * Tenant Controller
 * Handles tenant operations (God user only)
 */

import { Request, Response } from 'express';
import { TenantService } from '../services/TenantService';
import { SearchTenantQuerySchema, CreateTenantSchema, UpdateTenantSchema } from '../models/TenantCore';

export class TenantController {
  static async search(req: Request, res: Response) {
    try {
      // Access control handled by middleware
      const query = SearchTenantQuerySchema.parse(req.query);
      const result = await TenantService.search(query);

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
      console.error('Search tenants error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to search tenants'
      });
    }
  }

  static async findById(req: Request, res: Response) {
    try {
      // Access control handled by middleware
      const { id } = req.params;
      const tenant = await TenantService.findById(id);

      return res.json({ success: true, data: tenant });
    } catch (error: any) {
      console.error('Find tenant error:', error);
      if (error.message === 'Tenant not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getTenantStats(req: Request, res: Response) {
    try {
      // Access control handled by middleware
      const stats = await TenantService.getTenantStats();

      return res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('Get tenant stats error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      // Access control handled by middleware
      const data = CreateTenantSchema.parse(req.body);
      const tenant = await TenantService.createTenant(data);

      return res.status(201).json({ success: true, data: tenant });
    } catch (error: any) {
      console.error('Create tenant error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create tenant'
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      // Access control handled by middleware
      const { id } = req.params;
      const data = UpdateTenantSchema.parse(req.body);
      const result = await TenantService.updateTenant(id, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update tenant error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update tenant'
      });
    }
  }

  static async checkLimits(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;

      // God users can check any tenant, others can only check their own
      if ((req.user.level || 5) !== 1 && req.user.tenantId !== id) {
        return res.status(403).json({
          success: false,
          message: 'Can only check limits for your own tenant'
        });
      }

      const limits = await TenantService.checkTenantLimits(id);

      return res.json({ success: true, data: limits });
    } catch (error: any) {
      console.error('Check tenant limits error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to check tenant limits'
      });
    }
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user;

    console.log(`🔴 [TENANT CONTROLLER] Delete request received for tenant: ${id} by user: ${user?.username} (ID: ${user?.id})`);

    try {
      // Access control handled by middleware
      console.log(`🔍 [TENANT CONTROLLER] Calling TenantService.deleteTenant for ID: ${id}`);

      const result = await TenantService.deleteTenant(id);

      console.log(`✅ [TENANT CONTROLLER] Successfully deleted tenant ${id}, result:`, result);

      return res.json({
        success: true,
        message: 'Tenant deleted successfully',
        data: result
      });

    } catch (err: any) {
      const errorMsg = err.message || 'Unknown error';
      console.log(`❌ [TENANT CONTROLLER] Error deleting tenant ${id}: ${errorMsg}`);
      console.error(`🔥 [TENANT CONTROLLER] Full error details:`, err);

      if (err.message === 'Tenant not found' || err.message === 'Tenant not found or already deleted') {
        console.log(`🚫 [TENANT CONTROLLER] Returning 404 for tenant ${id}`);
        return res.status(404).json({
          success: false,
          message: 'Tenant not found'
        });
      }

      if (err.message.includes('Cannot delete tenant with active')) {
        console.log(`⚠️ [TENANT CONTROLLER] Returning 400 - dependency error for tenant ${id}`);
        return res.status(400).json({
          success: false,
          message: err.message,
          error: 'DEPENDENCY_EXISTS'
        });
      }

      console.log(`💥 [TENANT CONTROLLER] Returning 500 - unexpected error for tenant ${id}`);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while deleting tenant',
        error: errorMsg
      });
    }
  }
}