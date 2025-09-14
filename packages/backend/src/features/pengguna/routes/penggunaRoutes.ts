/**
 * Routes untuk API Pengguna
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { Router } from 'express'
import { PenggunaController } from '../controllers/PenggunaController'
import { authenticate, authorize } from '@/features/auth/middleware/authMiddleware'
import { UserRole } from '@/features/auth/models/User'
import { 
  requireCRUDAccess, 
  requireAdmin, 
  requireAdminToko 
} from '@/features/auth/middleware/levelAuthMiddleware'
import { CrudOperation, SystemModule } from '@/features/auth/middleware/levelAccessMiddleware'

const router = Router()

// Middleware untuk semua routes pengguna
router.use(authenticate)

/**
 * @route GET /api/pengguna
 * @desc Ambil semua pengguna dengan filter dan pagination
 * @access Private - Level 2+ (Admin ke atas)
 */
router.get('/', 
  requireCRUDAccess(CrudOperation.READ, SystemModule.PENGGUNA), 
  PenggunaController.getAllPengguna
)

/**
 * @route GET /api/pengguna/peran
 * @desc Ambil semua peran yang tersedia
 * @access Private - Level 2+ (Admin ke atas)
 */
router.get('/peran', 
  requireAdmin(CrudOperation.READ, SystemModule.PENGGUNA), 
  PenggunaController.getAllPeran
)

/**
 * @route GET /api/pengguna/:id
 * @desc Ambil pengguna berdasarkan ID
 * @access Private - Level 3+ (Admin Toko ke atas)
 */
router.get('/:id', 
  requireCRUDAccess(CrudOperation.READ, SystemModule.PENGGUNA), 
  PenggunaController.getPenggunaById
)

/**
 * @route POST /api/pengguna
 * @desc Buat pengguna baru
 * @access Private - Level 2+ (Admin ke atas)
 */
router.post('/', 
  requireAdmin(CrudOperation.CREATE, SystemModule.PENGGUNA), 
  PenggunaController.createPengguna
)

/**
 * @route PUT /api/pengguna/:id
 * @desc Update pengguna berdasarkan ID
 * @access Private - Level 2+ (Admin ke atas)
 */
router.put('/:id', 
  requireAdmin(CrudOperation.UPDATE, SystemModule.PENGGUNA), 
  PenggunaController.updatePengguna
)

/**
 * @route DELETE /api/pengguna/:id
 * @desc Hapus pengguna berdasarkan ID
 * @access Private - Level 2+ (Admin ke atas)
 */
router.delete('/:id', 
  requireAdmin(CrudOperation.DELETE, SystemModule.PENGGUNA), 
  PenggunaController.deletePengguna
)

export default router