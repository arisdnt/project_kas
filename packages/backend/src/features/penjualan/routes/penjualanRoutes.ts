/**
 * Sales Routes
 * Sales transaction management routes with proper authentication and authorization
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope, requireStoreWhenNeeded } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { PenjualanController } from '../controllers/PenjualanController';
import { PenjualanReportController } from '../controllers/PenjualanReportController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

// Transaction CRUD routes - all require store access for POS operations
router.get('/',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  requireStoreWhenNeeded,
  PenjualanController.search
);

router.get('/:id',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  requireStoreWhenNeeded,
  PenjualanController.findById
);

router.post('/',
  requirePermission(PERMISSIONS.TRANSACTION_CREATE),
  requireStoreWhenNeeded,
  PenjualanController.create
);

router.put('/:id',
  requirePermission(PERMISSIONS.TRANSACTION_UPDATE),
  requireStoreWhenNeeded,
  PenjualanController.update
);

router.delete('/:id',
  requirePermission(PERMISSIONS.TRANSACTION_DELETE),
  requireStoreWhenNeeded,
  PenjualanController.cancel
);

// Reporting routes - require report permissions
router.get('/reports/daily-sales',
  requirePermission(PERMISSIONS.REPORT_READ),
  PenjualanReportController.getDailySales
);

router.get('/reports/top-products',
  requirePermission(PERMISSIONS.REPORT_READ),
  PenjualanReportController.getTopProducts
);

router.get('/reports/sales-chart',
  requirePermission(PERMISSIONS.REPORT_READ),
  PenjualanReportController.getSalesChart
);

router.get('/reports/payment-methods',
  requirePermission(PERMISSIONS.REPORT_READ),
  PenjualanReportController.getPaymentMethodStats
);

router.get('/reports/cashier-performance',
  requirePermission(PERMISSIONS.REPORT_READ),
  PenjualanReportController.getCashierPerformance
);

export default router;