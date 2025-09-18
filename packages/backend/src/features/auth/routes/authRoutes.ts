/**
 * Authentication Routes
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate, authorize, userRateLimit } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';

const router = Router();

// Rate limiting untuk auth endpoints
const authRateLimit = userRateLimit(5, 15 * 60 * 1000); // 5 requests per 15 minutes
const loginRateLimit = userRateLimit(3, 15 * 60 * 1000); // 3 login attempts per 15 minutes

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - tenantId
 *       properties:
 *         username:
 *           type: string
 *           description: Username pengguna
 *           example: admin
 *         password:
 *           type: string
 *           description: Password pengguna
 *           example: admin123
 *         tenantId:
 *           type: string
 *           format: uuid
 *           description: ID tenant
 *           example: 7f69ce68-9068-11f0-8eff-00155d24a169
 *     
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - email
 *         - role
 *       properties:
 *         username:
 *           type: string
 *           description: Username pengguna baru
 *           example: user123
 *         password:
 *           type: string
 *           description: Password pengguna baru
 *           example: password123
 *         email:
 *           type: string
 *           format: email
 *           description: Email pengguna
 *           example: user@example.com
 *         role:
 *           type: string
 *           enum: [KASIR, ADMIN, SUPER_ADMIN]
 *           description: Role pengguna
 *           example: KASIR
 *         nama:
 *           type: string
 *           description: Nama lengkap pengguna
 *           example: John Doe
 *     
 *     RefreshTokenRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: JWT refresh token
 *     
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           description: Password saat ini
 *         newPassword:
 *           type: string
 *           description: Password baru
 *     
 *     VerifyTokenRequest:
 *       type: object
 *       required:
 *         - token
 *       properties:
 *         token:
 *           type: string
 *           description: JWT token untuk diverifikasi
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Login successful
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 nama:
 *                   type: string
 *                 tenant_id:
 *                   type: string
 *                   format: uuid
 *             accessToken:
 *               type: string
 *               description: JWT access token
 *             refreshToken:
 *               type: string
 *               description: JWT refresh token
 *     
 *     UserProfile:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             username:
 *               type: string
 *             email:
 *               type: string
 *             role:
 *               type: string
 *             nama:
 *               type: string
 *             tenant_id:
 *               type: string
 *               format: uuid
 *             created_at:
 *               type: string
 *               format: date-time
 *             updated_at:
 *               type: string
 *               format: date-time
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           description: Pesan error
 *         error:
 *           type: string
 *           description: Detail error
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login pengguna
 *     description: Melakukan autentikasi pengguna dan mengembalikan access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Data request tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Kredensial tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Akses tenant tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Terlalu banyak percobaan login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', loginRateLimit, AuthController.login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrasi pengguna baru
 *     description: Mendaftarkan pengguna baru (hanya admin dan super admin)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Pengguna berhasil didaftarkan
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
 *                   example: User registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         username:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                         nama:
 *                           type: string
 *       400:
 *         description: Data request tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Tidak terautentikasi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Tidak memiliki hak akses (hanya admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Username atau email sudah digunakan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', 
  authenticate, 
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AuthController.register
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Memperbarui access token menggunakan refresh token
 *     tags: [Authentication]
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Token refreshed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token baru
 *                     refreshToken:
 *                       type: string
 *                       description: JWT refresh token baru
 *       400:
 *         description: Refresh token tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Refresh token expired atau tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Terlalu banyak permintaan refresh
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/refresh', authRateLimit, AuthController.refreshToken);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Mendapatkan profil pengguna
 *     description: Mengambil informasi profil pengguna yang sedang login
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil pengguna berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Tidak terautentikasi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Pengguna tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/profile', authenticate, AuthController.getProfile);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout pengguna
 *     description: Mengeluarkan pengguna dari sistem dan menghapus refresh token
 *     tags: [Authentication]
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logout successful
 *       401:
 *         description: Tidak terautentikasi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Mengubah password pengguna
 *     description: Mengubah password pengguna yang sedang login
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password berhasil diubah
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
 *                   example: Password changed successfully
 *       400:
 *         description: Data request tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Password saat ini tidak benar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Terlalu banyak percobaan ubah password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/change-password', 
  authenticate, 
  authRateLimit,
  AuthController.changePassword
);

/**
 * @swagger
 * /api/auth/verify-token:
 *   post:
 *     summary: Verifikasi JWT token
 *     description: Memverifikasi validitas JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyTokenRequest'
 *     responses:
 *       200:
 *         description: Token valid
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
 *                   example: Token is valid
 *                 data:
 *                   type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                       example: true
 *                     user:
 *                       type: object
 *                       description: Data pengguna dari token
 *       400:
 *         description: Token tidak disediakan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token tidak valid atau expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/verify-token', AuthController.verifyToken);

export default router;