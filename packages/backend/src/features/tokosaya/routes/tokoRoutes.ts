

import { Router } from 'express';
import { TokoController } from '../controllers/TokoController';
import { authenticate } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

router.get('/', TokoController.getTokoSaya);

router.get('/stats', TokoController.getTokoStats);

router.get('/health', TokoController.healthCheck);

router.get('/:id', TokoController.getTokoById);

export default router;