/**
 * Profile Routes
 * Routes for user profile and settings management operations
 * 
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID pengguna
 *         username:
 *           type: string
 *           description: Username pengguna
 *         email:
 *           type: string
 *           format: email
 *           description: Email pengguna
 *         namaLengkap:
 *           type: string
 *           description: Nama lengkap pengguna
 *         noTelepon:
 *           type: string
 *           description: Nomor telepon
 *         alamat:
 *           type: string
 *           description: Alamat pengguna
 *         avatar:
 *           type: string
 *           description: URL avatar pengguna
 *         role:
 *           type: string
 *           description: Role pengguna
 *         isAktif:
 *           type: boolean
 *           description: Status aktif pengguna
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Tanggal dibuat
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Tanggal diperbarui
 *     
 *     UpdateProfileRequest:
 *       type: object
 *       properties:
 *         namaLengkap:
 *           type: string
 *           description: Nama lengkap pengguna
 *         email:
 *           type: string
 *           format: email
 *           description: Email pengguna
 *         noTelepon:
 *           type: string
 *           description: Nomor telepon
 *         alamat:
 *           type: string
 *           description: Alamat pengguna
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
 *           minLength: 6
 *           description: Password baru
 *     
 *     UpdateAvatarRequest:
 *       type: object
 *       required:
 *         - avatar_url
 *       properties:
 *         avatar_url:
 *           type: string
 *           format: uri
 *           description: URL avatar baru
 *     
 *     UserSettings:
 *       type: object
 *       properties:
 *         theme:
 *           type: string
 *           enum: [light, dark]
 *           description: Tema aplikasi
 *         language:
 *           type: string
 *           description: Bahasa aplikasi
 *         notifications:
 *           type: object
 *           properties:
 *             email:
 *               type: boolean
 *               description: Notifikasi email
 *             push:
 *               type: boolean
 *               description: Notifikasi push
 *             sms:
 *               type: boolean
 *               description: Notifikasi SMS
 *         timezone:
 *           type: string
 *           description: Zona waktu
 *     
 *     PerformanceStats:
 *       type: object
 *       properties:
 *         totalSales:
 *           type: number
 *           description: Total penjualan
 *         totalTransactions:
 *           type: integer
 *           description: Total transaksi
 *         averageTransactionValue:
 *           type: number
 *           description: Rata-rata nilai transaksi
 *         topProducts:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               revenue:
 *                 type: number
 *         monthlyGrowth:
 *           type: number
 *           description: Pertumbuhan bulanan (%)
 *     
 *     ActivityLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID aktivitas
 *         action:
 *           type: string
 *           description: Jenis aktivitas
 *         description:
 *           type: string
 *           description: Deskripsi aktivitas
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Waktu aktivitas
 *         metadata:
 *           type: object
 *           description: Data tambahan aktivitas
 *     
 *     SalesReport:
 *       type: object
 *       properties:
 *         period:
 *           type: string
 *           description: Periode laporan
 *         totalRevenue:
 *           type: number
 *           description: Total pendapatan
 *         totalTransactions:
 *           type: integer
 *           description: Total transaksi
 *         averageOrderValue:
 *           type: number
 *           description: Rata-rata nilai pesanan
 *         topProducts:
 *           type: array
 *           items:
 *             type: object
 *         dailyBreakdown:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               revenue:
 *                 type: number
 *               transactions:
 *                 type: integer
 *     
 *     ProfileDashboard:
 *       type: object
 *       properties:
 *         todayStats:
 *           type: object
 *           properties:
 *             sales:
 *               type: number
 *             transactions:
 *               type: integer
 *             customers:
 *               type: integer
 *         weeklyStats:
 *           type: object
 *         monthlyStats:
 *           type: object
 *         recentActivities:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ActivityLog'
 *         upcomingTasks:
 *           type: array
 *           items:
 *             type: object
 */

import { Router } from 'express';
import { ProfileController } from '../controllers/ProfileController';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';

const router = Router();

// Apply authentication and access scope to all routes
router.use(authenticate);
router.use(attachAccessScope);

/**
 * @swagger
 * /api/profile/me:
 *   get:
 *     summary: Mengambil profil saya
 *     description: Mengambil informasi profil pengguna yang sedang login
 *     tags: [Profile - Self Service]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Tidak terautentikasi
 */
// My profile routes (self-service)
router.get('/me', ProfileController.getMyProfile);

/**
 * @swagger
 * /api/profile/me:
 *   put:
 *     summary: Memperbarui profil saya
 *     description: Memperbarui informasi profil pengguna yang sedang login
 *     tags: [Profile - Self Service]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Profil berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 */
router.put('/me', ProfileController.updateMyProfile);

/**
 * @swagger
 * /api/profile/me/password:
 *   put:
 *     summary: Mengubah password saya
 *     description: Mengubah password pengguna yang sedang login
 *     tags: [Profile - Self Service]
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
 *                   example: "Password berhasil diubah"
 *       400:
 *         description: Data tidak valid atau password lama salah
 *       401:
 *         description: Tidak terautentikasi
 */
router.put('/me/password', ProfileController.changeMyPassword);

/**
 * @swagger
 * /api/profile/me/avatar:
 *   put:
 *     summary: Memperbarui avatar saya
 *     description: Memperbarui foto avatar pengguna yang sedang login
 *     tags: [Profile - Self Service]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAvatarRequest'
 *     responses:
 *       200:
 *         description: Avatar berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 */
router.put('/me/avatar', ProfileController.updateMyAvatar);

/**
 * @swagger
 * /api/profile/me:
 *   delete:
 *     summary: Menghapus akun saya
 *     description: Menghapus akun pengguna yang sedang login
 *     tags: [Profile - Self Service]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Akun berhasil dihapus
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
 *                   example: "Akun berhasil dihapus"
 *       401:
 *         description: Tidak terautentikasi
 */
router.delete('/me', ProfileController.deleteMyAccount);

/**
 * @swagger
 * /api/profile/me/performance:
 *   get:
 *     summary: Statistik performa saya
 *     description: Mengambil statistik performa penjualan pengguna yang sedang login
 *     tags: [Profile - Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly]
 *           default: monthly
 *         description: Periode statistik
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal mulai
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal akhir
 *     responses:
 *       200:
 *         description: Statistik performa berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PerformanceStats'
 *       401:
 *         description: Tidak terautentikasi
 */
// My performance and analytics routes
router.get('/me/performance', ProfileController.getMyPerformanceStats);

/**
 * @swagger
 * /api/profile/me/activity:
 *   get:
 *     summary: Log aktivitas saya
 *     description: Mengambil riwayat aktivitas pengguna yang sedang login
 *     tags: [Profile - Analytics]
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
 *           default: 20
 *         description: Jumlah item per halaman
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter berdasarkan jenis aktivitas
 *     responses:
 *       200:
 *         description: Log aktivitas berhasil diambil
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
 *                     $ref: '#/components/schemas/ActivityLog'
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
 *       401:
 *         description: Tidak terautentikasi
 */
router.get('/me/activity', ProfileController.getMyActivityLogs);

/**
 * @swagger
 * /api/profile/me/sales-report:
 *   get:
 *     summary: Laporan penjualan saya
 *     description: Mengambil laporan penjualan pengguna yang sedang login
 *     tags: [Profile - Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly]
 *           default: monthly
 *         description: Periode laporan
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal mulai
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal akhir
 *     responses:
 *       200:
 *         description: Laporan penjualan berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SalesReport'
 *       401:
 *         description: Tidak terautentikasi
 */
router.get('/me/sales-report', ProfileController.getMySalesReport);

/**
 * @swagger
 * /api/profile/me/settings:
 *   get:
 *     summary: Pengaturan saya
 *     description: Mengambil pengaturan pengguna yang sedang login
 *     tags: [Profile - Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pengaturan berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserSettings'
 *       401:
 *         description: Tidak terautentikasi
 */
// My settings routes
router.get('/me/settings', ProfileController.getMySettings);

/**
 * @swagger
 * /api/profile/me/settings:
 *   put:
 *     summary: Memperbarui pengaturan saya
 *     description: Memperbarui pengaturan pengguna yang sedang login
 *     tags: [Profile - Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserSettings'
 *     responses:
 *       200:
 *         description: Pengaturan berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserSettings'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 */
router.put('/me/settings', ProfileController.updateMySettings);

/**
 * @swagger
 * /api/profile/me/dashboard:
 *   get:
 *     summary: Dashboard profil saya
 *     description: Mengambil data dashboard untuk pengguna yang sedang login
 *     tags: [Profile - Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data dashboard berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ProfileDashboard'
 *       401:
 *         description: Tidak terautentikasi
 */
// Dashboard route
router.get('/me/dashboard', ProfileController.getProfileDashboard);

/**
 * @swagger
 * /api/profile/me/team-comparison:
 *   get:
 *     summary: Perbandingan performa tim
 *     description: Mengambil perbandingan performa dengan anggota tim lain (memerlukan izin manager)
 *     tags: [Profile - Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly]
 *           default: monthly
 *         description: Periode perbandingan
 *     responses:
 *       200:
 *         description: Perbandingan performa tim berhasil diambil
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
 *                     myStats:
 *                       $ref: '#/components/schemas/PerformanceStats'
 *                     teamStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                           username:
 *                             type: string
 *                           stats:
 *                             $ref: '#/components/schemas/PerformanceStats'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 */
// Team performance comparison (requires manager role or higher)
router.get('/me/team-comparison', requirePermission(PERMISSIONS.USER_READ), ProfileController.getTeamPerformanceComparison);

/**
 * @swagger
 * /api/profile/users/{userId}:
 *   get:
 *     summary: Mengambil profil pengguna lain
 *     description: Mengambil informasi profil pengguna berdasarkan ID (memerlukan izin admin)
 *     tags: [Profile - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID pengguna
 *     responses:
 *       200:
 *         description: Profil pengguna berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Pengguna tidak ditemukan
 */
// Admin routes for managing other users (requires admin role or higher)
router.get('/users/:userId', requirePermission(PERMISSIONS.USER_READ), ProfileController.getUserProfile);

/**
 * @swagger
 * /api/profile/users/{userId}:
 *   put:
 *     summary: Memperbarui profil pengguna lain
 *     description: Memperbarui informasi profil pengguna berdasarkan ID (memerlukan izin admin)
 *     tags: [Profile - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID pengguna
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Profil pengguna berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Pengguna tidak ditemukan
 */
router.put('/users/:userId', requirePermission(PERMISSIONS.USER_UPDATE), ProfileController.updateUserProfile);

/**
 * @swagger
 * /api/profile/users/{userId}/password:
 *   put:
 *     summary: Mengubah password pengguna lain
 *     description: Mengubah password pengguna berdasarkan ID (memerlukan izin admin)
 *     tags: [Profile - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID pengguna
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: Password baru
 *     responses:
 *       200:
 *         description: Password pengguna berhasil diubah
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
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Pengguna tidak ditemukan
 */
router.put('/users/:userId/password', requirePermission(PERMISSIONS.USER_UPDATE), ProfileController.changeUserPassword);

/**
 * @swagger
 * /api/profile/users/{userId}:
 *   delete:
 *     summary: Menghapus akun pengguna lain
 *     description: Menghapus akun pengguna berdasarkan ID (memerlukan izin admin)
 *     tags: [Profile - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID pengguna
 *     responses:
 *       200:
 *         description: Akun pengguna berhasil dihapus
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
 *                   example: "Akun berhasil dihapus"
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Pengguna tidak ditemukan
 */
router.delete('/users/:userId', requirePermission(PERMISSIONS.USER_DELETE), ProfileController.deleteUserAccount);

/**
 * @swagger
 * /api/profile/users/{userId}/performance:
 *   get:
 *     summary: Statistik performa pengguna lain
 *     description: Mengambil statistik performa pengguna berdasarkan ID (memerlukan izin admin)
 *     tags: [Profile - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID pengguna
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly]
 *           default: monthly
 *         description: Periode statistik
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal mulai
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal akhir
 *     responses:
 *       200:
 *         description: Statistik performa pengguna berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PerformanceStats'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Pengguna tidak ditemukan
 */
// Admin routes for user analytics (requires admin role or higher)
router.get('/users/:userId/performance', requirePermission(PERMISSIONS.USER_READ), ProfileController.getUserPerformanceStats);

/**
 * @swagger
 * /api/profile/users/{userId}/activity:
 *   get:
 *     summary: Log aktivitas pengguna lain
 *     description: Mengambil riwayat aktivitas pengguna berdasarkan ID (memerlukan izin admin)
 *     tags: [Profile - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID pengguna
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
 *           default: 20
 *         description: Jumlah item per halaman
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter berdasarkan jenis aktivitas
 *     responses:
 *       200:
 *         description: Log aktivitas pengguna berhasil diambil
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
 *                     $ref: '#/components/schemas/ActivityLog'
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
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Pengguna tidak ditemukan
 */
router.get('/users/:userId/activity', requirePermission(PERMISSIONS.USER_READ), ProfileController.getUserActivityLogs);

/**
 * @swagger
 * /api/profile/users/{userId}/sales-report:
 *   get:
 *     summary: Laporan penjualan pengguna lain
 *     description: Mengambil laporan penjualan pengguna berdasarkan ID (memerlukan izin admin)
 *     tags: [Profile - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID pengguna
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly]
 *           default: monthly
 *         description: Periode laporan
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal mulai
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal akhir
 *     responses:
 *       200:
 *         description: Laporan penjualan pengguna berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SalesReport'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Pengguna tidak ditemukan
 */
router.get('/users/:userId/sales-report', requirePermission(PERMISSIONS.USER_READ), ProfileController.getUserSalesReport);

export default router;
