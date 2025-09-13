/**
 * Routes Penjualan
 */

import { Router } from 'express'
import { PenjualanController } from '../controllers/PenjualanController'
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware'

const router = Router()

router.use(authenticate)

// Buat transaksi baru
router.post('/', requirePermission('penjualan:buat'), PenjualanController.create)

// Detail transaksi
router.get('/:id', requirePermission('penjualan:lihat'), PenjualanController.detail)

// Cetak struk (stub text)
router.post('/:id/cetak-struk', requirePermission('penjualan:lihat'), PenjualanController.cetakStruk)

export default router

