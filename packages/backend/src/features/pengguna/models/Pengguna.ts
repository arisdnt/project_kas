/**
 * Model Pengguna untuk Manajemen User
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { z } from 'zod'

// Interface untuk data pengguna dari database
export interface Pengguna {
  id: string
  toko_id: string
  peran_id: string
  username: string
  nama: string
  status: string
  dibuat_pada: string
  diperbarui_pada: string
  nama_peran?: string
  nama_toko?: string
}

// Interface untuk data peran
export interface Peran {
  id: number
  nama: string
  deskripsi?: string
}

// Schema validasi untuk membuat pengguna baru
export const CreatePenggunaSchema = z.object({
  username: z.string()
    .min(3, 'Username minimal 3 karakter')
    .max(50, 'Username maksimal 50 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh mengandung huruf, angka, dan underscore'),
  nama: z.string()
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  peran_id: z.string()
    .uuid('ID peran harus berupa UUID yang valid'),
  password: z.string()
    .min(6, 'Password minimal 6 karakter')
    .max(100, 'Password maksimal 100 karakter'),
  status: z.enum(['aktif', 'nonaktif', 'cuti']).default('aktif')
})

// Schema validasi untuk update pengguna
export const UpdatePenggunaSchema = z.object({
  username: z.string()
    .min(3, 'Username minimal 3 karakter')
    .max(50, 'Username maksimal 50 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh mengandung huruf, angka, dan underscore')
    .optional(),
  nama: z.string()
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter')
    .optional(),
  peran_id: z.string()
    .uuid('ID peran harus berupa UUID yang valid')
    .optional(),
  password: z.string()
    .min(6, 'Password minimal 6 karakter')
    .max(100, 'Password maksimal 100 karakter')
    .optional(),
  status: z.enum(['aktif', 'nonaktif', 'cuti']).optional()
})

// Schema validasi untuk query pengguna
export const PenggunaQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 10).optional(),
  search: z.string().optional(),
  peran_id: z.string().uuid().optional(),
  status: z.enum(['aktif', 'nonaktif', 'cuti']).optional()
})

// Type untuk request create pengguna
export type CreatePenggunaRequest = z.infer<typeof CreatePenggunaSchema>

// Type untuk request update pengguna
export type UpdatePenggunaRequest = z.infer<typeof UpdatePenggunaSchema>

// Type untuk query parameter
export type PenggunaQuery = z.infer<typeof PenggunaQuerySchema>

// Interface untuk response API
export interface PenggunaResponse {
  success: boolean
  message: string
  data?: {
    pengguna?: Pengguna | Pengguna[]
    peran?: Peran[]
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  error?: string
}

// Interface untuk statistik pengguna
export interface PenggunaStats {
  total_pengguna: number
  pengguna_aktif: number
  pengguna_nonaktif: number
  per_peran: {
    peran_id: string
    nama_peran: string
    jumlah: number
  }[]
}