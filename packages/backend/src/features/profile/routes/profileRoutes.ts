

import { Router } from 'express';
import { ProfileController } from '../controllers/ProfileController';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';
import { PERMISSIONS } from '@/features/auth/models/User';

const router = Router();

// Apply authentication and access scope to all routes
router.use(authenticate);
router.use(attachAccessScope);

// My profile routes (self-service)
router.get('/me', ProfileController.getMyProfile);

router.put('/me', ProfileController.updateMyProfile);

router.put('/me/password', ProfileController.changeMyPassword);

router.put('/me/avatar', ProfileController.updateMyAvatar);

router.delete('/me', ProfileController.deleteMyAccount);

// My performance and analytics routes
router.get('/me/performance', ProfileController.getMyPerformanceStats);

router.get('/me/activity', ProfileController.getMyActivityLogs);

router.get('/me/sales-report', ProfileController.getMySalesReport);

// My settings routes
router.get('/me/settings', ProfileController.getMySettings);

router.put('/me/settings', ProfileController.updateMySettings);

// Dashboard route
router.get('/me/dashboard', ProfileController.getProfileDashboard);

// Team performance comparison (requires manager role or higher)
router.get('/me/team-comparison', requirePermission(PERMISSIONS.USER_READ), ProfileController.getTeamPerformanceComparison);

// Admin routes for managing other users (requires admin role or higher)
router.get('/users/:userId', requirePermission(PERMISSIONS.USER_READ), ProfileController.getUserProfile);

router.put('/users/:userId', requirePermission(PERMISSIONS.USER_UPDATE), ProfileController.updateUserProfile);

router.put('/users/:userId/password', requirePermission(PERMISSIONS.USER_UPDATE), ProfileController.changeUserPassword);

router.delete('/users/:userId', requirePermission(PERMISSIONS.USER_DELETE), ProfileController.deleteUserAccount);

// Admin routes for user analytics (requires admin role or higher)
router.get('/users/:userId/performance', requirePermission(PERMISSIONS.USER_READ), ProfileController.getUserPerformanceStats);

router.get('/users/:userId/activity', requirePermission(PERMISSIONS.USER_READ), ProfileController.getUserActivityLogs);

router.get('/users/:userId/sales-report', requirePermission(PERMISSIONS.USER_READ), ProfileController.getUserSalesReport);

export default router;
