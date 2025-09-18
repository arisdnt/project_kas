/**
 * User Routes untuk Pengaturan Saya
 * Routes untuk mengelola data user yang sedang login
 * 
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID user
 *         username:
 *           type: string
 *           description: Username user
 *         email:
 *           type: string
 *           format: email
 *           description: Email user
 *         nama:
 *           type: string
 *           description: Nama lengkap user
 *         telepon:
 *           type: string
 *           description: Nomor telepon user
 *         alamat:
 *           type: string
 *           description: Alamat user
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           description: Status user
 *         peran:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: ID peran
 *             nama:
 *               type: string
 *               description: Nama peran
 *         tenant:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: ID tenant
 *             nama:
 *               type: string
 *               description: Nama tenant
 *         toko:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: ID toko
 *             nama:
 *               type: string
 *               description: Nama toko
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Tanggal dibuat
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Tanggal diperbarui
 *     
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *         - confirmPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           format: password
 *           description: Password saat ini
 *         newPassword:
 *           type: string
 *           format: password
 *           minLength: 8
 *           description: Password baru (minimal 8 karakter)
 *         confirmPassword:
 *           type: string
 *           format: password
 *           description: Konfirmasi password baru
 */

import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate, userRateLimit } from '@/features/auth/middleware/authMiddleware';

const router = Router();

// Rate limiting untuk user endpoints
const userRateLimit5 = userRateLimit(50, 15 * 60 * 1000); // 50 requests per 15 minutes
const passwordRateLimit = userRateLimit(10, 15 * 60 * 1000); // 10 password change attempts per 15 minutes

/**
 * @swagger
 * /api/pengaturansaya/profile:
 *   get:
 *     summary: Mendapatkan profil user yang sedang login
 *     description: Mengambil data lengkap profil user yang sedang terautentikasi
 *     tags: [Pengaturan Saya]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data profil user berhasil diambil
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
 *                   example: "Data user berhasil diambil"
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Tidak terautentikasi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *                 message:
 *                   type: string
 *                   example: "User tidak terautentikasi"
 *       404:
 *         description: Data user tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Not Found"
 *                 message:
 *                   type: string
 *                   example: "Data user tidak ditemukan"
 *       429:
 *         description: Terlalu banyak permintaan
 *       500:
 *         description: Kesalahan server internal
 */
router.get('/profile', 
  authenticate, 
  userRateLimit5,
  UserController.getCurrentUser
);

/**
 * @swagger
 * /api/pengaturansaya/change-password:
 *   post:
 *     summary: Mengubah password user
 *     description: Mengubah password user yang sedang terautentikasi
 *     tags: [Pengaturan Saya]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *           example:
 *             currentPassword: "password123"
 *             newPassword: "newpassword123"
 *             confirmPassword: "newpassword123"
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
 *                   example: "Password berhasil diubah"
 *       400:
 *         description: Data tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Bad Request"
 *                 message:
 *                   type: string
 *                   example: "Password saat ini tidak sesuai"
 *       401:
 *         description: Tidak terautentikasi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *                 message:
 *                   type: string
 *                   example: "User tidak terautentikasi"
 *       429:
 *         description: Terlalu banyak percobaan ubah password
 *       500:
 *         description: Kesalahan server internal
 */
router.post('/change-password', 
  authenticate, 
  passwordRateLimit,
  UserController.changePassword
);

export default router;