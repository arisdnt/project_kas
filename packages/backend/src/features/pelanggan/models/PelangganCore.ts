/**
 * Customer (Pelanggan) Core Model
 * Customer management model for POS system
 */

import { z } from 'zod';

export const PelangganSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid(),
  kode: z.string().min(1).max(50),
  nama: z.string().min(1).max(255),
  email: z.string().email().optional(),
  telepon: z.string().max(20).optional(),
  alamat: z.string().optional(),
  tanggal_lahir: z.date().optional(),
  jenis_kelamin: z.enum(['pria', 'wanita']).optional(),
  pekerjaan: z.string().max(100).optional(),
  tipe: z.enum(['reguler', 'vip', 'member', 'wholesale']).default('reguler'),
  diskon_persen: z.number().min(0).max(100).default(0),
  limit_kredit: z.number().min(0).default(0),
  saldo_poin: z.number().int().min(0).default(0),
  status: z.enum(['aktif', 'nonaktif', 'blacklist']).default('aktif'),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const CreatePelangganSchema = PelangganSchema.omit({
  id: true,
  saldo_poin: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const UpdatePelangganSchema = PelangganSchema.partial().omit({
  id: true,
  tenant_id: true,
  toko_id: true,
  kode: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const SearchPelangganQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  tipe: z.enum(['reguler', 'vip', 'member', 'wholesale']).optional(),
  status: z.enum(['aktif', 'nonaktif', 'blacklist']).optional(),
  jenis_kelamin: z.enum(['pria', 'wanita']).optional(),
  has_email: z.boolean().optional(),
  has_phone: z.boolean().optional(),
  kode: z.string().optional()
});

export const PelangganStatsSchema = z.object({
  pelanggan_id: z.string().uuid(),
  total_transactions: z.number().int(),
  total_spent: z.number(),
  total_points_earned: z.number().int(),
  total_points_used: z.number().int(),
  average_order_value: z.number(),
  last_transaction_date: z.date().optional(),
  favorite_products: z.array(z.object({
    product_id: z.string().uuid(),
    product_name: z.string(),
    purchase_count: z.number().int()
  })).optional()
});

export const PelangganTransactionHistorySchema = z.object({
  transaction_id: z.string().uuid(),
  nomor_transaksi: z.string(),
  tanggal: z.date(),
  total: z.number(),
  status: z.string(),
  items_count: z.number().int(),
  points_earned: z.number().int(),
  points_used: z.number().int()
});

export const PelangganPoinLogSchema = z.object({
  id: z.string().uuid(),
  pelanggan_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid(),
  transaksi_id: z.string().uuid().optional(),
  tipe: z.enum(['earned', 'used', 'expired', 'adjustment']),
  jumlah: z.number().int(),
  saldo_sebelum: z.number().int(),
  saldo_sesudah: z.number().int(),
  keterangan: z.string(),
  expired_at: z.date().optional(),
  created_at: z.date()
});

export const CreatePelangganPoinLogSchema = PelangganPoinLogSchema.omit({
  id: true,
  created_at: true
});

export const BulkPelangganActionSchema = z.object({
  pelanggan_ids: z.array(z.string().uuid()).min(1),
  action: z.enum(['activate', 'deactivate', 'blacklist', 'upgrade_to_vip', 'downgrade_to_reguler', 'reset_points']),
  reason: z.string().optional()
});

export const PelangganSegmentationSchema = z.object({
  segment: z.string(),
  criteria: z.string(),
  customer_count: z.number().int(),
  total_value: z.number(),
  avg_order_value: z.number()
});

export const PelangganLoyaltyReportSchema = z.object({
  pelanggan_id: z.string().uuid(),
  nama: z.string(),
  tipe: z.string(),
  total_spent: z.number(),
  total_transactions: z.number().int(),
  points_balance: z.number().int(),
  last_visit: z.date().optional(),
  loyalty_score: z.number(),
  segment: z.string()
});

export const ImportPelangganSchema = z.object({
  nama: z.string().min(1),
  email: z.string().email().optional(),
  telepon: z.string().optional(),
  alamat: z.string().optional(),
  tanggal_lahir: z.string().optional(),
  jenis_kelamin: z.enum(['pria', 'wanita']).optional(),
  tipe: z.enum(['reguler', 'vip', 'member', 'wholesale']).default('reguler')
});

export const PelangganCreditLimitAdjustmentSchema = z.object({
  pelanggan_id: z.string().uuid(),
  new_limit: z.number().min(0),
  reason: z.string().min(1),
  approved_by: z.string().uuid()
});

export type Pelanggan = z.infer<typeof PelangganSchema>;
export type CreatePelanggan = z.infer<typeof CreatePelangganSchema>;
export type UpdatePelanggan = z.infer<typeof UpdatePelangganSchema>;
export type SearchPelangganQuery = z.infer<typeof SearchPelangganQuerySchema>;
export type PelangganStats = z.infer<typeof PelangganStatsSchema>;
export type PelangganTransactionHistory = z.infer<typeof PelangganTransactionHistorySchema>;
export type PelangganPoinLog = z.infer<typeof PelangganPoinLogSchema>;
export type CreatePelangganPoinLog = z.infer<typeof CreatePelangganPoinLogSchema>;
export type BulkPelangganAction = z.infer<typeof BulkPelangganActionSchema>;
export type PelangganSegmentation = z.infer<typeof PelangganSegmentationSchema>;
export type PelangganLoyaltyReport = z.infer<typeof PelangganLoyaltyReportSchema>;
export type ImportPelanggan = z.infer<typeof ImportPelangganSchema>;
export type PelangganCreditLimitAdjustment = z.infer<typeof PelangganCreditLimitAdjustmentSchema>;