import { Request, Response } from 'express'
import { 
  fileTypesConfig, 
  getAllowedMimeTypes, 
  getFileCategory,
  getFileDescription,
  FileTypeConfig 
} from '@/core/config/fileTypes'
import { logger } from '@/core/utils/logger'

/**
 * Controller untuk mengelola informasi tipe file yang diizinkan
 */
export class FileTypesController {
  /**
   * Mendapatkan semua tipe file yang diizinkan
   */
  static async getAllowedTypes(req: Request, res: Response) {
    try {
      const allowedTypes = getAllowedMimeTypes()
      
      logger.info({
        totalTypes: allowedTypes.length,
        userId: req.user?.id
      }, 'Retrieved allowed file types')
      
      return res.json({
        success: true,
        data: {
          mimeTypes: allowedTypes,
          total: allowedTypes.length
        }
      })
    } catch (error) {
      logger.error({ error }, 'Failed to get allowed file types')
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil daftar tipe file yang diizinkan'
      })
    }
  }

  /**
   * Mendapatkan konfigurasi lengkap tipe file berdasarkan kategori
   */
  static async getFileTypesConfig(req: Request, res: Response) {
    try {
      const config = fileTypesConfig
      
      // Transform config untuk response yang lebih user-friendly
      const transformedConfig = Object.entries(config).reduce((acc, [category, types]) => {
        acc[category] = types.map((type: FileTypeConfig) => ({
          mimeType: type.mimeType,
          extensions: type.extensions,
          maxSize: type.maxSize,
          maxSizeMB: type.maxSize ? Math.round(type.maxSize / 1024 / 1024) : null,
          description: type.description
        }))
        return acc
      }, {} as Record<string, any>)
      
      logger.info({
        categories: Object.keys(transformedConfig),
        userId: req.user?.id
      }, 'Retrieved file types configuration')
      
      return res.json({
        success: true,
        data: {
          categories: transformedConfig,
          totalCategories: Object.keys(transformedConfig).length
        }
      })
    } catch (error) {
      logger.error({ error }, 'Failed to get file types configuration')
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil konfigurasi tipe file'
      })
    }
  }

  /**
   * Validasi tipe file berdasarkan MIME type
   */
  static async validateFileType(req: Request, res: Response) {
    try {
      const { mimeType } = req.params
      
      if (!mimeType) {
        return res.status(400).json({
          success: false,
          message: 'MIME type harus disediakan'
        })
      }
      
      const allowedTypes = getAllowedMimeTypes()
      const isAllowed = allowedTypes.includes(mimeType)
      const category = getFileCategory(mimeType)
      const description = getFileDescription(mimeType)
      
      logger.info({
        mimeType,
        isAllowed,
        category,
        description,
        userId: req.user?.id
      }, 'File type validation requested')
      
      return res.json({
        success: true,
        data: {
          mimeType,
          isAllowed,
          category,
          description
        }
      })
    } catch (error) {
      logger.error({ error, mimeType: req.params.mimeType }, 'Failed to validate file type')
      return res.status(500).json({
        success: false,
        message: 'Gagal memvalidasi tipe file'
      })
    }
  }

  /**
   * Mendapatkan statistik penggunaan file berdasarkan kategori
   */
  static async getFileStats(req: Request, res: Response) {
    try {
      // Implementasi statistik bisa ditambahkan nanti
      // Untuk saat ini, return struktur dasar
      
      const categories = Object.keys(fileTypesConfig)
      const stats = categories.reduce((acc, category) => {
        acc[category] = {
          totalTypes: fileTypesConfig[category as keyof typeof fileTypesConfig].length,
          uploadCount: 0, // Bisa diambil dari database nanti
          totalSize: 0    // Bisa diambil dari database nanti
        }
        return acc
      }, {} as Record<string, any>)
      
      logger.info({
        categories,
        userId: req.user?.id
      }, 'File statistics requested')
      
      return res.json({
        success: true,
        data: {
          categories: stats,
          totalCategories: categories.length
        }
      })
    } catch (error) {
      logger.error({ error }, 'Failed to get file statistics')
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil statistik file'
      })
    }
  }
}