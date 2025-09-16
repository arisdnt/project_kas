/**
 * Supplier Core Model
 * Supplier management model for POS system
 */

import { z } from 'zod';

export const SupplierSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid(),
  nama: z.string().min(1).max(255),
  kontak_person: z.string().max(255).optional(),
  telepon: z.string().max(20).optional(),
  email: z.string().email().optional(),
  alamat: z.string().optional(),
  npwp: z.string().max(20).optional(),
  bank_nama: z.string().max(100).optional(),
  bank_rekening: z.string().max(50).optional(),
  bank_atas_nama: z.string().max(255).optional(),
  status: z.enum(['aktif', 'nonaktif', 'blacklist']).default('aktif'),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const CreateSupplierSchema = SupplierSchema.omit({
  id: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const UpdateSupplierSchema = SupplierSchema.partial().omit({
  id: true,
  tenant_id: true,
  toko_id: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const SearchSupplierQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  status: z.enum(['aktif', 'nonaktif', 'blacklist']).optional(),
  has_email: z.boolean().optional(),
  has_phone: z.boolean().optional(),
  has_bank_info: z.boolean().optional()
});

export const SupplierStatsSchema = z.object({
  supplier_id: z.string().uuid(),
  total_purchases: z.number().int(),
  total_amount: z.number(),
  total_products_supplied: z.number().int(),
  average_order_value: z.number(),
  last_purchase_date: z.date().optional(),
  outstanding_balance: z.number(),
  payment_performance: z.enum(['excellent', 'good', 'fair', 'poor'])
});

export const SupplierPurchaseHistorySchema = z.object({
  purchase_id: z.string().uuid(),
  nomor_pembelian: z.string(),
  tanggal: z.date(),
  total: z.number(),
  status: z.string(),
  items_count: z.number().int(),
  payment_status: z.string().optional(),
  due_date: z.date().optional()
});

export const SupplierProductsSchema = z.object({
  product_id: z.string().uuid(),
  product_name: z.string(),
  product_code: z.string(),
  category_name: z.string().optional(),
  last_purchase_price: z.number(),
  last_purchase_date: z.date().optional(),
  total_purchased: z.number().int()
});

export const BulkSupplierActionSchema = z.object({
  supplier_ids: z.array(z.string().uuid()).min(1),
  action: z.enum(['activate', 'deactivate', 'blacklist', 'export_data']),
  reason: z.string().optional()
});

export const SupplierPerformanceReportSchema = z.object({
  supplier_id: z.string().uuid(),
  nama: z.string(),
  total_purchases: z.number().int(),
  total_amount: z.number(),
  average_order_value: z.number(),
  on_time_delivery_rate: z.number(),
  quality_rating: z.number(),
  payment_terms_compliance: z.number(),
  overall_score: z.number(),
  rank: z.number().int()
});

export const ImportSupplierSchema = z.object({
  nama: z.string().min(1),
  kontak_person: z.string().optional(),
  telepon: z.string().optional(),
  email: z.string().email().optional(),
  alamat: z.string().optional(),
  npwp: z.string().optional(),
  bank_nama: z.string().optional(),
  bank_rekening: z.string().optional(),
  bank_atas_nama: z.string().optional()
});

export const SupplierPaymentTermsSchema = z.object({
  id: z.string().uuid(),
  supplier_id: z.string().uuid(),
  payment_method: z.enum(['cash', 'transfer', 'check', 'credit']),
  payment_terms_days: z.number().int().min(0).max(365),
  discount_rate: z.number().min(0).max(100).optional(),
  discount_days: z.number().int().min(0).optional(),
  late_fee_rate: z.number().min(0).max(100).optional(),
  credit_limit: z.number().min(0).optional(),
  is_active: z.boolean().default(true),
  created_at: z.date(),
  updated_at: z.date()
});

export const CreateSupplierPaymentTermsSchema = SupplierPaymentTermsSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const SupplierContactLogSchema = z.object({
  id: z.string().uuid(),
  supplier_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid(),
  contact_type: z.enum(['call', 'email', 'meeting', 'visit', 'other']),
  subject: z.string(),
  notes: z.string().optional(),
  follow_up_date: z.date().optional(),
  status: z.enum(['completed', 'pending', 'cancelled']),
  created_at: z.date()
});

export const CreateSupplierContactLogSchema = SupplierContactLogSchema.omit({
  id: true,
  created_at: true
});

export type Supplier = z.infer<typeof SupplierSchema>;
export type CreateSupplier = z.infer<typeof CreateSupplierSchema>;
export type UpdateSupplier = z.infer<typeof UpdateSupplierSchema>;
export type SearchSupplierQuery = z.infer<typeof SearchSupplierQuerySchema>;
export type SupplierStats = z.infer<typeof SupplierStatsSchema>;
export type SupplierPurchaseHistory = z.infer<typeof SupplierPurchaseHistorySchema>;
export type SupplierProducts = z.infer<typeof SupplierProductsSchema>;
export type BulkSupplierAction = z.infer<typeof BulkSupplierActionSchema>;
export type SupplierPerformanceReport = z.infer<typeof SupplierPerformanceReportSchema>;
export type ImportSupplier = z.infer<typeof ImportSupplierSchema>;
export type SupplierPaymentTerms = z.infer<typeof SupplierPaymentTermsSchema>;
export type CreateSupplierPaymentTerms = z.infer<typeof CreateSupplierPaymentTermsSchema>;
export type SupplierContactLog = z.infer<typeof SupplierContactLogSchema>;
export type CreateSupplierContactLog = z.infer<typeof CreateSupplierContactLogSchema>;