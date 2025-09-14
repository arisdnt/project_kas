/**
 * Routes Laporan Keuangan (Ledger & Laba Rugi)
 */

import { Router } from 'express';
import { KeuanganController } from '@/features/keuangan/controllers/KeuanganController';
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware';
import { PERMISSIONS } from '@/features/auth/models/User';

const router = Router();

router.use(authenticate);

router.get('/ledger', requirePermission(PERMISSIONS.REPORT_READ), KeuanganController.ledger);
router.get('/pl', requirePermission(PERMISSIONS.REPORT_READ), KeuanganController.profitLoss);

export default router;

