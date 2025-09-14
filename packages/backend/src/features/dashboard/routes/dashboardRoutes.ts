import { Router } from 'express';
import { KpiController } from '../controllers/KpiController';
import { TransaksiController } from '../controllers/TransaksiController';
import { ProdukController } from '../controllers/ProdukController';
import { DashboardLengkapController } from '../controllers/DashboardLengkapController';
import { ChartController } from '../controllers/ChartController';
import { authenticate } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';

/**
 * Router untuk endpoint dashboard
 */
const router = Router();

/**
 * Middleware yang diterapkan ke semua route dashboard:
 * 1. authenticate - Memastikan user sudah login
 * 2. attachAccessScope - Memvalidasi akses tenant dan toko
 */
router.use(authenticate);
router.use(attachAccessScope);

/**
 * GET /api/dashboard/kpi
 * Mendapatkan data KPI dashboard
 * 
 * Query Parameters:
 * - tipeFilter: 'bulan_berjalan' | 'tahun_berjalan' | '6_bulan' | '3_bulan' | 'custom' | 'semua'
 * - tanggalMulai: string (format: YYYY-MM-DD) - untuk tipeFilter 'custom'
 * - tanggalSelesai: string (format: YYYY-MM-DD) - untuk tipeFilter 'custom'
 */
router.get('/kpi', KpiController.getKPI);

/**
 * GET /api/dashboard/transaksi-terbaru
 * Mendapatkan daftar transaksi terbaru
 * 
 * Query Parameters:
 * - tipeFilter: 'bulan_berjalan' | 'tahun_berjalan' | '6_bulan' | '3_bulan' | 'custom' | 'semua'
 * - tanggalMulai: string (format: YYYY-MM-DD) - untuk tipeFilter 'custom'
 * - tanggalSelesai: string (format: YYYY-MM-DD) - untuk tipeFilter 'custom'
 * - limit: number (1-50, default: 10)
 */
router.get('/transaksi-terbaru', TransaksiController.getTransaksiTerbaru);

/**
 * GET /api/dashboard/produk-terlaris
 * Mendapatkan daftar produk terlaris
 * 
 * Query Parameters:
 * - tipeFilter: 'bulan_berjalan' | 'tahun_berjalan' | '6_bulan' | '3_bulan' | 'custom' | 'semua'
 * - tanggalMulai: string (format: YYYY-MM-DD) - untuk tipeFilter 'custom'
 * - tanggalSelesai: string (format: YYYY-MM-DD) - untuk tipeFilter 'custom'
 * - limit: number (1-50, default: 10)
 */
router.get('/produk-terlaris', ProdukController.getProdukTerlaris);

/**
 * GET /api/dashboard/lengkap
 * Mendapatkan semua data dashboard (KPI + transaksi terbaru + produk terlaris)
 * 
 * Query Parameters:
 * - tipeFilter: 'bulan_berjalan' | 'tahun_berjalan' | '6_bulan' | '3_bulan' | 'custom' | 'semua'
 * - tanggalMulai: string (format: YYYY-MM-DD) - untuk tipeFilter 'custom'
 * - tanggalSelesai: string (format: YYYY-MM-DD) - untuk tipeFilter 'custom'
 * - limit: number (1-50, default: 10) - untuk transaksi dan produk
 */
router.get('/lengkap', DashboardLengkapController.getDashboardLengkap);

/**
 * GET /api/dashboard/chart-penjualan
 * Mendapatkan data chart penjualan untuk visualisasi
 * 
 * Query Parameters:
 * - tipeFilter: 'bulan_berjalan' | 'tahun_berjalan' | '6_bulan' | '3_bulan' | 'custom' | 'semua'
 * - tanggalMulai: string (format: YYYY-MM-DD) - untuk tipeFilter 'custom'
 * - tanggalSelesai: string (format: YYYY-MM-DD) - untuk tipeFilter 'custom'
 */
router.get('/chart-penjualan', ChartController.getChartPenjualan);

/**
 * GET /api/dashboard/health
 * Health check endpoint untuk dashboard API
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Dashboard API berjalan dengan baik',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;