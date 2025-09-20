/**
 * Route definitions untuk API catatan
 * Menangani routing, middleware auth, dan permission
 */

import { Router } from 'express';
import { CatatanController } from '../controllers/CatatanController';
import { CatatanControllerExtended } from '../controllers/CatatanControllerExtended';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';

const router = Router();

// Middleware global untuk semua route catatan
router.use(authenticate);
router.use(attachAccessScope);

// Route untuk operasi CRUD dasar catatan
router.get(
  '/search',
  requirePermission('catatan:read'),
  CatatanController.searchCatatan
);

router.get(
  '/stats',
  requirePermission('catatan:read'),
  CatatanController.getStats
);

router.get(
  '/:id',
  requirePermission('catatan:read'),
  CatatanController.findById
);

router.post(
  '/',
  requirePermission('catatan:create'),
  CatatanController.createCatatan
);

router.put(
  '/:id',
  requirePermission('catatan:update'),
  CatatanController.updateCatatan
);

router.delete(
  '/:id',
  requirePermission('catatan:delete'),
  CatatanController.deleteCatatan
);

// Route untuk fitur tambahan catatan
router.get(
  '/kategori/:kategori',
  requirePermission('catatan:read'),
  CatatanControllerExtended.getCatatanByKategori
);

router.get(
  '/filter/reminder',
  requirePermission('catatan:read'),
  CatatanControllerExtended.getCatatanWithReminder
);

router.get(
  '/prioritas/:prioritas',
  requirePermission('catatan:read'),
  CatatanControllerExtended.getCatatanByPrioritas
);

router.get(
  '/status/:status',
  requirePermission('catatan:read'),
  CatatanControllerExtended.getCatatanByStatus
);

router.get(
  '/filter/tags',
  requirePermission('catatan:read'),
  CatatanControllerExtended.searchByTags
);

router.get(
  '/filter/recent',
  requirePermission('catatan:read'),
  CatatanControllerExtended.getRecentCatatan
);

export default router;