/**
 * @swagger
 * components:
 *   schemas:
 *     Supplier:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID unik supplier
 *         nama:
 *           type: string
 *           description: Nama supplier
 *         kontak_person:
 *           type: string
 *           description: Nama kontak person
 *         telepon:
 *           type: string
 *           description: Nomor telepon
 *         email:
 *           type: string
 *           format: email
 *           description: Alamat email
 *         alamat:
 *           type: string
 *           description: Alamat lengkap
 *         npwp:
 *           type: string
 *           description: Nomor NPWP
 *         bank_nama:
 *           type: string
 *           description: Nama bank
 *         bank_rekening:
 *           type: string
 *           description: Nomor rekening
 *         bank_atas_nama:
 *           type: string
 *           description: Nama pemilik rekening
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     CreateSupplierRequest:
 *       type: object
 *       required:
 *         - nama
 *       properties:
 *         nama:
 *           type: string
 *           description: Nama supplier
 *         kontak_person:
 *           type: string
 *           description: Nama kontak person
 *         telepon:
 *           type: string
 *           description: Nomor telepon
 *         email:
 *           type: string
 *           format: email
 *           description: Alamat email
 *         alamat:
 *           type: string
 *           description: Alamat lengkap
 *         npwp:
 *           type: string
 *           description: Nomor NPWP
 *         bank_nama:
 *           type: string
 *           description: Nama bank
 *         bank_rekening:
 *           type: string
 *           description: Nomor rekening
 *         bank_atas_nama:
 *           type: string
 *           description: Nama pemilik rekening
 *     UpdateSupplierRequest:
 *       type: object
 *       properties:
 *         nama:
 *           type: string
 *           description: Nama supplier
 *         kontak_person:
 *           type: string
 *           description: Nama kontak person
 *         telepon:
 *           type: string
 *           description: Nomor telepon
 *         email:
 *           type: string
 *           format: email
 *           description: Alamat email
 *         alamat:
 *           type: string
 *           description: Alamat lengkap
 *         npwp:
 *           type: string
 *           description: Nomor NPWP
 *         bank_nama:
 *           type: string
 *           description: Nama bank
 *         bank_rekening:
 *           type: string
 *           description: Nomor rekening
 *         bank_atas_nama:
 *           type: string
 *           description: Nama pemilik rekening
 *     BulkSupplierActionRequest:
 *       type: object
 *       required:
 *         - action
 *         - supplierIds
 *       properties:
 *         action:
 *           type: string
 *           enum: [delete, activate, deactivate]
 *           description: Aksi yang akan dilakukan
 *         supplierIds:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: Array ID supplier
 *     ImportSuppliersRequest:
 *       type: object
 *       required:
 *         - suppliers
 *       properties:
 *         suppliers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CreateSupplierRequest'
 *           description: Array data supplier untuk diimpor
 *     RateSupplierRequest:
 *       type: object
 *       required:
 *         - rating
 *       properties:
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Rating supplier (1-5)
 *         notes:
 *           type: string
 *           description: Catatan rating
 *     SupplierStats:
 *       type: object
 *       properties:
 *         total_purchases:
 *           type: number
 *           description: Total pembelian
 *         total_amount:
 *           type: number
 *           description: Total nilai pembelian
 *         average_rating:
 *           type: number
 *           description: Rating rata-rata
 *         last_purchase_date:
 *           type: string
 *           format: date-time
 *           description: Tanggal pembelian terakhir
 *     SupplierPerformanceReport:
 *       type: object
 *       properties:
 *         supplier_id:
 *           type: string
 *           format: uuid
 *         nama:
 *           type: string
 *         total_orders:
 *           type: number
 *         total_amount:
 *           type: number
 *         on_time_delivery_rate:
 *           type: number
 *         quality_rating:
 *           type: number
 */

import { Router } from 'express';
import { SupplierController } from '../controllers/SupplierController';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

/**
 * @swagger
 * /api/supplier/search:
 *   get:
 *     tags: [Supplier]
 *     summary: Cari supplier
 *     description: Mencari supplier dengan filter dan pagination
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
 *         description: Kata kunci pencarian nama supplier
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
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/search', requirePermission(PERMISSIONS.PRODUCT_READ), SupplierController.searchSuppliers);

/**
 * @swagger
 * /api/supplier/active:
 *   get:
 *     tags: [Supplier]
 *     summary: Dapatkan supplier aktif
 *     description: Mengambil daftar supplier yang aktif
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar supplier aktif berhasil diambil
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
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/active', requirePermission(PERMISSIONS.PRODUCT_READ), SupplierController.getActiveSuppliers);

/**
 * @swagger
 * /api/supplier/performance/report:
 *   get:
 *     tags: [Supplier]
 *     summary: Laporan performa supplier
 *     description: Mengambil laporan performa supplier
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Laporan performa supplier berhasil diambil
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
 *                     $ref: '#/components/schemas/SupplierPerformanceReport'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/performance/report', requirePermission(PERMISSIONS.REPORT_READ), SupplierController.getPerformanceReport);

/**
 * @swagger
 * /api/supplier/performance/top:
 *   get:
 *     tags: [Supplier]
 *     summary: Top supplier berperforma
 *     description: Mengambil daftar supplier dengan performa terbaik
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar top supplier berhasil diambil
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
 *                     $ref: '#/components/schemas/SupplierPerformanceReport'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/performance/top', requirePermission(PERMISSIONS.REPORT_READ), SupplierController.getTopSuppliers);

/**
 * @swagger
 * /api/supplier/attention:
 *   get:
 *     tags: [Supplier]
 *     summary: Supplier yang perlu perhatian
 *     description: Mengambil daftar supplier yang memerlukan perhatian khusus
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar supplier yang perlu perhatian berhasil diambil
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
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/attention', requirePermission(PERMISSIONS.PRODUCT_READ), SupplierController.getSuppliersNeedingAttention);

/**
 * @swagger
 * /api/supplier/{id}:
 *   get:
 *     tags: [Supplier]
 *     summary: Dapatkan supplier berdasarkan ID
 *     description: Mengambil detail supplier berdasarkan ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID supplier
 *     responses:
 *       200:
 *         description: Detail supplier berhasil diambil
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
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id', requirePermission(PERMISSIONS.PRODUCT_READ), SupplierController.findSupplierById);

/**
 * @swagger
 * /api/supplier/{id}/profile:
 *   get:
 *     tags: [Supplier]
 *     summary: Profil lengkap supplier
 *     description: Mengambil profil lengkap supplier dengan semua detail
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID supplier
 *     responses:
 *       200:
 *         description: Profil lengkap supplier berhasil diambil
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
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id/profile', requirePermission(PERMISSIONS.PRODUCT_READ), SupplierController.getSupplierWithFullProfile);

/**
 * @swagger
 * /api/supplier/{id}/stats:
 *   get:
 *     tags: [Supplier]
 *     summary: Statistik supplier
 *     description: Mengambil statistik supplier
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID supplier
 *     responses:
 *       200:
 *         description: Statistik supplier berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SupplierStats'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id/stats', requirePermission(PERMISSIONS.PRODUCT_READ), SupplierController.getSupplierStats);

/**
 * @swagger
 * /api/supplier/{id}/history:
 *   get:
 *     tags: [Supplier]
 *     summary: Riwayat pembelian supplier
 *     description: Mengambil riwayat pembelian dari supplier
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID supplier
 *     responses:
 *       200:
 *         description: Riwayat pembelian berhasil diambil
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
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id/history', requirePermission(PERMISSIONS.PRODUCT_READ), SupplierController.getPurchaseHistory);

/**
 * @swagger
 * /api/supplier/{id}/products:
 *   get:
 *     tags: [Supplier]
 *     summary: Produk dari supplier
 *     description: Mengambil daftar produk dari supplier
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID supplier
 *     responses:
 *       200:
 *         description: Daftar produk supplier berhasil diambil
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
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id/products', requirePermission(PERMISSIONS.PRODUCT_READ), SupplierController.getSupplierProducts);

/**
 * @swagger
 * /api/supplier/{id}/contacts:
 *   get:
 *     tags: [Supplier]
 *     summary: Log kontak supplier
 *     description: Mengambil log kontak dengan supplier
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID supplier
 *     responses:
 *       200:
 *         description: Log kontak berhasil diambil
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
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id/contacts', requirePermission(PERMISSIONS.PRODUCT_READ), SupplierController.getContactLogs);

/**
 * @swagger
 * /api/supplier/{id}/payment-terms:
 *   get:
 *     tags: [Supplier]
 *     summary: Syarat pembayaran supplier
 *     description: Mengambil syarat pembayaran supplier
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID supplier
 *     responses:
 *       200:
 *         description: Syarat pembayaran berhasil diambil
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
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id/payment-terms', requirePermission(PERMISSIONS.PRODUCT_READ), SupplierController.getPaymentTerms);

/**
 * @swagger
 * /api/supplier:
 *   post:
 *     tags: [Supplier]
 *     summary: Buat supplier baru
 *     description: Membuat supplier baru
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSupplierRequest'
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
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/', requirePermission(PERMISSIONS.PRODUCT_CREATE), SupplierController.createSupplier);

/**
 * @swagger
 * /api/supplier/{id}:
 *   put:
 *     tags: [Supplier]
 *     summary: Update supplier
 *     description: Mengupdate data supplier
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID supplier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSupplierRequest'
 *     responses:
 *       200:
 *         description: Supplier berhasil diupdate
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
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/:id', requirePermission(PERMISSIONS.PRODUCT_UPDATE), SupplierController.updateSupplier);

/**
 * @swagger
 * /api/supplier/{id}:
 *   delete:
 *     tags: [Supplier]
 *     summary: Hapus supplier
 *     description: Menghapus supplier
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID supplier
 *     responses:
 *       200:
 *         description: Supplier berhasil dihapus
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
 *                   example: "Supplier berhasil dihapus"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete('/:id', requirePermission(PERMISSIONS.PRODUCT_DELETE), SupplierController.deleteSupplier);

/**
 * @swagger
 * /api/supplier/bulk:
 *   post:
 *     tags: [Supplier]
 *     summary: Aksi bulk supplier
 *     description: Melakukan aksi bulk pada multiple supplier
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkSupplierActionRequest'
 *     responses:
 *       200:
 *         description: Aksi bulk berhasil dilakukan
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
 *                   example: "Aksi bulk berhasil dilakukan"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/bulk', requirePermission(PERMISSIONS.PRODUCT_UPDATE), SupplierController.bulkSupplierAction);

/**
 * @swagger
 * /api/supplier/import:
 *   post:
 *     tags: [Supplier]
 *     summary: Import supplier
 *     description: Mengimpor multiple supplier sekaligus
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ImportSuppliersRequest'
 *     responses:
 *       201:
 *         description: Supplier berhasil diimpor
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
 *                   example: "Supplier berhasil diimpor"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/import', requirePermission(PERMISSIONS.PRODUCT_CREATE), SupplierController.importSuppliers);

/**
 * @swagger
 * /api/supplier/{id}/rate:
 *   post:
 *     tags: [Supplier]
 *     summary: Beri rating supplier
 *     description: Memberikan rating pada supplier
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID supplier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RateSupplierRequest'
 *     responses:
 *       200:
 *         description: Rating berhasil diberikan
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
 *                   example: "Rating berhasil diberikan"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/:id/rate', requirePermission(PERMISSIONS.PRODUCT_UPDATE), SupplierController.rateSupplier);

/**
 * @swagger
 * /api/supplier/{id}/follow-up:
 *   post:
 *     tags: [Supplier]
 *     summary: Jadwalkan follow up
 *     description: Menjadwalkan follow up dengan supplier
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID supplier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scheduled_date:
 *                 type: string
 *                 format: date-time
 *                 description: Tanggal follow up
 *               notes:
 *                 type: string
 *                 description: Catatan follow up
 *     responses:
 *       200:
 *         description: Follow up berhasil dijadwalkan
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
 *                   example: "Follow up berhasil dijadwalkan"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/:id/follow-up', requirePermission(PERMISSIONS.PRODUCT_UPDATE), SupplierController.scheduleFollowUp);

/**
 * @swagger
 * /api/supplier/payment-terms:
 *   post:
 *     tags: [Supplier]
 *     summary: Buat syarat pembayaran
 *     description: Membuat syarat pembayaran baru untuk supplier
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               supplier_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID supplier
 *               payment_terms:
 *                 type: string
 *                 description: Syarat pembayaran
 *               credit_limit:
 *                 type: number
 *                 description: Limit kredit
 *     responses:
 *       201:
 *         description: Syarat pembayaran berhasil dibuat
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
 *                   example: "Syarat pembayaran berhasil dibuat"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/payment-terms', requirePermission(PERMISSIONS.PRODUCT_CREATE), SupplierController.createPaymentTerms);

/**
 * @swagger
 * /api/supplier/contact-log:
 *   post:
 *     tags: [Supplier]
 *     summary: Log kontak supplier
 *     description: Mencatat log kontak dengan supplier
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               supplier_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID supplier
 *               contact_type:
 *                 type: string
 *                 description: Jenis kontak
 *               notes:
 *                 type: string
 *                 description: Catatan kontak
 *               contact_date:
 *                 type: string
 *                 format: date-time
 *                 description: Tanggal kontak
 *     responses:
 *       201:
 *         description: Log kontak berhasil dicatat
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
 *                   example: "Log kontak berhasil dicatat"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/contact-log', requirePermission(PERMISSIONS.PRODUCT_CREATE), SupplierController.logContact);

export default router;