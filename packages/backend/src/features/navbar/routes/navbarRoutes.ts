/**
 * Routes untuk Navbar
 * Menangani endpoint khusus untuk data navbar (toko + tenant)
 */

import { Router } from 'express';
import { NavbarController } from '../controllers/NavbarController';
import { authenticate } from '@/features/auth/middleware/authMiddleware';
import { attachAccessScope } from '@/core/middleware/accessScope';

const router = Router();

// Terapkan middleware autentikasi dan access scope
router.use(authenticate);
router.use(attachAccessScope);

// Endpoint untuk mendapatkan data navbar (toko + tenant)
router.get('/info', NavbarController.getNavbarInfo);

// Health check endpoint
router.get('/health', NavbarController.healthCheck);

export default router;