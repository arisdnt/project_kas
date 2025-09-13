/**
 * Routes untuk API Inventaris
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { Router } from 'express';
import { ProdukControllerExtended } from '@/features/produk/controllers/ProdukControllerExtended';
import { authenticate, authorize } from '@/features/auth/middleware/authMiddleware';
import { UserRole } from '@/features/auth/models/User';

const router = Router();

// Middleware untuk semua routes inventaris
router.use(authenticate);

// ===== INVENTARIS ROUTES =====

/**
 * @route GET /api/inventaris
 * @desc Get inventaris by toko
 * @access Private - Admin/Cashier
 */
router.get('/', 
  authorize(UserRole.ADMIN, UserRole.CASHIER), 
  ProdukControllerExtended.getInventarisByToko
);

/**
 * @route POST /api/inventaris
 * @desc Create or update inventaris
 * @access Private - Admin
 */
router.post('/', 
  authorize(UserRole.ADMIN), 
  ProdukControllerExtended.upsertInventaris
);

/**
 * @route PUT /api/inventaris
 * @desc Update inventaris (upsert)
 * @access Private - Admin
 */
router.put('/', 
  authorize(UserRole.ADMIN), 
  ProdukControllerExtended.upsertInventaris
);

/**
 * @route PUT /api/inventaris/:productId/stok
 * @desc Update stok inventaris
 * @access Private - Admin
 */
router.put('/:productId/stok', 
  authorize(UserRole.ADMIN), 
  ProdukControllerExtended.updateStok
);

/**
 * @route DELETE /api/inventaris/:id
 * @desc Delete inventaris by ID
 * @access Private - Admin
 */
router.delete('/:id', 
  authorize(UserRole.ADMIN), 
  ProdukControllerExtended.deleteInventaris
);

export default router;