import { Router } from 'express'
import { FileTypesController } from '../controllers/FileTypesController'
import { authenticate } from '@/features/auth/middleware/authMiddleware'

const router = Router()

/**
 * Routes untuk mengelola informasi tipe file yang diizinkan
 * Semua endpoint memerlukan autentikasi
 */

// GET /api/file-types/allowed - Mendapatkan semua MIME types yang diizinkan
router.get('/allowed', authenticate, FileTypesController.getAllowedTypes)

// GET /api/file-types/config - Mendapatkan konfigurasi lengkap tipe file
router.get('/config', authenticate, FileTypesController.getFileTypesConfig)

// GET /api/file-types/validate/:mimeType - Validasi tipe file berdasarkan MIME type
router.get('/validate/:mimeType', authenticate, FileTypesController.validateFileType)

// GET /api/file-types/stats - Mendapatkan statistik penggunaan file
router.get('/stats', authenticate, FileTypesController.getFileStats)

export { router as fileTypesRoutes }