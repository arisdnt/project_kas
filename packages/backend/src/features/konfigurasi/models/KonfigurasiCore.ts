/**
 * System Configuration Core Model
 * Based on database schema for system settings management
 */

import { z } from 'zod';

export const KonfigurasiSistemSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid().optional(),
  pajak: z.number().min(0).max(100).default(0),
  is_pajak_aktif: z.boolean().default(false),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const CreateKonfigurasiSchema = KonfigurasiSistemSchema.omit({
  id: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const UpdateKonfigurasiSchema = CreateKonfigurasiSchema.partial().omit({
  tenant_id: true
});

// Extended configuration with additional settings
export const ExtendedKonfigurasiSchema = KonfigurasiSistemSchema.extend({
  // Business settings
  nama_bisnis: z.string().optional(),
  alamat_bisnis: z.string().optional(),
  telepon_bisnis: z.string().optional(),
  email_bisnis: z.string().email().optional(),
  website_bisnis: z.string().url().optional(),
  logo_bisnis: z.string().url().optional(),

  // Currency settings
  mata_uang: z.string().default('IDR'),
  format_mata_uang: z.string().default('Rp'),
  decimal_places: z.number().int().min(0).max(4).default(0),

  // Receipt settings
  header_nota: z.string().optional(),
  footer_nota: z.string().optional(),
  show_logo_nota: z.boolean().default(true),

  // System settings
  timezone: z.string().default('Asia/Jakarta'),
  date_format: z.string().default('dd/MM/yyyy'),
  time_format: z.string().default('HH:mm'),

  // Inventory settings
  low_stock_threshold: z.number().int().min(0).default(10),
  auto_reduce_stock: z.boolean().default(true),
  allow_negative_stock: z.boolean().default(false),

  // POS settings
  auto_print_receipt: z.boolean().default(false),
  require_customer: z.boolean().default(false),
  allow_discount: z.boolean().default(true),
  max_discount_percent: z.number().min(0).max(100).default(100)
});

export const ConfigSettingSchema = z.object({
  key: z.string(),
  value: z.any(),
  type: z.enum(['string', 'number', 'boolean', 'json']),
  description: z.string().optional()
});

export type KonfigurasiSistem = z.infer<typeof KonfigurasiSistemSchema>;
export type CreateKonfigurasi = z.infer<typeof CreateKonfigurasiSchema>;
export type UpdateKonfigurasi = z.infer<typeof UpdateKonfigurasiSchema>;
export type ExtendedKonfigurasi = z.infer<typeof ExtendedKonfigurasiSchema>;
export type ConfigSetting = z.infer<typeof ConfigSettingSchema>;