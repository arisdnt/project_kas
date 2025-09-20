

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope, requireStoreWhenNeeded } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { requireAdminTokoAccess, SystemModule, CrudOperation } from '@/features/auth/middleware/levelAccessMiddleware';
import { PembelianController } from '../controllers/PembelianController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

// Purchase transaction CRUD routes - all require store access
router.get('/',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  requireStoreWhenNeeded,
  PembelianController.search
);

router.get('/:id',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  requireStoreWhenNeeded,
  PembelianController.findById
);

router.post('/',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  requireStoreWhenNeeded,
  PembelianController.create
);

router.post('/restock',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  requireAdminTokoAccess(SystemModule.TRANSAKSI, CrudOperation.CREATE),
  requireStoreWhenNeeded,
  PembelianController.restock
);

router.put('/:id',
  requirePermission(PERMISSIONS.TRANSACTION_UPDATE),
  requireStoreWhenNeeded,
  PembelianController.update
);

router.delete('/:id',
  requirePermission(PERMISSIONS.TRANSACTION_DELETE),
  requireStoreWhenNeeded,
  PembelianController.cancel
);

export default router;
