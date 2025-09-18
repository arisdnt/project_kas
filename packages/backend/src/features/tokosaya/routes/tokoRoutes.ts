/**
 * Routes untuk endpoint Toko Saya
 * Mengelola routing untuk fitur toko milik user yang login
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TokoSaya:
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
 *     TokoSayaStats:
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
 *         last_transaction:
 *           type: string
 *           format: date-time
 *           description: Waktu transaksi terakhir
 *     HealthCheckToko:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [healthy, unhealthy]
 *           description: Status kesehatan sistem
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Waktu pengecekan
 *         uptime:
 *           type: number
 *           description: Waktu aktif sistem dalam detik
 *         version:
 *           type: string
 *           description: Versi aplikasi
 */

import { Router } from 'express';
import { TokoController } from '../controllers/TokoController';
import { authenticate } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

/**
 * @swagger
 * /api/tokosaya:
 *   get:
 *     tags: [Toko Saya]
 *     summary: Dapatkan data toko saya
 *     description: Mengambil data toko milik user yang sedang login
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter berdasarkan status toko
 *       - in: query
 *         name: nama
 *         schema:
 *           type: string
 *         description: Filter berdasarkan nama toko
 *       - in: query
 *         name: kode
 *         schema:
 *           type: string
 *         description: Filter berdasarkan kode toko
 *     responses:
 *       200:
 *         description: Data toko berhasil diambil
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
 *                     $ref: '#/components/schemas/TokoSaya'
 *                 message:
 *                   type: string
 *                   example: "Data toko berhasil diambil"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/', TokoController.getTokoSaya);

/**
 * @swagger
 * /api/tokosaya/stats:
 *   get:
 *     tags: [Toko Saya]
 *     summary: Dapatkan statistik toko saya
 *     description: Mengambil statistik toko milik user yang sedang login
 *     security:
 *       - bearerAuth: []
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
 *                   $ref: '#/components/schemas/TokoSayaStats'
 *                 message:
 *                   type: string
 *                   example: "Statistik toko berhasil diambil"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/stats', TokoController.getTokoStats);

/**
 * @swagger
 * /api/tokosaya/health:
 *   get:
 *     tags: [Toko Saya]
 *     summary: Health check toko saya
 *     description: Melakukan pengecekan kesehatan sistem untuk endpoint tokosaya
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
 *                   $ref: '#/components/schemas/HealthCheckToko'
 *                 message:
 *                   type: string
 *                   example: "Health check berhasil"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/health', TokoController.healthCheck);

/**
 * @swagger
 * /api/tokosaya/{id}:
 *   get:
 *     tags: [Toko Saya]
 *     summary: Dapatkan toko berdasarkan ID
 *     description: Mengambil data toko berdasarkan ID dengan validasi akses
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
 *                   $ref: '#/components/schemas/TokoSaya'
 *                 message:
 *                   type: string
 *                   example: "Data toko berhasil diambil"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/:id', TokoController.getTokoById);

export default router;