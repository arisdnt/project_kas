/**
 * Routes untuk endpoint Toko Saya
 * Mengelola routing untuk fitur toko milik user yang login
 */

import { Router } from 'express';
import { TokoController } from '../controllers/TokoController';
import { authenticate } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';

const router = Router();

/**
 * Middleware untuk semua routes tokosaya
 * Memerlukan autentikasi dan access scope
 */
router.use(authenticate);
router.use(attachAccessScope);

/**
 * @route GET /api/tokosaya
 * @desc Mengambil data toko milik user yang sedang login
 * @access Private - Memerlukan autentikasi
 * @middleware authenticate, attachAccessScope
 */
router.get('/', TokoController.getTokoSaya);

/**
 * @route GET /api/tokosaya/stats
 * @desc Mengambil statistik toko milik user yang sedang login
 * @access Private - Memerlukan autentikasi
 * @middleware authenticate, attachAccessScope
 */
router.get('/stats', TokoController.getTokoStats);

/**
 * @route GET /api/tokosaya/health
 * @desc Health check untuk endpoint tokosaya
 * @access Private - Memerlukan autentikasi
 * @middleware authenticate, attachAccessScope
 */
router.get('/health', TokoController.healthCheck);

/**
 * @route GET /api/tokosaya/:id
 * @desc Mengambil data toko berdasarkan ID (dengan validasi akses)
 * @access Private - Memerlukan autentikasi
 * @middleware authenticate, attachAccessScope
 */
router.get('/:id', TokoController.getTokoById);

export default router;