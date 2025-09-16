/**
 * Promo Routes
 * Promo management routes with proper authentication and authorization
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope, requireStoreWhenNeeded } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { PromoController } from '../controllers/PromoController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

// Promo CRUD routes - require store access for most operations
router.get('/',
  requirePermission(PERMISSIONS.PRODUCT_READ), // Using product read permission for promos
  PromoController.search
);

router.get('/code/:code',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  PromoController.findByCode
);

router.get('/:id',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  PromoController.findById
);

router.post('/',
  requirePermission(PERMISSIONS.PRODUCT_CREATE),
  requireStoreWhenNeeded,
  PromoController.create
);

router.put('/:id',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  requireStoreWhenNeeded,
  PromoController.update
);

router.delete('/:id',
  requirePermission(PERMISSIONS.PRODUCT_DELETE),
  requireStoreWhenNeeded,
  PromoController.delete
);

// Promo validation endpoint for POS system
router.post('/validate',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  requireStoreWhenNeeded,
  PromoController.validatePromo
);

export default router;