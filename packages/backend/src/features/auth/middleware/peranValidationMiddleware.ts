/**
 * Middleware Validasi Peran
 * Validasi input untuk peran dengan level 1-5
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '@/core/utils/logger';

// Schema validasi untuk level peran
const PeranLevelSchema = z.number()
  .int('Level harus berupa bilangan bulat')
  .min(1, 'Level minimal adalah 1 (God)')
  .max(5, 'Level maksimal adalah 5 (Reviewer)');

// Schema validasi untuk create peran
const CreatePeranSchema = z.object({
  body: z.object({
    nama: z.string()
      .min(1, 'Nama peran harus diisi')
      .max(50, 'Nama peran maksimal 50 karakter'),
    deskripsi: z.string()
      .min(1, 'Deskripsi peran harus diisi')
      .max(255, 'Deskripsi peran maksimal 255 karakter'),
    level: PeranLevelSchema,
    status: z.enum(['aktif', 'nonaktif']).default('aktif')
  })
});

// Schema validasi untuk update peran
const UpdatePeranSchema = z.object({
  body: z.object({
    nama: z.string()
      .min(1, 'Nama peran harus diisi')
      .max(50, 'Nama peran maksimal 50 karakter')
      .optional(),
    deskripsi: z.string()
      .min(1, 'Deskripsi peran harus diisi')
      .max(255, 'Deskripsi peran maksimal 255 karakter')
      .optional(),
    level: PeranLevelSchema.optional(),
    status: z.enum(['aktif', 'nonaktif']).optional()
  }),
  params: z.object({
    id: z.string().uuid('ID peran harus berupa UUID yang valid')
  })
});

// Schema validasi untuk get by ID
const GetPeranByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID peran harus berupa UUID yang valid')
  })
});

// Middleware factory untuk validasi peran
export const validatePeranRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        logger.warn('Validasi peran gagal:', { errors: errorMessages, url: req.url });
        
        res.status(400).json({
          success: false,
          message: 'Data peran tidak valid',
          errors: errorMessages
        });
        return;
      }
      
      logger.error('Error validasi peran tidak terduga:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan validasi peran'
      });
    }
  };
};

// Validasi khusus untuk level peran
export const validatePeranLevel = (req: Request, res: Response, next: NextFunction): void => {
  const { level } = req.body;
  
  if (level !== undefined) {
    try {
      PeranLevelSchema.parse(level);
      
      // Validasi tambahan berdasarkan level
      const levelDescriptions = {
        1: 'God - Akses penuh semua tenant',
        2: 'Admin - Akses semua toko dalam tenant',
        3: 'Admin Toko - Akses toko tertentu',
        4: 'Kasir - Akses transaksi kasir',
        5: 'Reviewer - Akses read-only'
      };
      
      if (!levelDescriptions[level as keyof typeof levelDescriptions]) {
        res.status(400).json({
          success: false,
          message: 'Level peran tidak valid',
          validLevels: levelDescriptions
        });
        return;
      }
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Level peran tidak valid',
          error: error.errors[0]?.message || 'Level harus antara 1-5'
        });
        return;
      }
      
      logger.error('Error validasi level peran:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan validasi level peran'
      });
      return;
    }
  } else {
    next();
  }
};

// Export schema validators
export const validateCreatePeran = validatePeranRequest(CreatePeranSchema);
export const validateUpdatePeran = validatePeranRequest(UpdatePeranSchema);
export const validateGetPeranById = validatePeranRequest(GetPeranByIdSchema);

// Export level constants untuk referensi
export const PERAN_LEVELS = {
  GOD: 1,
  ADMIN: 2,
  ADMIN_TOKO: 3,
  KASIR: 4,
  REVIEWER: 5
} as const;

export const PERAN_LEVEL_DESCRIPTIONS = {
  [PERAN_LEVELS.GOD]: 'God - Memiliki akses penuh CRUD di semua tenant',
  [PERAN_LEVELS.ADMIN]: 'Admin - Memiliki akses CRUD di semua toko dalam tenant',
  [PERAN_LEVELS.ADMIN_TOKO]: 'Admin Toko - Memiliki akses CRUD hanya untuk toko terkait',
  [PERAN_LEVELS.KASIR]: 'Kasir - Memiliki akses penuh untuk proses kasir di toko terkait',
  [PERAN_LEVELS.REVIEWER]: 'Reviewer - Hanya memiliki akses read di toko terkait'
} as const;

// Middleware untuk memerlukan level minimum
export const requireMinimumLevel = (minimumLevel: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const userLevel = user.level || 5;
    if (userLevel > minimumLevel) {
      res.status(403).json({ 
        success: false, 
        message: `Akses ditolak. Diperlukan level ${minimumLevel} atau lebih tinggi` 
      });
      return;
    }

    next();
  };
};