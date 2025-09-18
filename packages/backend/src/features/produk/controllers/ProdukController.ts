/**
 * Product Controller
 * Handles product CRUD operations with access scope validation
 */

import { Request, Response } from 'express';
import { ProdukService } from '../services/ProdukService';
import { SearchProdukQuerySchema, CreateProdukSchema, UpdateProdukSchema } from '../models/ProdukCore';
import { requireStoreWhenNeeded } from '@/core/middleware/accessScope';

export class ProdukController {
  /**
   * @swagger
   * /api/produk:
   *   get:
   *     tags: [Produk]
   *     summary: Cari produk
   *     description: Mencari produk dengan filter dan pagination
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
   *       - in: query
   *         name: kategori_id
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter berdasarkan kategori
   *       - in: query
   *         name: brand_id
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter berdasarkan brand
   *       - in: query
   *         name: is_aktif
   *         schema:
   *           type: string
   *           enum: ["0", "1"]
   *         description: Filter status aktif
   *     responses:
   *       200:
   *         description: Daftar produk berhasil diambil
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
   *                     $ref: '#/components/schemas/Produk'
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

  /**
   * @swagger
   * /api/produk/{id}:
   *   get:
   *     tags: [Produk]
   *     summary: Ambil produk berdasarkan ID
   *     description: Mengambil detail produk berdasarkan ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID produk
   *     responses:
   *       200:
   *         description: Detail produk berhasil diambil
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Produk'
   *       404:
   *         description: Produk tidak ditemukan
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
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

  /**
   * @swagger
   * /api/produk:
   *   post:
   *     tags: [Produk]
   *     summary: Buat produk baru
   *     description: Membuat produk baru (memerlukan akses toko)
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - kategori_id
   *               - brand_id
   *               - supplier_id
   *               - kode
   *               - nama
   *             properties:
   *               kategori_id:
   *                 type: string
   *                 format: uuid
   *                 description: ID kategori produk
   *               brand_id:
   *                 type: string
   *                 format: uuid
   *                 description: ID brand produk
   *               supplier_id:
   *                 type: string
   *                 format: uuid
   *                 description: ID supplier produk
   *               kode:
   *                 type: string
   *                 maxLength: 50
   *                 description: Kode produk unik
   *               nama:
   *                 type: string
   *                 maxLength: 255
   *                 description: Nama produk
   *               harga_beli:
   *                 type: number
   *                 minimum: 0
   *                 description: Harga beli produk
   *               harga_jual:
   *                 type: number
   *                 minimum: 0
   *                 description: Harga jual produk
   *     responses:
   *       201:
   *         description: Produk berhasil dibuat
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Produk'
   *       400:
   *         description: Data tidak valid
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
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

  /**
   * @swagger
   * /api/produk/{id}:
   *   put:
   *     tags: [Produk]
   *     summary: Update produk
   *     description: Mengupdate data produk berdasarkan ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID produk
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nama:
   *                 type: string
   *                 maxLength: 255
   *                 description: Nama produk
   *               harga_beli:
   *                 type: number
   *                 minimum: 0
   *                 description: Harga beli produk
   *               harga_jual:
   *                 type: number
   *                 minimum: 0
   *                 description: Harga jual produk
   *               is_aktif:
   *                 type: integer
   *                 enum: [0, 1]
   *                 description: Status aktif produk
   *     responses:
   *       200:
   *         description: Produk berhasil diupdate
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Produk'
   *       400:
   *         description: Data tidak valid
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
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

  /**
   * @swagger
   * /api/produk/{id}:
   *   delete:
   *     tags: [Produk]
   *     summary: Hapus produk
   *     description: Menghapus produk berdasarkan ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID produk
   *     responses:
   *       200:
   *         description: Produk berhasil dihapus
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
   *                   properties:
   *                     message:
   *                       type: string
   *                       example: Product deleted successfully
   *       400:
   *         description: Gagal menghapus produk
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
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
}