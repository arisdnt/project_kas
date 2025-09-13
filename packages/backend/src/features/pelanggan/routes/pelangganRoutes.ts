/**
 * Routes Pelanggan
 */

import { Router } from 'express'
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware'
import { PelangganController } from '../controllers/PelangganController'

const router = Router()

router.use(authenticate)

router.get('/', requirePermission('penjualan:lihat'), PelangganController.search)

export default router

