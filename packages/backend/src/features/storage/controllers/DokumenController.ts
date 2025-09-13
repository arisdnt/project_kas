/**
 * Controller untuk Manajemen Dokumen Transaksi
 * Mengelola CRUD operations dengan database tracking
 */

import { Request, Response } from 'express'
import { 
  CreateDokumenSchema, 
  UpdateDokumenSchema, 
  DokumenQuerySchema 
} from '../models/DokumenTransaksi'
import { DokumenService } from '../services/DokumenService'
import { StorageService } from '../services/StorageService'
import { logger } from '@/core/utils/logger'
import { z } from 'zod'
import { getObjectStream } from '@/core/storage/minioClient'

export class DokumenController {
  /**
   * Mengambil daftar dokumen dengan filter dan pagination
   */
  static async getList(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' })
      }

      const query = DokumenQuerySchema.parse(req.query)
      const result = await DokumenService.getDokumenList(req.user.tenantId, query)

      // Generate URLs for files
      const dataWithUrls = await Promise.all(
        result.data.map(async (doc) => {
          try {
            const url = await StorageService.getFileUrl(doc.kunci_objek)
            return { ...doc, url }
          } catch (error) {
            logger.warn({ error, key: doc.kunci_objek }, 'Failed to get file URL')
            return doc
          }
        })
      )

      return res.status(200).json({
        success: true,
        data: {
          items: dataWithUrls,
          total: result.pagination.total,
          page: result.pagination.page,
          limit: result.pagination.limit,
          totalPages: result.pagination.totalPages
        }
      })
    } catch (error: any) {
      logger.error({ error }, 'Gagal mengambil daftar dokumen')
      const status = error?.name === 'ZodError' ? 400 : 500
      return res.status(status).json({
        success: false,
        message: error?.message || 'Gagal mengambil daftar dokumen'
      })
    }
  }

  /**
   * Mengambil detail dokumen berdasarkan ID
   */
  static async getById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' })
      }

      const id = parseInt(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID tidak valid' })
      }

      const dokumen = await DokumenService.getDokumenById(id, req.user.tenantId)
      
      // Generate URL for file
      try {
        const url = await StorageService.getFileUrl(dokumen.kunci_objek)
        return res.status(200).json({
          success: true,
          data: { ...dokumen, url }
        })
      } catch (error) {
        logger.warn({ error, key: dokumen.kunci_objek }, 'Failed to get file URL')
        return res.status(200).json({
          success: true,
          data: dokumen
        })
      }
    } catch (error: any) {
      logger.error({ error }, 'Gagal mengambil detail dokumen')
      const status = error?.message === 'Dokumen tidak ditemukan' ? 404 : 500
      return res.status(status).json({
        success: false,
        message: error?.message || 'Gagal mengambil detail dokumen'
      })
    }
  }

  /**
   * Membuat record dokumen baru (untuk file yang sudah diupload)
   */
  static async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' })
      }

      const data = CreateDokumenSchema.parse(req.body)
      
      // Additional business logic validation
      if (data.ukuran_file && data.ukuran_file > 50 * 1024 * 1024) { // 50MB
        return res.status(400).json({
          success: false,
          message: 'Ukuran file terlalu besar (maksimal 50MB)'
        })
      }
      
      const dokumen = await DokumenService.createDokumen(
        req.user.id,
        req.user.tenantId,
        data
      )

      return res.status(201).json({
        success: true,
        data: dokumen,
        message: 'Dokumen berhasil dibuat'
      })
    } catch (error: any) {
      logger.error({ error }, 'Gagal membuat dokumen')
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Data tidak valid',
          errors: error.errors
        })
      }
      
      const status = error?.name === 'ZodError' ? 400 : 500
      return res.status(status).json({
        success: false,
        message: error?.message || 'Gagal membuat dokumen'
      })
    }
  }

  /**
   * Update metadata dokumen
   */
  static async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' })
      }

      const id = parseInt(req.params.id)
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ success: false, message: 'ID dokumen tidak valid' })
      }

      const data = UpdateDokumenSchema.parse(req.body)
      const dokumen = await DokumenService.updateDokumen(
        id,
        req.user.tenantId,
        data
      )

      return res.status(200).json({
        success: true,
        data: dokumen,
        message: 'Dokumen berhasil diperbarui'
      })
    } catch (error: any) {
      logger.error({ error }, 'Gagal memperbarui dokumen')
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Data tidak valid',
          errors: error.errors
        })
      }
      
      const status = error?.name === 'ZodError' ? 400 : 
                    error?.message === 'Dokumen tidak ditemukan' ? 404 : 500
      return res.status(status).json({
        success: false,
        message: error?.message || 'Gagal memperbarui dokumen'
      })
    }
  }

  /**
   * Hapus dokumen (soft delete dari database + hapus dari storage)
   */
  static async delete(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' })
      }

      const id = parseInt(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID tidak valid' })
      }

      // Get dokumen info first
      const dokumen = await DokumenService.getDokumenById(id, req.user.tenantId)
      
      // Delete from database (soft delete)
      await DokumenService.deleteDokumen(id, req.user.tenantId)
      
      // Delete from storage
      try {
        await StorageService.deleteFile(dokumen.kunci_objek)
      } catch (error) {
        logger.warn({ error, key: dokumen.kunci_objek }, 'Failed to delete file from storage')
        // Continue even if storage deletion fails
      }

      return res.status(200).json({
        success: true,
        message: 'Dokumen berhasil dihapus'
      })
    } catch (error: any) {
      logger.error({ error }, 'Gagal menghapus dokumen')
      const status = error?.message === 'Dokumen tidak ditemukan' ? 404 : 500
      return res.status(status).json({
        success: false,
        message: error?.message || 'Gagal menghapus dokumen'
      })
    }
  }

  /**
   * Get file URL by document ID
   */
  static async getFileUrl(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' })
      }

      const id = parseInt(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID tidak valid' })
      }

      const dokumen = await DokumenService.getDokumenById(id, req.user.tenantId)
      const url = await StorageService.getFileUrl(dokumen.kunci_objek)

      return res.status(200).json({
        success: true,
        data: { url }
      })
    } catch (error: any) {
      logger.error({ error }, 'Gagal mendapatkan URL file')
      const status = error?.message === 'Dokumen tidak ditemukan' ? 404 : 500
      return res.status(status).json({
        success: false,
        message: error?.message || 'Gagal mendapatkan URL file'
      })
    }
  }

  /**
   * Stream file content by document ID (same-origin, works offline)
   */
  static async streamFile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' })
      }

      const id = parseInt(req.params.id)
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID tidak valid' })
      }

      const dokumen = await DokumenService.getDokumenById(id, req.user.tenantId)
      const { stream, contentType, size } = await getObjectStream(dokumen.kunci_objek)

      const filename = encodeURIComponent(dokumen.nama_file_asli || 'file')
      if (contentType) res.setHeader('Content-Type', contentType)
      res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${filename}`)
      if (typeof size === 'number') res.setHeader('Content-Length', String(size))
      res.setHeader('Cache-Control', 'private, max-age=60')

      stream.on('error', (err) => {
        logger.error({ err }, 'Streaming file error')
        if (!res.headersSent) res.status(500)
        res.end()
      })

      stream.pipe(res)
      return
    } catch (error: any) {
      logger.error({ error }, 'Gagal streaming file')
      const status = error?.message === 'Dokumen tidak ditemukan' ? 404 : 500
      return res.status(status).json({
        success: false,
        message: error?.message || 'Gagal streaming file'
      })
    }
  }
}
