/**
 * Master Data Controller
 * Handles category, brand, and supplier operations for products
 */

import { Request, Response } from 'express';
import { ProdukService } from '../services/ProdukService';
import { z } from 'zod';

const CreateCategorySchema = z.object({
  nama: z.string().min(1).max(100),
  deskripsi: z.string().optional(),
  icon_url: z.string().url().optional(),
  urutan: z.number().int().min(0).optional()
});

const UpdateCategorySchema = z.object({
  nama: z.string().min(1).max(100).optional(),
  deskripsi: z.string().optional(),
  icon_url: z.string().url().optional(),
  urutan: z.number().int().min(0).optional(),
  status: z.enum(['aktif', 'nonaktif']).optional()
});

const CreateBrandSchema = z.object({
  nama: z.string().min(1).max(100),
  deskripsi: z.string().optional(),
  logo_url: z.string().url().optional(),
  website: z.string().url().optional()
});

const CreateSupplierSchema = z.object({
  nama: z.string().min(1).max(100),
  kontak_person: z.string().max(100).optional(),
  telepon: z.string().max(20).optional(),
  email: z.string().email().optional(),
  alamat: z.string().optional()
});

export class MasterDataController {
  // Category operations
  static async getCategories(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      console.log('Getting categories with scope:', req.accessScope);
      const categories = await ProdukService.getCategories(req.accessScope);
      console.log('Categories retrieved:', categories.length);
      return res.json({ success: true, data: categories });
    } catch (error: any) {
      console.error('Get categories error:', error);
      console.error('Error stack:', error.stack);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  static async createCategory(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data = CreateCategorySchema.parse(req.body);
      const category = await ProdukService.createCategory(req.accessScope, data);

      return res.status(201).json({ success: true, data: category });
    } catch (error: any) {
      console.error('Create category error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create category'
      });
    }
  }

  static async updateCategory(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const data = UpdateCategorySchema.parse(req.body);
      const category = await ProdukService.updateCategory(req.accessScope, id, data);

      return res.json({ success: true, data: category });
    } catch (error: any) {
      console.error('Update category error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update category'
      });
    }
  }

  static async deleteCategory(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const deleted = await ProdukService.deleteCategory(req.accessScope, id);

      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }

      return res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error: any) {
      console.error('Delete category error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Brand operations
  static async getBrands(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const brands = await ProdukService.getBrands(req.accessScope);
      return res.json({ success: true, data: brands });
    } catch (error: any) {
      console.error('Get brands error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async createBrand(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data = CreateBrandSchema.parse(req.body);
      const brand = await ProdukService.createBrand(req.accessScope, data);

      return res.status(201).json({ success: true, data: brand });
    } catch (error: any) {
      console.error('Create brand error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create brand'
      });
    }
  }

  static async updateBrand(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const data = CreateBrandSchema.partial().parse(req.body);
      const brand = await ProdukService.updateBrand(req.accessScope, id, data);

      return res.json({ success: true, data: brand });
    } catch (error: any) {
      console.error('Update brand error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update brand'
      });
    }
  }

  static async deleteBrand(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const deleted = await ProdukService.deleteBrand(req.accessScope, id);

      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Brand not found' });
      }

      return res.json({ success: true, message: 'Brand deleted successfully' });
    } catch (error: any) {
      console.error('Delete brand error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Supplier operations
  static async getSuppliers(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const suppliers = await ProdukService.getSuppliers(req.accessScope);
      return res.json({ success: true, data: suppliers });
    } catch (error: any) {
      console.error('Get suppliers error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async createSupplier(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data = CreateSupplierSchema.parse(req.body);
      const supplier = await ProdukService.createSupplier(req.accessScope, data);

      return res.status(201).json({ success: true, data: supplier });
    } catch (error: any) {
      console.error('Create supplier error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create supplier'
      });
    }
  }
}