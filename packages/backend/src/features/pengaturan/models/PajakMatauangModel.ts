import { z } from 'zod';

// ========================================
// Tax (Pajak) Models
// ========================================

export const PajakSettingSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid(),
  nama: z.string().min(1, 'Nama pajak wajib diisi').max(100),
  persentase: z.number().min(0, 'Persentase tidak boleh negatif').max(100, 'Persentase tidak boleh lebih dari 100'),
  deskripsi: z.string().optional().nullable(),
  aktif: z.boolean().default(true),
  is_default: z.boolean().default(false),
  dibuat_pada: z.string().or(z.date()),
  diperbarui_pada: z.string().or(z.date()),
  dibuat_oleh: z.string().uuid().optional().nullable(),
  diperbarui_oleh: z.string().uuid().optional().nullable(),
});

export const CreatePajakRequestSchema = z.object({
  nama: z.string().min(1, 'Nama pajak wajib diisi').max(100),
  persentase: z.number().min(0, 'Persentase tidak boleh negatif').max(100, 'Persentase tidak boleh lebih dari 100'),
  deskripsi: z.string().optional(),
  aktif: z.boolean().default(true),
  is_default: z.boolean().default(false),
});

export const UpdatePajakRequestSchema = CreatePajakRequestSchema.partial();

// ========================================
// Currency (Mata Uang) Models
// ========================================

export const MatauangSettingSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid(),
  kode: z.string().length(3, 'Kode mata uang harus 3 karakter').toUpperCase(),
  nama: z.string().min(1, 'Nama mata uang wajib diisi').max(100),
  simbol: z.string().min(1, 'Simbol mata uang wajib diisi').max(10),
  format_tampilan: z.enum(['before', 'after'], {
    errorMap: () => ({ message: 'Format tampilan harus "before" atau "after"' })
  }),
  pemisah_desimal: z.string().length(1, 'Pemisah desimal harus 1 karakter'),
  pemisah_ribuan: z.string().length(1, 'Pemisah ribuan harus 1 karakter'),
  jumlah_desimal: z.number().int().min(0).max(4, 'Jumlah desimal maksimal 4'),
  aktif: z.boolean().default(true),
  is_default: z.boolean().default(false),
  dibuat_pada: z.string().or(z.date()),
  diperbarui_pada: z.string().or(z.date()),
  dibuat_oleh: z.string().uuid().optional().nullable(),
  diperbarui_oleh: z.string().uuid().optional().nullable(),
});

export const CreateMatauangRequestSchema = z.object({
  kode: z.string().length(3, 'Kode mata uang harus 3 karakter').toUpperCase(),
  nama: z.string().min(1, 'Nama mata uang wajib diisi').max(100),
  simbol: z.string().min(1, 'Simbol mata uang wajib diisi').max(10),
  format_tampilan: z.enum(['before', 'after'], {
    errorMap: () => ({ message: 'Format tampilan harus "before" atau "after"' })
  }),
  pemisah_desimal: z.string().length(1, 'Pemisah desimal harus 1 karakter').default(','),
  pemisah_ribuan: z.string().length(1, 'Pemisah ribuan harus 1 karakter').default('.'),
  jumlah_desimal: z.number().int().min(0).max(4, 'Jumlah desimal maksimal 4').default(0),
  aktif: z.boolean().default(true),
  is_default: z.boolean().default(false),
});

export const UpdateMatauangRequestSchema = CreateMatauangRequestSchema.partial();

// ========================================
// Search and Filter Models
// ========================================

export const PajakMatauangFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.enum(['ALL', 'PAJAK', 'MATA_UANG']).default('ALL'),
  status: z.enum(['ALL', 'AKTIF', 'NONAKTIF']).default('ALL'),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 25),
});

export const PajakMatauangStatsSchema = z.object({
  total_pajak: z.number(),
  pajak_aktif: z.number(),
  total_mata_uang: z.number(),
  mata_uang_aktif: z.number(),
});

// ========================================
// TypeScript Types
// ========================================

export type PajakSetting = z.infer<typeof PajakSettingSchema>;
export type CreatePajakRequest = z.infer<typeof CreatePajakRequestSchema>;
export type UpdatePajakRequest = z.infer<typeof UpdatePajakRequestSchema>;

export type MatauangSetting = z.infer<typeof MatauangSettingSchema>;
export type CreateMatauangRequest = z.infer<typeof CreateMatauangRequestSchema>;
export type UpdateMatauangRequest = z.infer<typeof UpdateMatauangRequestSchema>;

export type PajakMatauangFilters = z.infer<typeof PajakMatauangFiltersSchema>;
export type PajakMatauangStats = z.infer<typeof PajakMatauangStatsSchema>;

// ========================================
// Response Types
// ========================================

export interface PajakListResponse {
  success: boolean;
  message: string;
  data: PajakSetting[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

export interface MatauangListResponse {
  success: boolean;
  message: string;
  data: MatauangSetting[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

export interface PajakMatauangStatsResponse {
  success: boolean;
  message: string;
  data: PajakMatauangStats;
}

// ========================================
// Helper Functions
// ========================================

export const createSuccessResponse = <T>(data: T, message: string = 'Operasi berhasil') => ({
  success: true,
  message,
  data,
});

export const createErrorResponse = (message: string = 'Terjadi kesalahan') => ({
  success: false,
  message,
  data: null,
});

export const formatCurrency = (amount: number, currency: MatauangSetting): string => {
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: currency.jumlah_desimal,
    maximumFractionDigits: currency.jumlah_desimal
  }).format(amount);

  const withCustomSeparators = formatted
    .replace(/,/g, '|||TEMP|||')
    .replace(/\./g, currency.pemisah_ribuan)
    .replace(/\|\|\|TEMP\|\|\|/g, currency.pemisah_desimal);

  return currency.format_tampilan === 'before'
    ? `${currency.simbol}${withCustomSeparators}`
    : `${withCustomSeparators} ${currency.simbol}`;
};