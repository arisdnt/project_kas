/**
 * Audit Routes
 * Audit log management routes with strict access control
 */

import { Router } from 'express';
import { authenticate } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { AuditController } from '../controllers/AuditController';
import { requireMinimumLevel } from '@/features/auth/middleware/peranValidationMiddleware';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

// All audit routes require admin level (level 2) or higher
router.use(requireMinimumLevel(2));

// Audit log routes - read-only for security
router.get('/', AuditController.search);
router.get('/activity-summary', AuditController.getActivitySummary);
router.get('/user-activity', AuditController.getUserActivity);
router.get('/:id', AuditController.findById);

export default router;