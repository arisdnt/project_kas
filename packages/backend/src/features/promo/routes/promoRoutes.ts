/**
 * Promo Routes
 * Promo management routes with proper authentication and authorization
 * 
 * @swagger
 * components:
 *   schemas:
 *     Promo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID promo
 *         kodePromo:
 *           type: string
 *           description: Kode promo unik
 *         namaPromo:
 *           type: string
 *           description: Nama promo
 *         deskripsi:
 *           type: string
 *           description: Deskripsi promo
 *         jenisDiskon:
 *           type: string
 *           enum: [PERCENTAGE, FIXED_AMOUNT]
 *           description: Jenis diskon (persentase atau nominal tetap)
 *         nilaiDiskon:
 *           type: number
 *           description: Nilai diskon
 *         minimalPembelian:
 *           type: number
 *           description: Minimal pembelian untuk menggunakan promo
 *         maksimalDiskon:
 *           type: number
 *           description: Maksimal diskon yang bisa didapat
 *         tanggalMulai:
 *           type: string
 *           format: date-time
 *           description: Tanggal mulai promo
 *         tanggalBerakhir:
 *           type: string
 *           format: date-time
 *           description: Tanggal berakhir promo
 *         kuotaPenggunaan:
 *           type: integer
 *           description: Kuota penggunaan promo
 *         jumlahTerpakai:
 *           type: integer
 *           description: Jumlah promo yang sudah terpakai
 *         isAktif:
 *           type: boolean
 *           description: Status aktif promo
 *         tokoId:
 *           type: string
 *           description: ID toko
 *         tenantId:
 *           type: string
 *           description: ID tenant
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Tanggal dibuat
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Tanggal diperbarui
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *           description: Kategori produk yang berlaku
 *         products:
 *           type: array
 *           items:
 *             type: string
 *           description: Produk yang berlaku
 *         customers:
 *           type: array
 *           items:
 *             type: string
 *           description: Customer yang berlaku
 *     
 *     CreatePromoRequest:
 *       type: object
 *       required:
 *         - promo
 *       properties:
 *         promo:
 *           type: object
 *           required:
 *             - kodePromo
 *             - namaPromo
 *             - jenisDiskon
 *             - nilaiDiskon
 *             - tanggalMulai
 *             - tanggalBerakhir
 *           properties:
 *             kodePromo:
 *               type: string
 *               description: Kode promo unik
 *             namaPromo:
 *               type: string
 *               description: Nama promo
 *             deskripsi:
 *               type: string
 *               description: Deskripsi promo
 *             jenisDiskon:
 *               type: string
 *               enum: [PERCENTAGE, FIXED_AMOUNT]
 *               description: Jenis diskon
 *             nilaiDiskon:
 *               type: number
 *               minimum: 0
 *               description: Nilai diskon
 *             minimalPembelian:
 *               type: number
 *               minimum: 0
 *               description: Minimal pembelian
 *             maksimalDiskon:
 *               type: number
 *               minimum: 0
 *               description: Maksimal diskon
 *             tanggalMulai:
 *               type: string
 *               format: date-time
 *               description: Tanggal mulai promo
 *             tanggalBerakhir:
 *               type: string
 *               format: date-time
 *               description: Tanggal berakhir promo
 *             kuotaPenggunaan:
 *               type: integer
 *               minimum: 1
 *               description: Kuota penggunaan promo
 *             isAktif:
 *               type: boolean
 *               default: true
 *               description: Status aktif promo
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: ID kategori yang berlaku
 *         products:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: ID produk yang berlaku
 *         customers:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: ID customer yang berlaku
 *     
 *     UpdatePromoRequest:
 *       type: object
 *       properties:
 *         promo:
 *           type: object
 *           properties:
 *             namaPromo:
 *               type: string
 *               description: Nama promo
 *             deskripsi:
 *               type: string
 *               description: Deskripsi promo
 *             jenisDiskon:
 *               type: string
 *               enum: [PERCENTAGE, FIXED_AMOUNT]
 *               description: Jenis diskon
 *             nilaiDiskon:
 *               type: number
 *               minimum: 0
 *               description: Nilai diskon
 *             minimalPembelian:
 *               type: number
 *               minimum: 0
 *               description: Minimal pembelian
 *             maksimalDiskon:
 *               type: number
 *               minimum: 0
 *               description: Maksimal diskon
 *             tanggalMulai:
 *               type: string
 *               format: date-time
 *               description: Tanggal mulai promo
 *             tanggalBerakhir:
 *               type: string
 *               format: date-time
 *               description: Tanggal berakhir promo
 *             kuotaPenggunaan:
 *               type: integer
 *               minimum: 1
 *               description: Kuota penggunaan promo
 *             isAktif:
 *               type: boolean
 *               description: Status aktif promo
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: ID kategori yang berlaku
 *         products:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: ID produk yang berlaku
 *         customers:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: ID customer yang berlaku
 *     
 *     ValidatePromoRequest:
 *       type: object
 *       required:
 *         - kodePromo
 *         - totalBelanja
 *       properties:
 *         kodePromo:
 *           type: string
 *           description: Kode promo yang akan divalidasi
 *         totalBelanja:
 *           type: number
 *           minimum: 0
 *           description: Total belanja untuk validasi
 *         customerId:
 *           type: string
 *           format: uuid
 *           description: ID customer (opsional)
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               produkId:
 *                 type: string
 *                 format: uuid
 *               kategoriId:
 *                 type: string
 *                 format: uuid
 *               jumlah:
 *                 type: integer
 *               harga:
 *                 type: number
 *           description: Item belanja untuk validasi
 *     
 *     PromoValidationResult:
 *       type: object
 *       properties:
 *         valid:
 *           type: boolean
 *           description: Apakah promo valid
 *         promo:
 *           $ref: '#/components/schemas/Promo'
 *         diskonAmount:
 *           type: number
 *           description: Jumlah diskon yang didapat
 *         message:
 *           type: string
 *           description: Pesan validasi
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *           description: Daftar error validasi
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope, requireStoreWhenNeeded } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { PromoController } from '../controllers/PromoController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

/**
 * @swagger
 * /api/promo:
 *   get:
 *     summary: Mencari promo
 *     description: Mengambil daftar promo dengan pagination dan filter
 *     tags: [Promo]
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
 *         description: Pencarian berdasarkan nama atau kode promo
 *       - in: query
 *         name: jenisDiskon
 *         schema:
 *           type: string
 *           enum: [PERCENTAGE, FIXED_AMOUNT]
 *         description: Filter berdasarkan jenis diskon
 *       - in: query
 *         name: isAktif
 *         schema:
 *           type: boolean
 *         description: Filter berdasarkan status aktif
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [namaPromo, kodePromo, tanggalMulai, tanggalBerakhir, createdAt]
 *           default: createdAt
 *         description: Field untuk sorting
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Urutan sorting
 *     responses:
 *       200:
 *         description: Daftar promo berhasil diambil
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
 *                     $ref: '#/components/schemas/Promo'
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
// Promo CRUD routes - require store access for most operations
router.get('/',
  requirePermission(PERMISSIONS.PRODUCT_READ), // Using product read permission for promos
  PromoController.search
);

/**
 * @swagger
 * /api/promo/code/{code}:
 *   get:
 *     summary: Mencari promo berdasarkan kode
 *     description: Mengambil promo berdasarkan kode promo
 *     tags: [Promo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Kode promo
 *     responses:
 *       200:
 *         description: Promo berhasil ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Promo'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Promo tidak ditemukan atau tidak aktif
 */
router.get('/code/:code',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  PromoController.findByCode
);

/**
 * @swagger
 * /api/promo/{id}:
 *   get:
 *     summary: Mengambil promo berdasarkan ID
 *     description: Mengambil detail promo berdasarkan ID
 *     tags: [Promo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID promo
 *     responses:
 *       200:
 *         description: Detail promo berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Promo'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Promo tidak ditemukan
 */
router.get('/:id',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  PromoController.findById
);

/**
 * @swagger
 * /api/promo:
 *   post:
 *     summary: Membuat promo baru
 *     description: Membuat promo baru dengan kategori, produk, dan customer yang berlaku
 *     tags: [Promo]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePromoRequest'
 *     responses:
 *       201:
 *         description: Promo berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Promo'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       409:
 *         description: Kode promo sudah ada
 */
router.post('/',
  requirePermission(PERMISSIONS.PRODUCT_CREATE),
  requireStoreWhenNeeded,
  PromoController.create
);

/**
 * @swagger
 * /api/promo/{id}:
 *   put:
 *     summary: Memperbarui promo
 *     description: Memperbarui promo berdasarkan ID
 *     tags: [Promo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID promo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePromoRequest'
 *     responses:
 *       200:
 *         description: Promo berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Promo'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Promo tidak ditemukan
 */
router.put('/:id',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  requireStoreWhenNeeded,
  PromoController.update
);

/**
 * @swagger
 * /api/promo/{id}:
 *   delete:
 *     summary: Menghapus promo
 *     description: Menghapus promo berdasarkan ID
 *     tags: [Promo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID promo
 *     responses:
 *       200:
 *         description: Promo berhasil dihapus
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
 *                   example: "Promo berhasil dihapus"
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Promo tidak ditemukan
 */
router.delete('/:id',
  requirePermission(PERMISSIONS.PRODUCT_DELETE),
  requireStoreWhenNeeded,
  PromoController.delete
);

/**
 * @swagger
 * /api/promo/validate:
 *   post:
 *     summary: Validasi promo
 *     description: Memvalidasi apakah promo dapat digunakan untuk transaksi tertentu
 *     tags: [Promo - Validation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidatePromoRequest'
 *     responses:
 *       200:
 *         description: Hasil validasi promo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PromoValidationResult'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 */
router.post('/validate',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  requireStoreWhenNeeded,
  PromoController.validatePromo
);

export default router;