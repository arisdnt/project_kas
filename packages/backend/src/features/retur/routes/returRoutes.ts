

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope, requireStoreWhenNeeded } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { ReturController } from '../controllers/ReturController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

// Sales return routes
router.get('/sales',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  requireStoreWhenNeeded,
  ReturController.searchSalesReturns
);

router.get('/sales/:id',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  requireStoreWhenNeeded,
  ReturController.findSalesReturnById
);

router.post('/sales',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  requireStoreWhenNeeded,
  ReturController.createSalesReturn
);

router.put('/sales/:id',
  requirePermission(PERMISSIONS.TRANSACTION_UPDATE),
  requireStoreWhenNeeded,
  ReturController.updateSalesReturn
);

// Purchase return routes
router.get('/purchases',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  requireStoreWhenNeeded,
  ReturController.searchPurchaseReturns
);

router.get('/purchases/:id',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  requireStoreWhenNeeded,
  ReturController.findPurchaseReturnById
);

router.post('/purchases',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  requireStoreWhenNeeded,
  ReturController.createPurchaseReturn
);

router.put('/purchases/:id',
  requirePermission(PERMISSIONS.TRANSACTION_UPDATE),
  requireStoreWhenNeeded,
  ReturController.updatePurchaseReturn
);

// Statistics route
router.get('/stats',
  requirePermission(PERMISSIONS.REPORT_READ),
  ReturController.getReturnStats
);

export default router;