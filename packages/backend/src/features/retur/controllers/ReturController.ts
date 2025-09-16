/**
 * Return Controller
 * Handles return operations with access scope validation
 */

import { Request, Response } from 'express';
import { ReturService } from '../services/ReturService';
import { SearchReturQuerySchema, CreateReturPenjualanSchema, CreateReturPembelianSchema, UpdateReturSchema } from '../models/ReturCore';
import { CreateItemReturPenjualanSchema, CreateItemReturPembelianSchema } from '../models/ItemReturModel';
import { requireStoreWhenNeeded } from '@/core/middleware/accessScope';
import { z } from 'zod';

const CreateSalesReturnRequestSchema = z.object({
  retur: CreateReturPenjualanSchema,
  items: z.array(CreateItemReturPenjualanSchema).min(1, 'At least one item is required')
});

const CreatePurchaseReturnRequestSchema = z.object({
  retur: CreateReturPembelianSchema,
  items: z.array(CreateItemReturPembelianSchema).min(1, 'At least one item is required')
});

const ReturnStatsQuerySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, use YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, use YYYY-MM-DD'),
  type: z.enum(['penjualan', 'pembelian'])
});

export class ReturController {
  static async searchSalesReturns(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = SearchReturQuerySchema.parse(req.query);
      const result = await ReturService.searchSalesReturns(req.accessScope, query);

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
      console.error('Search sales returns error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to search sales returns'
      });
    }
  }

  static async searchPurchaseReturns(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = SearchReturQuerySchema.parse(req.query);
      const result = await ReturService.searchPurchaseReturns(req.accessScope, query);

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
      console.error('Search purchase returns error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to search purchase returns'
      });
    }
  }

  static async findSalesReturnById(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const retur = await ReturService.findSalesReturnById(req.accessScope, id);

      return res.json({ success: true, data: retur });
    } catch (error: any) {
      console.error('Find sales return error:', error);
      if (error.message === 'Sales return not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async findPurchaseReturnById(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const retur = await ReturService.findPurchaseReturnById(req.accessScope, id);

      return res.json({ success: true, data: retur });
    } catch (error: any) {
      console.error('Find purchase return error:', error);
      if (error.message === 'Purchase return not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async createSalesReturn(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Store required for return creation
      await new Promise<void>((resolve, reject) =>
        requireStoreWhenNeeded(req, res, (err?: any) => err ? reject(err) : resolve())
      );

      const request = CreateSalesReturnRequestSchema.parse(req.body);
      const retur = await ReturService.createSalesReturn(req.accessScope, request);

      return res.status(201).json({ success: true, data: retur });
    } catch (error: any) {
      console.error('Create sales return error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create sales return'
      });
    }
  }

  static async createPurchaseReturn(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Store required for return creation
      await new Promise<void>((resolve, reject) =>
        requireStoreWhenNeeded(req, res, (err?: any) => err ? reject(err) : resolve())
      );

      const request = CreatePurchaseReturnRequestSchema.parse(req.body);
      const retur = await ReturService.createPurchaseReturn(req.accessScope, request);

      return res.status(201).json({ success: true, data: retur });
    } catch (error: any) {
      console.error('Create purchase return error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create purchase return'
      });
    }
  }

  static async updateSalesReturn(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const data = UpdateReturSchema.parse(req.body);
      const result = await ReturService.updateSalesReturn(req.accessScope, id, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update sales return error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update sales return'
      });
    }
  }

  static async updatePurchaseReturn(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const data = UpdateReturSchema.parse(req.body);
      const result = await ReturService.updatePurchaseReturn(req.accessScope, id, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update purchase return error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update purchase return'
      });
    }
  }

  static async getReturnStats(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = ReturnStatsQuerySchema.parse(req.query);
      const stats = await ReturService.getReturnStats(
        req.accessScope,
        query.type,
        query.start_date,
        query.end_date
      );

      return res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('Get return stats error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to get return statistics'
      });
    }
  }
}