/**
 * Model Pelanggan
 */

import { z } from 'zod'

export const PelangganSchema = z.object({
  id: z.string().uuid().optional(),
  id_toko: z.string().uuid(),
  nama: z.string().max(255).optional(),
  email: z.string().email().max(255).optional(),
  telepon: z.string().max(50).optional(),
})

export const SearchPelangganQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().transform(Number).pipe(z.number().int().positive()).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).default('10'),
})

export type Pelanggan = z.infer<typeof PelangganSchema>
export type SearchPelangganQuery = z.infer<typeof SearchPelangganQuerySchema>
