/**
 * Routes Pelanggan
 */

import { Router } from 'express'
import { authenticate, requirePermission } from '@/features/auth/middleware/authMiddleware'
import { PelangganController } from '../controllers/PelangganController'
import { attachAccessScope } from '@/core/middleware/accessScope'
import { PERMISSIONS } from '@/features/auth/models/User'

const router = Router()

router.use(authenticate)
router.use(attachAccessScope)

router.get('/', requirePermission(PERMISSIONS.CUSTOMER_READ), PelangganController.search)

export default router
