/**
 * Routes StokOpname
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { Router } from 'express';
import { StokOpnameController } from '../controllers/StokOpnameController';
import { authenticate } from '@/features/auth/middleware/authMiddleware';
import { validateRequest } from '@/features/storage/middleware/validationMiddleware';
import { z } from 'zod';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

/**
 * @route GET /api/stok-opname
 * @desc Get all stok opname with pagination and filters
 * @access Private
 */
// Schema validasi untuk query parameters
const querySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    kategori: z.string().regex(/^\d+$/).optional(),
    brand: z.string().regex(/^\d+$/).optional(),
    supplier: z.string().regex(/^\d+$/).optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
    tanggal: z.string().optional(),
    search: z.string().optional()
  })
});

router.get(
  '/',
  validateRequest(querySchema),
  StokOpnameController.getAll
);

// Schema validasi untuk get by ID
const getByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID harus berupa angka')
  })
});

/**
 * @route GET /api/stok-opname/:id
 * @desc Get stok opname by ID
 * @access Private
 */
router.get(
  '/:id',
  validateRequest(getByIdSchema),
  StokOpnameController.getById
);

// Schema validasi untuk create
const createSchema = z.object({
  body: z.object({
    id_produk: z.number().positive('ID produk harus berupa angka positif'),
    stok_fisik: z.number().min(0, 'Stok fisik harus berupa angka non-negatif'),
    catatan: z.string().max(500, 'Catatan maksimal 500 karakter').optional()
  })
});

/**
 * @route POST /api/stok-opname
 * @desc Create new stok opname
 * @access Private
 */
router.post(
  '/',
  validateRequest(createSchema),
  StokOpnameController.create
);

// Schema validasi untuk update
const updateSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID harus berupa angka')
  }),
  body: z.object({
    stok_fisik: z.number().min(0, 'Stok fisik harus berupa angka non-negatif').optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
    catatan: z.string().max(500, 'Catatan maksimal 500 karakter').optional()
  })
});

/**
 * @route PUT /api/stok-opname/:id
 * @desc Update stok opname
 * @access Private
 */
router.put(
  '/:id',
  validateRequest(updateSchema),
  StokOpnameController.update
);

/**
 * @route DELETE /api/stok-opname/:id
 * @desc Delete stok opname
 * @access Private
 */
router.delete(
  '/:id',
  validateRequest(getByIdSchema),
  StokOpnameController.delete
);

/**
 * @route PATCH /api/stok-opname/:id/complete
 * @desc Complete stok opname
 * @access Private
 */
router.patch(
  '/:id/complete',
  validateRequest(getByIdSchema),
  StokOpnameController.complete
);

/**
 * @route PATCH /api/stok-opname/:id/cancel
 * @desc Cancel stok opname
 * @access Private
 */
router.patch(
  '/:id/cancel',
  validateRequest(getByIdSchema),
  StokOpnameController.cancel
);

export { router as stokOpnameRoutes };