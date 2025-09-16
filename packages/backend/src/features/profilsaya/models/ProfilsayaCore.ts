/**
 * Detail User Model
 * Model untuk detail informasi user dari tabel detail_user
 */

import { z } from 'zod';

// Enum untuk jenis kelamin
export enum JenisKelamin {
  L = 'L',
  P = 'P'
}

// Schema validasi untuk DetailUser sesuai dengan struktur tabel detail_user
export const DetailUserSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  tenant_id: z.string().uuid().nullable(),
  toko_id: z.string().uuid().nullable(),
  nama_lengkap: z.string().max(255).nullable(),
  email: z.string().email().max(255).nullable(),
  telepon: z.string().max(20).nullable(),
  alamat: z.string().nullable(),
  tanggal_lahir: z.date().nullable(),
  jenis_kelamin: z.nativeEnum(JenisKelamin).nullable(),
  gaji_poko: z.number().nullable(),
  komisi_persen: z.number().min(0).max(100).nullable(),
  tanggal_masuk: z.date().nullable(),
  tanggal_keluar: z.date().nullable(),
  avatar_url: z.string().max(500).nullable(),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

// Schema untuk create detail user
export const CreateDetailUserSchema = DetailUserSchema.omit({
  id: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

// Schema untuk update detail user
export const UpdateDetailUserSchema = CreateDetailUserSchema.partial().omit({
  user_id: true
});

// Schema untuk query parameters
export const DetailUserQuerySchema = z.object({
  tenant_id: z.string().uuid().optional(),
  toko_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  jenis_kelamin: z.nativeEnum(JenisKelamin).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sort: z.enum(['nama_lengkap', 'email', 'tanggal_masuk', 'dibuat_pada']).default('dibuat_pada'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional()
});

// Schema untuk response list detail user
export const DetailUserListResponseSchema = z.object({
  data: z.array(DetailUserSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean()
  })
});

// Type definitions
export type DetailUser = z.infer<typeof DetailUserSchema>;
export type CreateDetailUser = z.infer<typeof CreateDetailUserSchema>;
export type UpdateDetailUser = z.infer<typeof UpdateDetailUserSchema>;
export type DetailUserQuery = z.infer<typeof DetailUserQuerySchema>;
export type DetailUserListResponse = z.infer<typeof DetailUserListResponseSchema>;

// Interface untuk joined data dengan user
export interface DetailUserWithUser extends DetailUser {
  user?: {
    id: string;
    username: string;
    status: string;
    last_login: Date | null;
  };
}

// Interface untuk response data
export interface DetailUserResponse {
  success: boolean;
  message: string;
  data?: DetailUser | DetailUser[] | DetailUserListResponse;
  error?: string;
}

// Constants untuk validasi
export const DETAIL_USER_CONSTANTS = {
  MAX_KOMISI_PERSEN: 100,
  MIN_KOMISI_PERSEN: 0,
  MAX_EMAIL_LENGTH: 255,
  MAX_TELEPON_LENGTH: 20,
  MAX_NAMA_LENGTH: 255,
  MAX_AVATAR_URL_LENGTH: 500
} as const;

// Helper functions
export const isValidKomisiPersen = (komisi: number): boolean => {
  return komisi >= DETAIL_USER_CONSTANTS.MIN_KOMISI_PERSEN &&
         komisi <= DETAIL_USER_CONSTANTS.MAX_KOMISI_PERSEN;
};

export const calculateAge = (tanggalLahir: Date): number | null => {
  if (!tanggalLahir) return null;
  const today = new Date();
  const birthDate = new Date(tanggalLahir);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount);
};