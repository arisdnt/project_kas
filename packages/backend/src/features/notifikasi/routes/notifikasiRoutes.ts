/**
 * Notification Routes
 * Notification system routes with proper authentication
 * 
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID notifikasi
 *         tenant_id:
 *           type: string
 *           format: uuid
 *           description: ID tenant
 *         user_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID pengguna penerima
 *         tipe:
 *           type: string
 *           enum: [info, warning, error, success]
 *           description: Tipe notifikasi
 *         judul:
 *           type: string
 *           description: Judul notifikasi
 *         pesan:
 *           type: string
 *           description: Isi pesan notifikasi
 *         data:
 *           type: object
 *           nullable: true
 *           description: Data tambahan dalam format JSON
 *         dibaca:
 *           type: boolean
 *           description: Status sudah dibaca atau belum
 *         dibaca_pada:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Waktu dibaca
 *         kadaluarsa_pada:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Waktu kadaluarsa
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Waktu dibuat
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Waktu diperbarui
 *     
 *     CreateNotificationRequest:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID pengguna penerima (null untuk broadcast)
 *         tipe:
 *           type: string
 *           enum: [info, warning, error, success]
 *           description: Tipe notifikasi
 *         judul:
 *           type: string
 *           description: Judul notifikasi
 *         pesan:
 *           type: string
 *           description: Isi pesan notifikasi
 *         data:
 *           type: object
 *           nullable: true
 *           description: Data tambahan dalam format JSON
 *         kadaluarsa_pada:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Waktu kadaluarsa
 *       required:
 *         - tipe
 *         - judul
 *         - pesan
 *     
 *     UpdateNotificationRequest:
 *       type: object
 *       properties:
 *         judul:
 *           type: string
 *           description: Judul notifikasi
 *         pesan:
 *           type: string
 *           description: Isi pesan notifikasi
 *         data:
 *           type: object
 *           nullable: true
 *           description: Data tambahan dalam format JSON
 *         kadaluarsa_pada:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Waktu kadaluarsa
 *     
 *     BulkNotificationRequest:
 *       type: object
 *       properties:
 *         user_ids:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: Daftar ID pengguna penerima
 *         tipe:
 *           type: string
 *           enum: [info, warning, error, success]
 *           description: Tipe notifikasi
 *         judul:
 *           type: string
 *           description: Judul notifikasi
 *         pesan:
 *           type: string
 *           description: Isi pesan notifikasi
 *         data:
 *           type: object
 *           nullable: true
 *           description: Data tambahan dalam format JSON
 *         kadaluarsa_pada:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Waktu kadaluarsa
 *       required:
 *         - user_ids
 *         - tipe
 *         - judul
 *         - pesan
 *     
 *     NotificationStats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total notifikasi
 *         unread:
 *           type: integer
 *           description: Jumlah belum dibaca
 *         by_type:
 *           type: object
 *           properties:
 *             info:
 *               type: integer
 *             warning:
 *               type: integer
 *             error:
 *               type: integer
 *             success:
 *               type: integer
 *           description: Jumlah berdasarkan tipe
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { NotifikasiController } from '../controllers/NotifikasiController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

/**
 * @swagger
 * /api/notifikasi:
 *   get:
 *     summary: Mencari notifikasi
 *     description: Mengambil daftar notifikasi dengan filter dan paginasi
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Kata kunci pencarian
 *       - in: query
 *         name: tipe
 *         schema:
 *           type: string
 *           enum: [info, warning, error, success]
 *         description: Filter berdasarkan tipe
 *       - in: query
 *         name: dibaca
 *         schema:
 *           type: boolean
 *         description: Filter berdasarkan status dibaca
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Jumlah data per halaman
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan daftar notifikasi
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
 *                     $ref: '#/components/schemas/Notification'
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
 *       400:
 *         description: Parameter tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       500:
 *         description: Kesalahan server internal
 */
// Basic notification routes
router.get('/',
  requirePermission(PERMISSIONS.NOTIFICATION_READ),
  NotifikasiController.searchNotifications
);

/**
 * @swagger
 * /api/notifikasi/unread-count:
 *   get:
 *     summary: Mendapatkan jumlah notifikasi belum dibaca
 *     description: Mengambil jumlah notifikasi yang belum dibaca oleh pengguna
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan jumlah notifikasi belum dibaca
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
 *                     unread_count:
 *                       type: integer
 *                       description: Jumlah notifikasi belum dibaca
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       500:
 *         description: Kesalahan server internal
 */
router.get('/unread-count',
  requirePermission(PERMISSIONS.NOTIFICATION_READ),
  NotifikasiController.getUnreadCount
);

/**
 * @swagger
 * /api/notifikasi/stats:
 *   get:
 *     summary: Mendapatkan statistik notifikasi
 *     description: Mengambil statistik notifikasi berdasarkan tipe dan status
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan statistik notifikasi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/NotificationStats'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       500:
 *         description: Kesalahan server internal
 */
router.get('/stats',
  requirePermission(PERMISSIONS.NOTIFICATION_READ),
  NotifikasiController.getNotificationStats
);

/**
 * @swagger
 * /api/notifikasi/type/{tipe}:
 *   get:
 *     summary: Mendapatkan notifikasi berdasarkan tipe
 *     description: Mengambil notifikasi berdasarkan tipe tertentu
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipe
 *         required: true
 *         schema:
 *           type: string
 *           enum: [info, warning, error, success]
 *         description: Tipe notifikasi
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Jumlah data yang diambil
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan notifikasi berdasarkan tipe
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
 *                     $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       500:
 *         description: Kesalahan server internal
 */
router.get('/type/:tipe',
  requirePermission(PERMISSIONS.NOTIFICATION_READ),
  NotifikasiController.getNotificationsByType
);

/**
 * @swagger
 * /api/notifikasi/{id}:
 *   get:
 *     summary: Mendapatkan notifikasi berdasarkan ID
 *     description: Mengambil detail notifikasi berdasarkan ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID notifikasi
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan detail notifikasi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Notifikasi tidak ditemukan
 *       500:
 *         description: Kesalahan server internal
 */
router.get('/:id',
  requirePermission(PERMISSIONS.NOTIFICATION_READ),
  NotifikasiController.findNotificationById
);

/**
 * @swagger
 * /api/notifikasi:
 *   post:
 *     summary: Membuat notifikasi baru
 *     description: Membuat notifikasi baru untuk pengguna atau broadcast
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNotificationRequest'
 *     responses:
 *       201:
 *         description: Berhasil membuat notifikasi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       500:
 *         description: Kesalahan server internal
 */
// Notification management routes
router.post('/',
  requirePermission(PERMISSIONS.NOTIFICATION_CREATE),
  NotifikasiController.createNotification
);

/**
 * @swagger
 * /api/notifikasi/{id}:
 *   put:
 *     summary: Memperbarui notifikasi
 *     description: Memperbarui data notifikasi berdasarkan ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID notifikasi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNotificationRequest'
 *     responses:
 *       200:
 *         description: Berhasil memperbarui notifikasi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Notifikasi tidak ditemukan
 *       500:
 *         description: Kesalahan server internal
 */
router.put('/:id',
  requirePermission(PERMISSIONS.NOTIFICATION_UPDATE),
  NotifikasiController.updateNotification
);

/**
 * @swagger
 * /api/notifikasi/{id}/read:
 *   put:
 *     summary: Menandai notifikasi sebagai sudah dibaca
 *     description: Menandai notifikasi tertentu sebagai sudah dibaca
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID notifikasi
 *     responses:
 *       200:
 *         description: Berhasil menandai notifikasi sebagai sudah dibaca
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
 *                   example: "Notifikasi berhasil ditandai sebagai sudah dibaca"
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Notifikasi tidak ditemukan
 *       500:
 *         description: Kesalahan server internal
 */
router.put('/:id/read',
  requirePermission(PERMISSIONS.NOTIFICATION_UPDATE),
  NotifikasiController.markAsRead
);

/**
 * @swagger
 * /api/notifikasi/read-all:
 *   put:
 *     summary: Menandai semua notifikasi sebagai sudah dibaca
 *     description: Menandai semua notifikasi pengguna sebagai sudah dibaca
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil menandai semua notifikasi sebagai sudah dibaca
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
 *                   example: "Semua notifikasi berhasil ditandai sebagai sudah dibaca"
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       500:
 *         description: Kesalahan server internal
 */
router.put('/read-all',
  requirePermission(PERMISSIONS.NOTIFICATION_UPDATE),
  NotifikasiController.markAllAsRead
);

/**
 * @swagger
 * /api/notifikasi/bulk-send:
 *   post:
 *     summary: Mengirim notifikasi massal
 *     description: Mengirim notifikasi ke beberapa pengguna sekaligus
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkNotificationRequest'
 *     responses:
 *       201:
 *         description: Berhasil mengirim notifikasi massal
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
 *                   example: "Notifikasi massal berhasil dikirim"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sent_count:
 *                       type: integer
 *                       description: Jumlah notifikasi yang berhasil dikirim
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       500:
 *         description: Kesalahan server internal
 */
router.post('/bulk-send',
  requirePermission(PERMISSIONS.NOTIFICATION_CREATE),
  NotifikasiController.sendBulkNotifications
);

/**
 * @swagger
 * /api/notifikasi/cleanup-expired:
 *   post:
 *     summary: Membersihkan notifikasi kadaluarsa
 *     description: Menghapus notifikasi yang sudah kadaluarsa dari sistem
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil membersihkan notifikasi kadaluarsa
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
 *                   example: "Notifikasi kadaluarsa berhasil dibersihkan"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deleted_count:
 *                       type: integer
 *                       description: Jumlah notifikasi yang dihapus
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       500:
 *         description: Kesalahan server internal
 */
router.post('/cleanup-expired',
  requirePermission(PERMISSIONS.SYSTEM_MANAGE),
  NotifikasiController.cleanupExpiredNotifications
);

export default router;