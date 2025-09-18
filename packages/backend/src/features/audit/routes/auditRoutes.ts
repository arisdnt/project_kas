/**
 * Audit Routes
 * Audit log management routes with strict access control
 */

import { Router } from 'express';
import { authenticate } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { AuditController } from '../controllers/AuditController';
import { requireMinimumLevel } from '@/features/auth/middleware/peranValidationMiddleware';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

// All audit routes require admin level (level 2) or higher
router.use(requireMinimumLevel(2));

/**
 * @swagger
 * components:
 *   schemas:
 *     AuditLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID unik audit log
 *         user_id:
 *           type: string
 *           format: uuid
 *           description: ID pengguna yang melakukan aksi
 *         tenant_id:
 *           type: string
 *           format: uuid
 *           description: ID tenant
 *         toko_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID toko (opsional)
 *         action:
 *           type: string
 *           description: Jenis aksi yang dilakukan
 *         table_name:
 *           type: string
 *           description: Nama tabel yang diakses
 *         record_id:
 *           type: string
 *           nullable: true
 *           description: ID record yang diakses
 *         old_values:
 *           type: object
 *           nullable: true
 *           description: Nilai lama sebelum perubahan
 *         new_values:
 *           type: object
 *           nullable: true
 *           description: Nilai baru setelah perubahan
 *         ip_address:
 *           type: string
 *           description: Alamat IP pengguna
 *         user_agent:
 *           type: string
 *           description: User agent browser
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Waktu audit log dibuat
 *     
 *     ActivitySummary:
 *       type: object
 *       properties:
 *         total_actions:
 *           type: integer
 *           description: Total aksi dalam periode
 *         actions_by_type:
 *           type: object
 *           description: Ringkasan aksi berdasarkan jenis
 *         actions_by_user:
 *           type: object
 *           description: Ringkasan aksi berdasarkan pengguna
 *         daily_activity:
 *           type: array
 *           items:
 *             type: object
 *           description: Aktivitas harian
 *     
 *     UserActivity:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *           format: uuid
 *           description: ID pengguna
 *         total_actions:
 *           type: integer
 *           description: Total aksi pengguna
 *         actions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AuditLog'
 *           description: Daftar aksi pengguna
 */

/**
 * @swagger
 * /api/audit:
 *   get:
 *     summary: Mencari audit logs
 *     description: Mengambil daftar audit logs dengan filter dan paginasi (hanya admin)
 *     tags: [Audit]
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
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter berdasarkan jenis aksi
 *       - in: query
 *         name: table_name
 *         schema:
 *           type: string
 *         description: Filter berdasarkan nama tabel
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter berdasarkan ID pengguna
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal mulai filter (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal akhir filter (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Daftar audit logs berhasil diambil
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
 *                     $ref: '#/components/schemas/AuditLog'
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
 *         description: Tidak memiliki hak akses (hanya admin)
 *       400:
 *         description: Parameter query tidak valid
 */
router.get('/', AuditController.search);

/**
 * @swagger
 * /api/audit/activity-summary:
 *   get:
 *     summary: Mendapatkan ringkasan aktivitas
 *     description: Mengambil ringkasan aktivitas audit dalam rentang tanggal (hanya admin)
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal mulai (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal akhir (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Ringkasan aktivitas berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ActivitySummary'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki hak akses (hanya admin)
 *       400:
 *         description: Parameter tanggal tidak valid
 */
router.get('/activity-summary', AuditController.getActivitySummary);

/**
 * @swagger
 * /api/audit/user-activity:
 *   get:
 *     summary: Mendapatkan aktivitas pengguna
 *     description: Mengambil aktivitas audit pengguna tertentu dalam rentang tanggal (hanya admin)
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID pengguna
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal mulai (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal akhir (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Aktivitas pengguna berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserActivity'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki hak akses (hanya admin)
 *       400:
 *         description: Parameter tidak valid
 */
router.get('/user-activity', AuditController.getUserActivity);

/**
 * @swagger
 * /api/audit/{id}:
 *   get:
 *     summary: Mendapatkan audit log berdasarkan ID
 *     description: Mengambil detail audit log berdasarkan ID (hanya admin)
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID audit log
 *     responses:
 *       200:
 *         description: Detail audit log berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AuditLog'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki hak akses (hanya admin)
 *       404:
 *         description: Audit log tidak ditemukan
 *       500:
 *         description: Kesalahan server internal
 */
router.get('/:id', AuditController.findById);

export default router;