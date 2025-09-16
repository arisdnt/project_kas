/**
 * Profil Saya Routes
 * Routes untuk mengelola profil user yang sedang login
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';
import { ProfilsayaController } from '../controllers/ProfilsayaController';

const router = Router();

// Apply common middleware
router.use(authenticate);
router.use(attachAccessScope);

// Self-service routes (any authenticated user can access their own data)
router.get('/me',
  ProfilsayaController.getMyDetailUser
);

router.put('/me',
  ProfilsayaController.updateMyDetailUser
);

// Administrative routes (require USER_READ permission)
router.get('/',
  requirePermission(PERMISSIONS.USER_READ),
  ProfilsayaController.getAllDetailUsers
);

router.get('/stats',
  requirePermission(PERMISSIONS.USER_READ),
  ProfilsayaController.getDetailUserStats
);

router.get('/departments',
  requirePermission(PERMISSIONS.USER_READ),
  ProfilsayaController.getDetailUsersByDepartment
);

// Specific detail user routes
router.get('/user/:userId',
  requirePermission(PERMISSIONS.USER_READ),
  ProfilsayaController.getDetailUserByUserId
);

router.get('/:id',
  requirePermission(PERMISSIONS.USER_READ),
  ProfilsayaController.getDetailUserById
);

// Create detail user (admin only)
router.post('/',
  requirePermission(PERMISSIONS.USER_CREATE),
  ProfilsayaController.createDetailUser
);

// Update detail user (admin only for others, any user for themselves)
router.put('/:id',
  requirePermission(PERMISSIONS.USER_UPDATE),
  ProfilsayaController.updateDetailUser
);

// Delete detail user (admin only)
router.delete('/:id',
  requirePermission(PERMISSIONS.USER_DELETE),
  ProfilsayaController.deleteDetailUser
);

export default router;