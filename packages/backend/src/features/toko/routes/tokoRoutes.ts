

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { TokoController } from '../controllers/TokoController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

router.get('/',
  requirePermission(PERMISSIONS.STORE_READ),
  TokoController.searchStores
);

router.get('/active',
  requirePermission(PERMISSIONS.STORE_READ),
  TokoController.getActiveStores
);

router.get('/:id',
  requirePermission(PERMISSIONS.STORE_READ),
  TokoController.findStoreById
);

router.get('/:id/full-info',
  requirePermission(PERMISSIONS.STORE_READ),
  TokoController.getStoreWithFullInfo
);

router.get('/code/:kode',
  requirePermission(PERMISSIONS.STORE_READ),
  TokoController.findStoreByCode
);

router.post('/',
  requirePermission(PERMISSIONS.STORE_CREATE),
  TokoController.createStore
);

router.put('/:id',
  requirePermission(PERMISSIONS.STORE_UPDATE),
  TokoController.updateStore
);

router.delete('/:id',
  requirePermission(PERMISSIONS.STORE_DELETE),
  TokoController.deleteStore
);

router.get('/:id/configs',
  requirePermission(PERMISSIONS.STORE_READ),
  TokoController.getStoreConfigs
);

router.get('/:id/configs/:key',
  requirePermission(PERMISSIONS.STORE_READ),
  TokoController.getStoreConfig
);

router.post('/:id/configs',
  requirePermission(PERMISSIONS.STORE_UPDATE),
  TokoController.setStoreConfig
);

router.put('/:id/configs/:key',
  requirePermission(PERMISSIONS.STORE_UPDATE),
  TokoController.updateStoreConfig
);

router.delete('/:id/configs/:key',
  requirePermission(PERMISSIONS.STORE_DELETE),
  TokoController.deleteStoreConfig
);

router.get('/:id/operating-hours',
  requirePermission(PERMISSIONS.STORE_READ),
  TokoController.getOperatingHours
);

router.put('/:id/operating-hours',
  requirePermission(PERMISSIONS.STORE_UPDATE),
  TokoController.updateOperatingHours
);

router.get('/:id/stats',
  requirePermission(PERMISSIONS.STORE_READ),
  TokoController.getStoreStats
);

export default router;