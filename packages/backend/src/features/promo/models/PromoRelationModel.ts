/**
 * Promo Relation Models
 * Models for promo relationships with categories, products, and customers
 */

import { z } from 'zod';

// Promo Category relation
export const PromoCategorySchema = z.object({
  id: z.string().uuid(),
  promo_id: z.string().uuid(),
  kategori_id: z.string().uuid(),
  dibuat_pada: z.date()
});

export const CreatePromoCategorySchema = PromoCategorySchema.omit({
  id: true,
  dibuat_pada: true
});

// Promo Product relation
export const PromoProductSchema = z.object({
  id: z.string().uuid(),
  promo_id: z.string().uuid(),
  produk_id: z.string().uuid(),
  dibuat_pada: z.date()
});

export const CreatePromoProductSchema = PromoProductSchema.omit({
  id: true,
  dibuat_pada: true
});

// Promo Customer relation
export const PromoCustomerSchema = z.object({
  id: z.string().uuid(),
  promo_id: z.string().uuid(),
  pelanggan_id: z.string().uuid(),
  dibuat_pada: z.date()
});

export const CreatePromoCustomerSchema = PromoCustomerSchema.omit({
  id: true,
  dibuat_pada: true
});

// Promo Usage tracking
export const PromoUsageSchema = z.object({
  id: z.string().uuid(),
  promo_id: z.string().uuid(),
  transaksi_penjualan_id: z.string().uuid(),
  pelanggan_id: z.string().uuid().optional(),
  kode_promo_digunakan: z.string(),
  nilai_diskon_diberikan: z.number().min(0),
  tanggal_digunakan: z.date(),
  dibuat_pada: z.date()
});

export const CreatePromoUsageSchema = PromoUsageSchema.omit({
  id: true,
  dibuat_pada: true
});

export type PromoCategory = z.infer<typeof PromoCategorySchema>;
export type CreatePromoCategory = z.infer<typeof CreatePromoCategorySchema>;
export type PromoProduct = z.infer<typeof PromoProductSchema>;
export type CreatePromoProduct = z.infer<typeof CreatePromoProductSchema>;
export type PromoCustomer = z.infer<typeof PromoCustomerSchema>;
export type CreatePromoCustomer = z.infer<typeof CreatePromoCustomerSchema>;
export type PromoUsage = z.infer<typeof PromoUsageSchema>;
export type CreatePromoUsage = z.infer<typeof CreatePromoUsageSchema>;