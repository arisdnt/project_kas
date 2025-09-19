
import { Request, Response } from 'express';
import { MasterDataService } from '../services/modules/MasterDataService';
import { ProdukService } from '../services/ProdukService';
import { requireStoreWhenNeeded } from '@/core/middleware/accessScope';
import { CreateSupplierSchema } from '../../supplier/models/SupplierCore';
import { DokumenService } from '@/features/dokumen/services/DokumenService';
import { logger } from '@/core/utils/logger';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

export class MasterDataController {
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

      // Validasi manual tanpa schema
      const { nama, deskripsi, icon_url, urutan } = req.body;
      if (!nama || typeof nama !== 'string') {
        return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi' });
      }

      const data = { nama, deskripsi, icon_url, urutan };
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
      // Validasi manual tanpa schema
      const { nama, deskripsi, icon_url, urutan, status } = req.body;
      const data = { nama, deskripsi, icon_url, urutan, status };
      
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

  static async getProductsByCategory(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const { page = '1', limit = '50', search } = req.query;

      const options = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        search: search as string
      };

      const result = await ProdukService.getProductsByCategory(req.accessScope, id, options);
      return res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Get products by category error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
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

      // Validasi manual tanpa schema
      const { nama, deskripsi, logo_url, website } = req.body;
      if (!nama || typeof nama !== 'string') {
        return res.status(400).json({ success: false, message: 'Nama brand wajib diisi' });
      }

      const data = { nama, deskripsi, logo_url, website };
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
      // Validasi manual tanpa schema
      const { nama, deskripsi, logo_url, website } = req.body;
      const data = { nama, deskripsi, logo_url, website };
      
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

  // Configure multer for image upload (local, similar to ProdukController)
  private static imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) cb(null, true);
      else cb(new Error('Only image files are allowed'));
    }
  });

  // Image upload methods for categories
  static imageUploadMiddleware = MasterDataController.imageUpload.single('image') as any;

  static async uploadCategoryImage(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ success: false, message: 'No image file provided' });
      }

      // Upload to MinIO via DokumenService
      const uploadResult = await DokumenService.uploadDocument(
        req.accessScope,
        {
          fieldname: 'image',
          originalname: file.originalname,
          encoding: (file as any).encoding || '7bit',
          mimetype: file.mimetype,
          buffer: file.buffer,
          size: file.size,
        },
        { kategori_dokumen: 'image', is_public: false },
        String((req as any).user.id)
      );

  // Update category with new icon URL (respect bucket from upload result)
  const bucketNameCat = uploadResult.document?.bucket_name || 'pos-files';
  const minioUrl = `minio://${bucketNameCat}/${uploadResult.document.object_key}`;
      const category = await ProdukService.updateCategory(req.accessScope, id, {
        icon_url: minioUrl
      });

      return res.json({
        success: true,
        data: {
          icon_url: minioUrl,
          category: category
        },
        message: 'Category image uploaded successfully'
      });
    } catch (error: any) {
      console.error('Upload category image error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image',
        error: error.message
      });
    }
  }

  static async removeCategoryImage(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;

      // Ambil data kategori untuk mendapatkan URL gambar
      const categories = await ProdukService.getCategories(req.accessScope);
      const category = categories.find((c: any) => c.id === id);

      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }

      if (category.icon_url) {
        try {
          // Hapus file dari storage jika ada
          const objectKey = category.icon_url.split('/').pop();
          if (objectKey) {
            // Implementasi penghapusan file akan ditambahkan nanti
            console.log('Removing file:', objectKey);
          }
        } catch (error) {
          console.error('Error removing file:', error);
        }
      }

      // Update kategori untuk menghapus URL gambar
      await ProdukService.updateCategory(req.accessScope, id, { icon_url: undefined });

      return res.json({ success: true, message: 'Category image removed successfully' });
    } catch (error: any) {
      console.error('Remove category image error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to remove category image'
      });
    }
  }

  // Image upload methods for brands
  static async uploadBrandImage(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const file = req.file;

      console.log('[BrandUpload] Incoming upload', {
        brandId: id,
        userId: (req as any).user?.id,
        scope: req.accessScope,
        hasFile: !!file,
        headers: {
          'content-type': req.headers['content-type'],
          'content-length': req.headers['content-length']
        }
      });

      if (!file) {
        console.warn('[BrandUpload] No file provided');
        return res.status(400).json({ success: false, message: 'No image file provided' });
      }

      // Upload to MinIO via DokumenService
      const uploadResult = await DokumenService.uploadDocument(
        req.accessScope,
        {
          fieldname: 'image',
          originalname: file.originalname,
          encoding: (file as any).encoding || '7bit',
          mimetype: file.mimetype,
          buffer: file.buffer,
          size: file.size,
        },
        { kategori_dokumen: 'image', is_public: false },
        String((req as any).user.id)
      );

      console.log('[BrandUpload] Uploaded to MinIO and DB', {
        documentId: uploadResult.document?.id,
        objectKey: uploadResult.document?.object_key,
        bucket: uploadResult.document?.bucket_name,
        size: file.size,
        mimetype: file.mimetype
      });

  // Update brand with new logo URL (respect bucket from upload result)
  const bucketName = uploadResult.document?.bucket_name || 'pos-files';
  const minioUrl = `minio://${bucketName}/${uploadResult.document.object_key}`;
      const brand = await ProdukService.updateBrand(req.accessScope, id, {
        logo_url: minioUrl
      });

      console.log('[BrandUpload] Brand updated with logo_url', { brandId: id, logo_url: minioUrl });

      return res.json({
        success: true,
        data: {
          logo_url: minioUrl,
          brand: brand
        },
        message: 'Brand image uploaded successfully'
      });
    } catch (error: any) {
      console.error('[BrandUpload] Error:', {
        message: error?.message,
        stack: error?.stack
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image',
        error: error.message
      });
    }
  }

  static async removeBrandImage(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;

      // Ambil data brand untuk mendapatkan URL logo
      const brands = await ProdukService.getBrands(req.accessScope);
      const brand = brands.find((b: any) => b.id === id);

      if (!brand) {
        return res.status(404).json({ success: false, message: 'Brand not found' });
      }

      if (brand.logo_url) {
        try {
          // Hapus file dari storage jika ada
          const objectKey = brand.logo_url.split('/').pop();
          if (objectKey) {
            // Implementasi penghapusan file akan ditambahkan nanti
            console.log('Removing file:', objectKey);
          }
        } catch (error) {
          console.error('Error removing file:', error);
        }
      }

      // Update brand untuk menghapus URL logo
      await ProdukService.updateBrand(req.accessScope, id, { logo_url: undefined });

      return res.json({ success: true, message: 'Brand image removed successfully' });
    } catch (error: any) {
      console.error('Remove brand image error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to remove brand image'
      });
    }
  }
}