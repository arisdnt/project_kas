/**
 * Controller untuk Manajemen Pengguna
 * Mengelola HTTP requests dan responses
 */

import { Request, Response } from 'express'
import { 
  CreatePenggunaSchema, 
  UpdatePenggunaSchema, 
  PenggunaQuerySchema,
  PenggunaResponse 
} from '../models/Pengguna'
import { PenggunaService } from '../services/PenggunaService'
import { logger } from '@/core/utils/logger'
import { z } from 'zod'

export class PenggunaController {
  /**
   * Ambil semua pengguna dengan filter dan pagination
   */
  static async getAllPengguna(req: Request, res: Response) {
    try {
      // Validasi query parameters
      const query = PenggunaQuerySchema.parse(req.query)
      const tenantId = req.user?.tenantId
      
      if (!tenantId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Tenant ID tidak ditemukan'
        } as PenggunaResponse)
      }
      
      // Ambil data pengguna
      const result = await PenggunaService.getAllPengguna(query, tenantId)
      
      return res.json({
        success: true,
        message: 'Data pengguna berhasil diambil',
        data: {
          pengguna: result.pengguna,
          pagination: result.pagination
        }
      } as PenggunaResponse)
      
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        method: req.method,
        url: req.url,
        userId: req.user?.id
      }, 'Gagal mengambil data pengguna')
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Parameter query tidak valid',
          data: { errors: error.errors }
        } as PenggunaResponse)
      }
      
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Gagal mengambil data pengguna'
      } as PenggunaResponse)
    }
  }
  
  /**
   * Ambil pengguna berdasarkan ID
   */
  static async getPenggunaById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)
      const tenantId = req.user?.tenantId
      
      if (!tenantId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Tenant ID tidak ditemukan'
        } as PenggunaResponse)
      }
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'ID pengguna tidak valid'
        } as PenggunaResponse)
      }
      
      const pengguna = await PenggunaService.getPenggunaById(id, tenantId)
      
      if (!pengguna) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Pengguna tidak ditemukan'
        } as PenggunaResponse)
      }
      
      return res.json({
        success: true,
        message: 'Data pengguna berhasil diambil',
        data: { pengguna }
      } as PenggunaResponse)
      
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        method: req.method,
        url: req.url,
        userId: req.user?.id,
        penggunaId: req.params.id
      }, 'Gagal mengambil data pengguna')
      
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Gagal mengambil data pengguna'
      } as PenggunaResponse)
    }
  }
  
  /**
   * Buat pengguna baru
   */
  static async createPengguna(req: Request, res: Response) {
    try {
      // Validasi request body
      const data = CreatePenggunaSchema.parse(req.body)
      const tenantId = req.user?.tenantId
      
      if (!tenantId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Tenant ID tidak ditemukan'
        } as PenggunaResponse)
      }
      
      // Buat pengguna baru
      const pengguna = await PenggunaService.createPengguna(data, tenantId)
      
      return res.status(201).json({
        success: true,
        message: 'Pengguna berhasil dibuat',
        data: { pengguna }
      } as PenggunaResponse)
      
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        method: req.method,
        url: req.url,
        userId: req.user?.id,
        body: { ...req.body, password: '[REDACTED]' }
      }, 'Gagal membuat pengguna')
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Data pengguna tidak valid',
          data: { errors: error.errors }
        } as PenggunaResponse)
      }
      
      if (error instanceof Error) {
        if (error.message.includes('sudah digunakan')) {
          return res.status(409).json({
            success: false,
            error: 'Conflict',
            message: error.message
          } as PenggunaResponse)
        }
      }
      
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Gagal membuat pengguna'
      } as PenggunaResponse)
    }
  }
  
  /**
   * Update pengguna
   */
  static async updatePengguna(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)
      const data = UpdatePenggunaSchema.parse(req.body)
      const tenantId = req.user?.tenantId
      
      if (!tenantId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Tenant ID tidak ditemukan'
        } as PenggunaResponse)
      }
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'ID pengguna tidak valid'
        } as PenggunaResponse)
      }
      
      // Update pengguna
      const pengguna = await PenggunaService.updatePengguna(id, data, tenantId)
      
      return res.json({
        success: true,
        message: 'Pengguna berhasil diupdate',
        data: { pengguna }
      } as PenggunaResponse)
      
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        method: req.method,
        url: req.url,
        userId: req.user?.id,
        penggunaId: req.params.id,
        body: { ...req.body, password: req.body.password ? '[REDACTED]' : undefined }
      }, 'Gagal mengupdate pengguna')
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Data pengguna tidak valid',
          data: { errors: error.errors }
        } as PenggunaResponse)
      }
      
      if (error instanceof Error) {
        if (error.message.includes('tidak ditemukan')) {
          return res.status(404).json({
            success: false,
            error: 'Not Found',
            message: error.message
          } as PenggunaResponse)
        }
        
        if (error.message.includes('sudah digunakan')) {
          return res.status(409).json({
            success: false,
            error: 'Conflict',
            message: error.message
          } as PenggunaResponse)
        }
      }
      
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Gagal mengupdate pengguna'
      } as PenggunaResponse)
    }
  }
  
  /**
   * Hapus pengguna
   */
  static async deletePengguna(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)
      const tenantId = req.user?.tenantId
      
      if (!tenantId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Tenant ID tidak ditemukan'
        } as PenggunaResponse)
      }
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'ID pengguna tidak valid'
        } as PenggunaResponse)
      }
      
      // Hapus pengguna
      await PenggunaService.deletePengguna(id, tenantId)
      
      return res.json({
        success: true,
        message: 'Pengguna berhasil dihapus'
      } as PenggunaResponse)
      
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        method: req.method,
        url: req.url,
        userId: req.user?.id,
        penggunaId: req.params.id
      }, 'Gagal menghapus pengguna')
      
      if (error instanceof Error && error.message.includes('tidak ditemukan')) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: error.message
        } as PenggunaResponse)
      }
      
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Gagal menghapus pengguna'
      } as PenggunaResponse)
    }
  }
  
  /**
   * Ambil semua peran
   */
  static async getAllPeran(req: Request, res: Response) {
    try {
      const peran = await PenggunaService.getAllPeran()
      
      return res.json({
        success: true,
        message: 'Data peran berhasil diambil',
        data: { peran }
      } as PenggunaResponse)
      
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        method: req.method,
        url: req.url,
        userId: req.user?.id
      }, 'Gagal mengambil data peran')
      
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Gagal mengambil data peran'
      } as PenggunaResponse)
    }
  }
}