

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { DashboardController } from '../controllers/DashboardController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

router.get('/kpis/overview',
  requirePermission(PERMISSIONS.REPORT_READ),
  DashboardController.getOverviewKPIs
);

router.get('/analytics/sales-chart',
  requirePermission(PERMISSIONS.REPORT_READ),
  DashboardController.getSalesChart
);

router.get('/analytics/top-products',
  requirePermission(PERMISSIONS.REPORT_READ),
  DashboardController.getTopProducts
);

router.get('/analytics/top-customers',
  requirePermission(PERMISSIONS.REPORT_READ),
  DashboardController.getTopCustomers
);

router.get('/analytics/payment-methods',
  requirePermission(PERMISSIONS.REPORT_READ),
  DashboardController.getPaymentMethodDistribution
);

router.get('/analytics/category-performance',
  requirePermission(PERMISSIONS.REPORT_READ),
  DashboardController.getCategoryPerformance
);

export default router;