/**
 * Customer Controller
 * Handles customer operations with access scope validation
 */

import { Request, Response } from 'express';
import { PelangganService } from '../services/PelangganService';
import { SearchPelangganQuerySchema, CreatePelangganSchema, UpdatePelangganSchema, BulkPelangganActionSchema, PelangganCreditLimitAdjustmentSchema } from '../models/PelangganCore';
import { z } from 'zod';

const PointsAdjustmentSchema = z.object({
  adjustment: z.number().int(),
  reason: z.string().min(1),
  transaksi_id: z.string().uuid().optional()
});

const ImportCustomersSchema = z.object({
  customers: z.array(z.object({
    nama: z.string().min(1),
    email: z.string().email().optional(),
    telepon: z.string().optional(),
    alamat: z.string().optional(),
    tanggal_lahir: z.string().optional(),
    jenis_kelamin: z.enum(['pria', 'wanita']).optional(),
    tipe: z.enum(['reguler', 'vip', 'member', 'wholesale']).default('reguler')
  })).min(1)
});

export class PelangganController {
  static async searchCustomers(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = SearchPelangganQuerySchema.parse(req.query);
      const result = await PelangganService.searchCustomers(req.accessScope, query);

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
      console.error('Search customers error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to search customers'
      });
    }
  }

  static async findCustomerById(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const customer = await PelangganService.findCustomerById(req.accessScope, id);

      return res.json({ success: true, data: customer });
    } catch (error: any) {
      console.error('Find customer error:', error);
      if (error.message === 'Customer not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async findCustomerByCode(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { kode } = req.params;
      const customer = await PelangganService.findCustomerByCode(req.accessScope, kode);

      return res.json({ success: true, data: customer });
    } catch (error: any) {
      console.error('Find customer by code error:', error);
      if (error.message === 'Customer not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getCustomerWithFullProfile(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const profile = await PelangganService.getCustomerWithFullProfile(req.accessScope, id);

      return res.json({ success: true, data: profile });
    } catch (error: any) {
      console.error('Get customer full profile error:', error);
      if (error.message === 'Customer not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getActiveCustomers(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const customers = await PelangganService.getActiveCustomers(req.accessScope);
      return res.json({ success: true, data: customers });
    } catch (error: any) {
      console.error('Get active customers error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getCustomerStats(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const stats = await PelangganService.getCustomerStats(req.accessScope, id);

      return res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('Get customer stats error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getTransactionHistory(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const limit = Number(req.query.limit) || 50;
      const history = await PelangganService.getTransactionHistory(req.accessScope, id, limit);

      return res.json({ success: true, data: history });
    } catch (error: any) {
      console.error('Get transaction history error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getPointsHistory(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const limit = Number(req.query.limit) || 50;
      const history = await PelangganService.getPointsHistory(req.accessScope, id, limit);

      return res.json({ success: true, data: history });
    } catch (error: any) {
      console.error('Get points history error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getCustomerSegmentation(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const segmentation = await PelangganService.getCustomerSegmentation(req.accessScope);
      return res.json({ success: true, data: segmentation });
    } catch (error: any) {
      console.error('Get customer segmentation error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getLoyaltyReport(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const limit = Number(req.query.limit) || 100;
      const report = await PelangganService.getLoyaltyReport(req.accessScope, limit);

      return res.json({ success: true, data: report });
    } catch (error: any) {
      console.error('Get loyalty report error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async createCustomer(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data = CreatePelangganSchema.parse(req.body);
      const customer = await PelangganService.createCustomer(req.accessScope, data);

      return res.status(201).json({ success: true, data: customer });
    } catch (error: any) {
      console.error('Create customer error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create customer'
      });
    }
  }

  static async updateCustomer(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const data = UpdatePelangganSchema.parse(req.body);
      const result = await PelangganService.updateCustomer(req.accessScope, id, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update customer error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update customer'
      });
    }
  }

  static async adjustCustomerPoints(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const data = PointsAdjustmentSchema.parse(req.body);

      const result = await PelangganService.adjustCustomerPoints(
        req.accessScope,
        id,
        data.adjustment,
        data.reason,
        data.transaksi_id
      );

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Adjust customer points error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to adjust customer points'
      });
    }
  }

  static async bulkCustomerAction(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data = BulkPelangganActionSchema.parse(req.body);
      const result = await PelangganService.bulkCustomerAction(req.accessScope, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Bulk customer action error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to perform bulk action'
      });
    }
  }

  static async importCustomers(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data = ImportCustomersSchema.parse(req.body);
      const result = await PelangganService.importCustomers(req.accessScope, data.customers);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Import customers error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to import customers'
      });
    }
  }

  static async adjustCreditLimit(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data = PelangganCreditLimitAdjustmentSchema.parse(req.body);
      const result = await PelangganService.adjustCreditLimit(req.accessScope, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Adjust credit limit error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to adjust credit limit'
      });
    }
  }

  // Points management endpoints
  static async earnPoints(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const { transaction_total, transaksi_id } = req.body;

      if (!transaction_total || transaction_total <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Transaction total must be provided and greater than 0'
        });
      }

      const result = await PelangganService.earnPoints(
        req.accessScope,
        id,
        Number(transaction_total),
        transaksi_id
      );

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Earn points error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to earn points'
      });
    }
  }

  static async redeemPoints(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const { points_to_redeem, transaksi_id } = req.body;

      if (!points_to_redeem || points_to_redeem <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Points to redeem must be provided and greater than 0'
        });
      }

      const result = await PelangganService.redeemPoints(
        req.accessScope,
        id,
        Number(points_to_redeem),
        transaksi_id
      );

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Redeem points error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to redeem points'
      });
    }
  }
}