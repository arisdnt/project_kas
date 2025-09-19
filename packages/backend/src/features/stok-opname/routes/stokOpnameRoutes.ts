/**
 * Routes untuk Stok Opname
 * Menangani routing HTTP untuk operasi stok opname
 */

import { Router } from 'express';
import { StokOpnameController } from '../controllers/StokOpnameController';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

// Routes untuk stok opname
router.get('/',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  StokOpnameController.getStokOpname
);

router.get('/:id',
  requirePermission(PERMISSIONS.PRODUCT_READ),
  StokOpnameController.getStokOpnameById
);

router.post('/',
  requirePermission(PERMISSIONS.PRODUCT_CREATE),
  StokOpnameController.createStokOpname
);

router.put('/:id',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  StokOpnameController.updateStokOpname
);

router.delete('/:id',
  requirePermission(PERMISSIONS.PRODUCT_DELETE),
  StokOpnameController.deleteStokOpname
);

router.patch('/:id/complete',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  StokOpnameController.completeStokOpname
);

router.patch('/:id/cancel',
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  StokOpnameController.cancelStokOpname
);

export default router;