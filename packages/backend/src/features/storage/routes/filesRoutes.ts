import { Router } from 'express'
import { FilesController, singleFileMiddleware } from '../controllers/FilesController'
import { authenticate, authorize } from '@/features/auth/middleware/authMiddleware'
import { UserRole } from '@/features/auth/models/User'

const router = Router()

router.use(authenticate)

// Upload file umum/produk/dokumen
router.post('/upload', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), singleFileMiddleware, FilesController.upload)

// Dapatkan pre-signed URL via redirect 302
router.get('/:key', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CASHIER), FilesController.resolve)

// Dapatkan pre-signed URL sebagai JSON (untuk fetch Authorization)
router.get('/:key/url', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CASHIER), FilesController.getUrl)

// Hapus file dari object storage
router.delete('/:key', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), FilesController.delete)

export default router
