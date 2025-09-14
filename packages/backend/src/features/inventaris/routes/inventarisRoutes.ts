/**
 * Routes untuk API Inventaris
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { Router } from 'express';
import { ProdukInventarisController } from '@/features/produk/controllers/ProdukInventarisController';
import { authenticate, authorize } from '@/features/auth/middleware/authMiddleware';
import { UserRole } from '@/features/auth/models/User';
import { attachAccessScope, requireStoreWhenNeeded } from '@/core/middleware/accessScope';

const router = Router();

// Middleware untuk semua routes inventaris
router.use(authenticate);
router.use(attachAccessScope);

// ===== INVENTARIS ROUTES =====

/**
 * @route GET /api/inventaris
 * @desc Get inventaris by toko
 * @access Private - Admin/Cashier
 */
router.get('/', 
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CASHIER), 
  requireStoreWhenNeeded,
  ProdukInventarisController.getInventarisByToko
);

/**
 * @route POST /api/inventaris
 * @desc Create or update inventaris
 * @access Private - Admin
 */
router.post('/', 
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), 
  requireStoreWhenNeeded,
  ProdukInventarisController.upsertInventaris
);

/**
 * @route PUT /api/inventaris
 * @desc Update inventaris (upsert)
 * @access Private - Admin
 */
router.put('/', 
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), 
  requireStoreWhenNeeded,
  ProdukInventarisController.upsertInventaris
);

/**
 * @route PUT /api/inventaris/:productId/stok
 * @desc Update stok inventaris
 * @access Private - Admin
 */
router.put('/:productId/stok', 
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), 
  requireStoreWhenNeeded,
  ProdukInventarisController.updateStok
);

/**
 * @route DELETE /api/inventaris/:id
 * @desc Delete inventaris by ID
 * @access Private - Admin
 */
router.delete('/:id', 
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), 
  requireStoreWhenNeeded,
  ProdukInventarisController.deleteInventaris
);

export default router;
