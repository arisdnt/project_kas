/**
 * @swagger
 * components:
 *   schemas:
 *     Toko:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID unik toko
 *         nama:
 *           type: string
 *           description: Nama toko
 *         kode:
 *           type: string
 *           description: Kode unik toko
 *         alamat:
 *           type: string
 *           description: Alamat toko
 *         telepon:
 *           type: string
 *           description: Nomor telepon toko
 *         email:
 *           type: string
 *           format: email
 *           description: Email toko
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: Status toko
 *         tenant_id:
 *           type: string
 *           format: uuid
 *           description: ID tenant
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     CreateTokoRequest:
 *       type: object
 *       required:
 *         - nama
 *         - kode
 *       properties:
 *         nama:
 *           type: string
 *           description: Nama toko
 *         kode:
 *           type: string
 *           description: Kode unik toko
 *         alamat:
 *           type: string
 *           description: Alamat toko
 *         telepon:
 *           type: string
 *           description: Nomor telepon toko
 *         email:
 *           type: string
 *           format: email
 *           description: Email toko
 *     UpdateTokoRequest:
 *       type: object
 *       properties:
 *         nama:
 *           type: string
 *           description: Nama toko
 *         alamat:
 *           type: string
 *           description: Alamat toko
 *         telepon:
 *           type: string
 *           description: Nomor telepon toko
 *         email:
 *           type: string
 *           format: email
 *           description: Email toko
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: Status toko
 *     TokoConfig:
 *       type: object
 *       properties:
 *         key:
 *           type: string
 *           description: Kunci konfigurasi
 *         value:
 *           type: string
 *           description: Nilai konfigurasi
 *         description:
 *           type: string
 *           description: Deskripsi konfigurasi
 *     CreateTokoConfigRequest:
 *       type: object
 *       required:
 *         - key
 *         - value
 *       properties:
 *         key:
 *           type: string
 *           description: Kunci konfigurasi
 *         value:
 *           type: string
 *           description: Nilai konfigurasi
 *         description:
 *           type: string
 *           description: Deskripsi konfigurasi
 *     OperatingHours:
 *       type: object
 *       properties:
 *         day:
 *           type: string
 *           enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *           description: Hari dalam seminggu
 *         open_time:
 *           type: string
 *           format: time
 *           description: Jam buka (HH:mm)
 *         close_time:
 *           type: string
 *           format: time
 *           description: Jam tutup (HH:mm)
 *         is_open:
 *           type: boolean
 *           description: Apakah buka di hari ini
 *     TokoStats:
 *       type: object
 *       properties:
 *         total_transactions:
 *           type: number
 *           description: Total transaksi
 *         daily_revenue:
 *           type: number
 *           description: Pendapatan harian
 *         monthly_revenue:
 *           type: number
 *           description: Pendapatan bulanan
 *         total_products:
 *           type: number
 *           description: Total produk
 *         active_products:
 *           type: number
 *           description: Produk aktif
 *         total_customers:
 *           type: number
 *           description: Total pelanggan
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { TokoController } from '../controllers/TokoController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

/**
 * @swagger
 * /api/toko:
 *   get:
 *     tags: [Toko]
 *     summary: Cari toko
 *     description: Mencari toko dengan filter dan pagination
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
 *         description: Kata kunci pencarian nama atau kode toko
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter berdasarkan status
 *     responses:
 *       200:
 *         description: Daftar toko berhasil diambil
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
 *                     $ref: '#/components/schemas/Toko'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/',
  requirePermission(PERMISSIONS.STORE_READ),
  TokoController.searchStores
);

/**
 * @swagger
 * /api/toko/active:
 *   get:
 *     tags: [Toko]
 *     summary: Dapatkan toko aktif
 *     description: Mengambil daftar toko yang aktif
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar toko aktif berhasil diambil
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
 *                     $ref: '#/components/schemas/Toko'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/active',
  requirePermission(PERMISSIONS.STORE_READ),
  TokoController.getActiveStores
);

/**
 * @swagger
 * /api/toko/{id}:
 *   get:
 *     tags: [Toko]
 *     summary: Dapatkan toko berdasarkan ID
 *     description: Mengambil detail toko berdasarkan ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID toko
 *     responses:
 *       200:
 *         description: Detail toko berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Toko'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id',
  requirePermission(PERMISSIONS.STORE_READ),
  TokoController.findStoreById
);

/**
 * @swagger
 * /api/toko/{id}/full-info:
 *   get:
 *     tags: [Toko]
 *     summary: Dapatkan informasi lengkap toko
 *     description: Mengambil informasi lengkap toko termasuk konfigurasi dan jam operasional
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID toko
 *     responses:
 *       200:
 *         description: Informasi lengkap toko berhasil diambil
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
 *                     store:
 *                       $ref: '#/components/schemas/Toko'
 *                     configs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TokoConfig'
 *                     operating_hours:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/OperatingHours'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id/full-info',
  requirePermission(PERMISSIONS.STORE_READ),
  TokoController.getStoreWithFullInfo
);

/**
 * @swagger
 * /api/toko/code/{kode}:
 *   get:
 *     tags: [Toko]
 *     summary: Dapatkan toko berdasarkan kode
 *     description: Mengambil detail toko berdasarkan kode
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kode
 *         required: true
 *         schema:
 *           type: string
 *         description: Kode toko
 *     responses:
 *       200:
 *         description: Detail toko berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Toko'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/code/:kode',
  requirePermission(PERMISSIONS.STORE_READ),
  TokoController.findStoreByCode
);

/**
 * @swagger
 * /api/toko:
 *   post:
 *     tags: [Toko]
 *     summary: Buat toko baru
 *     description: Membuat toko baru
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTokoRequest'
 *     responses:
 *       201:
 *         description: Toko berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Toko'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/',
  requirePermission(PERMISSIONS.STORE_CREATE),
  TokoController.createStore
);

/**
 * @swagger
 * /api/toko/{id}:
 *   put:
 *     tags: [Toko]
 *     summary: Update toko
 *     description: Mengupdate data toko
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID toko
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTokoRequest'
 *     responses:
 *       200:
 *         description: Toko berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Toko'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/:id',
  requirePermission(PERMISSIONS.STORE_UPDATE),
  TokoController.updateStore
);

/**
 * @swagger
 * /api/toko/{id}:
 *   delete:
 *     tags: [Toko]
 *     summary: Hapus toko
 *     description: Menghapus toko
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID toko
 *     responses:
 *       200:
 *         description: Toko berhasil dihapus
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
 *                   example: "Toko berhasil dihapus"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete('/:id',
  requirePermission(PERMISSIONS.STORE_DELETE),
  TokoController.deleteStore
);

/**
 * @swagger
 * /api/toko/{id}/configs:
 *   get:
 *     tags: [Toko]
 *     summary: Dapatkan konfigurasi toko
 *     description: Mengambil semua konfigurasi toko
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID toko
 *     responses:
 *       200:
 *         description: Konfigurasi toko berhasil diambil
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
 *                     $ref: '#/components/schemas/TokoConfig'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id/configs',
  requirePermission(PERMISSIONS.STORE_READ),
  TokoController.getStoreConfigs
);

/**
 * @swagger
 * /api/toko/{id}/configs/{key}:
 *   get:
 *     tags: [Toko]
 *     summary: Dapatkan konfigurasi toko berdasarkan key
 *     description: Mengambil konfigurasi toko berdasarkan key tertentu
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID toko
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Key konfigurasi
 *     responses:
 *       200:
 *         description: Konfigurasi toko berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TokoConfig'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id/configs/:key',
  requirePermission(PERMISSIONS.STORE_READ),
  TokoController.getStoreConfig
);

/**
 * @swagger
 * /api/toko/{id}/configs:
 *   post:
 *     tags: [Toko]
 *     summary: Set konfigurasi toko
 *     description: Menambahkan konfigurasi baru untuk toko
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID toko
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTokoConfigRequest'
 *     responses:
 *       201:
 *         description: Konfigurasi toko berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TokoConfig'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/:id/configs',
  requirePermission(PERMISSIONS.STORE_UPDATE),
  TokoController.setStoreConfig
);

/**
 * @swagger
 * /api/toko/{id}/configs/{key}:
 *   put:
 *     tags: [Toko]
 *     summary: Update konfigurasi toko
 *     description: Mengupdate konfigurasi toko berdasarkan key
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID toko
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Key konfigurasi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: string
 *                 description: Nilai konfigurasi baru
 *               description:
 *                 type: string
 *                 description: Deskripsi konfigurasi
 *     responses:
 *       200:
 *         description: Konfigurasi toko berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TokoConfig'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/:id/configs/:key',
  requirePermission(PERMISSIONS.STORE_UPDATE),
  TokoController.updateStoreConfig
);

/**
 * @swagger
 * /api/toko/{id}/configs/{key}:
 *   delete:
 *     tags: [Toko]
 *     summary: Hapus konfigurasi toko
 *     description: Menghapus konfigurasi toko berdasarkan key
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID toko
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Key konfigurasi
 *     responses:
 *       200:
 *         description: Konfigurasi toko berhasil dihapus
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
 *                   example: "Konfigurasi berhasil dihapus"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete('/:id/configs/:key',
  requirePermission(PERMISSIONS.STORE_DELETE),
  TokoController.deleteStoreConfig
);

/**
 * @swagger
 * /api/toko/{id}/operating-hours:
 *   get:
 *     tags: [Toko]
 *     summary: Dapatkan jam operasional toko
 *     description: Mengambil jam operasional toko
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID toko
 *     responses:
 *       200:
 *         description: Jam operasional toko berhasil diambil
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
 *                     $ref: '#/components/schemas/OperatingHours'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id/operating-hours',
  requirePermission(PERMISSIONS.STORE_READ),
  TokoController.getOperatingHours
);

/**
 * @swagger
 * /api/toko/{id}/operating-hours:
 *   put:
 *     tags: [Toko]
 *     summary: Update jam operasional toko
 *     description: Mengupdate jam operasional toko
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID toko
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/OperatingHours'
 *     responses:
 *       200:
 *         description: Jam operasional toko berhasil diupdate
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
 *                     $ref: '#/components/schemas/OperatingHours'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/:id/operating-hours',
  requirePermission(PERMISSIONS.STORE_UPDATE),
  TokoController.updateOperatingHours
);

/**
 * @swagger
 * /api/toko/{id}/stats:
 *   get:
 *     tags: [Toko]
 *     summary: Dapatkan statistik toko
 *     description: Mengambil statistik toko
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID toko
 *     responses:
 *       200:
 *         description: Statistik toko berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TokoStats'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id/stats',
  requirePermission(PERMISSIONS.STORE_READ),
  TokoController.getStoreStats
);

export default router;