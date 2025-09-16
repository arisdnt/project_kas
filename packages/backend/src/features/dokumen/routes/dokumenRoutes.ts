/**
 * Document Routes
 * Document and file management routes with proper authentication
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope, requireStoreWhenNeeded } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { DokumenController } from '../controllers/DokumenController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

// Document management routes
router.get('/',
  requirePermission(PERMISSIONS.DOCUMENT_READ),
  DokumenController.searchDocuments
);

router.get('/stats',
  requirePermission(PERMISSIONS.DOCUMENT_READ),
  DokumenController.getStorageStats
);

router.get('/category/:kategori',
  requirePermission(PERMISSIONS.DOCUMENT_READ),
  DokumenController.getDocumentsByCategory
);

router.get('/:id',
  requirePermission(PERMISSIONS.DOCUMENT_READ),
  DokumenController.findDocumentById
);

router.post('/upload',
  requirePermission(PERMISSIONS.DOCUMENT_CREATE),
  requireStoreWhenNeeded,
  DokumenController.uploadMiddleware,
  DokumenController.uploadDocument
);

router.put('/:id',
  requirePermission(PERMISSIONS.DOCUMENT_UPDATE),
  DokumenController.updateDocument
);

router.delete('/:id',
  requirePermission(PERMISSIONS.DOCUMENT_DELETE),
  DokumenController.deleteDocument
);

// Admin only routes
router.post('/cleanup-expired',
  requirePermission(PERMISSIONS.SYSTEM_MANAGE),
  DokumenController.cleanupExpiredDocuments
);

export default router;