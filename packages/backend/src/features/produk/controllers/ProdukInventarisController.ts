/**
 * Product Inventory Controller
 * Handles product inventory operations with store-level access control
 */

import { Request, Response } from 'express';
import { ProdukService } from '../services/ProdukService';
import { InventarisQuerySchema, CreateInventarisSchema, UpdateInventarisSchema } from '../models/InventarisModel';
import { requireStoreWhenNeeded } from '@/core/middleware/accessScope';

export class ProdukInventarisController {
  static async search(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Store required for inventory operations
      await new Promise<void>((resolve, reject) =>
        requireStoreWhenNeeded(req, res, (err?: any) => err ? reject(err) : resolve())
      );

      const query = InventarisQuerySchema.parse(req.query);
      const result = await ProdukService.getInventory(req.accessScope, query);

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
      console.error('Search inventory error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to search inventory'
      });
    }
  }

  static async getProductInventory(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { produkId } = req.params;
      const { tokoId } = req.query;

      if (!tokoId) {
        return res.status(400).json({
          success: false,
          message: 'Store ID (tokoId) is required'
        });
      }

      const inventory = await ProdukService.getProductInventory(
        req.accessScope,
        produkId,
        tokoId as string
      );

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: 'Inventory not found'
        });
      }

      return res.json({ success: true, data: inventory });
    } catch (error: any) {
      console.error('Get product inventory error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async updateStock(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Store required for inventory operations
      await new Promise<void>((resolve, reject) =>
        requireStoreWhenNeeded(req, res, (err?: any) => err ? reject(err) : resolve())
      );

      const { produkId } = req.params;
      const tokoId = req.body.toko_id || req.accessScope.storeId;

      if (!tokoId) {
        return res.status(400).json({ success: false, message: 'Store ID is required' });
      }

      // Check if it's a create or update operation
      const isUpdate = req.method === 'PUT';

      let result;
      if (isUpdate) {
        const data = UpdateInventarisSchema.parse(req.body);
        result = await ProdukService.updateInventory(req.accessScope, produkId, tokoId, data);
      } else {
        const bodyData = { ...req.body, produk_id: produkId, toko_id: tokoId };
        const data = CreateInventarisSchema.parse(bodyData);
        result = await ProdukService.createInventory(req.accessScope, data);
      }

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update inventory error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update inventory'
      });
    }
  }

  static async getLowStockItems(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = {
        ...req.query,
        low_stock: 'true'
      };

      const validatedQuery = InventarisQuerySchema.parse(query);
      const result = await ProdukService.getInventory(req.accessScope, validatedQuery);

      return res.json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit: Number(validatedQuery.limit)
        }
      });
    } catch (error: any) {
      console.error('Get low stock items error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to get low stock items'
      });
    }
  }
}