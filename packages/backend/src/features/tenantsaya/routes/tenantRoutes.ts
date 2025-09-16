/**
 * Tenant Routes untuk Tenantsaya
 * Routes untuk mengelola data tenant user yang sedang login
 */

import { Router } from 'express';
import { authenticate } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { TenantController } from '../controllers/TenantController';

const router = Router();

// Apply authentication middleware terlebih dahulu
router.use(authenticate);
// Kemudian apply access scope middleware
router.use(attachAccessScope);

/**
 * @route GET /api/tenantsaya
 * @desc Mendapatkan data tenant user yang sedang login
 * @access Private - Authenticated users
 */
router.get('/', TenantController.getTenantSaya);

/**
 * @route GET /api/tenantsaya/stats
 * @desc Mendapatkan statistik tenant user yang sedang login
 * @access Private - Authenticated users
 */
router.get('/stats', TenantController.getTenantStats);

/**
 * @route GET /api/tenantsaya/health
 * @desc Health check endpoint untuk tenant
 * @access Private - Authenticated users
 */
router.get('/health', TenantController.healthCheck);

export default router;