/**
 * Session Routes
 * User session management routes with proper access control
 * 
 * @swagger
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID sesi
 *         user_id:
 *           type: string
 *           description: ID pengguna
 *         token:
 *           type: string
 *           description: Token sesi
 *         refresh_token:
 *           type: string
 *           description: Token refresh
 *         expires_at:
 *           type: string
 *           format: date-time
 *           description: Waktu kedaluwarsa
 *         last_activity:
 *           type: string
 *           format: date-time
 *           description: Aktivitas terakhir
 *         ip_address:
 *           type: string
 *           description: Alamat IP
 *         user_agent:
 *           type: string
 *           description: User agent
 *         is_active:
 *           type: boolean
 *           description: Status aktif
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 * 
 *     RefreshTokenRequest:
 *       type: object
 *       required:
 *         - refresh_token
 *       properties:
 *         refresh_token:
 *           type: string
 *           description: Token refresh untuk memperbarui sesi
 * 
 *     ExtendSessionRequest:
 *       type: object
 *       properties:
 *         additional_hours:
 *           type: number
 *           minimum: 1
 *           maximum: 24
 *           default: 1
 *           description: Jam tambahan untuk memperpanjang sesi
 * 
 *     SessionStats:
 *       type: object
 *       properties:
 *         total_active_sessions:
 *           type: number
 *           description: Total sesi aktif
 *         total_users_online:
 *           type: number
 *           description: Total pengguna online
 *         sessions_by_hour:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               hour:
 *                 type: string
 *               count:
 *                 type: number
 *         sessions_by_device:
 *           type: object
 *           properties:
 *             desktop:
 *               type: number
 *             mobile:
 *               type: number
 *             tablet:
 *               type: number
 * 
 *     RefreshTokenResponse:
 *       type: object
 *       properties:
 *         access_token:
 *           type: string
 *           description: Token akses baru
 *         refresh_token:
 *           type: string
 *           description: Token refresh baru
 *         expires_in:
 *           type: number
 *           description: Waktu kedaluwarsa dalam detik
 */

import { Router } from 'express';
import { authenticate } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { SessionController } from '../controllers/SessionController';
import { requireMinimumLevel } from '@/features/auth/middleware/peranValidationMiddleware';

const router = Router();

/**
 * @swagger
 * /api/session/refresh:
 *   post:
 *     summary: Refresh token sesi
 *     description: Memperbarui token akses menggunakan refresh token
 *     tags: [Session]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Token berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RefreshTokenResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
// Public routes (no authentication needed)
router.post('/refresh', SessionController.refreshSession);

// Protected routes
router.use(authenticate);
router.use(attachAccessScope);

/**
 * @swagger
 * /api/session/my-sessions:
 *   get:
 *     summary: Ambil sesi pengguna sendiri
 *     description: Mengambil daftar sesi aktif milik pengguna yang sedang login
 *     tags: [Session]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar sesi berhasil diambil
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
 *                     $ref: '#/components/schemas/Session'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
// User's own session management
router.get('/my-sessions', SessionController.getMySessions);

/**
 * @swagger
 * /api/session/extend:
 *   post:
 *     summary: Perpanjang sesi
 *     description: Memperpanjang waktu kedaluwarsa sesi aktif
 *     tags: [Session]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExtendSessionRequest'
 *     responses:
 *       200:
 *         description: Sesi berhasil diperpanjang
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Session'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/extend', SessionController.extendSession);

/**
 * @swagger
 * /api/session/logout:
 *   post:
 *     summary: Logout sesi saat ini
 *     description: Mengakhiri sesi yang sedang aktif
 *     tags: [Session]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/logout', SessionController.logoutCurrentSession);

/**
 * @swagger
 * /api/session/logout-all:
 *   post:
 *     summary: Logout semua sesi
 *     description: Mengakhiri semua sesi aktif pengguna
 *     tags: [Session]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Semua sesi berhasil diakhiri
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/logout-all', SessionController.logoutAllSessions);

/**
 * @swagger
 * /api/session/logout-others:
 *   post:
 *     summary: Logout sesi lain
 *     description: Mengakhiri semua sesi aktif kecuali sesi saat ini
 *     tags: [Session]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesi lain berhasil diakhiri
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/logout-others', SessionController.logoutOtherSessions);

/**
 * @swagger
 * /api/session:
 *   get:
 *     summary: Cari sesi (Admin)
 *     description: Mencari dan memfilter sesi dengan pagination (hanya admin)
 *     tags: [Session]
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
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter berdasarkan status aktif
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID pengguna
 *     responses:
 *       200:
 *         description: Daftar sesi berhasil diambil
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
 *                     $ref: '#/components/schemas/Session'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
// Admin routes - require minimum level 2 (admin)
router.get('/', requireMinimumLevel(2), SessionController.search);

/**
 * @swagger
 * /api/session/stats:
 *   get:
 *     summary: Ambil statistik sesi (Admin)
 *     description: Mengambil statistik sesi dan pengguna online (hanya admin)
 *     tags: [Session]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistik sesi berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SessionStats'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/stats', requireMinimumLevel(2), SessionController.getSessionStats);

export default router;