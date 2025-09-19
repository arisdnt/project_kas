/**
 * Master Data Controller
 * Handles category, brand, and supplier operations for products
 */

import { Request, Response } from 'express';
import { ProdukService } from '../services/ProdukService';
import { DokumenService } from '../../dokumen/services/DokumenService';
import multer from 'multer';
import { removeObject } from '@/core/storage/minioClient';
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
  /**
   * @swagger
   * /api/produk/master/categories:
   *   get:
   *     tags: [Master Data]
   *     summary: Ambil daftar kategori
   *     description: Mengambil semua kategori produk
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Daftar kategori berhasil diambil
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
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         format: uuid
   *                       nama:
   *                         type: string
   *                       deskripsi:
   *                         type: string
   *                       icon_url:
   *                         type: string
   *                       status:
   *                         type: string
   *                         enum: [aktif, nonaktif]
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
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

  /**
   * @swagger
   * /api/produk/master/categories:
   *   post:
   *     tags: [Master Data]
   *     summary: Buat kategori baru
   *     description: Membuat kategori produk baru
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nama
   *             properties:
   *               nama:
   *                 type: string
   *                 maxLength: 100
   *                 description: Nama kategori
   *               deskripsi:
   *                 type: string
   *                 description: Deskripsi kategori
   *               icon_url:
   *                 type: string
   *                 format: uri
   *                 description: URL icon kategori
   *               urutan:
   *                 type: integer
   *                 minimum: 0
   *                 description: Urutan tampil kategori
   *     responses:
   *       201:
   *         description: Kategori berhasil dibuat
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *       400:
   *         description: Data tidak valid
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
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

      // Get current category to get the current icon URL
      const categories = await ProdukService.getCategories(req.accessScope);
      const category = categories.find(c => c.id === id);

      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }

      // Remove from MinIO if exists
      if (category.icon_url && category.icon_url.startsWith('minio://')) {
        try {
          const objectKey = category.icon_url.replace('minio://pos-files/', '');
          await removeObject(objectKey);
        } catch (error) {
          console.warn('Failed to delete MinIO file:', error);
        }
      }

      // Update category to remove icon URL
      const updatedCategory = await ProdukService.updateCategory(req.accessScope, id, {
        icon_url: null as any
      });

      return res.json({
        success: true,
        data: updatedCategory,
        message: 'Category image removed successfully'
      });
    } catch (error: any) {
      console.error('Remove category image error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to remove image',
        error: error.message
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

      console.log('[BrandRemoveImage] Incoming remove', {
        brandId: id,
        userId: (req as any).user?.id,
        scope: req.accessScope,
      });

      // Get current brand to get the current logo URL
      const brands = await ProdukService.getBrands(req.accessScope);
      const brand = brands.find(b => b.id === id);

      if (!brand) {
        console.warn('[BrandRemoveImage] Brand not found', { brandId: id });
        return res.status(404).json({ success: false, message: 'Brand not found' });
      }

      // Remove from MinIO if exists
      if (brand.logo_url && brand.logo_url.startsWith('minio://')) {
        try {
          const objectKey = brand.logo_url.replace('minio://pos-files/', '');
          console.log('[BrandRemoveImage] Removing from MinIO', { objectKey });
          await removeObject(objectKey);
        } catch (error) {
          console.warn('[BrandRemoveImage] Failed to delete MinIO file:', error);
        }
      }

      // Update brand to remove logo URL
      const updatedBrand = await ProdukService.updateBrand(req.accessScope, id, {
        logo_url: null as any
      });

      console.log('[BrandRemoveImage] Brand logo_url cleared', { brandId: id });

      return res.json({
        success: true,
        data: updatedBrand,
        message: 'Brand image removed successfully'
      });
    } catch (error: any) {
      console.error('[BrandRemoveImage] Error:', {
        message: error?.message,
        stack: error?.stack
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to remove image',
        error: error.message
      });
    }
  }
}