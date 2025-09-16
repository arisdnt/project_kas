/**
 * Promo Core Model
 * Based on database schema with multi-tenant, multi-role, multi-store support
 */

import { z } from 'zod';

export enum TipePromo {
  KATEGORI = 'kategori',
  PRODUK = 'produk',
  PELANGGAN = 'pelanggan',
  UMUM = 'umum'
}

export enum TipeDiskon {
  PERSEN = 'persen',
  NOMINAL = 'nominal'
}

export enum StatusPromo {
  ACTIVE = 'aktif',
  INACTIVE = 'nonaktif'
}

export const PromoSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid(),
  kode_promo: z.string().min(1).max(20),
  nama: z.string().min(1).max(100),
  deskripsi: z.string().optional(),
  tipe_promo: z.nativeEnum(TipePromo),
  tipe_diskon: z.nativeEnum(TipeDiskon),
  nilai_diskon: z.number().min(0),
  tanggal_mulai: z.date(),
  tanggal_berakhir: z.date(),
  minimum_pembelian: z.number().min(0).default(0),
  maksimum_penggunaan: z.number().int().min(0).optional(),
  jumlah_terpakai: z.number().int().min(0).default(0),
  status: z.nativeEnum(StatusPromo).default(StatusPromo.ACTIVE),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const CreatePromoSchema = PromoSchema.omit({
  id: true,
  jumlah_terpakai: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const UpdatePromoSchema = CreatePromoSchema.partial().omit({
  tenant_id: true,
  toko_id: true
});

export const SearchPromoQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  tipe_promo: z.nativeEnum(TipePromo).optional(),
  tipe_diskon: z.nativeEnum(TipeDiskon).optional(),
  status: z.nativeEnum(StatusPromo).optional(),
  active_only: z.enum(['true', 'false']).optional(),
  toko_id: z.string().uuid().optional()
});

export const ValidatePromoSchema = z.object({
  kode_promo: z.string().min(1),
  pelanggan_id: z.string().uuid().optional(),
  subtotal: z.number().min(0)
});

export type Promo = z.infer<typeof PromoSchema>;
export type CreatePromo = z.infer<typeof CreatePromoSchema>;
export type UpdatePromo = z.infer<typeof UpdatePromoSchema>;
export type SearchPromoQuery = z.infer<typeof SearchPromoQuerySchema>;
export type ValidatePromoRequest = z.infer<typeof ValidatePromoSchema>;