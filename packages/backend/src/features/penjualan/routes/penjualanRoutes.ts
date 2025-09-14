/**
 * Routes Penjualan
 */

import { Router } from 'express'
import { PenjualanController } from '../controllers/PenjualanController'
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware'
import { attachAccessScope, requireStoreWhenNeeded } from '@/core/middleware/accessScope'
import { PERMISSIONS } from '@/features/auth/models/User'

const router = Router()

router.use(authenticate)
router.use(attachAccessScope)

// Buat transaksi baru
router.post('/', requirePermission(PERMISSIONS.TRANSACTION_CREATE), requireStoreWhenNeeded, PenjualanController.create)

// Detail transaksi
router.get('/:id', requirePermission(PERMISSIONS.TRANSACTION_READ), PenjualanController.detail)

// Cetak struk (stub text)
router.post('/:id/cetak-struk', requirePermission(PERMISSIONS.TRANSACTION_READ), PenjualanController.cetakStruk)

export default router
