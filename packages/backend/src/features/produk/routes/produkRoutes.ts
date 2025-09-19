/**
 * Product Routes
 * Main product management routes with proper authentication and authorization
 * 
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID produk
 *         kode:
 *           type: string
 *           description: Kode produk
 *         nama:
 *           type: string
 *           description: Nama produk
 *         deskripsi:
 *           type: string
 *           description: Deskripsi produk
 *         kategoriId:
 *           type: string
 *           description: ID kategori
 *         brandId:
 *           type: string
 *           description: ID brand
 *         hargaBeli:
 *           type: number
 *           description: Harga beli
 *         hargaJual:
 *           type: number
 *           description: Harga jual
 *         stokMinimal:
 *           type: integer
 *           description: Stok minimal
 *         satuan:
 *           type: string
 *           description: Satuan produk
 *         isAktif:
 *           type: boolean
 *           description: Status aktif produk
 *         gambar:
 *           type: string
 *           description: URL gambar produk
 *         barcode:
 *           type: string
 *           description: Barcode produk
 *         berat:
 *           type: number
 *           description: Berat produk
 *         dimensi:
 *           type: string
 *           description: Dimensi produk
 *     
 *     CreateProductRequest:
 *       type: object
 *       required:
 *         - kode
 *         - nama
 *         - kategoriId
 *         - hargaBeli
 *         - hargaJual
 *         - satuan
 *       properties:
 *         kode:
 *           type: string
 *           description: Kode produk
 *         nama:
 *           type: string
 *           description: Nama produk
 *         deskripsi:
 *           type: string
 *           description: Deskripsi produk
 *         kategoriId:
 *           type: string
 *           description: ID kategori
 *         brandId:
 *           type: string
 *           description: ID brand
 *         hargaBeli:
 *           type: number
 *           description: Harga beli
 *         hargaJual:
 *           type: number
 *           description: Harga jual
 *         stokMinimal:
 *           type: integer
 *           description: Stok minimal
 *         satuan:
 *           type: string
 *           description: Satuan produk
 *         gambar:
 *           type: string
 *           description: URL gambar produk
 *         barcode:
 *           type: string
 *           description: Barcode produk
 *         berat:
 *           type: number
 *           description: Berat produk
 *         dimensi:
 *           type: string
 *           description: Dimensi produk
 *     
 *     UpdateProductRequest:
 *       type: object
 *       properties:
 *         nama:
 *           type: string
 *           description: Nama produk
 *         deskripsi:
 *           type: string
 *           description: Deskripsi produk
 *         kategoriId:
 *           type: string
 *           description: ID kategori
 *         brandId:
 *           type: string
 *           description: ID brand
 *         hargaBeli:
 *           type: number
 *           description: Harga beli
 *         hargaJual:
 *           type: number
 *           description: Harga jual
 *         stokMinimal:
 *           type: integer
 *           description: Stok minimal
 *         satuan:
 *           type: string
 *           description: Satuan produk
 *         isAktif:
 *           type: boolean
 *           description: Status aktif produk
 *         gambar:
 *           type: string
 *           description: URL gambar produk
 *         barcode:
 *           type: string
 *           description: Barcode produk
 *         berat:
 *           type: number
 *           description: Berat produk
 *         dimensi:
 *           type: string
 *           description: Dimensi produk
 *     
 *     ProductInventory:
 *       type: object
 *       properties:
 *         produkId:
 *           type: string
 *           description: ID produk
 *         tokoId:
 *           type: string
 *           description: ID toko
 *         stokTersedia:
 *           type: integer
 *           description: Stok tersedia
 *         stokReserved:
 *           type: integer
 *           description: Stok yang direservasi
 *         stokMinimal:
 *           type: integer
 *           description: Stok minimal
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *           description: Terakhir diperbarui
 *     
 *     StockUpdateRequest:
 *       type: object
 *       required:
 *         - tipe
 *         - jumlah
 *       properties:
 *         tipe:
 *           type: string
 *           enum: [masuk, keluar, penyesuaian]
 *           description: Tipe perubahan stok
 *         jumlah:
 *           type: integer
 *           description: Jumlah perubahan stok
 *         keterangan:
 *           type: string
 *           description: Keterangan perubahan stok
 *     
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID kategori
 *         nama:
 *           type: string
 *           description: Nama kategori
 *         deskripsi:
 *           type: string
 *           description: Deskripsi kategori
 *         isAktif:
 *           type: boolean
 *           description: Status aktif kategori
 *     
 *     Brand:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID brand
 *         nama:
 *           type: string
 *           description: Nama brand
 *         deskripsi:
 *           type: string
 *           description: Deskripsi brand
 *         isAktif:
 *           type: boolean
 *           description: Status aktif brand
 *     
 *     Supplier:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID supplier
 *         nama:
 *           type: string
 *           description: Nama supplier
 *         kontak:
 *           type: string
 *           description: Kontak supplier
 *         alamat:
 *           type: string
 *           description: Alamat supplier
 *         isAktif:
 *           type: boolean
 *           description: Status aktif supplier
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope, requireStoreWhenNeeded } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { ProdukController } from '../controllers/ProdukController';
import { ProdukInventarisController } from '../controllers/ProdukInventarisController';
import { MasterDataController } from '../controllers/MasterDataController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

/**
 * @swagger
 * /api/produk:
 *   get:
 *     summary: Mencari produk
 *     description: Mengambil daftar produk dengan filter dan pagination
 *     tags: [Produk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Jumlah item per halaman
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Kata kunci pencarian
 *       - in: query
 *         name: kategoriId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID kategori
 *       - in: query
 *         name: brandId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID brand
 *       - in: query
 *         name: isAktif
 *         schema:
 *           type: boolean
 *         description: Filter berdasarkan status aktif
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
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 */
// Product CRUD routes
router.get('/', requirePermission(PERMISSIONS.PRODUCT_READ), ProdukController.search);

/**
 * @swagger
 * /api/produk/{id}:
 *   get:
 *     summary: Mengambil detail produk
 *     description: Mengambil detail produk berdasarkan ID
 *     tags: [Produk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *                   $ref: '#/components/schemas/Product'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Produk tidak ditemukan
 */
router.get('/:id', requirePermission(PERMISSIONS.PRODUCT_READ), ProdukController.findById);

/**
 * @swagger
 * /api/produk:
 *   post:
 *     summary: Membuat produk baru
 *     description: Membuat produk baru dengan data yang diberikan
 *     tags: [Produk]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
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
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 */
router.post('/', requirePermission(PERMISSIONS.PRODUCT_CREATE), ProdukController.create);

/**
 * @swagger
 * /api/produk/{id}:
 *   put:
 *     summary: Memperbarui produk
 *     description: Memperbarui data produk yang sudah ada
 *     tags: [Produk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID produk
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProductRequest'
 *     responses:
 *       200:
 *         description: Produk berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Produk tidak ditemukan
 */
router.put('/:id', requirePermission(PERMISSIONS.PRODUCT_UPDATE), ProdukController.update);

/**
 * @swagger
 * /api/produk/{id}:
 *   delete:
 *     summary: Menghapus produk
 *     description: Menghapus produk dari sistem
 *     tags: [Produk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *                 message:
 *                   type: string
 *                   example: "Produk berhasil dihapus"
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Produk tidak ditemukan
 */
router.delete('/:id', requirePermission(PERMISSIONS.PRODUCT_DELETE), ProdukController.delete);

// Image upload routes
router.post('/:id/upload-image',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  ProdukController.imageUploadMiddleware,
  ProdukController.uploadProductImage
);

router.delete('/:id/remove-image',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  ProdukController.removeProductImage
);

/**
 * @swagger
 * /api/produk/inventory/search:
 *   get:
 *     summary: Mencari inventaris produk
 *     description: Mengambil daftar inventaris produk dengan filter
 *     tags: [Inventaris Produk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Jumlah item per halaman
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Kata kunci pencarian
 *       - in: query
 *         name: tokoId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID toko
 *     responses:
 *       200:
 *         description: Daftar inventaris produk berhasil diambil
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
 *                     $ref: '#/components/schemas/ProductInventory'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 */
// Inventory routes - require store access
router.get('/inventory/search',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  requireStoreWhenNeeded,
  ProdukInventarisController.search
);

/**
 * @swagger
 * /api/produk/inventory/low-stock:
 *   get:
 *     summary: Produk dengan stok rendah
 *     description: Mengambil daftar produk dengan stok di bawah minimum
 *     tags: [Inventaris Produk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tokoId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID toko
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Jumlah item maksimal
 *     responses:
 *       200:
 *         description: Daftar produk stok rendah berhasil diambil
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
 *                     $ref: '#/components/schemas/ProductInventory'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 */
router.get('/inventory/low-stock',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  requireStoreWhenNeeded,
  ProdukInventarisController.getLowStockItems
);

/**
 * @swagger
 * /api/produk/{produkId}/inventory:
 *   get:
 *     summary: Inventaris produk spesifik
 *     description: Mengambil data inventaris untuk produk tertentu
 *     tags: [Inventaris Produk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: produkId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID produk
 *       - in: query
 *         name: tokoId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID toko
 *     responses:
 *       200:
 *         description: Data inventaris produk berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ProductInventory'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Inventaris tidak ditemukan
 */
router.get('/:produkId/inventory',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  ProdukInventarisController.getProductInventory
);

/**
 * @swagger
 * /api/produk/{produkId}/inventory:
 *   post:
 *     summary: Update stok produk
 *     description: Memperbarui stok produk dengan berbagai tipe perubahan
 *     tags: [Inventaris Produk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: produkId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID produk
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockUpdateRequest'
 *     responses:
 *       200:
 *         description: Stok produk berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ProductInventory'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Produk tidak ditemukan
 */
router.post('/:produkId/inventory',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  requireStoreWhenNeeded,
  ProdukInventarisController.updateStock
);

router.put('/:produkId/inventory',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  requireStoreWhenNeeded,
  ProdukInventarisController.updateStock
);

// Master data routes
/**
 * @swagger
 * /api/produk/master/categories:
 *   get:
 *     summary: Daftar kategori produk
 *     description: Mengambil daftar semua kategori produk
 *     tags: [Master Data]
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
 *                     $ref: '#/components/schemas/Category'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 */
router.get('/master/categories',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  MasterDataController.getCategories
);

/**
 * @swagger
 * /api/produk/master/categories:
 *   post:
 *     summary: Membuat kategori baru
 *     description: Membuat kategori produk baru
 *     tags: [Master Data]
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
 *                 description: Nama kategori
 *               deskripsi:
 *                 type: string
 *                 description: Deskripsi kategori
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
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 */
router.post('/master/categories',
  requirePermission(PERMISSIONS.PRODUCT_CREATE),
  MasterDataController.createCategory
);

/**
 * @swagger
 * /api/produk/master/categories/{id}:
 *   put:
 *     summary: Memperbarui kategori
 *     description: Memperbarui data kategori yang sudah ada
 *     tags: [Master Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID kategori
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama:
 *                 type: string
 *                 description: Nama kategori
 *               deskripsi:
 *                 type: string
 *                 description: Deskripsi kategori
 *               isAktif:
 *                 type: boolean
 *                 description: Status aktif kategori
 *     responses:
 *       200:
 *         description: Kategori berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Kategori tidak ditemukan
 */
router.put('/master/categories/:id',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  MasterDataController.updateCategory
);

/**
 * @swagger
 * /api/produk/master/categories/{id}:
 *   delete:
 *     summary: Menghapus kategori
 *     description: Menghapus kategori dari sistem
 *     tags: [Master Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID kategori
 *     responses:
 *       200:
 *         description: Kategori berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Kategori berhasil dihapus"
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Kategori tidak ditemukan
 */
router.delete('/master/categories/:id',
  requirePermission(PERMISSIONS.PRODUCT_DELETE),
  MasterDataController.deleteCategory
);

// Category image upload routes
router.post('/master/categories/:id/upload-image',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  MasterDataController.imageUploadMiddleware,
  MasterDataController.uploadCategoryImage
);

router.delete('/master/categories/:id/remove-image',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  MasterDataController.removeCategoryImage
);

// Brand image upload routes
router.post('/master/brands/:id/upload-image',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  MasterDataController.imageUploadMiddleware,
  MasterDataController.uploadBrandImage
);

router.delete('/master/brands/:id/remove-image',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  MasterDataController.removeBrandImage
);

/**
 * @swagger
 * /api/produk/master/categories/{id}/products:
 *   get:
 *     summary: Produk berdasarkan kategori
 *     description: Mengambil daftar produk dalam kategori tertentu
 *     tags: [Master Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID kategori
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Jumlah item per halaman
 *     responses:
 *       200:
 *         description: Daftar produk dalam kategori berhasil diambil
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
 *                     $ref: '#/components/schemas/Product'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Kategori tidak ditemukan
 */
router.get('/master/categories/:id/products',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  MasterDataController.getProductsByCategory
);

/**
 * @swagger
 * /api/produk/master/brands:
 *   get:
 *     summary: Daftar brand produk
 *     description: Mengambil daftar semua brand produk
 *     tags: [Master Data]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar brand berhasil diambil
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
 *                     $ref: '#/components/schemas/Brand'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 */
router.get('/master/brands',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  MasterDataController.getBrands
);

/**
 * @swagger
 * /api/produk/master/brands:
 *   post:
 *     summary: Membuat brand baru
 *     description: Membuat brand produk baru
 *     tags: [Master Data]
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
 *                 description: Nama brand
 *               deskripsi:
 *                 type: string
 *                 description: Deskripsi brand
 *     responses:
 *       201:
 *         description: Brand berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 */
router.post('/master/brands',
  requirePermission(PERMISSIONS.PRODUCT_CREATE),
  MasterDataController.createBrand
);

/**
 * @swagger
 * /api/produk/master/brands/{id}:
 *   put:
 *     summary: Memperbarui brand
 *     description: Memperbarui data brand yang sudah ada
 *     tags: [Master Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID brand
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama:
 *                 type: string
 *                 description: Nama brand
 *               deskripsi:
 *                 type: string
 *                 description: Deskripsi brand
 *               isAktif:
 *                 type: boolean
 *                 description: Status aktif brand
 *     responses:
 *       200:
 *         description: Brand berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Brand tidak ditemukan
 */
router.put('/master/brands/:id',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  MasterDataController.updateBrand
);

/**
 * @swagger
 * /api/produk/master/brands/{id}:
 *   delete:
 *     summary: Menghapus brand
 *     description: Menghapus brand dari sistem
 *     tags: [Master Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID brand
 *     responses:
 *       200:
 *         description: Brand berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Brand berhasil dihapus"
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Brand tidak ditemukan
 */
router.delete('/master/brands/:id',
  requirePermission(PERMISSIONS.PRODUCT_DELETE),
  MasterDataController.deleteBrand
);

/**
 * @swagger
 * /api/produk/master/suppliers:
 *   get:
 *     summary: Daftar supplier
 *     description: Mengambil daftar semua supplier
 *     tags: [Master Data]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar supplier berhasil diambil
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
 *                     $ref: '#/components/schemas/Supplier'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 */
router.get('/master/suppliers',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  MasterDataController.getSuppliers
);

/**
 * @swagger
 * /api/produk/master/suppliers:
 *   post:
 *     summary: Membuat supplier baru
 *     description: Membuat supplier baru
 *     tags: [Master Data]
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
 *               - kontak
 *             properties:
 *               nama:
 *                 type: string
 *                 description: Nama supplier
 *               kontak:
 *                 type: string
 *                 description: Kontak supplier
 *               alamat:
 *                 type: string
 *                 description: Alamat supplier
 *     responses:
 *       201:
 *         description: Supplier berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Supplier'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 */
router.post('/master/suppliers',
  requirePermission(PERMISSIONS.PRODUCT_CREATE),
  MasterDataController.createSupplier
);

// Shortcut routes for compatibility
/**
 * @swagger
 * /api/produk/brand:
 *   get:
 *     summary: Daftar brand (shortcut)
 *     description: Shortcut untuk mengambil daftar brand
 *     tags: [Master Data]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar brand berhasil diambil
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
 *                     $ref: '#/components/schemas/Brand'
 */
router.get('/brand',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  MasterDataController.getBrands
);

/**
 * @swagger
 * /api/produk/kategori:
 *   get:
 *     summary: Daftar kategori (shortcut)
 *     description: Shortcut untuk mengambil daftar kategori
 *     tags: [Master Data]
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
 *                     $ref: '#/components/schemas/Category'
 */
router.get('/kategori',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  MasterDataController.getCategories
);

/**
 * @swagger
 * /api/produk/supplier:
 *   get:
 *     summary: Daftar supplier (shortcut)
 *     description: Shortcut untuk mengambil daftar supplier
 *     tags: [Master Data]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar supplier berhasil diambil
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
 *                     $ref: '#/components/schemas/Supplier'
 */
router.get('/supplier',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  MasterDataController.getSuppliers
);

// Enhanced create routes with scope support
router.get('/categories',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  ProdukController.getCategories
);

router.post('/categories',
  requirePermission(PERMISSIONS.PRODUCT_CREATE),
  ProdukController.createCategory
);

router.get('/brands',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  ProdukController.getBrands
);

router.post('/brands',
  requirePermission(PERMISSIONS.PRODUCT_CREATE),
  ProdukController.createBrand
);

router.get('/suppliers',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  ProdukController.getSuppliers
);

router.post('/suppliers',
  requirePermission(PERMISSIONS.PRODUCT_CREATE),
  ProdukController.createSupplier
);

export default router;