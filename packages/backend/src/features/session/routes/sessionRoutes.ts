

import { Router } from 'express';
import { authenticate } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { SessionController } from '../controllers/SessionController';
import { requireMinimumLevel } from '@/features/auth/middleware/peranValidationMiddleware';

const router = Router();

// Public routes (no authentication needed)
router.post('/refresh', SessionController.refreshSession);

// Protected routes
router.use(authenticate);
router.use(attachAccessScope);

// User's own session management
router.get('/my-sessions', SessionController.getMySessions);

router.post('/extend', SessionController.extendSession);

router.post('/logout', SessionController.logoutCurrentSession);

router.post('/logout-all', SessionController.logoutAllSessions);

router.post('/logout-others', SessionController.logoutOtherSessions);

// Admin routes - require minimum level 2 (admin)
router.get('/', requireMinimumLevel(2), SessionController.search);

router.get('/stats', requireMinimumLevel(2), SessionController.getSessionStats);

export default router;