

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';

const router = Router();

router.post('/login', AuthController.login);

router.post('/refresh', AuthController.refreshToken);

router.get('/profile', authenticate, AuthController.getProfile);

router.post('/logout', authenticate, AuthController.logout);

router.post('/change-password', 
  authenticate, 
  AuthController.changePassword
);

router.post('/verify-token', AuthController.verifyToken);

export default router;