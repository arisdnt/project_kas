/**
 * User Routes untuk Pengaturan Saya
 * Routes untuk mengelola data user yang sedang login
 */

import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate, userRateLimit } from '@/features/auth/middleware/authMiddleware';

const router = Router();

// Rate limiting untuk user endpoints
const userRateLimit5 = userRateLimit(50, 15 * 60 * 1000); // 50 requests per 15 minutes
const passwordRateLimit = userRateLimit(10, 15 * 60 * 1000); // 10 password change attempts per 15 minutes

/**
 * @route GET /api/pengaturansaya/profile
 * @desc Mendapatkan data user yang sedang login
 * @access Private - Authenticated users
 */
router.get('/profile', 
  authenticate, 
  userRateLimit5,
  UserController.getCurrentUser
);

/**
 * @route POST /api/pengaturansaya/change-password
 * @desc Ubah password user yang sedang login
 * @access Private - Authenticated users
 */
router.post('/change-password', 
  authenticate, 
  passwordRateLimit,
  UserController.changePassword
);

export default router;