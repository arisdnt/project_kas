/**
 * Configuration Routes
 * System configuration management routes with proper access control
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { KonfigurasiController } from '../controllers/KonfigurasiController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

// Configuration read routes
router.get('/',
  requirePermission(PERMISSIONS.SETTINGS_READ),
  KonfigurasiController.getConfiguration
);

router.get('/tenant',
  requirePermission(PERMISSIONS.SETTINGS_READ),
  KonfigurasiController.getTenantConfiguration
);

router.get('/stores',
  requirePermission(PERMISSIONS.SETTINGS_READ),
  KonfigurasiController.getAllStoreConfigurations
);

router.get('/effective',
  requirePermission(PERMISSIONS.SETTINGS_READ),
  KonfigurasiController.getEffectiveConfiguration
);

router.get('/store/:storeId',
  requirePermission(PERMISSIONS.SETTINGS_READ),
  KonfigurasiController.getStoreConfiguration
);

// Configuration update routes
router.put('/tenant',
  requirePermission(PERMISSIONS.SETTINGS_UPDATE),
  KonfigurasiController.updateTenantConfiguration
);

router.put('/store/:storeId',
  requirePermission(PERMISSIONS.SETTINGS_UPDATE),
  KonfigurasiController.updateStoreConfiguration
);

// Utility routes
router.post('/calculate-tax',
  requirePermission(PERMISSIONS.TRANSACTION_READ),
  KonfigurasiController.calculateTax
);

export default router;