

import { Router } from 'express';
import { authenticate } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { TenantController } from '../controllers/TenantController';

const router = Router();

// Apply authentication middleware terlebih dahulu
router.use(authenticate);
// Kemudian apply access scope middleware
router.use(attachAccessScope);

router.get('/', TenantController.getTenantSaya);

router.get('/stats', TenantController.getTenantStats);

router.get('/health', TenantController.healthCheck);

export default router;