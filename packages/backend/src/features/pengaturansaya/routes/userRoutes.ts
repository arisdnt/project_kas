

import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate, userRateLimit } from '@/features/auth/middleware/authMiddleware';

const router = Router();

// Rate limiting untuk user endpoints
const userRateLimit5 = userRateLimit(50, 15 * 60 * 1000); // 50 requests per 15 minutes
const passwordRateLimit = userRateLimit(10, 15 * 60 * 1000); // 10 password change attempts per 15 minutes

router.get('/profile', 
  authenticate, 
  userRateLimit5,
  UserController.getCurrentUser
);

router.post('/change-password', 
  authenticate, 
  passwordRateLimit,
  UserController.changePassword
);

export default router;