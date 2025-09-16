/**
 * Product Controller
 * Handles product CRUD operations with access scope validation
 */

import { Request, Response } from 'express';
import { ProdukService } from '../services/ProdukService';
import { SearchProdukQuerySchema, CreateProdukSchema, UpdateProdukSchema } from '../models/ProdukCore';
import { requireStoreWhenNeeded } from '@/core/middleware/accessScope';

export class ProdukController {
  static async search(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = SearchProdukQuerySchema.parse(req.query);
      const result = await ProdukService.search(req.accessScope, query);

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
      console.error('Search products error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to search products'
      });
    }
  }

  static async findById(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const product = await ProdukService.findById(req.accessScope, id);

      return res.json({ success: true, data: product });
    } catch (error: any) {
      console.error('Find product error:', error);
      if (error.message === 'Product not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Store required for product creation at level >= 3
      await new Promise<void>((resolve, reject) =>
        requireStoreWhenNeeded(req, res, (err?: any) => err ? reject(err) : resolve())
      );

      const data = CreateProdukSchema.parse(req.body);
      const product = await ProdukService.create(req.accessScope, data);

      return res.status(201).json({ success: true, data: product });
    } catch (error: any) {
      console.error('Create product error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create product'
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const data = UpdateProdukSchema.parse(req.body);
      const result = await ProdukService.update(req.accessScope, id, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update product error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update product'
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const result = await ProdukService.delete(req.accessScope, id);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Delete product error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete product'
      });
    }
  }
}