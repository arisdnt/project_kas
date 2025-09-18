/**
 * Profil Saya Routes
 * Routes untuk mengelola profil user yang sedang login
 * 
 * @swagger
 * components:
 *   schemas:
 *     DetailUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID detail user
 *         userId:
 *           type: string
 *           description: ID pengguna
 *         namaLengkap:
 *           type: string
 *           description: Nama lengkap
 *         email:
 *           type: string
 *           format: email
 *           description: Email pengguna
 *         noTelepon:
 *           type: string
 *           description: Nomor telepon
 *         alamat:
 *           type: string
 *           description: Alamat lengkap
 *         tanggalLahir:
 *           type: string
 *           format: date
 *           description: Tanggal lahir
 *         jenisKelamin:
 *           type: string
 *           enum: [L, P]
 *           description: Jenis kelamin (L=Laki-laki, P=Perempuan)
 *         departemen:
 *           type: string
 *           description: Departemen kerja
 *         posisi:
 *           type: string
 *           description: Posisi/jabatan
 *         tanggalBergabung:
 *           type: string
 *           format: date
 *           description: Tanggal bergabung
 *         avatar:
 *           type: string
 *           description: URL foto profil
 *         bio:
 *           type: string
 *           description: Biografi singkat
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           description: Keahlian/skill
 *         socialMedia:
 *           type: object
 *           properties:
 *             linkedin:
 *               type: string
 *             twitter:
 *               type: string
 *             instagram:
 *               type: string
 *           description: Media sosial
 *         isAktif:
 *           type: boolean
 *           description: Status aktif
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Tanggal dibuat
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Tanggal diperbarui
 *     
 *     CreateDetailUserRequest:
 *       type: object
 *       required:
 *         - userId
 *         - namaLengkap
 *         - email
 *       properties:
 *         userId:
 *           type: string
 *           description: ID pengguna
 *         namaLengkap:
 *           type: string
 *           description: Nama lengkap
 *         email:
 *           type: string
 *           format: email
 *           description: Email pengguna
 *         noTelepon:
 *           type: string
 *           description: Nomor telepon
 *         alamat:
 *           type: string
 *           description: Alamat lengkap
 *         tanggalLahir:
 *           type: string
 *           format: date
 *           description: Tanggal lahir
 *         jenisKelamin:
 *           type: string
 *           enum: [L, P]
 *           description: Jenis kelamin
 *         departemen:
 *           type: string
 *           description: Departemen kerja
 *         posisi:
 *           type: string
 *           description: Posisi/jabatan
 *         tanggalBergabung:
 *           type: string
 *           format: date
 *           description: Tanggal bergabung
 *         avatar:
 *           type: string
 *           description: URL foto profil
 *         bio:
 *           type: string
 *           description: Biografi singkat
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           description: Keahlian/skill
 *         socialMedia:
 *           type: object
 *           description: Media sosial
 *     
 *     UpdateDetailUserRequest:
 *       type: object
 *       properties:
 *         namaLengkap:
 *           type: string
 *           description: Nama lengkap
 *         email:
 *           type: string
 *           format: email
 *           description: Email pengguna
 *         noTelepon:
 *           type: string
 *           description: Nomor telepon
 *         alamat:
 *           type: string
 *           description: Alamat lengkap
 *         tanggalLahir:
 *           type: string
 *           format: date
 *           description: Tanggal lahir
 *         jenisKelamin:
 *           type: string
 *           enum: [L, P]
 *           description: Jenis kelamin
 *         departemen:
 *           type: string
 *           description: Departemen kerja
 *         posisi:
 *           type: string
 *           description: Posisi/jabatan
 *         tanggalBergabung:
 *           type: string
 *           format: date
 *           description: Tanggal bergabung
 *         avatar:
 *           type: string
 *           description: URL foto profil
 *         bio:
 *           type: string
 *           description: Biografi singkat
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           description: Keahlian/skill
 *         socialMedia:
 *           type: object
 *           description: Media sosial
 *     
 *     DetailUserStats:
 *       type: object
 *       properties:
 *         totalUsers:
 *           type: integer
 *           description: Total pengguna
 *         activeUsers:
 *           type: integer
 *           description: Pengguna aktif
 *         inactiveUsers:
 *           type: integer
 *           description: Pengguna tidak aktif
 *         departmentBreakdown:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               departemen:
 *                 type: string
 *               count:
 *                 type: integer
 *           description: Breakdown per departemen
 *         positionBreakdown:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               posisi:
 *                 type: string
 *               count:
 *                 type: integer
 *           description: Breakdown per posisi
 *         genderBreakdown:
 *           type: object
 *           properties:
 *             L:
 *               type: integer
 *             P:
 *               type: integer
 *           description: Breakdown per jenis kelamin
 *     
 *     DepartmentUsers:
 *       type: object
 *       properties:
 *         departemen:
 *           type: string
 *           description: Nama departemen
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DetailUser'
 *           description: Daftar pengguna di departemen
 *         totalUsers:
 *           type: integer
 *           description: Total pengguna di departemen
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { ProfilsayaController } from '../controllers/ProfilsayaController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

/**
 * @swagger
 * /api/profilsaya/me:
 *   get:
 *     summary: Mengambil detail profil saya
 *     description: Mengambil informasi detail profil pengguna yang sedang login
 *     tags: [Profil Saya - Self Service]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detail profil berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DetailUser'
 *       401:
 *         description: Tidak terautentikasi
 *       404:
 *         description: Detail profil tidak ditemukan
 */
// Self-service routes (any authenticated user can access their own data)
router.get('/me',
  ProfilsayaController.getMyDetailUser
);

/**
 * @swagger
 * /api/profilsaya/me:
 *   put:
 *     summary: Memperbarui detail profil saya
 *     description: Memperbarui informasi detail profil pengguna yang sedang login
 *     tags: [Profil Saya - Self Service]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDetailUserRequest'
 *     responses:
 *       200:
 *         description: Detail profil berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DetailUser'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       404:
 *         description: Detail profil tidak ditemukan
 */
router.put('/me',
  ProfilsayaController.updateMyDetailUser
);

/**
 * @swagger
 * /api/profilsaya:
 *   get:
 *     summary: Mengambil semua detail pengguna
 *     description: Mengambil daftar semua detail pengguna dengan pagination dan filter (memerlukan izin admin)
 *     tags: [Profil Saya - Admin]
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
 *         description: Pencarian berdasarkan nama atau email
 *       - in: query
 *         name: departemen
 *         schema:
 *           type: string
 *         description: Filter berdasarkan departemen
 *       - in: query
 *         name: posisi
 *         schema:
 *           type: string
 *         description: Filter berdasarkan posisi
 *       - in: query
 *         name: isAktif
 *         schema:
 *           type: boolean
 *         description: Filter berdasarkan status aktif
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [namaLengkap, email, departemen, posisi, tanggalBergabung, createdAt]
 *           default: createdAt
 *         description: Field untuk sorting
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Urutan sorting
 *     responses:
 *       200:
 *         description: Daftar detail pengguna berhasil diambil
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
 *                     $ref: '#/components/schemas/DetailUser'
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
 */
// Administrative routes (require USER_READ permission)
router.get('/',
  requirePermission(PERMISSIONS.USER_READ),
  ProfilsayaController.getAllDetailUsers
);

/**
 * @swagger
 * /api/profilsaya/stats:
 *   get:
 *     summary: Statistik detail pengguna
 *     description: Mengambil statistik detail pengguna (memerlukan izin admin)
 *     tags: [Profil Saya - Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistik detail pengguna berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DetailUserStats'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 */
router.get('/stats',
  requirePermission(PERMISSIONS.USER_READ),
  ProfilsayaController.getDetailUserStats
);

/**
 * @swagger
 * /api/profilsaya/departments:
 *   get:
 *     summary: Detail pengguna berdasarkan departemen
 *     description: Mengambil detail pengguna yang dikelompokkan berdasarkan departemen (memerlukan izin admin)
 *     tags: [Profil Saya - Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departemen
 *         schema:
 *           type: string
 *         description: Filter departemen tertentu
 *     responses:
 *       200:
 *         description: Detail pengguna berdasarkan departemen berhasil diambil
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
 *                     $ref: '#/components/schemas/DepartmentUsers'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 */
router.get('/departments',
  requirePermission(PERMISSIONS.USER_READ),
  ProfilsayaController.getDetailUsersByDepartment
);

/**
 * @swagger
 * /api/profilsaya/user/{userId}:
 *   get:
 *     summary: Mengambil detail pengguna berdasarkan User ID
 *     description: Mengambil detail pengguna berdasarkan User ID (memerlukan izin admin)
 *     tags: [Profil Saya - Admin]
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
 *         description: Detail pengguna berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DetailUser'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Detail pengguna tidak ditemukan
 */
// Specific detail user routes
router.get('/user/:userId',
  requirePermission(PERMISSIONS.USER_READ),
  ProfilsayaController.getDetailUserByUserId
);

/**
 * @swagger
 * /api/profilsaya/{id}:
 *   get:
 *     summary: Mengambil detail pengguna berdasarkan ID
 *     description: Mengambil detail pengguna berdasarkan ID detail user (memerlukan izin admin)
 *     tags: [Profil Saya - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID detail user
 *     responses:
 *       200:
 *         description: Detail pengguna berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DetailUser'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Detail pengguna tidak ditemukan
 */
router.get('/:id',
  requirePermission(PERMISSIONS.USER_READ),
  ProfilsayaController.getDetailUserById
);

/**
 * @swagger
 * /api/profilsaya:
 *   post:
 *     summary: Membuat detail pengguna baru
 *     description: Membuat detail pengguna baru (memerlukan izin admin)
 *     tags: [Profil Saya - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDetailUserRequest'
 *     responses:
 *       201:
 *         description: Detail pengguna berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DetailUser'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       409:
 *         description: Detail pengguna sudah ada
 */
router.post('/',
  requirePermission(PERMISSIONS.USER_CREATE),
  ProfilsayaController.createDetailUser
);

/**
 * @swagger
 * /api/profilsaya/{id}:
 *   put:
 *     summary: Memperbarui detail pengguna
 *     description: Memperbarui detail pengguna berdasarkan ID (memerlukan izin admin)
 *     tags: [Profil Saya - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID detail user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDetailUserRequest'
 *     responses:
 *       200:
 *         description: Detail pengguna berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DetailUser'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Detail pengguna tidak ditemukan
 */
router.put('/:id',
  requirePermission(PERMISSIONS.USER_UPDATE),
  ProfilsayaController.updateDetailUser
);

/**
 * @swagger
 * /api/profilsaya/{id}:
 *   delete:
 *     summary: Menghapus detail pengguna
 *     description: Menghapus detail pengguna berdasarkan ID (memerlukan izin admin)
 *     tags: [Profil Saya - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID detail user
 *     responses:
 *       200:
 *         description: Detail pengguna berhasil dihapus
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
 *                   example: "Detail pengguna berhasil dihapus"
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Detail pengguna tidak ditemukan
 */
router.delete('/:id',
  requirePermission(PERMISSIONS.USER_DELETE),
  ProfilsayaController.deleteDetailUser
);

export default router;