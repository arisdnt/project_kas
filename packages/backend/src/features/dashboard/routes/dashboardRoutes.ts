/**
 * Dashboard Routes
 * Dashboard analytics and KPI routes with proper authentication
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { DashboardController } from '../controllers/DashboardController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

/**
 * @swagger
 * components:
 *   schemas:
 *     OverviewKPIs:
 *       type: object
 *       properties:
 *         total_sales:
 *           type: number
 *           description: Total penjualan dalam periode
 *           example: 15000000
 *         total_transactions:
 *           type: integer
 *           description: Total transaksi dalam periode
 *           example: 150
 *         total_customers:
 *           type: integer
 *           description: Total pelanggan unik dalam periode
 *           example: 85
 *         average_transaction:
 *           type: number
 *           description: Rata-rata nilai transaksi
 *           example: 100000
 *         growth_rate:
 *           type: number
 *           description: Tingkat pertumbuhan (%)
 *           example: 12.5
 *     
 *     SalesChartData:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           description: Tanggal
 *         sales:
 *           type: number
 *           description: Total penjualan pada tanggal tersebut
 *         transactions:
 *           type: integer
 *           description: Jumlah transaksi pada tanggal tersebut
 *     
 *     TopProduct:
 *       type: object
 *       properties:
 *         product_id:
 *           type: string
 *           format: uuid
 *           description: ID produk
 *         product_name:
 *           type: string
 *           description: Nama produk
 *         total_sold:
 *           type: integer
 *           description: Total terjual
 *         total_revenue:
 *           type: number
 *           description: Total pendapatan dari produk
 *         category:
 *           type: string
 *           description: Kategori produk
 *     
 *     TopCustomer:
 *       type: object
 *       properties:
 *         customer_id:
 *           type: string
 *           format: uuid
 *           description: ID pelanggan
 *         customer_name:
 *           type: string
 *           description: Nama pelanggan
 *         total_transactions:
 *           type: integer
 *           description: Total transaksi
 *         total_spent:
 *           type: number
 *           description: Total pengeluaran
 *         last_transaction:
 *           type: string
 *           format: date-time
 *           description: Transaksi terakhir
 *     
 *     PaymentMethodDistribution:
 *       type: object
 *       properties:
 *         payment_method:
 *           type: string
 *           description: Metode pembayaran
 *           example: cash
 *         count:
 *           type: integer
 *           description: Jumlah transaksi
 *         percentage:
 *           type: number
 *           description: Persentase dari total transaksi
 *         total_amount:
 *           type: number
 *           description: Total nilai transaksi
 *     
 *     CategoryPerformance:
 *       type: object
 *       properties:
 *         category_id:
 *           type: string
 *           format: uuid
 *           description: ID kategori
 *         category_name:
 *           type: string
 *           description: Nama kategori
 *         total_products:
 *           type: integer
 *           description: Jumlah produk dalam kategori
 *         total_sold:
 *           type: integer
 *           description: Total produk terjual
 *         total_revenue:
 *           type: number
 *           description: Total pendapatan kategori
 *         growth_rate:
 *           type: number
 *           description: Tingkat pertumbuhan (%)
 */

/**
 * @swagger
 * /api/dashboard/kpis/overview:
 *   get:
 *     summary: Mendapatkan KPI overview dashboard
 *     description: Mengambil data KPI utama untuk dashboard overview dalam periode tertentu
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         description: Tanggal mulai periode (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-31"
 *         description: Tanggal akhir periode (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Data KPI overview berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/OverviewKPIs'
 *       400:
 *         description: Parameter tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki permission REPORT_READ
 */
router.get('/kpis/overview',
  requirePermission(PERMISSIONS.REPORT_READ),
  DashboardController.getOverviewKPIs
);

/**
 * @swagger
 * /api/dashboard/analytics/sales-chart:
 *   get:
 *     summary: Mendapatkan data chart penjualan
 *     description: Mengambil data penjualan harian untuk chart dalam periode tertentu
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         description: Tanggal mulai periode (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-31"
 *         description: Tanggal akhir periode (YYYY-MM-DD)
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: daily
 *         description: Interval data chart
 *     responses:
 *       200:
 *         description: Data chart penjualan berhasil diambil
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
 *       400:
 *         description: Parameter tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki permission REPORT_READ
 */
router.get('/analytics/sales-chart',
  requirePermission(PERMISSIONS.REPORT_READ),
  DashboardController.getSalesChart
);

/**
 * @swagger
 * /api/dashboard/analytics/top-products:
 *   get:
 *     summary: Mendapatkan produk terlaris
 *     description: Mengambil daftar produk dengan penjualan tertinggi dalam periode tertentu
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         description: Tanggal mulai periode (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-31"
 *         description: Tanggal akhir periode (YYYY-MM-DD)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Jumlah produk yang ditampilkan
 *     responses:
 *       200:
 *         description: Daftar produk terlaris berhasil diambil
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
 *                     $ref: '#/components/schemas/TopProduct'
 *       400:
 *         description: Parameter tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki permission REPORT_READ
 */
router.get('/analytics/top-products',
  requirePermission(PERMISSIONS.REPORT_READ),
  DashboardController.getTopProducts
);

/**
 * @swagger
 * /api/dashboard/analytics/top-customers:
 *   get:
 *     summary: Mendapatkan pelanggan terbaik
 *     description: Mengambil daftar pelanggan dengan transaksi tertinggi dalam periode tertentu
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         description: Tanggal mulai periode (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-31"
 *         description: Tanggal akhir periode (YYYY-MM-DD)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Jumlah pelanggan yang ditampilkan
 *     responses:
 *       200:
 *         description: Daftar pelanggan terbaik berhasil diambil
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
 *                     $ref: '#/components/schemas/TopCustomer'
 *       400:
 *         description: Parameter tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki permission REPORT_READ
 */
router.get('/analytics/top-customers',
  requirePermission(PERMISSIONS.REPORT_READ),
  DashboardController.getTopCustomers
);

/**
 * @swagger
 * /api/dashboard/analytics/payment-methods:
 *   get:
 *     summary: Mendapatkan distribusi metode pembayaran
 *     description: Mengambil data distribusi penggunaan metode pembayaran dalam periode tertentu
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         description: Tanggal mulai periode (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-31"
 *         description: Tanggal akhir periode (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Data distribusi metode pembayaran berhasil diambil
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
 *                     $ref: '#/components/schemas/PaymentMethodDistribution'
 *       400:
 *         description: Parameter tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki permission REPORT_READ
 */
router.get('/analytics/payment-methods',
  requirePermission(PERMISSIONS.REPORT_READ),
  DashboardController.getPaymentMethodDistribution
);

/**
 * @swagger
 * /api/dashboard/analytics/category-performance:
 *   get:
 *     summary: Mendapatkan performa kategori produk
 *     description: Mengambil data performa penjualan berdasarkan kategori produk dalam periode tertentu
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         description: Tanggal mulai periode (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-31"
 *         description: Tanggal akhir periode (YYYY-MM-DD)
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [revenue, quantity, growth]
 *           default: revenue
 *         description: Kriteria pengurutan data
 *     responses:
 *       200:
 *         description: Data performa kategori berhasil diambil
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
 *                     $ref: '#/components/schemas/CategoryPerformance'
 *       400:
 *         description: Parameter tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak memiliki permission REPORT_READ
 */
router.get('/analytics/category-performance',
  requirePermission(PERMISSIONS.REPORT_READ),
  DashboardController.getCategoryPerformance
);

export default router;