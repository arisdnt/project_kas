/**
 * Sales Routes
 * Sales transaction management routes with proper authentication and authorization
 * 
 * @swagger
 * components:
 *   schemas:
 *     SalesTransaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID transaksi penjualan
 *         nomorTransaksi:
 *           type: string
 *           description: Nomor transaksi penjualan
 *         pelangganId:
 *           type: string
 *           description: ID pelanggan
 *         tanggalTransaksi:
 *           type: string
 *           format: date-time
 *           description: Tanggal transaksi
 *         totalSebelumDiskon:
 *           type: number
 *           description: Total sebelum diskon
 *         totalDiskon:
 *           type: number
 *           description: Total diskon
 *         totalSetelahDiskon:
 *           type: number
 *           description: Total setelah diskon
 *         totalPajak:
 *           type: number
 *           description: Total pajak
 *         totalAkhir:
 *           type: number
 *           description: Total akhir
 *         metodePembayaran:
 *           type: string
 *           enum: [cash, card, transfer, ewallet]
 *           description: Metode pembayaran
 *         status:
 *           type: string
 *           enum: [pending, completed, cancelled, refunded]
 *           description: Status transaksi
 *         catatan:
 *           type: string
 *           description: Catatan transaksi
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SalesItem'
 *     
 *     SalesItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID item penjualan
 *         produkId:
 *           type: string
 *           description: ID produk
 *         kuantitas:
 *           type: number
 *           description: Kuantitas item
 *         hargaSatuan:
 *           type: number
 *           description: Harga satuan
 *         diskon:
 *           type: number
 *           description: Diskon item
 *         subtotal:
 *           type: number
 *           description: Subtotal item
 *     
 *     CreateSalesRequest:
 *       type: object
 *       required:
 *         - transaction
 *         - items
 *       properties:
 *         transaction:
 *           type: object
 *           properties:
 *             pelangganId:
 *               type: string
 *               description: ID pelanggan
 *             tanggalTransaksi:
 *               type: string
 *               format: date-time
 *               description: Tanggal transaksi
 *             metodePembayaran:
 *               type: string
 *               enum: [cash, card, transfer, ewallet]
 *               description: Metode pembayaran
 *             catatan:
 *               type: string
 *               description: Catatan transaksi
 *         items:
 *           type: array
 *           minItems: 1
 *           items:
 *             type: object
 *             properties:
 *               produkId:
 *                 type: string
 *                 description: ID produk
 *               kuantitas:
 *                 type: number
 *                 description: Kuantitas item
 *               hargaSatuan:
 *                 type: number
 *                 description: Harga satuan
 *               diskon:
 *                 type: number
 *                 description: Diskon item
 *     
 *     UpdateSalesRequest:
 *       type: object
 *       properties:
 *         pelangganId:
 *           type: string
 *           description: ID pelanggan
 *         tanggalTransaksi:
 *           type: string
 *           format: date-time
 *           description: Tanggal transaksi
 *         metodePembayaran:
 *           type: string
 *           enum: [cash, card, transfer, ewallet]
 *           description: Metode pembayaran
 *         catatan:
 *           type: string
 *           description: Catatan transaksi
 *         status:
 *           type: string
 *           enum: [pending, completed, cancelled, refunded]
 *           description: Status transaksi
 *     
 *     DailySalesReport:
 *       type: object
 *       properties:
 *         tanggal:
 *           type: string
 *           format: date
 *           description: Tanggal laporan
 *         totalTransaksi:
 *           type: integer
 *           description: Jumlah transaksi
 *         totalPenjualan:
 *           type: number
 *           description: Total penjualan
 *         totalDiskon:
 *           type: number
 *           description: Total diskon
 *         totalPajak:
 *           type: number
 *           description: Total pajak
 *     
 *     TopProductReport:
 *       type: object
 *       properties:
 *         produkId:
 *           type: string
 *           description: ID produk
 *         namaProduk:
 *           type: string
 *           description: Nama produk
 *         totalTerjual:
 *           type: integer
 *           description: Total kuantitas terjual
 *         totalPendapatan:
 *           type: number
 *           description: Total pendapatan dari produk
 *     
 *     SalesChartData:
 *       type: object
 *       properties:
 *         periode:
 *           type: string
 *           description: Periode data (tanggal/bulan)
 *         penjualan:
 *           type: number
 *           description: Total penjualan
 *         transaksi:
 *           type: integer
 *           description: Jumlah transaksi
 *     
 *     PaymentMethodStats:
 *       type: object
 *       properties:
 *         metodePembayaran:
 *           type: string
 *           description: Metode pembayaran
 *         jumlahTransaksi:
 *           type: integer
 *           description: Jumlah transaksi
 *         totalNilai:
 *           type: number
 *           description: Total nilai transaksi
 *         persentase:
 *           type: number
 *           description: Persentase dari total
 *     
 *     CashierPerformance:
 *       type: object
 *       properties:
 *         kasirId:
 *           type: string
 *           description: ID kasir
 *         namaKasir:
 *           type: string
 *           description: Nama kasir
 *         jumlahTransaksi:
 *           type: integer
 *           description: Jumlah transaksi
 *         totalPenjualan:
 *           type: number
 *           description: Total penjualan
 *         rataRataTransaksi:
 *           type: number
 *           description: Rata-rata nilai per transaksi
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope, requireStoreWhenNeeded } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { PenjualanController } from '../controllers/PenjualanController';
import { PenjualanReportController } from '../controllers/PenjualanReportController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

/**
 * @swagger
 * /api/penjualan:
 *   get:
 *     summary: Mencari transaksi penjualan
 *     description: Mengambil daftar transaksi penjualan dengan filter dan pagination
 *     tags: [Penjualan]
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
 *         description: Kata kunci pencarian
 *       - in: query
 *         name: pelangganId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID pelanggan
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, cancelled, refunded]
 *         description: Filter berdasarkan status
 *       - in: query
 *         name: metodePembayaran
 *         schema:
 *           type: string
 *           enum: [cash, card, transfer, ewallet]
 *         description: Filter berdasarkan metode pembayaran
 *       - in: query
 *         name: tanggalMulai
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tanggal mulai
 *       - in: query
 *         name: tanggalSelesai
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tanggal selesai
 *     responses:
 *       200:
 *         description: Daftar transaksi penjualan berhasil diambil
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
 *                     $ref: '#/components/schemas/SalesTransaction'
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
 */
// Transaction CRUD routes - all require store access for POS operations
router.get('/',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  requireStoreWhenNeeded,
  PenjualanController.search
);

/**
 * @swagger
 * /api/penjualan/{id}:
 *   get:
 *     summary: Mengambil detail transaksi penjualan
 *     description: Mengambil detail transaksi penjualan berdasarkan ID
 *     tags: [Penjualan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID transaksi penjualan
 *     responses:
 *       200:
 *         description: Detail transaksi penjualan berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SalesTransaction'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Transaksi tidak ditemukan
 */
router.get('/:id',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  requireStoreWhenNeeded,
  PenjualanController.findById
);

/**
 * @swagger
 * /api/penjualan:
 *   post:
 *     summary: Membuat transaksi penjualan baru
 *     description: Membuat transaksi penjualan baru dengan item-item yang dijual
 *     tags: [Penjualan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSalesRequest'
 *     responses:
 *       201:
 *         description: Transaksi penjualan berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SalesTransaction'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 */
router.post('/',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  requireStoreWhenNeeded,
  PenjualanController.create
);

/**
 * @swagger
 * /api/penjualan/{id}:
 *   put:
 *     summary: Memperbarui transaksi penjualan
 *     description: Memperbarui data transaksi penjualan yang sudah ada
 *     tags: [Penjualan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID transaksi penjualan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSalesRequest'
 *     responses:
 *       200:
 *         description: Transaksi penjualan berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SalesTransaction'
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Transaksi tidak ditemukan
 */
router.put('/:id',
  requirePermission(PERMISSIONS.TRANSACTION_UPDATE),
  requireStoreWhenNeeded,
  PenjualanController.update
);

/**
 * @swagger
 * /api/penjualan/{id}:
 *   delete:
 *     summary: Membatalkan transaksi penjualan
 *     description: Membatalkan transaksi penjualan yang sudah ada
 *     tags: [Penjualan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID transaksi penjualan
 *     responses:
 *       200:
 *         description: Transaksi penjualan berhasil dibatalkan
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
 *                   example: "Transaksi berhasil dibatalkan"
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Transaksi tidak ditemukan
 */
router.delete('/:id',
  requirePermission(PERMISSIONS.TRANSACTION_DELETE),
  requireStoreWhenNeeded,
  PenjualanController.cancel
);

/**
 * @swagger
 * /api/penjualan/reports/daily-sales:
 *   get:
 *     summary: Laporan penjualan harian
 *     description: Mengambil laporan penjualan berdasarkan hari
 *     tags: [Laporan Penjualan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tanggalMulai
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal mulai laporan
 *       - in: query
 *         name: tanggalSelesai
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal selesai laporan
 *       - in: query
 *         name: tokoId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID toko
 *     responses:
 *       200:
 *         description: Laporan penjualan harian berhasil diambil
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
 *                     $ref: '#/components/schemas/DailySalesReport'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 */
// Reporting routes - require report permissions
router.get('/reports/daily-sales',
  requirePermission(PERMISSIONS.REPORT_READ),
  PenjualanReportController.getDailySales
);

/**
 * @swagger
 * /api/penjualan/reports/top-products:
 *   get:
 *     summary: Laporan produk terlaris
 *     description: Mengambil laporan produk dengan penjualan tertinggi
 *     tags: [Laporan Penjualan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tanggalMulai
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal mulai laporan
 *       - in: query
 *         name: tanggalSelesai
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal selesai laporan
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Jumlah produk teratas
 *       - in: query
 *         name: tokoId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID toko
 *     responses:
 *       200:
 *         description: Laporan produk terlaris berhasil diambil
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
 *                     $ref: '#/components/schemas/TopProductReport'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 */
router.get('/reports/top-products',
  requirePermission(PERMISSIONS.REPORT_READ),
  PenjualanReportController.getTopProducts
);

/**
 * @swagger
 * /api/penjualan/reports/sales-chart:
 *   get:
 *     summary: Data grafik penjualan
 *     description: Mengambil data untuk grafik penjualan berdasarkan periode
 *     tags: [Laporan Penjualan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: periode
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: daily
 *         description: Periode grafik
 *       - in: query
 *         name: tanggalMulai
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal mulai
 *       - in: query
 *         name: tanggalSelesai
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal selesai
 *       - in: query
 *         name: tokoId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID toko
 *     responses:
 *       200:
 *         description: Data grafik penjualan berhasil diambil
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
 *                     $ref: '#/components/schemas/SalesChartData'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 */
router.get('/reports/sales-chart',
  requirePermission(PERMISSIONS.REPORT_READ),
  PenjualanReportController.getSalesChart
);

/**
 * @swagger
 * /api/penjualan/reports/payment-methods:
 *   get:
 *     summary: Statistik metode pembayaran
 *     description: Mengambil statistik penggunaan metode pembayaran
 *     tags: [Laporan Penjualan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tanggalMulai
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal mulai laporan
 *       - in: query
 *         name: tanggalSelesai
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal selesai laporan
 *       - in: query
 *         name: tokoId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID toko
 *     responses:
 *       200:
 *         description: Statistik metode pembayaran berhasil diambil
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
 *                     $ref: '#/components/schemas/PaymentMethodStats'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 */
router.get('/reports/payment-methods',
  requirePermission(PERMISSIONS.REPORT_READ),
  PenjualanReportController.getPaymentMethodStats
);

/**
 * @swagger
 * /api/penjualan/reports/cashier-performance:
 *   get:
 *     summary: Laporan performa kasir
 *     description: Mengambil laporan performa penjualan per kasir
 *     tags: [Laporan Penjualan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tanggalMulai
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal mulai laporan
 *       - in: query
 *         name: tanggalSelesai
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal selesai laporan
 *       - in: query
 *         name: tokoId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID toko
 *       - in: query
 *         name: kasirId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID kasir
 *     responses:
 *       200:
 *         description: Laporan performa kasir berhasil diambil
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
 *                     $ref: '#/components/schemas/CashierPerformance'
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki izin
 */
router.get('/reports/cashier-performance',
  requirePermission(PERMISSIONS.REPORT_READ),
  PenjualanReportController.getCashierPerformance
);

export default router;