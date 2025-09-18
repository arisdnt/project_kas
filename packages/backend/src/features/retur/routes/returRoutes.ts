/**
 * Return Routes
 * Return transaction management routes with proper authentication
 * 
 * @swagger
 * components:
 *   schemas:
 *     SalesReturn:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID retur penjualan
 *         nomor_retur:
 *           type: string
 *           description: Nomor retur penjualan
 *         tanggal_retur:
 *           type: string
 *           format: date
 *           description: Tanggal retur
 *         id_penjualan:
 *           type: string
 *           description: ID penjualan yang diretur
 *         total_retur:
 *           type: number
 *           description: Total nilai retur
 *         alasan:
 *           type: string
 *           description: Alasan retur
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Status retur
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 * 
 *     PurchaseReturn:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID retur pembelian
 *         nomor_retur:
 *           type: string
 *           description: Nomor retur pembelian
 *         tanggal_retur:
 *           type: string
 *           format: date
 *           description: Tanggal retur
 *         id_pembelian:
 *           type: string
 *           description: ID pembelian yang diretur
 *         total_retur:
 *           type: number
 *           description: Total nilai retur
 *         alasan:
 *           type: string
 *           description: Alasan retur
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Status retur
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 * 
 *     CreateSalesReturnRequest:
 *       type: object
 *       required:
 *         - retur
 *         - items
 *       properties:
 *         retur:
 *           type: object
 *           properties:
 *             id_penjualan:
 *               type: string
 *               description: ID penjualan yang diretur
 *             alasan:
 *               type: string
 *               description: Alasan retur
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id_produk:
 *                 type: string
 *                 description: ID produk yang diretur
 *               jumlah:
 *                 type: number
 *                 description: Jumlah yang diretur
 *               harga:
 *                 type: number
 *                 description: Harga satuan
 * 
 *     CreatePurchaseReturnRequest:
 *       type: object
 *       required:
 *         - retur
 *         - items
 *       properties:
 *         retur:
 *           type: object
 *           properties:
 *             id_pembelian:
 *               type: string
 *               description: ID pembelian yang diretur
 *             alasan:
 *               type: string
 *               description: Alasan retur
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id_produk:
 *                 type: string
 *                 description: ID produk yang diretur
 *               jumlah:
 *                 type: number
 *                 description: Jumlah yang diretur
 *               harga:
 *                 type: number
 *                 description: Harga satuan
 * 
 *     UpdateReturnRequest:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Status retur
 *         alasan:
 *           type: string
 *           description: Alasan retur
 * 
 *     ReturnStats:
 *       type: object
 *       properties:
 *         total_returns:
 *           type: number
 *           description: Total jumlah retur
 *         total_value:
 *           type: number
 *           description: Total nilai retur
 *         by_status:
 *           type: object
 *           properties:
 *             pending:
 *               type: number
 *             approved:
 *               type: number
 *             rejected:
 *               type: number
 *         by_date:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               count:
 *                 type: number
 *               value:
 *                 type: number
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope, requireStoreWhenNeeded } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { ReturController } from '../controllers/ReturController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

/**
 * @swagger
 * /api/retur/sales:
 *   get:
 *     summary: Cari retur penjualan
 *     description: Mencari dan memfilter retur penjualan dengan pagination
 *     tags: [Retur]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah data per halaman
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Kata kunci pencarian
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter berdasarkan status
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal mulai filter
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal akhir filter
 *     responses:
 *       200:
 *         description: Daftar retur penjualan berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SalesReturn'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
// Sales return routes
router.get('/sales',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  requireStoreWhenNeeded,
  ReturController.searchSalesReturns
);

/**
 * @swagger
 * /api/retur/sales/{id}:
 *   get:
 *     summary: Ambil detail retur penjualan
 *     description: Mengambil detail retur penjualan berdasarkan ID
 *     tags: [Retur]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID retur penjualan
 *     responses:
 *       200:
 *         description: Detail retur penjualan berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SalesReturn'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/sales/:id',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  requireStoreWhenNeeded,
  ReturController.findSalesReturnById
);

/**
 * @swagger
 * /api/retur/sales:
 *   post:
 *     summary: Buat retur penjualan baru
 *     description: Membuat retur penjualan baru dengan item-item yang diretur
 *     tags: [Retur]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSalesReturnRequest'
 *     responses:
 *       201:
 *         description: Retur penjualan berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SalesReturn'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/sales',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  requireStoreWhenNeeded,
  ReturController.createSalesReturn
);

/**
 * @swagger
 * /api/retur/sales/{id}:
 *   put:
 *     summary: Update retur penjualan
 *     description: Mengupdate status atau informasi retur penjualan
 *     tags: [Retur]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID retur penjualan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReturnRequest'
 *     responses:
 *       200:
 *         description: Retur penjualan berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SalesReturn'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/sales/:id',
  requirePermission(PERMISSIONS.TRANSACTION_UPDATE),
  requireStoreWhenNeeded,
  ReturController.updateSalesReturn
);

/**
 * @swagger
 * /api/retur/purchases:
 *   get:
 *     summary: Cari retur pembelian
 *     description: Mencari dan memfilter retur pembelian dengan pagination
 *     tags: [Retur]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah data per halaman
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Kata kunci pencarian
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter berdasarkan status
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal mulai filter
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal akhir filter
 *     responses:
 *       200:
 *         description: Daftar retur pembelian berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PurchaseReturn'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
// Purchase return routes
router.get('/purchases',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  requireStoreWhenNeeded,
  ReturController.searchPurchaseReturns
);

/**
 * @swagger
 * /api/retur/purchases/{id}:
 *   get:
 *     summary: Ambil detail retur pembelian
 *     description: Mengambil detail retur pembelian berdasarkan ID
 *     tags: [Retur]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID retur pembelian
 *     responses:
 *       200:
 *         description: Detail retur pembelian berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PurchaseReturn'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/purchases/:id',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  requireStoreWhenNeeded,
  ReturController.findPurchaseReturnById
);

/**
 * @swagger
 * /api/retur/purchases:
 *   post:
 *     summary: Buat retur pembelian baru
 *     description: Membuat retur pembelian baru dengan item-item yang diretur
 *     tags: [Retur]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePurchaseReturnRequest'
 *     responses:
 *       201:
 *         description: Retur pembelian berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PurchaseReturn'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/purchases',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  requireStoreWhenNeeded,
  ReturController.createPurchaseReturn
);

/**
 * @swagger
 * /api/retur/purchases/{id}:
 *   put:
 *     summary: Update retur pembelian
 *     description: Mengupdate status atau informasi retur pembelian
 *     tags: [Retur]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID retur pembelian
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReturnRequest'
 *     responses:
 *       200:
 *         description: Retur pembelian berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PurchaseReturn'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/purchases/:id',
  requirePermission(PERMISSIONS.TRANSACTION_UPDATE),
  requireStoreWhenNeeded,
  ReturController.updatePurchaseReturn
);

/**
 * @swagger
 * /api/retur/stats:
 *   get:
 *     summary: Ambil statistik retur
 *     description: Mengambil statistik retur berdasarkan periode dan tipe
 *     tags: [Retur]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal mulai (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal akhir (YYYY-MM-DD)
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [penjualan, pembelian]
 *         description: Tipe retur
 *     responses:
 *       200:
 *         description: Statistik retur berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ReturnStats'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
// Statistics route
router.get('/stats',
  requirePermission(PERMISSIONS.REPORT_READ),
  ReturController.getReturnStats
);

export default router;