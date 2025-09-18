/**
 * Scope Routes
 * Routes for tenant and store scope operations
 */

import express from 'express';
import { ScopeController } from '../controllers/ScopeController';
import { authenticate } from '../middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';

const router = express.Router();

// Apply middleware
router.use(authenticate);
router.use(attachAccessScope);

// Scope routes
router.get('/tenants', ScopeController.getAccessibleTenants);
router.get('/stores', ScopeController.getAccessibleStores);
router.get('/capabilities', ScopeController.getScopeCapabilities);

export default router;