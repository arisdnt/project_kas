/**
 * Routes untuk API Promo
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { Router } from 'express';
import { PromoController } from '../controllers/PromoController';
import { authenticate, authorize } from '@/features/auth/middleware/authMiddleware';
import { UserRole } from '@/features/auth/models/User';

const router = Router();

// Middleware untuk semua routes promo
router.use(authenticate);

// ===== PROMO ROUTES =====

/**
 * @route GET /api/v1/promos
 * @desc Get all promos
 * @access Private - Admin/Cashier
 */
router.get('/', 
  authorize(UserRole.ADMIN, UserRole.CASHIER), 
  PromoController.getAllPromos
);

/**
 * @route GET /api/v1/promos/stats
 * @desc Get promo statistics
 * @access Private - Admin/Cashier
 */
router.get('/stats', 
  authorize(UserRole.ADMIN, UserRole.CASHIER), 
  PromoController.getPromoStats
);

/**
 * @route GET /api/v1/promos/active
 * @desc Get active promos
 * @access Private - Admin/Cashier
 */
router.get('/active', 
  authorize(UserRole.ADMIN, UserRole.CASHIER), 
  PromoController.getActivePromos
);

/**
 * @route GET /api/v1/promos/range
 * @desc Get promos by date range
 * @access Private - Admin/Cashier
 */
router.get('/range', 
  authorize(UserRole.ADMIN, UserRole.CASHIER), 
  PromoController.getPromosByDateRange
);

/**
 * @route GET /api/v1/promos/:id
 * @desc Get promo by ID
 * @access Private - Admin/Cashier
 */
router.get('/:id', 
  authorize(UserRole.ADMIN, UserRole.CASHIER), 
  PromoController.getPromoById
);

/**
 * @route POST /api/v1/promos
 * @desc Create new promo
 * @access Private - Admin only
 */
router.post('/', 
  authorize(UserRole.ADMIN), 
  PromoController.createPromo
);

/**
 * @route PUT /api/v1/promos/:id
 * @desc Update promo
 * @access Private - Admin only
 */
router.put('/:id', 
  authorize(UserRole.ADMIN), 
  PromoController.updatePromo
);

/**
 * @route PATCH /api/v1/promos/:id/toggle
 * @desc Toggle promo status
 * @access Private - Admin only
 */
router.patch('/:id/toggle', 
  authorize(UserRole.ADMIN), 
  PromoController.togglePromoStatus
);

/**
 * @route DELETE /api/v1/promos/:id
 * @desc Delete promo
 * @access Private - Admin only
 */
router.delete('/:id', 
  authorize(UserRole.ADMIN), 
  PromoController.deletePromo
);

export default router;