/**
 * Store (Toko) Core Model
 * Store management and configuration model
 */

import { z } from 'zod';

export const TokoSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  nama: z.string().min(1).max(255),
  kode: z.string().min(1).max(50),
  alamat: z.string().optional(),
  telepon: z.string().max(20).optional(),
  email: z.string().email().optional(),
  status: z.enum(['aktif', 'nonaktif', 'tutup_sementara']).default('aktif'),
  timezone: z.string().default('Asia/Jakarta'),
  mata_uang: z.string().length(3).default('IDR'),
  logo_url: z.string().url().optional(),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const CreateTokoSchema = TokoSchema.omit({
  id: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const UpdateTokoSchema = TokoSchema.partial().omit({
  id: true,
  tenant_id: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const SearchTokoQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  status: z.enum(['aktif', 'nonaktif', 'tutup_sementara']).optional(),
  kode: z.string().optional()
});

export const TokoConfigSchema = z.object({
  id: z.string().uuid(),
  toko_id: z.string().uuid(),
  key: z.string().min(1).max(100),
  value: z.string(),
  tipe: z.enum(['string', 'number', 'boolean', 'json']).default('string'),
  deskripsi: z.string().optional(),
  is_public: z.boolean().default(false),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const CreateTokoConfigSchema = TokoConfigSchema.omit({
  id: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const UpdateTokoConfigSchema = z.object({
  value: z.string(),
  deskripsi: z.string().optional()
});

export const TokoStatsSchema = z.object({
  toko_id: z.string().uuid(),
  total_products: z.number().int(),
  total_transactions_today: z.number().int(),
  total_sales_today: z.number(),
  total_customers: z.number().int(),
  low_stock_items: z.number().int(),
  active_users: z.number().int()
});

export const TokoOperatingHoursSchema = z.object({
  id: z.string().uuid(),
  toko_id: z.string().uuid(),
  hari: z.enum(['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu']),
  jam_buka: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  jam_tutup: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  is_buka: z.boolean().default(true),
  catatan: z.string().optional(),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const CreateTokoOperatingHoursSchema = TokoOperatingHoursSchema.omit({
  id: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const BulkUpdateOperatingHoursSchema = z.object({
  operating_hours: z.array(z.object({
    hari: z.enum(['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu']),
    jam_buka: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    jam_tutup: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    is_buka: z.boolean().default(true),
    catatan: z.string().optional()
  })).min(1).max(7)
});

export type Toko = z.infer<typeof TokoSchema>;
export type CreateToko = z.infer<typeof CreateTokoSchema>;
export type UpdateToko = z.infer<typeof UpdateTokoSchema>;
export type SearchTokoQuery = z.infer<typeof SearchTokoQuerySchema>;
export type TokoConfig = z.infer<typeof TokoConfigSchema>;
export type CreateTokoConfig = z.infer<typeof CreateTokoConfigSchema>;
export type UpdateTokoConfig = z.infer<typeof UpdateTokoConfigSchema>;
export type TokoStats = z.infer<typeof TokoStatsSchema>;
export type TokoOperatingHours = z.infer<typeof TokoOperatingHoursSchema>;
export type CreateTokoOperatingHours = z.infer<typeof CreateTokoOperatingHoursSchema>;
export type BulkUpdateOperatingHours = z.infer<typeof BulkUpdateOperatingHoursSchema>;