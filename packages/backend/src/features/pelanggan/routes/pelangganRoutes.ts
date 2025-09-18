/**
 * Customer Routes
 * Customer management routes with proper authentication
 * 
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID pelanggan
 *         tenant_id:
 *           type: string
 *           format: uuid
 *           description: ID tenant
 *         store_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID toko
 *         kode:
 *           type: string
 *           description: Kode unik pelanggan
 *         nama:
 *           type: string
 *           description: Nama pelanggan
 *         email:
 *           type: string
 *           format: email
 *           nullable: true
 *           description: Email pelanggan
 *         telepon:
 *           type: string
 *           nullable: true
 *           description: Nomor telepon
 *         alamat:
 *           type: string
 *           nullable: true
 *           description: Alamat pelanggan
 *         tanggal_lahir:
 *           type: string
 *           format: date
 *           nullable: true
 *           description: Tanggal lahir
 *         jenis_kelamin:
 *           type: string
 *           enum: [pria, wanita]
 *           nullable: true
 *           description: Jenis kelamin
 *         tipe:
 *           type: string
 *           enum: [reguler, vip, member, wholesale]
 *           description: Tipe pelanggan
 *         status:
 *           type: string
 *           enum: [aktif, nonaktif, suspended]
 *           description: Status pelanggan
 *         poin:
 *           type: integer
 *           description: Jumlah poin loyalty
 *         credit_limit:
 *           type: number
 *           format: decimal
 *           description: Batas kredit
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Waktu dibuat
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Waktu diperbarui
 *     
 *     CreateCustomerRequest:
 *       type: object
 *       properties:
 *         nama:
 *           type: string
 *           description: Nama pelanggan
 *         email:
 *           type: string
 *           format: email
 *           nullable: true
 *           description: Email pelanggan
 *         telepon:
 *           type: string
 *           nullable: true
 *           description: Nomor telepon
 *         alamat:
 *           type: string
 *           nullable: true
 *           description: Alamat pelanggan
 *         tanggal_lahir:
 *           type: string
 *           format: date
 *           nullable: true
 *           description: Tanggal lahir
 *         jenis_kelamin:
 *           type: string
 *           enum: [pria, wanita]
 *           nullable: true
 *           description: Jenis kelamin
 *         tipe:
 *           type: string
 *           enum: [reguler, vip, member, wholesale]
 *           default: reguler
 *           description: Tipe pelanggan
 *         credit_limit:
 *           type: number
 *           format: decimal
 *           nullable: true
 *           description: Batas kredit
 *       required:
 *         - nama
 *     
 *     UpdateCustomerRequest:
 *       type: object
 *       properties:
 *         nama:
 *           type: string
 *           description: Nama pelanggan
 *         email:
 *           type: string
 *           format: email
 *           nullable: true
 *           description: Email pelanggan
 *         telepon:
 *           type: string
 *           nullable: true
 *           description: Nomor telepon
 *         alamat:
 *           type: string
 *           nullable: true
 *           description: Alamat pelanggan
 *         tanggal_lahir:
 *           type: string
 *           format: date
 *           nullable: true
 *           description: Tanggal lahir
 *         jenis_kelamin:
 *           type: string
 *           enum: [pria, wanita]
 *           nullable: true
 *           description: Jenis kelamin
 *         tipe:
 *           type: string
 *           enum: [reguler, vip, member, wholesale]
 *           description: Tipe pelanggan
 *         status:
 *           type: string
 *           enum: [aktif, nonaktif, suspended]
 *           description: Status pelanggan
 *         credit_limit:
 *           type: number
 *           format: decimal
 *           nullable: true
 *           description: Batas kredit
 *     
 *     PointsAdjustmentRequest:
 *       type: object
 *       properties:
 *         adjustment:
 *           type: integer
 *           description: Jumlah poin yang disesuaikan (positif/negatif)
 *         reason:
 *           type: string
 *           description: Alasan penyesuaian poin
 *         transaksi_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID transaksi terkait
 *       required:
 *         - adjustment
 *         - reason
 *     
 *     CustomerStats:
 *       type: object
 *       properties:
 *         total_transactions:
 *           type: integer
 *           description: Total transaksi
 *         total_spent:
 *           type: number
 *           format: decimal
 *           description: Total pembelian
 *         average_transaction:
 *           type: number
 *           format: decimal
 *           description: Rata-rata transaksi
 *         last_transaction:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Transaksi terakhir
 *         points_earned:
 *           type: integer
 *           description: Poin yang diperoleh
 *         points_redeemed:
 *           type: integer
 *           description: Poin yang ditukar
 *     
 *     BulkCustomerActionRequest:
 *       type: object
 *       properties:
 *         customer_ids:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: Daftar ID pelanggan
 *         action:
 *           type: string
 *           enum: [activate, deactivate, suspend, delete]
 *           description: Aksi yang akan dilakukan
 *       required:
 *         - customer_ids
 *         - action
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope, requireStoreWhenNeeded } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { PelangganController } from '../controllers/PelangganController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

/**
 * @swagger
 * /api/pelanggan:
 *   get:
 *     summary: Mencari pelanggan
 *     description: Mengambil daftar pelanggan dengan filter dan paginasi
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Kata kunci pencarian nama atau kode pelanggan
 *       - in: query
 *         name: tipe
 *         schema:
 *           type: string
 *           enum: [reguler, vip, member, wholesale]
 *         description: Filter berdasarkan tipe pelanggan
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [aktif, nonaktif, suspended]
 *         description: Filter berdasarkan status
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
 *         description: Berhasil mendapatkan daftar pelanggan
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
 *                     $ref: '#/components/schemas/Customer'
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
// Customer management routes
router.get('/',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  PelangganController.searchCustomers
);

/**
 * @swagger
 * /api/pelanggan/active:
 *   get:
 *     summary: Mendapatkan pelanggan aktif
 *     description: Mengambil daftar pelanggan dengan status aktif
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Jumlah data yang diambil
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan daftar pelanggan aktif
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
 *                     $ref: '#/components/schemas/Customer'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       500:
 *         description: Kesalahan server internal
 */
router.get('/active',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  PelangganController.getActiveCustomers
);

/**
 * @swagger
 * /api/pelanggan/segmentation:
 *   get:
 *     summary: Mendapatkan segmentasi pelanggan
 *     description: Mengambil data segmentasi pelanggan berdasarkan berbagai kriteria
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan segmentasi pelanggan
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
 *                     by_type:
 *                       type: object
 *                       properties:
 *                         reguler:
 *                           type: integer
 *                         vip:
 *                           type: integer
 *                         member:
 *                           type: integer
 *                         wholesale:
 *                           type: integer
 *                     by_status:
 *                       type: object
 *                       properties:
 *                         aktif:
 *                           type: integer
 *                         nonaktif:
 *                           type: integer
 *                         suspended:
 *                           type: integer
 *                     by_gender:
 *                       type: object
 *                       properties:
 *                         pria:
 *                           type: integer
 *                         wanita:
 *                           type: integer
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       500:
 *         description: Kesalahan server internal
 */
router.get('/segmentation',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  PelangganController.getCustomerSegmentation
);

/**
 * @swagger
 * /api/pelanggan/loyalty-report:
 *   get:
 *     summary: Mendapatkan laporan loyalty pelanggan
 *     description: Mengambil laporan program loyalty dan poin pelanggan
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan laporan loyalty
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
 *                     total_points_issued:
 *                       type: integer
 *                       description: Total poin yang diterbitkan
 *                     total_points_redeemed:
 *                       type: integer
 *                       description: Total poin yang ditukar
 *                     active_members:
 *                       type: integer
 *                       description: Jumlah member aktif
 *                     top_customers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           nama:
 *                             type: string
 *                           poin:
 *                             type: integer
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       500:
 *         description: Kesalahan server internal
 */
router.get('/loyalty-report',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  PelangganController.getLoyaltyReport
);

/**
 * @swagger
 * /api/pelanggan/{id}:
 *   get:
 *     summary: Mendapatkan pelanggan berdasarkan ID
 *     description: Mengambil detail pelanggan berdasarkan ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID pelanggan
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan detail pelanggan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Pelanggan tidak ditemukan
 *       500:
 *         description: Kesalahan server internal
 */
router.get('/:id',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  PelangganController.findCustomerById
);

/**
 * @swagger
 * /api/pelanggan/{id}/full-profile:
 *   get:
 *     summary: Mendapatkan profil lengkap pelanggan
 *     description: Mengambil profil lengkap pelanggan termasuk statistik dan riwayat
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID pelanggan
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan profil lengkap pelanggan
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
 *                     customer:
 *                       $ref: '#/components/schemas/Customer'
 *                     stats:
 *                       $ref: '#/components/schemas/CustomerStats'
 *                     recent_transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Pelanggan tidak ditemukan
 *       500:
 *         description: Kesalahan server internal
 */
router.get('/:id/full-profile',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  PelangganController.getCustomerWithFullProfile
);

/**
 * @swagger
 * /api/pelanggan/code/{kode}:
 *   get:
 *     summary: Mencari pelanggan berdasarkan kode
 *     description: Mengambil data pelanggan berdasarkan kode unik
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kode
 *         required: true
 *         schema:
 *           type: string
 *         description: Kode unik pelanggan
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan data pelanggan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Pelanggan tidak ditemukan
 *       500:
 *         description: Kesalahan server internal
 */
router.get('/code/:kode',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  PelangganController.findCustomerByCode
);

/**
 * @swagger
 * /api/pelanggan/{id}/stats:
 *   get:
 *     summary: Mendapatkan statistik pelanggan
 *     description: Mengambil statistik transaksi dan aktivitas pelanggan
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID pelanggan
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan statistik pelanggan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CustomerStats'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Pelanggan tidak ditemukan
 *       500:
 *         description: Kesalahan server internal
 */
router.get('/:id/stats',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  PelangganController.getCustomerStats
);

/**
 * @swagger
 * /api/pelanggan/{id}/transactions:
 *   get:
 *     summary: Mendapatkan riwayat transaksi pelanggan
 *     description: Mengambil riwayat transaksi pelanggan dengan paginasi
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID pelanggan
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
 *         description: Berhasil mendapatkan riwayat transaksi
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       nomor_transaksi:
 *                         type: string
 *                       total:
 *                         type: number
 *                         format: decimal
 *                       tanggal:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
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
 *         description: Pelanggan tidak ditemukan
 *       500:
 *         description: Kesalahan server internal
 */
router.get('/:id/transactions',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  PelangganController.getTransactionHistory
);

/**
 * @swagger
 * /api/pelanggan/{id}/points-history:
 *   get:
 *     summary: Mendapatkan riwayat poin pelanggan
 *     description: Mengambil riwayat perubahan poin loyalty pelanggan
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID pelanggan
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
 *         description: Berhasil mendapatkan riwayat poin
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       tipe:
 *                         type: string
 *                         enum: [earned, redeemed, adjustment]
 *                       jumlah:
 *                         type: integer
 *                       keterangan:
 *                         type: string
 *                       tanggal:
 *                         type: string
 *                         format: date-time
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
 *         description: Pelanggan tidak ditemukan
 *       500:
 *         description: Kesalahan server internal
 */
router.get('/:id/points-history',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  PelangganController.getPointsHistory
);

/**
 * @swagger
 * /api/pelanggan:
 *   post:
 *     summary: Membuat pelanggan baru
 *     description: Membuat data pelanggan baru
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCustomerRequest'
 *     responses:
 *       201:
 *         description: Berhasil membuat pelanggan baru
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       409:
 *         description: Email atau telepon sudah digunakan
 *       500:
 *         description: Kesalahan server internal
 */
router.post('/',
  requirePermission(PERMISSIONS.CUSTOMER_CREATE),
  requireStoreWhenNeeded,
  PelangganController.createCustomer
);

/**
 * @swagger
 * /api/pelanggan/{id}:
 *   put:
 *     summary: Memperbarui data pelanggan
 *     description: Memperbarui data pelanggan berdasarkan ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID pelanggan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCustomerRequest'
 *     responses:
 *       200:
 *         description: Berhasil memperbarui data pelanggan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Pelanggan tidak ditemukan
 *       409:
 *         description: Email atau telepon sudah digunakan
 *       500:
 *         description: Kesalahan server internal
 */
router.put('/:id',
  requirePermission(PERMISSIONS.CUSTOMER_UPDATE),
  PelangganController.updateCustomer
);

/**
 * @swagger
 * /api/pelanggan/{id}/adjust-points:
 *   post:
 *     summary: Menyesuaikan poin pelanggan
 *     description: Menambah atau mengurangi poin loyalty pelanggan
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID pelanggan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PointsAdjustmentRequest'
 *     responses:
 *       200:
 *         description: Berhasil menyesuaikan poin pelanggan
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
 *                   example: "Poin pelanggan berhasil disesuaikan"
 *                 data:
 *                   type: object
 *                   properties:
 *                     previous_points:
 *                       type: integer
 *                     adjustment:
 *                       type: integer
 *                     new_points:
 *                       type: integer
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Pelanggan tidak ditemukan
 *       500:
 *         description: Kesalahan server internal
 */
router.post('/:id/adjust-points',
  requirePermission(PERMISSIONS.CUSTOMER_UPDATE),
  PelangganController.adjustCustomerPoints
);

/**
 * @swagger
 * /api/pelanggan/{id}/earn-points:
 *   post:
 *     summary: Memberikan poin kepada pelanggan
 *     description: Memberikan poin loyalty kepada pelanggan dari transaksi
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID pelanggan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               points:
 *                 type: integer
 *                 minimum: 1
 *                 description: Jumlah poin yang diberikan
 *               transaksi_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID transaksi terkait
 *             required:
 *               - points
 *               - transaksi_id
 *     responses:
 *       200:
 *         description: Berhasil memberikan poin kepada pelanggan
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
 *                   example: "Poin berhasil diberikan kepada pelanggan"
 *                 data:
 *                   type: object
 *                   properties:
 *                     points_earned:
 *                       type: integer
 *                     total_points:
 *                       type: integer
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Pelanggan tidak ditemukan
 *       500:
 *         description: Kesalahan server internal
 */
router.post('/:id/earn-points',
  requirePermission(PERMISSIONS.CUSTOMER_UPDATE),
  PelangganController.earnPoints
);

/**
 * @swagger
 * /api/pelanggan/{id}/redeem-points:
 *   post:
 *     summary: Menukar poin pelanggan
 *     description: Menukar poin loyalty pelanggan dengan reward atau diskon
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID pelanggan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               points:
 *                 type: integer
 *                 minimum: 1
 *                 description: Jumlah poin yang ditukar
 *               reason:
 *                 type: string
 *                 description: Alasan penukaran poin
 *               transaksi_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: ID transaksi terkait
 *             required:
 *               - points
 *               - reason
 *     responses:
 *       200:
 *         description: Berhasil menukar poin pelanggan
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
 *                   example: "Poin berhasil ditukar"
 *                 data:
 *                   type: object
 *                   properties:
 *                     points_redeemed:
 *                       type: integer
 *                     remaining_points:
 *                       type: integer
 *       400:
 *         description: Data tidak valid atau poin tidak mencukupi
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Pelanggan tidak ditemukan
 *       500:
 *         description: Kesalahan server internal
 */
router.post('/:id/redeem-points',
  requirePermission(PERMISSIONS.CUSTOMER_UPDATE),
  PelangganController.redeemPoints
);

/**
 * @swagger
 * /api/pelanggan/adjust-credit-limit:
 *   post:
 *     summary: Menyesuaikan batas kredit pelanggan
 *     description: Mengubah batas kredit untuk pelanggan tertentu
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID pelanggan
 *               new_limit:
 *                 type: number
 *                 format: decimal
 *                 minimum: 0
 *                 description: Batas kredit baru
 *               reason:
 *                 type: string
 *                 description: Alasan perubahan batas kredit
 *             required:
 *               - customer_id
 *               - new_limit
 *               - reason
 *     responses:
 *       200:
 *         description: Berhasil menyesuaikan batas kredit
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
 *                   example: "Batas kredit berhasil disesuaikan"
 *                 data:
 *                   type: object
 *                   properties:
 *                     previous_limit:
 *                       type: number
 *                       format: decimal
 *                     new_limit:
 *                       type: number
 *                       format: decimal
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Pelanggan tidak ditemukan
 *       500:
 *         description: Kesalahan server internal
 */
router.post('/adjust-credit-limit',
  requirePermission(PERMISSIONS.CUSTOMER_UPDATE),
  PelangganController.adjustCreditLimit
);

/**
 * @swagger
 * /api/pelanggan/bulk-action:
 *   post:
 *     summary: Aksi massal pada pelanggan
 *     description: Melakukan aksi massal pada beberapa pelanggan sekaligus
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkCustomerActionRequest'
 *     responses:
 *       200:
 *         description: Berhasil melakukan aksi massal
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
 *                   example: "Aksi massal berhasil dilakukan"
 *                 data:
 *                   type: object
 *                   properties:
 *                     processed_count:
 *                       type: integer
 *                       description: Jumlah pelanggan yang diproses
 *                     failed_count:
 *                       type: integer
 *                       description: Jumlah yang gagal diproses
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       500:
 *         description: Kesalahan server internal
 */
router.post('/bulk-action',
  requirePermission(PERMISSIONS.CUSTOMER_UPDATE),
  PelangganController.bulkCustomerAction
);

/**
 * @swagger
 * /api/pelanggan/import:
 *   post:
 *     summary: Import data pelanggan
 *     description: Import data pelanggan dalam jumlah banyak dari file atau array
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nama:
 *                       type: string
 *                       description: Nama pelanggan
 *                     email:
 *                       type: string
 *                       format: email
 *                       nullable: true
 *                       description: Email pelanggan
 *                     telepon:
 *                       type: string
 *                       nullable: true
 *                       description: Nomor telepon
 *                     alamat:
 *                       type: string
 *                       nullable: true
 *                       description: Alamat pelanggan
 *                     tanggal_lahir:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                       description: Tanggal lahir
 *                     jenis_kelamin:
 *                       type: string
 *                       enum: [pria, wanita]
 *                       nullable: true
 *                       description: Jenis kelamin
 *                     tipe:
 *                       type: string
 *                       enum: [reguler, vip, member, wholesale]
 *                       default: reguler
 *                       description: Tipe pelanggan
 *                   required:
 *                     - nama
 *                 description: Daftar data pelanggan yang akan diimport
 *             required:
 *               - customers
 *     responses:
 *       201:
 *         description: Berhasil import data pelanggan
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
 *                   example: "Data pelanggan berhasil diimport"
 *                 data:
 *                   type: object
 *                   properties:
 *                     imported_count:
 *                       type: integer
 *                       description: Jumlah pelanggan yang berhasil diimport
 *                     failed_count:
 *                       type: integer
 *                       description: Jumlah yang gagal diimport
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           row:
 *                             type: integer
 *                           error:
 *                             type: string
 *                       description: Detail error untuk data yang gagal
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       500:
 *         description: Kesalahan server internal
 */
router.post('/import',
  requirePermission(PERMISSIONS.CUSTOMER_CREATE),
  requireStoreWhenNeeded,
  PelangganController.importCustomers
);

export default router;