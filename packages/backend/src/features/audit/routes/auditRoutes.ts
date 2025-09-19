

import { Router } from 'express';
import { AuditController } from '../controllers/AuditController';

const router = Router();

router.get('/', AuditController.search);

router.get('/activity-summary', AuditController.getActivitySummary);

router.get('/user-activity', AuditController.getUserActivity);

router.get('/:id', AuditController.findById);

export default router;