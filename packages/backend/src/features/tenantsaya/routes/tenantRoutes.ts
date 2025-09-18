/**
 * Tenant Routes untuk Tenantsaya
 * Routes untuk mengelola data tenant user yang sedang login
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TenantSaya:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID unik tenant
 *         nama:
 *           type: string
 *           description: Nama tenant
 *         email:
 *           type: string
 *           format: email
 *           description: Email tenant
 *         telepon:
 *           type: string
 *           description: Nomor telepon
 *         alamat:
 *           type: string
 *           description: Alamat lengkap
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           description: Status tenant
 *         subscription_plan:
 *           type: string
 *           description: Paket berlangganan
 *         subscription_expires:
 *           type: string
 *           format: date-time
 *           description: Tanggal berakhir berlangganan
 *         max_users:
 *           type: number
 *           description: Maksimal pengguna
 *         max_stores:
 *           type: number
 *           description: Maksimal toko
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     TenantSayaStats:
 *       type: object
 *       properties:
 *         total_users:
 *           type: number
 *           description: Total pengguna
 *         active_users:
 *           type: number
 *           description: Pengguna aktif
 *         total_stores:
 *           type: number
 *           description: Total toko
 *         active_stores:
 *           type: number
 *           description: Toko aktif
 *         total_products:
 *           type: number
 *           description: Total produk
 *         total_transactions:
 *           type: number
 *           description: Total transaksi
 *         monthly_revenue:
 *           type: number
 *           description: Pendapatan bulanan
 *         storage_used:
 *           type: number
 *           description: Penyimpanan yang digunakan (MB)
 *         storage_limit:
 *           type: number
 *           description: Batas penyimpanan (MB)
 *     HealthCheck:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [healthy, degraded, unhealthy]
 *           description: Status kesehatan
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Waktu pengecekan
 *         tenant_id:
 *           type: string
 *           format: uuid
 *           description: ID tenant
 *         services:
 *           type: object
 *           properties:
 *             database:
 *               type: string
 *               enum: [up, down]
 *             storage:
 *               type: string
 *               enum: [up, down]
 *             cache:
 *               type: string
 *               enum: [up, down]
 */

import { Router } from 'express';
import { authenticate } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { TenantController } from '../controllers/TenantController';

const router = Router();

// Apply authentication middleware terlebih dahulu
router.use(authenticate);
// Kemudian apply access scope middleware
router.use(attachAccessScope);

/**
 * @swagger
 * /api/tenantsaya:
 *   get:
 *     tags: [Tenant Saya]
 *     summary: Dapatkan data tenant saya
 *     description: Mengambil data tenant untuk user yang sedang login
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data tenant berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TenantSaya'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/', TenantController.getTenantSaya);

/**
 * @swagger
 * /api/tenantsaya/stats:
 *   get:
 *     tags: [Tenant Saya]
 *     summary: Dapatkan statistik tenant saya
 *     description: Mengambil statistik tenant untuk user yang sedang login
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistik tenant berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TenantSayaStats'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/stats', TenantController.getTenantStats);

/**
 * @swagger
 * /api/tenantsaya/health:
 *   get:
 *     tags: [Tenant Saya]
 *     summary: Health check tenant
 *     description: Melakukan pengecekan kesehatan sistem tenant
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Health check berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/HealthCheck'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       503:
 *         description: Service unavailable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Service tidak tersedia"
 */
router.get('/health', TenantController.healthCheck);

export default router;