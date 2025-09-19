

import { Router } from 'express';
import { authenticate } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { TenantController } from '../controllers/TenantController';
import { TokoController } from '../controllers/TokoController';
import { requireGodUserForTenant, requireTenantReadAccess } from '../middleware/tenantAccessMiddleware';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

router.get('/', requireGodUserForTenant, TenantController.search);

router.get('/stats', requireGodUserForTenant, TenantController.getTenantStats);

router.get('/:id', requireTenantReadAccess, TenantController.findById);

router.post('/', requireGodUserForTenant, TenantController.create);

router.put('/:id', requireGodUserForTenant, TenantController.update);

router.delete('/:id', requireGodUserForTenant, TenantController.delete);

router.get('/:id/limits', requireTenantReadAccess, TenantController.checkLimits);

router.get('/:tenantId/stores', TokoController.getTenantStores);

router.post('/stores', TokoController.create);

router.put('/stores/:id', TokoController.update);

router.delete('/stores/:id', TokoController.delete);

export default router;