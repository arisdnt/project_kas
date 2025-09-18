/**
 * Configuration Routes
 * System configuration management routes with proper access control
 * 
 * @swagger
 * components:
 *   schemas:
 *     Configuration:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID konfigurasi
 *         tenant_id:
 *           type: string
 *           format: uuid
 *           description: ID tenant
 *         store_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID toko (null untuk konfigurasi tenant)
 *         key:
 *           type: string
 *           description: Kunci konfigurasi
 *         value:
 *           type: string
 *           description: Nilai konfigurasi
 *         description:
 *           type: string
 *           nullable: true
 *           description: Deskripsi konfigurasi
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Waktu dibuat
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Waktu diperbarui
 *     
 *     UpdateConfigurationRequest:
 *       type: object
 *       properties:
 *         configurations:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 description: Kunci konfigurasi
 *               value:
 *                 type: string
 *                 description: Nilai konfigurasi
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Deskripsi konfigurasi
 *             required:
 *               - key
 *               - value
 *       required:
 *         - configurations
 *     
 *     TaxCalculationRequest:
 *       type: object
 *       properties:
 *         amount:
 *           type: number
 *           minimum: 0
 *           description: Jumlah yang akan dihitung pajaknya
 *         store_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID toko untuk perhitungan pajak spesifik
 *       required:
 *         - amount
 *     
 *     TaxCalculationResponse:
 *       type: object
 *       properties:
 *         amount:
 *           type: number
 *           description: Jumlah asli
 *         tax_rate:
 *           type: number
 *           description: Persentase pajak
 *         tax_amount:
 *           type: number
 *           description: Jumlah pajak
 *         total_amount:
 *           type: number
 *           description: Total termasuk pajak
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { KonfigurasiController } from '../controllers/KonfigurasiController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

/**
 * @swagger
 * /api/konfigurasi:
 *   get:
 *     summary: Mendapatkan semua konfigurasi
 *     description: Mengambil semua konfigurasi yang tersedia untuk tenant
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan konfigurasi
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
 *                     $ref: '#/components/schemas/Configuration'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Konfigurasi tidak ditemukan
 *       500:
 *         description: Kesalahan server internal
 */
// Configuration read routes
router.get('/',
  requirePermission(PERMISSIONS.SETTINGS_READ),
  KonfigurasiController.getConfiguration
);

/**
 * @swagger
 * /api/konfigurasi/tenant:
 *   get:
 *     summary: Mendapatkan konfigurasi tenant
 *     description: Mengambil konfigurasi khusus untuk tenant
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan konfigurasi tenant
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
 *                     $ref: '#/components/schemas/Configuration'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       500:
 *         description: Kesalahan server internal
 */
router.get('/tenant',
  requirePermission(PERMISSIONS.SETTINGS_READ),
  KonfigurasiController.getTenantConfiguration
);

/**
 * @swagger
 * /api/konfigurasi/stores:
 *   get:
 *     summary: Mendapatkan konfigurasi semua toko
 *     description: Mengambil konfigurasi untuk semua toko (hanya admin)
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan konfigurasi semua toko
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
 *                     $ref: '#/components/schemas/Configuration'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       500:
 *         description: Kesalahan server internal
 */
router.get('/stores',
  requirePermission(PERMISSIONS.SETTINGS_READ),
  KonfigurasiController.getAllStoreConfigurations
);

/**
 * @swagger
 * /api/konfigurasi/effective:
 *   get:
 *     summary: Mendapatkan konfigurasi efektif
 *     description: Mengambil konfigurasi yang berlaku dengan prioritas toko > tenant
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID toko untuk konfigurasi spesifik
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan konfigurasi efektif
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
 *                     $ref: '#/components/schemas/Configuration'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       500:
 *         description: Kesalahan server internal
 */
router.get('/effective',
  requirePermission(PERMISSIONS.SETTINGS_READ),
  KonfigurasiController.getEffectiveConfiguration
);

/**
 * @swagger
 * /api/konfigurasi/store/{storeId}:
 *   get:
 *     summary: Mendapatkan konfigurasi toko
 *     description: Mengambil konfigurasi khusus untuk toko tertentu
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID toko
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan konfigurasi toko
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
 *                     $ref: '#/components/schemas/Configuration'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       500:
 *         description: Kesalahan server internal
 */
router.get('/store/:storeId',
  requirePermission(PERMISSIONS.SETTINGS_READ),
  KonfigurasiController.getStoreConfiguration
);

/**
 * @swagger
 * /api/konfigurasi/tenant:
 *   put:
 *     summary: Memperbarui konfigurasi tenant
 *     description: Memperbarui konfigurasi untuk tenant
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateConfigurationRequest'
 *     responses:
 *       200:
 *         description: Berhasil memperbarui konfigurasi tenant
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
 *                   example: "Konfigurasi tenant berhasil diperbarui"
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       500:
 *         description: Kesalahan server internal
 */
// Configuration update routes
router.put('/tenant',
  requirePermission(PERMISSIONS.SETTINGS_UPDATE),
  KonfigurasiController.updateTenantConfiguration
);

/**
 * @swagger
 * /api/konfigurasi/store/{storeId}:
 *   put:
 *     summary: Memperbarui konfigurasi toko
 *     description: Memperbarui konfigurasi untuk toko tertentu
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
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
 *             $ref: '#/components/schemas/UpdateConfigurationRequest'
 *     responses:
 *       200:
 *         description: Berhasil memperbarui konfigurasi toko
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
 *                   example: "Konfigurasi toko berhasil diperbarui"
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       500:
 *         description: Kesalahan server internal
 */
router.put('/store/:storeId',
  requirePermission(PERMISSIONS.SETTINGS_UPDATE),
  KonfigurasiController.updateStoreConfiguration
);

/**
 * @swagger
 * /api/konfigurasi/calculate-tax:
 *   post:
 *     summary: Menghitung pajak
 *     description: Menghitung pajak berdasarkan jumlah dan konfigurasi toko
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaxCalculationRequest'
 *     responses:
 *       200:
 *         description: Berhasil menghitung pajak
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TaxCalculationResponse'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       500:
 *         description: Kesalahan server internal
 */
router.post('/calculate-tax',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  KonfigurasiController.calculateTax
);

export default router;