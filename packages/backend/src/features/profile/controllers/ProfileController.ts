import { Request, Response } from 'express'
import { ProfileService } from '../services/ProfileService'
import { logger } from '@/core/utils/logger'
import { ApiResponse } from '@/core/utils/response'
import { UserRole } from '@/features/auth/models/User'

export class ProfileController {
  static async getCompleteProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      
      if (!userId) {
        return ApiResponse.unauthorized(res, 'User tidak terautentikasi')
      }
      
      const profileData = await ProfileService.getCompleteUserProfile(userId)
      
      if (!profileData) {
        return ApiResponse.notFound(res, 'Profil tidak ditemukan')
      }

      return ApiResponse.success(res, profileData, 'Profil berhasil diambil')
    } catch (error) {
      logger.error('Error in ProfileController.getCompleteProfile:', error)
      return ApiResponse.serverError(res, 'Gagal mengambil data profil')
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const updateData = req.body
      
      if (!userId) {
        return ApiResponse.unauthorized(res, 'User tidak terautentikasi')
      }
      
      // Validasi data
      const validationErrors = await ProfileService.validateProfileData(updateData)
      if (validationErrors.length > 0) {
        return ApiResponse.badRequest(res, 'Data tidak valid', validationErrors)
      }

      const success = await ProfileService.updateUserProfile(userId, updateData)
      
      if (success) {
        return ApiResponse.success(res, null, 'Profil berhasil diperbarui')
      } else {
        return ApiResponse.serverError(res, 'Gagal memperbarui profil')
      }
    } catch (error) {
      logger.error('Error in ProfileController.updateProfile:', error)
      return ApiResponse.serverError(res, 'Gagal memperbarui profil')
    }
  }

  static async getActivitySummary(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      
      if (!userId) {
        return ApiResponse.unauthorized(res, 'User tidak terautentikasi')
      }
      
      const activityData = await ProfileService.getUserActivitySummary(userId)
      
      return ApiResponse.success(res, activityData, 'Ringkasan aktivitas berhasil diambil')
    } catch (error) {
      logger.error('Error in ProfileController.getActivitySummary:', error)
      return ApiResponse.serverError(res, 'Gagal mengambil ringkasan aktivitas')
    }
  }

  static async getProfileById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const requesterId = req.user?.id
      
      if (!requesterId) {
        return ApiResponse.unauthorized(res, 'User tidak terautentikasi')
      }

      // Hanya super admin atau user sendiri yang bisa melihat profil
      const isSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN
      
      if (requesterId !== id && !isSuperAdmin) {
        return ApiResponse.forbidden(res, 'Tidak memiliki akses untuk melihat profil ini')
      }

      const profileData = await ProfileService.getCompleteUserProfile(id)
      
      if (!profileData) {
        return ApiResponse.notFound(res, 'Profil tidak ditemukan')
      }

      return ApiResponse.success(res, profileData, 'Profil berhasil diambil')
    } catch (error) {
      logger.error('Error in ProfileController.getProfileById:', error)
      return ApiResponse.serverError(res, 'Gagal mengambil data profil')
    }
  }

  static async getUserSessions(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      
      if (!userId) {
        return ApiResponse.unauthorized(res, 'User tidak terautentikasi')
      }
      
      const sessions = await ProfileService.getCompleteUserProfile(userId)
      
      return ApiResponse.success(res, sessions?.sessions || [], 'Sesi user berhasil diambil')
    } catch (error) {
      logger.error('Error in ProfileController.getUserSessions:', error)
      return ApiResponse.serverError(res, 'Gagal mengambil data sesi')
    }
  }

  static async getAuditLogs(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const { limit = 20 } = req.query
      
      if (!userId) {
        return ApiResponse.unauthorized(res, 'User tidak terautentikasi')
      }
      
      const profileData = await ProfileService.getCompleteUserProfile(userId)
      
      return ApiResponse.success(res, profileData?.auditLogs || [], 'Log audit berhasil diambil')
    } catch (error) {
      logger.error('Error in ProfileController.getAuditLogs:', error)
      return ApiResponse.serverError(res, 'Gagal mengambil log audit')
    }
  }
}