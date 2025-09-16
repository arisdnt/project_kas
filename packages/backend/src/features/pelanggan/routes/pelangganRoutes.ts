/**
 * Customer Routes
 * Customer management routes with proper authentication
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope, requireStoreWhenNeeded } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { PelangganController } from '../controllers/PelangganController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

// Customer management routes
router.get('/',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  PelangganController.searchCustomers
);

router.get('/active',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  PelangganController.getActiveCustomers
);

router.get('/segmentation',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  PelangganController.getCustomerSegmentation
);

router.get('/loyalty-report',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  PelangganController.getLoyaltyReport
);

router.get('/:id',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  PelangganController.findCustomerById
);

router.get('/:id/full-profile',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  PelangganController.getCustomerWithFullProfile
);

router.get('/code/:kode',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  PelangganController.findCustomerByCode
);

router.get('/:id/stats',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  PelangganController.getCustomerStats
);

router.get('/:id/transactions',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  PelangganController.getTransactionHistory
);

router.get('/:id/points-history',
  requirePermission(PERMISSIONS.CUSTOMER_READ),
  PelangganController.getPointsHistory
);

router.post('/',
  requirePermission(PERMISSIONS.CUSTOMER_CREATE),
  requireStoreWhenNeeded,
  PelangganController.createCustomer
);

router.put('/:id',
  requirePermission(PERMISSIONS.CUSTOMER_UPDATE),
  PelangganController.updateCustomer
);

// Points management routes
router.post('/:id/adjust-points',
  requirePermission(PERMISSIONS.CUSTOMER_UPDATE),
  PelangganController.adjustCustomerPoints
);

router.post('/:id/earn-points',
  requirePermission(PERMISSIONS.CUSTOMER_UPDATE),
  PelangganController.earnPoints
);

router.post('/:id/redeem-points',
  requirePermission(PERMISSIONS.CUSTOMER_UPDATE),
  PelangganController.redeemPoints
);

// Credit management routes
router.post('/adjust-credit-limit',
  requirePermission(PERMISSIONS.CUSTOMER_UPDATE),
  PelangganController.adjustCreditLimit
);

// Bulk operations
router.post('/bulk-action',
  requirePermission(PERMISSIONS.CUSTOMER_UPDATE),
  PelangganController.bulkCustomerAction
);

router.post('/import',
  requirePermission(PERMISSIONS.CUSTOMER_CREATE),
  requireStoreWhenNeeded,
  PelangganController.importCustomers
);

export default router;