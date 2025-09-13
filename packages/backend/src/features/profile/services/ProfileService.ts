import { ProfileModel, UserProfileData } from '../models/ProfileModel'
import { logger } from '@/core/utils/logger'

export interface CompleteProfileResponse {
  profile: UserProfileData
  sessions: any[]
  auditLogs: any[]
  statistics: {
    totalSessions: number
    activeSessions: number
    lastLogin: Date | null
    totalAuditLogs: number
  }
}

export class ProfileService {
  static async getCompleteUserProfile(userId: string): Promise<CompleteProfileResponse | null> {
    try {
      // Ambil data profil lengkap
      const profile = await ProfileModel.getCompleteProfile(userId)
      if (!profile) {
        return null
      }

      // Ambil data sessions
      const sessions = await ProfileModel.getUserSessions(userId) as any[]
      
      // Ambil audit logs (10 terakhir)
      const auditLogs = await ProfileModel.getAuditLogs(userId, 10) as any[]

      // Hitung statistik
      const activeSessions = sessions.filter((session: any) => session.is_active).length
      const lastLoginSession = sessions.find((session: any) => session.is_active)
      
      const statistics = {
        totalSessions: sessions.length,
        activeSessions,
        lastLogin: lastLoginSession ? new Date(lastLoginSession.created_at) : null,
        totalAuditLogs: auditLogs.length
      }

      return {
        profile,
        sessions,
        auditLogs,
        statistics
      }
    } catch (error) {
      logger.error('Error in ProfileService.getCompleteUserProfile:', error)
      throw error
    }
  }

  static async updateUserProfile(
    userId: string, 
    updateData: Partial<UserProfileData>
  ): Promise<boolean> {
    try {
      await ProfileModel.updateProfile(userId, updateData)
      logger.info(`Profile updated for user ${userId}`)
      return true
    } catch (error) {
      logger.error('Error in ProfileService.updateUserProfile:', error)
      throw error
    }
  }

  static async getUserActivitySummary(userId: string) {
    try {
      const sessions = await ProfileModel.getUserSessions(userId) as any[]
      const auditLogs = await ProfileModel.getAuditLogs(userId, 50) as any[]

      // Analisis aktivitas berdasarkan audit logs
      const activityByAction = auditLogs.reduce((acc: any, log: any) => {
        const action = log.aksi
        acc[action] = (acc[action] || 0) + 1
        return acc
      }, {})

      // Analisis aktivitas berdasarkan tabel
      const activityByTable = auditLogs.reduce((acc: any, log: any) => {
        const table = log.tabel
        acc[table] = (acc[table] || 0) + 1
        return acc
      }, {})

      // Analisis login patterns
      const loginPatterns = sessions.reduce((acc: any, session: any) => {
        const date = new Date(session.created_at).toDateString()
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {})

      return {
        activityByAction,
        activityByTable,
        loginPatterns,
        totalActivities: auditLogs.length,
        totalLogins: sessions.length
      }
    } catch (error) {
      logger.error('Error in ProfileService.getUserActivitySummary:', error)
      throw error
    }
  }

  static async validateProfileData(data: Partial<UserProfileData>): Promise<string[]> {
    const errors: string[] = []

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Format email tidak valid')
    }

    if (data.telepon && !/^[0-9+\-\s()]+$/.test(data.telepon)) {
      errors.push('Format nomor telepon tidak valid')
    }

    if (data.nama_lengkap && data.nama_lengkap.length < 2) {
      errors.push('Nama lengkap minimal 2 karakter')
    }

    return errors
  }
}