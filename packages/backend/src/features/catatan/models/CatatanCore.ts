/**
 * Model Core untuk Catatan
 * Definisi tipe data dan validasi untuk sistem notes/memo
 */

import { z } from 'zod';

// Enum untuk visibilitas catatan
export const VisibilitasCatatan = {
  PRIBADI: 'pribadi',
  TOKO: 'toko',
  TENANT: 'tenant',
  PUBLIK: 'publik'
} as const;

// Enum untuk prioritas catatan
export const PrioritasCatatan = {
  RENDAH: 'rendah',
  NORMAL: 'normal',
  TINGGI: 'tinggi'
} as const;

// Enum untuk status catatan
export const StatusCatatan = {
  DRAFT: 'draft',
  AKTIF: 'aktif',
  ARSIP: 'arsip',
  DIHAPUS: 'dihapus'
} as const;

// Interface untuk Catatan
export interface Catatan {
  id: string;
  tenant_id: string;
  toko_id?: string;
  user_id: string;
  judul: string;
  konten: string;
  visibilitas: keyof typeof VisibilitasCatatan;
  kategori?: string;
  tags?: string[];
  prioritas: keyof typeof PrioritasCatatan;
  status: keyof typeof StatusCatatan;
  reminder_pada?: Date;
  lampiran_url?: string;
  dibuat_pada: Date;
  diperbarui_pada: Date;
}

// Interface untuk response dengan data pembuat
export interface CatatanWithUser extends Catatan {
  pembuat: {
    id: string;
    nama: string;
    username: string;
  };
  toko?: {
    id: string;
    nama: string;
    kode: string;
  };
}

// Schema validasi untuk membuat catatan
export const CreateCatatanSchema = z.object({
  judul: z.string()
    .min(1, 'Judul tidak boleh kosong')
    .max(255, 'Judul maksimal 255 karakter'),
  konten: z.string()
    .min(1, 'Konten tidak boleh kosong'),
  visibilitas: z.enum(['pribadi', 'toko', 'tenant', 'publik'])
    .default('pribadi'),
  kategori: z.string()
    .max(100, 'Kategori maksimal 100 karakter')
    .optional(),
  tags: z.array(z.string().max(50, 'Tag maksimal 50 karakter'))
    .max(10, 'Maksimal 10 tags')
    .optional(),
  prioritas: z.enum(['rendah', 'normal', 'tinggi'])
    .optional()
    .default('normal'),
  status: z.enum(['draft', 'aktif', 'arsip'])
    .optional()
    .default('aktif'),
  reminder_pada: z.string()
    .datetime('Format tanggal tidak valid')
    .optional(),
  lampiran_url: z.string()
    .url('URL lampiran tidak valid')
    .max(500, 'URL lampiran maksimal 500 karakter')
    .optional(),
  toko_id: z.string()
    .uuid('ID toko harus berupa UUID yang valid')
    .optional()
});

// Schema validasi untuk update catatan
export const UpdateCatatanSchema = z.object({
  judul: z.string()
    .min(1, 'Judul tidak boleh kosong')
    .max(255, 'Judul maksimal 255 karakter')
    .optional(),
  konten: z.string()
    .min(1, 'Konten tidak boleh kosong')
    .optional(),
  visibilitas: z.enum(['pribadi', 'toko', 'tenant', 'publik']).optional(),
  kategori: z.string()
    .max(100, 'Kategori maksimal 100 karakter')
    .optional(),
  tags: z.array(z.string().max(50, 'Tag maksimal 50 karakter'))
    .max(10, 'Maksimal 10 tags')
    .optional(),
  prioritas: z.enum(['rendah', 'normal', 'tinggi']).optional(),
  status: z.enum(['draft', 'aktif', 'arsip']).optional(),
  reminder_pada: z.string()
    .datetime('Format tanggal tidak valid')
    .optional()
    .nullable(),
  lampiran_url: z.string()
    .url('URL lampiran tidak valid')
    .max(500, 'URL lampiran maksimal 500 karakter')
    .optional()
    .nullable(),
  toko_id: z.string()
    .uuid('ID toko harus berupa UUID yang valid')
    .optional()
    .nullable()
});

// Schema validasi untuk pencarian catatan
export const SearchCatatanSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  search: z.string().optional(),
  visibilitas: z.enum(['pribadi', 'toko', 'tenant', 'publik']).optional(),
  kategori: z.string().optional(),
  tags: z.string().optional(), // comma-separated tags
  prioritas: z.enum(['rendah', 'normal', 'tinggi']).optional(),
  status: z.enum(['draft', 'aktif', 'arsip', 'dihapus']).optional(),
  user_id: z.string().uuid().optional(),
  toko_id: z.string().uuid().optional(),
  tanggal_mulai: z.string().optional(),
  tanggal_selesai: z.string().optional(),
  has_reminder: z.enum(['true', 'false']).optional(),
  sort_by: z.enum(['dibuat_pada', 'diperbarui_pada', 'judul', 'prioritas', 'reminder_pada'])
    .optional()
    .default('diperbarui_pada'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc')
});

// Schema untuk bulk operations
export const BulkUpdateCatatanSchema = z.object({
  catatan_ids: z.array(z.string().uuid()).min(1, 'Minimal satu ID catatan diperlukan'),
  updates: z.object({
    visibilitas: z.enum(['pribadi', 'toko', 'tenant', 'publik']).optional(),
    kategori: z.string().max(100).optional(),
    prioritas: z.enum(['rendah', 'normal', 'tinggi']).optional(),
    status: z.enum(['draft', 'aktif', 'arsip']).optional(),
    toko_id: z.string().uuid().optional().nullable()
  })
});

// Tipe data yang diekspor
export type CreateCatatan = z.infer<typeof CreateCatatanSchema>;
export type UpdateCatatan = z.infer<typeof UpdateCatatanSchema>;
export type SearchCatatanQuery = z.infer<typeof SearchCatatanSchema>;
export type BulkUpdateCatatan = z.infer<typeof BulkUpdateCatatanSchema>;

// Interface untuk statistik catatan
export interface CatatanStats {
  total_catatan: number;
  catatan_aktif: number;
  catatan_draft: number;
  catatan_arsip: number;
  catatan_hari_ini: number;
  catatan_minggu_ini: number;
  catatan_bulan_ini: number;
  catatan_per_visibilitas: {
    pribadi: number;
    toko: number;
    tenant: number;
    publik: number;
  };
  catatan_per_prioritas: {
    rendah: number;
    normal: number;
    tinggi: number;
  };
  reminder_mendatang: number;
}

// Interface untuk response API
export interface CatatanResponse {
  success: boolean;
  message: string;
  data?: Catatan | CatatanWithUser | Catatan[] | CatatanWithUser[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  stats?: CatatanStats;
}