/**
 * Sales Controller
 * Handles sales transaction operations with access scope validation
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TransaksiPenjualan:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         kode_transaksi:
 *           type: string
 *         total:
 *           type: number
 *         status:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 */

import { Request, Response } from 'express';
import { PenjualanService, CreateTransaksiRequest } from '../services/PenjualanService';
import { SearchTransaksiQuerySchema, CreateTransaksiPenjualanSchema, UpdateTransaksiPenjualanSchema } from '../models/TransaksiPenjualanCore';
import { CreateItemTransaksiSchema } from '../models/ItemTransaksiModel';
import { requireStoreWhenNeeded } from '@/core/middleware/accessScope';
import { z } from 'zod';

const CreateTransaksiRequestSchema = z.object({
  transaction: CreateTransaksiPenjualanSchema,
  items: z.array(CreateItemTransaksiSchema).min(1, 'At least one item is required')
});

export class PenjualanController {
  /**
   * @swagger
   * /api/penjualan:
   *   get:
   *     tags: [Penjualan]
   *     summary: Cari transaksi penjualan
   *     description: Mencari transaksi penjualan dengan filter dan pagination
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: string
   *           default: "1"
   *         description: Nomor halaman
   *       - in: query
   *         name: limit
   *         schema:
   *           type: string
   *           default: "10"
   *         description: Jumlah item per halaman
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Kata kunci pencarian
   *     responses:
   *       200:
   *         description: Daftar transaksi berhasil diambil
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/TransaksiPenjualan'
   *                 pagination:
   *                   $ref: '#/components/schemas/Pagination'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  static async search(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = SearchTransaksiQuerySchema.parse(req.query);
      const result = await PenjualanService.search(req.accessScope, query);

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
      console.error('Search transactions error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to search transactions'
      });
    }
  }

  static async findById(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const transaction = await PenjualanService.findById(req.accessScope, id);

      return res.json({ success: true, data: transaction });
    } catch (error: any) {
      console.error('Find transaction error:', error);
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

      // Store required for transaction creation
      await new Promise<void>((resolve, reject) =>
        requireStoreWhenNeeded(req, res, (err?: any) => err ? reject(err) : resolve())
      );

      const request = CreateTransaksiRequestSchema.parse(req.body);
      
      // Tambahkan pengguna_id dari token ke data transaksi
      const requestWithUser = {
        ...request,
        transaction: {
          ...request.transaction,
          pengguna_id: req.user.id
        }
      };
      
      const transaction = await PenjualanService.create(req.accessScope, requestWithUser);

      return res.status(201).json({ success: true, data: transaction });
    } catch (error: any) {
      console.error('Create transaction error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create transaction'
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const data = UpdateTransaksiPenjualanSchema.parse(req.body);
      const result = await PenjualanService.update(req.accessScope, id, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update transaction error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update transaction'
      });
    }
  }

  static async cancel(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const result = await PenjualanService.cancel(req.accessScope, id);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Cancel transaction error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to cancel transaction'
      });
    }
  }
}