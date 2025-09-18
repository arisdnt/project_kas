/**
 * Purchase Routes
 * Purchase transaction management routes with proper authentication and authorization
 * 
 * @swagger
 * components:
 *   schemas:
 *     PurchaseTransaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID transaksi pembelian
 *         nomorTransaksi:
 *           type: string
 *           description: Nomor transaksi pembelian
 *         supplierId:
 *           type: string
 *           description: ID supplier
 *         tanggalTransaksi:
 *           type: string
 *           format: date-time
 *           description: Tanggal transaksi
 *         totalSebelumDiskon:
 *           type: number
 *           description: Total sebelum diskon
 *         totalDiskon:
 *           type: number
 *           description: Total diskon
 *         totalSetelahDiskon:
 *           type: number
 *           description: Total setelah diskon
 *         totalPajak:
 *           type: number
 *           description: Total pajak
 *         totalAkhir:
 *           type: number
 *           description: Total akhir
 *         status:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *           description: Status transaksi
 *         catatan:
 *           type: string
 *           description: Catatan transaksi
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PurchaseItem'
 *     
 *     PurchaseItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID item pembelian
 *         produkId:
 *           type: string
 *           description: ID produk
 *         kuantitas:
 *           type: number
 *           description: Kuantitas item
 *         hargaSatuan:
 *           type: number
 *           description: Harga satuan
 *         diskon:
 *           type: number
 *           description: Diskon item
 *         subtotal:
 *           type: number
 *           description: Subtotal item
 *     
 *     CreatePurchaseRequest:
 *       type: object
 *       required:
 *         - transaction
 *         - items
 *       properties:
 *         transaction:
 *           type: object
 *           properties:
 *             supplierId:
 *               type: string
 *               description: ID supplier
 *             tanggalTransaksi:
 *               type: string
 *               format: date-time
 *               description: Tanggal transaksi
 *             catatan:
 *               type: string
 *               description: Catatan transaksi
 *         items:
 *           type: array
 *           minItems: 1
 *           items:
 *             type: object
 *             properties:
 *               produkId:
 *                 type: string
 *                 description: ID produk
 *               kuantitas:
 *                 type: number
 *                 description: Kuantitas item
 *               hargaSatuan:
 *                 type: number
 *                 description: Harga satuan
 *               diskon:
 *                 type: number
 *                 description: Diskon item
 *     
 *     UpdatePurchaseRequest:
 *       type: object
 *       properties:
 *         supplierId:
 *           type: string
 *           description: ID supplier
 *         tanggalTransaksi:
 *           type: string
 *           format: date-time
 *           description: Tanggal transaksi
 *         catatan:
 *           type: string
 *           description: Catatan transaksi
 *         status:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *           description: Status transaksi
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope, requireStoreWhenNeeded } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { PembelianController } from '../controllers/PembelianController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

/**
 * @swagger
 * /api/pembelian:
 *   get:
 *     summary: Mencari transaksi pembelian
 *     description: Mengambil daftar transaksi pembelian dengan filter dan pagination
 *     tags: [Pembelian]
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
 *         name: supplierId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID supplier
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *         description: Filter berdasarkan status
 *       - in: query
 *         name: tanggalMulai
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tanggal mulai
 *       - in: query
 *         name: tanggalSelesai
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tanggal selesai
 *     responses:
 *       200:
 *         description: Daftar transaksi pembelian berhasil diambil
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
 *                     $ref: '#/components/schemas/PurchaseTransaction'
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
 *       400:
 *         description: Parameter tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 */
// Purchase transaction CRUD routes - all require store access
router.get('/',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  requireStoreWhenNeeded,
  PembelianController.search
);

/**
 * @swagger
 * /api/pembelian/{id}:
 *   get:
 *     summary: Mengambil detail transaksi pembelian
 *     description: Mengambil detail transaksi pembelian berdasarkan ID
 *     tags: [Pembelian]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID transaksi pembelian
 *     responses:
 *       200:
 *         description: Detail transaksi pembelian berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PurchaseTransaction'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Transaksi tidak ditemukan
 */
router.get('/:id',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  requireStoreWhenNeeded,
  PembelianController.findById
);

/**
 * @swagger
 * /api/pembelian:
 *   post:
 *     summary: Membuat transaksi pembelian baru
 *     description: Membuat transaksi pembelian baru dengan item-item yang dibeli
 *     tags: [Pembelian]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePurchaseRequest'
 *     responses:
 *       201:
 *         description: Transaksi pembelian berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PurchaseTransaction'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 */
router.post('/',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  requireStoreWhenNeeded,
  PembelianController.create
);

/**
 * @swagger
 * /api/pembelian/{id}:
 *   put:
 *     summary: Memperbarui transaksi pembelian
 *     description: Memperbarui data transaksi pembelian yang sudah ada
 *     tags: [Pembelian]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID transaksi pembelian
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePurchaseRequest'
 *     responses:
 *       200:
 *         description: Transaksi pembelian berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PurchaseTransaction'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Transaksi tidak ditemukan
 */
router.put('/:id',
  requirePermission(PERMISSIONS.TRANSACTION_UPDATE),
  requireStoreWhenNeeded,
  PembelianController.update
);

/**
 * @swagger
 * /api/pembelian/{id}:
 *   delete:
 *     summary: Membatalkan transaksi pembelian
 *     description: Membatalkan transaksi pembelian yang sudah ada
 *     tags: [Pembelian]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID transaksi pembelian
 *     responses:
 *       200:
 *         description: Transaksi pembelian berhasil dibatalkan
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
 *                   example: "Transaksi berhasil dibatalkan"
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Transaksi tidak ditemukan
 */
router.delete('/:id',
  requirePermission(PERMISSIONS.TRANSACTION_DELETE),
  requireStoreWhenNeeded,
  PembelianController.cancel
);

export default router;