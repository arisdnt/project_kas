import { Router } from 'express'
import { ProfileController } from '../controllers/ProfileController'
import { authenticate } from '@/features/auth/middleware/authMiddleware'
import { attachAccessScope } from '@/core/middleware/accessScope'

const router = Router()

// Middleware autentikasi untuk semua routes profile
router.use(authenticate)
router.use(attachAccessScope)

// GET /api/profile - Ambil profil lengkap user yang sedang login
router.get('/', ProfileController.getCompleteProfile)

// PUT /api/profile - Update profil user yang sedang login
router.put('/', ProfileController.updateProfile)

// GET /api/profile/activity - Ambil ringkasan aktivitas user
router.get('/activity', ProfileController.getActivitySummary)

// GET /api/profile/sessions - Ambil daftar sesi user
router.get('/sessions', ProfileController.getUserSessions)

// GET /api/profile/audit-logs - Ambil log audit user
router.get('/audit-logs', ProfileController.getAuditLogs)

// GET /api/profile/:id - Ambil profil user berdasarkan ID (hanya super admin atau user sendiri)
router.get('/:id', ProfileController.getProfileById)

export default router
