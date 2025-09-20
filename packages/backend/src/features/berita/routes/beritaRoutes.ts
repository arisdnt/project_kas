/**
 * Routes untuk berita
 * Menangani routing HTTP untuk operasi CRUD berita
 */

import { Router } from 'express';
import { BeritaController } from '../controllers/BeritaController';
import { authenticate } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { requireMinimumLevel } from '@/features/auth/middleware/peranValidationMiddleware';

const router = Router();

// Middleware untuk semua routes berita
router.use(authenticate);
router.use(attachAccessScope);

/**
 * GET /api/berita/search
 * Pencarian berita dengan filter dan pagination
 * Akses: Level 1-5 (semua user)
 */
router.get('/search', BeritaController.searchBerita);

/**
 * GET /api/berita/stats
 * Mendapatkan statistik berita
 * Akses: Level 1-3 (admin)
 */
router.get('/stats', requireMinimumLevel(3), BeritaController.getStats);

/**
 * GET /api/berita/active
 * Mendapatkan berita aktif untuk tampilan publik
 * Akses: Level 1-5 (semua user)
 */
router.get('/active', BeritaController.getActiveNews);

/**
 * GET /api/berita
 * Mendapatkan semua berita dengan pagination
 * Akses: Level 1-5 (semua user)
 */
router.get('/', BeritaController.searchBerita);

/**
 * GET /api/berita/dashboard
 * Mendapatkan data dashboard berita
 * Akses: Level 1-3 (admin)
 */
router.get('/dashboard', requireMinimumLevel(3), BeritaController.getDashboard);

/**
 * GET /api/berita/:id
 * Mendapatkan berita berdasarkan ID
 * Akses: Level 1-5 (semua user)
 */
router.get('/:id', BeritaController.findById);

/**
 * POST /api/berita
 * Membuat berita baru
 * Akses: Level 1-3 (admin)
 */
router.post('/', requireMinimumLevel(3), BeritaController.createBerita);

/**
 * PUT /api/berita/:id
 * Mengupdate berita
 * Akses: Level 1-3 (admin)
 */
router.put('/:id', requireMinimumLevel(3), BeritaController.updateBerita);

/**
 * DELETE /api/berita/:id
 * Menghapus berita
 * Akses: Level 1-2 (super admin dan admin tenant)
 */
router.delete('/:id', requireMinimumLevel(2), BeritaController.deleteBerita);

export default router;