

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { WebhookController } from '../controllers/WebhookController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

router.get('/',
  requirePermission(PERMISSIONS.WEBHOOK_READ),
  WebhookController.searchWebhooks
);

router.get('/:id',
  requirePermission(PERMISSIONS.WEBHOOK_READ),
  WebhookController.findWebhookById
);

router.get('/:id/deliveries',
  requirePermission(PERMISSIONS.WEBHOOK_READ),
  WebhookController.getWebhookDeliveries
);

router.get('/:id/stats',
  requirePermission(PERMISSIONS.WEBHOOK_READ),
  WebhookController.getWebhookStats
);

router.post('/',
  requirePermission(PERMISSIONS.WEBHOOK_CREATE),
  WebhookController.createWebhook
);

router.put('/:id',
  requirePermission(PERMISSIONS.WEBHOOK_UPDATE),
  WebhookController.updateWebhook
);

router.delete('/:id',
  requirePermission(PERMISSIONS.WEBHOOK_DELETE),
  WebhookController.deleteWebhook
);

router.post('/test',
  requirePermission(PERMISSIONS.WEBHOOK_CREATE),
  WebhookController.testWebhook
);

router.post('/trigger',
  requirePermission(PERMISSIONS.WEBHOOK_CREATE),
  WebhookController.triggerWebhooks
);

router.get('/integrations',
  requirePermission(PERMISSIONS.INTEGRATION_READ),
  WebhookController.getIntegrations
);

router.get('/integrations/:id',
  requirePermission(PERMISSIONS.INTEGRATION_READ),
  WebhookController.findIntegrationById
);

router.post('/integrations',
  requirePermission(PERMISSIONS.INTEGRATION_CREATE),
  WebhookController.createIntegration
);

router.put('/integrations/:id',
  requirePermission(PERMISSIONS.INTEGRATION_UPDATE),
  WebhookController.updateIntegration
);

export default router;