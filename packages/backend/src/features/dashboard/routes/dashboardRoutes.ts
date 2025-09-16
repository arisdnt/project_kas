/**
 * Dashboard Routes
 * Dashboard analytics and KPI routes with proper authentication
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { DashboardController } from '../controllers/DashboardController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

// Overview KPIs
router.get('/kpis/overview',
  requirePermission(PERMISSIONS.REPORT_READ),
  DashboardController.getOverviewKPIs
);

// Sales analytics
router.get('/analytics/sales-chart',
  requirePermission(PERMISSIONS.REPORT_READ),
  DashboardController.getSalesChart
);

// Top performers
router.get('/analytics/top-products',
  requirePermission(PERMISSIONS.REPORT_READ),
  DashboardController.getTopProducts
);

router.get('/analytics/top-customers',
  requirePermission(PERMISSIONS.REPORT_READ),
  DashboardController.getTopCustomers
);

// Distribution analytics
router.get('/analytics/payment-methods',
  requirePermission(PERMISSIONS.REPORT_READ),
  DashboardController.getPaymentMethodDistribution
);

router.get('/analytics/category-performance',
  requirePermission(PERMISSIONS.REPORT_READ),
  DashboardController.getCategoryPerformance
);

export default router;