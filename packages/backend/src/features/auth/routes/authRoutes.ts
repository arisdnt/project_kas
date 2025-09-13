/**
 * Authentication Routes
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate, authorize, userRateLimit } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';

const router = Router();

// Rate limiting untuk auth endpoints
const authRateLimit = userRateLimit(5, 15 * 60 * 1000); // 5 requests per 15 minutes
const loginRateLimit = userRateLimit(3, 15 * 60 * 1000); // 3 login attempts per 15 minutes

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', loginRateLimit, AuthController.login);

/**
 * @route POST /api/auth/register
 * @desc Register new user (admin only)
 * @access Private - Admin/Super Admin
 */
router.post('/register', 
  authenticate, 
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AuthController.register
);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh', authRateLimit, AuthController.refreshToken);

/**
 * @route GET /api/auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', authenticate, AuthController.getProfile);

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * @route POST /api/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.post('/change-password', 
  authenticate, 
  authRateLimit,
  AuthController.changePassword
);

/**
 * @route POST /api/auth/verify-token
 * @desc Verify JWT token
 * @access Public
 */
router.post('/verify-token', AuthController.verifyToken);

export default router;