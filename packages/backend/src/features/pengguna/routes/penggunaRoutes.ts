/**
 * Routes untuk API Pengguna
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { Router } from 'express'
import { PenggunaController } from '../controllers/PenggunaController'
import { authenticate, authorize } from '@/features/auth/middleware/authMiddleware'
import { UserRole } from '@/features/auth/models/User'

const router = Router()

// Middleware untuk semua routes pengguna
router.use(authenticate)

/**
 * @route GET /api/pengguna
 * @desc Ambil semua pengguna dengan filter dan pagination
 * @access Private - Admin/Super Admin
 */
router.get('/', 
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), 
  PenggunaController.getAllPengguna
)

/**
 * @route GET /api/pengguna/peran
 * @desc Ambil semua peran yang tersedia
 * @access Private - Admin/Super Admin
 */
router.get('/peran', 
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), 
  PenggunaController.getAllPeran
)

/**
 * @route GET /api/pengguna/:id
 * @desc Ambil pengguna berdasarkan ID
 * @access Private - Admin/Super Admin
 */
router.get('/:id', 
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), 
  PenggunaController.getPenggunaById
)

/**
 * @route POST /api/pengguna
 * @desc Buat pengguna baru
 * @access Private - Admin/Super Admin
 */
router.post('/', 
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), 
  PenggunaController.createPengguna
)

/**
 * @route PUT /api/pengguna/:id
 * @desc Update pengguna berdasarkan ID
 * @access Private - Admin/Super Admin
 */
router.put('/:id', 
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), 
  PenggunaController.updatePengguna
)

/**
 * @route DELETE /api/pengguna/:id
 * @desc Hapus pengguna berdasarkan ID
 * @access Private - Admin/Super Admin
 */
router.delete('/:id', 
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), 
  PenggunaController.deletePengguna
)

export default router