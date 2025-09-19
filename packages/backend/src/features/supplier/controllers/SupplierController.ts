
import { Request, Response } from 'express';
import { SupplierService } from '../services/SupplierService';
import { 
  SearchSupplierQuerySchema,
  CreateSupplierSchema,
  UpdateSupplierSchema,
  ImportSuppliersSchema, 
  CreateSupplierPaymentTermsSchema, 
  CreateSupplierContactLogSchema, 
  RateSupplierSchema,
  BulkSupplierActionSchema
} from '../models/SupplierCore';
import { logger } from '@/core/utils/logger';

export class SupplierController {
  static async searchSuppliers(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = SearchSupplierQuerySchema.parse(req.query);
      const result = await SupplierService.searchSuppliers(req.accessScope, query);

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
      console.error('Search suppliers error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to search suppliers'
      });
    }
  }

  static async findSupplierById(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const supplier = await SupplierService.findSupplierById(req.accessScope, id);

      return res.json({ success: true, data: supplier });
    } catch (error: any) {
      console.error('Find supplier error:', error);
      if (error.message === 'Supplier not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getSupplierWithFullProfile(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const profile = await SupplierService.getSupplierWithFullProfile(req.accessScope, id);

      return res.json({ success: true, data: profile });
    } catch (error: any) {
      console.error('Get supplier full profile error:', error);
      if (error.message === 'Supplier not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getActiveSuppliers(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const suppliers = await SupplierService.getActiveSuppliers(req.accessScope);
      return res.json({ success: true, data: suppliers });
    } catch (error: any) {
      console.error('Get active suppliers error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getSupplierStats(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const stats = await SupplierService.getSupplierStats(req.accessScope, id);

      return res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('Get supplier stats error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getPurchaseHistory(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const limit = Number(req.query.limit) || 50;
      const history = await SupplierService.getPurchaseHistory(req.accessScope, id, limit);

      return res.json({ success: true, data: history });
    } catch (error: any) {
      console.error('Get purchase history error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getSupplierProducts(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const products = await SupplierService.getSupplierProducts(req.accessScope, id);

      return res.json({ success: true, data: products });
    } catch (error: any) {
      console.error('Get supplier products error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getPerformanceReport(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const report = await SupplierService.getPerformanceReport(req.accessScope);
      return res.json({ success: true, data: report });
    } catch (error: any) {
      console.error('Get performance report error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getContactLogs(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const limit = Number(req.query.limit) || 50;
      const logs = await SupplierService.getContactLogs(req.accessScope, id, limit);

      return res.json({ success: true, data: logs });
    } catch (error: any) {
      console.error('Get contact logs error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getPaymentTerms(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const terms = await SupplierService.getPaymentTerms(req.accessScope, id);

      return res.json({ success: true, data: terms });
    } catch (error: any) {
      console.error('Get payment terms error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async createSupplier(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data = CreateSupplierSchema.parse(req.body);
      const supplier = await SupplierService.createSupplier(req.accessScope, data);

      return res.status(201).json({ success: true, data: supplier });
    } catch (error: any) {
      console.error('Create supplier error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create supplier'
      });
    }
  }

  static async updateSupplier(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const data = UpdateSupplierSchema.parse(req.body);
      const result = await SupplierService.updateSupplier(req.accessScope, id, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update supplier error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update supplier'
      });
    }
  }

  static async deleteSupplier(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const result = await SupplierService.deleteSupplier(req.accessScope, id);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Delete supplier error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete supplier'
      });
    }
  }

  static async bulkSupplierAction(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data = BulkSupplierActionSchema.parse(req.body);
      const result = await SupplierService.bulkSupplierAction(req.accessScope, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Bulk supplier action error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to perform bulk action'
      });
    }
  }

  static async importSuppliers(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data = ImportSuppliersSchema.parse(req.body);
      const result = await SupplierService.importSuppliers(req.accessScope, data.suppliers);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Import suppliers error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to import suppliers'
      });
    }
  }

  static async createPaymentTerms(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data = CreateSupplierPaymentTermsSchema.parse(req.body);
      const result = await SupplierService.createPaymentTerms(req.accessScope, data);

      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      console.error('Create payment terms error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create payment terms'
      });
    }
  }

  static async logContact(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data = CreateSupplierContactLogSchema.parse(req.body);
      const result = await SupplierService.logContact(req.accessScope, data);

      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      console.error('Log contact error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to log contact'
      });
    }
  }

  static async rateSupplier(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const data = RateSupplierSchema.parse(req.body);
      const result = await SupplierService.rateSupplier(req.accessScope, id, data.rating, data.notes);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Rate supplier error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to rate supplier'
      });
    }
  }

  // Performance and analytics endpoints
  static async getTopSuppliers(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const limit = Number(req.query.limit) || 10;
      const suppliers = await SupplierService.getTopSuppliers(req.accessScope, limit);

      return res.json({ success: true, data: suppliers });
    } catch (error: any) {
      console.error('Get top suppliers error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getSuppliersNeedingAttention(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const suppliers = await SupplierService.getSuppliersNeedingAttention(req.accessScope);
      return res.json({ success: true, data: suppliers });
    } catch (error: any) {
      console.error('Get suppliers needing attention error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async scheduleFollowUp(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const { follow_up_date, subject, notes } = req.body;

      if (!follow_up_date || !subject) {
        return res.status(400).json({
          success: false,
          message: 'Follow-up date and subject are required'
        });
      }

      const result = await SupplierService.scheduleFollowUp(
        req.accessScope,
        id,
        new Date(follow_up_date),
        subject,
        notes
      );

      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      console.error('Schedule follow-up error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to schedule follow-up'
      });
    }
  }
}