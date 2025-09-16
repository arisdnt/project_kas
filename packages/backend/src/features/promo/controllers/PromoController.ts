/**
 * Promo Controller
 * Handles promo operations with access scope validation
 */

import { Request, Response } from 'express';
import { PromoService } from '../services/PromoService';
import { SearchPromoQuerySchema, CreatePromoSchema, UpdatePromoSchema, ValidatePromoSchema } from '../models/PromoCore';
import { requireStoreWhenNeeded } from '@/core/middleware/accessScope';
import { z } from 'zod';

const CreatePromoRequestSchema = z.object({
  promo: CreatePromoSchema,
  categories: z.array(z.string().uuid()).optional(),
  products: z.array(z.string().uuid()).optional(),
  customers: z.array(z.string().uuid()).optional()
});

export class PromoController {
  static async search(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = SearchPromoQuerySchema.parse(req.query);
      const result = await PromoService.search(req.accessScope, query);

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
      console.error('Search promos error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to search promos'
      });
    }
  }

  static async findById(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const promo = await PromoService.findById(req.accessScope, id);

      return res.json({ success: true, data: promo });
    } catch (error: any) {
      console.error('Find promo error:', error);
      if (error.message === 'Promo not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async findByCode(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { code } = req.params;
      const promo = await PromoService.findByCode(req.accessScope, code);

      return res.json({ success: true, data: promo });
    } catch (error: any) {
      console.error('Find promo by code error:', error);
      if (error.message === 'Promo not found or inactive') {
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

      // Store required for promo creation
      await new Promise<void>((resolve, reject) =>
        requireStoreWhenNeeded(req, res, (err?: any) => err ? reject(err) : resolve())
      );

      const request = CreatePromoRequestSchema.parse(req.body);
      const promo = await PromoService.create(req.accessScope, request);

      return res.status(201).json({ success: true, data: promo });
    } catch (error: any) {
      console.error('Create promo error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create promo'
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const data = UpdatePromoSchema.parse(req.body);
      const result = await PromoService.update(req.accessScope, id, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update promo error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update promo'
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const result = await PromoService.delete(req.accessScope, id);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Delete promo error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete promo'
      });
    }
  }

  static async validatePromo(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const request = ValidatePromoSchema.parse(req.body);
      const items = req.body.items || [];

      const validation = await PromoService.validatePromo(req.accessScope, request, items);

      return res.json({ success: true, data: validation });
    } catch (error: any) {
      console.error('Validate promo error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to validate promo'
      });
    }
  }
}