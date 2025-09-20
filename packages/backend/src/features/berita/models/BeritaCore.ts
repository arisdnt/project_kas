/**
 * Model core untuk tabel berita
 * Definisi enum, interface, dan schema validasi menggunakan Zod
 */

import { z } from 'zod';

// Enum untuk tipe berita
export enum TipeBerita {
  INFORMASI = 'informasi',
  PENGUMUMAN = 'pengumuman',
  PERINGATAN = 'peringatan',
  URGENT = 'urgent'
}

// Enum untuk target tampil berita
export enum TargetTampil {
  TOKO_TERTENTU = 'toko_tertentu',
  SEMUA_TOKO_TENANT = 'semua_toko_tenant',
  SEMUA_TENANT = 'semua_tenant'
}

// Enum untuk prioritas berita
export enum PrioritasBerita {
  RENDAH = 'rendah',
  NORMAL = 'normal',
  TINGGI = 'tinggi',
  URGENT = 'urgent'
}

// Enum untuk status berita
export enum StatusBerita {
  DRAFT = 'draft',
  AKTIF = 'aktif',
  NONAKTIF = 'nonaktif',
  KEDALUWARSA = 'kedaluwarsa'
}

// Interface untuk tabel berita
export interface Berita {
  id: string;
  tenantId: string;
  tokoId?: string | null;
  userId: string;
  judul: string;
  konten: string;
  tipeBerita: TipeBerita;
  targetTampil: TargetTampil;
  targetTokoIds?: string[] | null;
  targetTenantIds?: string[] | null;
  jadwalMulai: Date;
  jadwalSelesai?: Date | null;
  intervalTampilMenit: number;
  maksimalTampil?: number | null;
  prioritas: PrioritasBerita;
  status: StatusBerita;
  gambarUrl?: string | null;
  lampiranUrl?: string | null;
  dibuatPada: Date;
  diperbaruiPada: Date;
}

// Interface untuk berita dengan informasi user
export interface BeritaWithUser extends Berita {
  namaUser: string;
  namaToko?: string | null;
}

// Schema validasi untuk membuat berita
export const CreateBeritaSchema = z.object({
  judul: z.string()
    .min(1, 'Judul berita wajib diisi')
    .max(255, 'Judul maksimal 255 karakter'),
  
  konten: z.string()
    .min(1, 'Konten berita wajib diisi'),
  
  tipeBerita: z.nativeEnum(TipeBerita)
    .default(TipeBerita.INFORMASI),
  
  targetTampil: z.nativeEnum(TargetTampil)
    .default(TargetTampil.TOKO_TERTENTU),
  
  targetTokoIds: z.array(z.string().uuid())
    .optional()
    .nullable(),
  
  targetTenantIds: z.array(z.string().uuid())
    .optional()
    .nullable(),
  
  jadwalMulai: z.union([
    z.string().datetime(),
    z.date()
  ])
    .optional()
    .transform(val => {
      if (!val) return new Date();
      return val instanceof Date ? val : new Date(val);
    }),
  
  jadwalSelesai: z.union([
    z.string().datetime(),
    z.date()
  ])
    .optional()
    .nullable()
    .transform(val => {
      if (!val) return null;
      return val instanceof Date ? val : new Date(val);
    }),
  
  intervalTampilMenit: z.number()
    .int()
    .min(1, 'Interval minimal 1 menit')
    .max(1440, 'Interval maksimal 1440 menit (24 jam)')
    .default(60),
  
  maksimalTampil: z.number()
    .int()
    .min(1)
    .optional()
    .nullable(),
  
  prioritas: z.nativeEnum(PrioritasBerita)
    .default(PrioritasBerita.NORMAL),
  
  status: z.nativeEnum(StatusBerita)
    .default(StatusBerita.DRAFT),
  
  gambarUrl: z.string()
    .url('Format URL gambar tidak valid')
    .max(500, 'URL gambar maksimal 500 karakter')
    .optional()
    .nullable(),
  
  lampiranUrl: z.string()
    .url('Format URL lampiran tidak valid')
    .max(500, 'URL lampiran maksimal 500 karakter')
    .optional()
    .nullable()
});

// Schema validasi untuk update berita
export const UpdateBeritaSchema = CreateBeritaSchema.partial();

// Schema validasi untuk pencarian berita
export const SearchBeritaQuerySchema = z.object({
  q: z.string().optional(),
  tipeBerita: z.nativeEnum(TipeBerita).optional(),
  targetTampil: z.nativeEnum(TargetTampil).optional(),
  prioritas: z.nativeEnum(PrioritasBerita).optional(),
  status: z.nativeEnum(StatusBerita).optional(),
  jadwalMulaiDari: z.string().datetime().optional(),
  jadwalMulaiSampai: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['dibuat_pada', 'jadwal_mulai', 'prioritas', 'judul']).default('dibuat_pada'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Tipe data untuk operasi CRUD
export type CreateBerita = z.infer<typeof CreateBeritaSchema>;
export type UpdateBerita = z.infer<typeof UpdateBeritaSchema>;
export type SearchBeritaQuery = z.infer<typeof SearchBeritaQuerySchema>;

// Interface untuk statistik berita
export interface BeritaStats {
  totalBerita: number;
  totalAktif: number;
  totalDraft: number;
  totalKedaluwarsa: number;
  beritaUrgent: number;
  beritaHariIni: number;
}

// Interface untuk response API berita
export interface BeritaResponse {
  success: boolean;
  message: string;
  data?: BeritaWithUser | BeritaWithUser[] | BeritaStats;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}