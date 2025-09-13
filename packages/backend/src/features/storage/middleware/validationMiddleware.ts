import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { logger } from '@/core/utils/logger'

// Schema validasi untuk create dokumen
const createDokumenSchema = z.object({
  body: z.object({
    kunci_objek: z.string().min(1, 'Kunci objek harus diisi'),
    nama_file_asli: z.string().min(1, 'Nama file harus diisi'),
    ukuran_file: z.number().positive('Ukuran file harus positif'),
    tipe_mime: z.string().min(1, 'Tipe MIME harus diisi'),
    kategori: z.enum(['produk', 'dokumen', 'umum'], {
      errorMap: () => ({ message: 'Kategori harus salah satu dari: produk, dokumen, umum' })
    }),
    status: z.enum(['aktif', 'dihapus', 'arsip']).default('aktif'),
    id_transaksi: z.number().optional(),
    deskripsi: z.string().optional()
  })
})

// Schema validasi untuk update dokumen
const updateDokumenSchema = z.object({
  body: z.object({
    nama_file_asli: z.string().min(1).optional(),
    kategori: z.enum(['produk', 'dokumen', 'umum']).optional(),
    status: z.enum(['aktif', 'dihapus', 'arsip']).optional(),
    id_transaksi: z.number().optional(),
    deskripsi: z.string().optional()
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID harus berupa angka')
  })
})

// Schema validasi untuk get by ID
const getByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID harus berupa angka')
  })
})

// Schema validasi untuk query parameters
const queryParamsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    kategori: z.enum(['produk', 'dokumen', 'umum']).optional(),
    status: z.enum(['aktif', 'dihapus', 'arsip']).optional(),
    search: z.string().optional()
  })
})

// Middleware factory untuk validasi
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      })
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
        
        logger.warn('Validation error:', { errors: errorMessages, url: req.url })
        
        res.status(400).json({
          success: false,
          message: 'Data tidak valid',
          errors: errorMessages
        })
        return
      }
      
      logger.error('Unexpected validation error:', error)
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan validasi'
      })
    }
  }
}

// Export schema validators
export const validateCreateDokumen = validateRequest(createDokumenSchema)
export const validateUpdateDokumen = validateRequest(updateDokumenSchema)
export const validateGetById = validateRequest(getByIdSchema)
export const validateQueryParams = validateRequest(queryParamsSchema)

// File upload validation middleware
export const validateFileUpload = (req: Request, res: Response, next: NextFunction): void => {
  const file = req.file
  
  if (!file) {
    res.status(400).json({
      success: false,
      message: 'File harus diupload'
    })
    return
  }
  
  // Validasi ukuran file (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    res.status(400).json({
      success: false,
      message: 'Ukuran file tidak boleh lebih dari 10MB'
    })
    return
  }
  
  // Validasi tipe file
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv'
  ]
  
  if (!allowedTypes.includes(file.mimetype)) {
    res.status(400).json({
      success: false,
      message: 'Tipe file tidak didukung'
    })
    return
  }
  
  next()
}

// Rate limiting untuk upload
const uploadAttempts = new Map<string, { count: number; resetTime: number }>()

export const rateLimitUpload = (req: Request, res: Response, next: NextFunction): void => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown'
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxAttempts = 10
  
  const attempts = uploadAttempts.get(clientIP)
  
  if (!attempts || now > attempts.resetTime) {
    uploadAttempts.set(clientIP, { count: 1, resetTime: now + windowMs })
    next()
    return
  }
  
  if (attempts.count >= maxAttempts) {
    res.status(429).json({
      success: false,
      message: 'Terlalu banyak percobaan upload. Coba lagi dalam 1 menit.'
    })
    return
  }
  
  attempts.count++
  next()
}