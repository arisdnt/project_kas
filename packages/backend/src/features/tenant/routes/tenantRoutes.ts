/**
 * Tenant Routes
 * Tenant management routes (God user only)
 */

import { Router } from 'express';
import { authenticate } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { TenantController } from '../controllers/TenantController';
import { TokoController } from '../controllers/TokoController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

// Tenant management routes (God user only)
router.get('/', TenantController.search);
router.get('/stats', TenantController.getTenantStats);
router.get('/:id', TenantController.findById);
router.post('/', TenantController.create);
router.put('/:id', TenantController.update);
router.get('/:id/limits', TenantController.checkLimits);

// Store management routes
router.get('/:tenantId/stores', TokoController.getTenantStores);
router.post('/stores', TokoController.create);
router.put('/stores/:id', TokoController.update);
router.delete('/stores/:id', TokoController.delete);

export default router;