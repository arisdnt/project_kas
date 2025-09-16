/**
 * Purchase Controller
 * Handles purchase transaction operations with access scope validation
 */

import { Request, Response } from 'express';
import { PembelianService, CreatePembelianRequest } from '../services/PembelianService';
import { SearchPembelianQuerySchema, CreateTransaksiPembelianSchema, UpdateTransaksiPembelianSchema } from '../models/TransaksiPembelianCore';
import { CreateItemPembelianSchema } from '../models/ItemPembelianModel';
import { requireStoreWhenNeeded } from '@/core/middleware/accessScope';
import { z } from 'zod';

const CreatePembelianRequestSchema = z.object({
  transaction: CreateTransaksiPembelianSchema,
  items: z.array(CreateItemPembelianSchema).min(1, 'At least one item is required')
});

export class PembelianController {
  static async search(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = SearchPembelianQuerySchema.parse(req.query);
      const result = await PembelianService.search(req.accessScope, query);

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
      console.error('Search purchase transactions error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to search purchase transactions'
      });
    }
  }

  static async findById(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const transaction = await PembelianService.findById(req.accessScope, id);

      return res.json({ success: true, data: transaction });
    } catch (error: any) {
      console.error('Find purchase transaction error:', error);
      if (error.message === 'Transaction not found') {
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

      // Store required for purchase transaction creation
      await new Promise<void>((resolve, reject) =>
        requireStoreWhenNeeded(req, res, (err?: any) => err ? reject(err) : resolve())
      );

      const request = CreatePembelianRequestSchema.parse(req.body);
      const transaction = await PembelianService.create(req.accessScope, request);

      return res.status(201).json({ success: true, data: transaction });
    } catch (error: any) {
      console.error('Create purchase transaction error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create purchase transaction'
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const data = UpdateTransaksiPembelianSchema.parse(req.body);
      const result = await PembelianService.update(req.accessScope, id, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update purchase transaction error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update purchase transaction'
      });
    }
  }

  static async cancel(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const result = await PembelianService.cancel(req.accessScope, id);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Cancel purchase transaction error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to cancel purchase transaction'
      });
    }
  }
}