/**
 * Model DokumenTransaksi dan Validasi
 * Mengacu pada tabel: dokumen_transaksi
 * Sesuai Blueprint POS Multi-Tenant
 */

import { z } from 'zod'

// Enum untuk kategori file
export const KategoriFileEnum = z.enum(['umum', 'produk', 'dokumen'])

// Enum untuk status file
export const StatusFileEnum = z.enum(['aktif', 'dihapus', 'arsip'])

// Schema untuk membuat dokumen baru
export const CreateDokumenSchema = z.object({
  id_transaksi: z.string().uuid().optional(),
  kunci_objek: z.string().min(1, 'Kunci objek diperlukan'),
  nama_file_asli: z.string().min(1, 'Nama file asli diperlukan'),
  ukuran_file: z.number().int().positive('Ukuran file harus positif'),
  tipe_mime: z.string().min(1, 'Tipe MIME diperlukan'),
  kategori: KategoriFileEnum.default('umum'),
  deskripsi: z.string().optional(),
  status: StatusFileEnum.default('aktif')
})

// Schema untuk update dokumen
export const UpdateDokumenSchema = z.object({
  nama_file_asli: z.string().min(1).optional(),
  deskripsi: z.string().optional(),
  status: StatusFileEnum.optional(),
  kategori: KategoriFileEnum.optional()
})

// Schema untuk query/filter dokumen
export const DokumenQuerySchema = z.object({
  kategori: KategoriFileEnum.optional(),
  status: StatusFileEnum.optional(),
  id_transaksi: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
})

// Type inference dari schema
export type KategoriFile = z.infer<typeof KategoriFileEnum>
export type StatusFile = z.infer<typeof StatusFileEnum>
export type CreateDokumen = z.infer<typeof CreateDokumenSchema>
export type UpdateDokumen = z.infer<typeof UpdateDokumenSchema>
export type DokumenQuery = z.infer<typeof DokumenQuerySchema>

// Interface untuk dokumen dari database
export interface DokumenTransaksi {
  id: number
  id_transaksi?: string | null
  kunci_objek: string
  nama_file_asli: string
  ukuran_file: number
  tipe_mime: string
  kategori: KategoriFile
  id_pengguna: string
  id_toko: string
  deskripsi?: string | null
  status: StatusFile
  dibuat_pada: string
  diperbarui_pada: string
}

// Interface untuk dokumen dengan informasi tambahan
export interface DokumenWithDetails extends DokumenTransaksi {
  url?: string
  nama_pengguna?: string
  kode_transaksi?: string
}

// Interface untuk response list dokumen
export interface DokumenListResponse {
  data: DokumenWithDetails[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats: {
    totalFiles: number
    totalSize: number
    categoryCounts: Record<KategoriFile, number>
  }
}
