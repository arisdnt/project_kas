
import { Request, Response } from 'express';
import { ProdukService } from '../services/ProdukService';
import { SearchProdukQuerySchema, CreateProdukSchema, UpdateProdukSchema } from '../models/ProdukCore';
import { logger } from '@/core/utils/logger';
import { requireStoreWhenNeeded } from '@/core/middleware/accessScope';
import { DokumenService } from '@/features/dokumen/services/DokumenService';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

export class ProdukController {
  // Konfigurasi multer untuk upload gambar
  private static imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Hanya file gambar yang diizinkan'));
      }
    }
  });

  // Middleware untuk upload gambar
  static imageUploadMiddleware = ProdukController.imageUpload.single('image') as any;
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

  // Master Data Endpoints
  static async getCategories(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const categories = await ProdukService.getCategories(req.accessScope);
      return res.json({ success: true, data: categories });
    } catch (error: any) {
      console.error('Get categories error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to get categories'
      });
    }
  }

  static async createCategory(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const category = await ProdukService.createCategory(req.accessScope, req.body);
      return res.status(201).json({ success: true, data: category });
    } catch (error: any) {
      console.error('Create category error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create category'
      });
    }
  }

  static async getBrands(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const brands = await ProdukService.getBrands(req.accessScope);
      return res.json({ success: true, data: brands });
    } catch (error: any) {
      console.error('Get brands error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to get brands'
      });
    }
  }

  static async createBrand(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const brand = await ProdukService.createBrand(req.accessScope, req.body);
      return res.status(201).json({ success: true, data: brand });
    } catch (error: any) {
      console.error('Create brand error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create brand'
      });
    }
  }

  static async getSuppliers(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const suppliers = await ProdukService.getSuppliers(req.accessScope);
      return res.json({ success: true, data: suppliers });
    } catch (error: any) {
      console.error('Get suppliers error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to get suppliers'
      });
    }
  }

  static async createSupplier(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const supplier = await ProdukService.createSupplier(req.accessScope, req.body);
      return res.status(201).json({ success: true, data: supplier });
    } catch (error: any) {
      console.error('Create supplier error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create supplier'
      });
    }
  }

  
  static async uploadProductImage(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file provided' });
      }

      const { id } = req.params;

      // Verify product exists and user has access
      await ProdukService.findById(req.accessScope, id);

      // Upload image to MinIO with image category
      const uploadConfig = {
        kategori_dokumen: 'image' as const,
        deskripsi: `Product image for product ${id}`,
        is_public: true,
        expires_at: undefined
      };

      const uploadResult = await DokumenService.uploadDocument(
        req.accessScope,
        req.file,
        uploadConfig,
        req.user.id
      );

      // Update product with image URL
      const gambar_url = uploadResult.document.url_dokumen;
      await ProdukService.update(req.accessScope, id, { gambar_url });

      return res.json({
        success: true,
        data: { gambar_url },
        message: 'Product image uploaded successfully'
      });
    } catch (error: any) {
      console.error('Upload product image error:', error);
      if (error.message === 'Product not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to upload product image'
      });
    }
  }

  
  static async removeProductImage(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;

      // Get current product to check if it has an image
      const product = await ProdukService.findById(req.accessScope, id);

      // Update product to remove image URL
      await ProdukService.update(req.accessScope, id, { gambar_url: null });

      // Note: We don't delete from MinIO here to preserve the file
      // The document can be cleaned up later via cleanup routines

      return res.json({
        success: true,
        message: 'Product image removed successfully'
      });
    } catch (error: any) {
      console.error('Remove product image error:', error);
      if (error.message === 'Product not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to remove product image'
      });
    }
  }
}