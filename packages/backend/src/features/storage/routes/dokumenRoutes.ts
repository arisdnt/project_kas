import { Router } from 'express'
import { DokumenController } from '../controllers/DokumenController'
import { authenticate, ensureTenantAccess } from '@/features/auth/middleware/authMiddleware'
import { 
  validateCreateDokumen, 
  validateUpdateDokumen, 
  validateGetById, 
  validateQueryParams 
} from '../middleware/validationMiddleware'

const router = Router()

// Apply middleware
router.use(authenticate)
router.use(ensureTenantAccess)

// CRUD routes with validation
router.get('/', validateQueryParams, DokumenController.getList)
router.get('/:id', validateGetById, DokumenController.getById)
router.post('/', validateCreateDokumen, DokumenController.create)
router.put('/:id', validateUpdateDokumen, DokumenController.update)
router.delete('/:id', validateGetById, DokumenController.delete)

// File access route
router.get('/:id/url', DokumenController.getFileUrl)
router.get('/:id/stream', DokumenController.streamFile)

export { router as dokumenRoutes }
