/**
 * Core Product Model
 * Based on database schema with multi-tenant, multi-role, multi-store support
 */

import { z } from 'zod';

export enum ProdukStatus {
  ACTIVE = 1,
  INACTIVE = 0
}

export const ProdukCoreSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid().optional(),
  kategori_id: z.string().uuid(),
  brand_id: z.string().uuid(),
  supplier_id: z.string().uuid(),
  kode: z.string().min(1).max(50),
  barcode: z.string().max(50).optional(),
  nama: z.string().min(1).max(255),
  deskripsi: z.string().optional(),
  satuan: z.string().max(20).default('pcs'),
  harga_beli: z.number().min(0).default(0),
  harga_jual: z.number().min(0).default(0),
  margin_persen: z.number().min(0).max(100).default(0),
  stok_minimum: z.number().int().min(0).default(0),
  berat: z.number().min(0).default(0),
  dimensi: z.string().max(100).optional(),
  gambar_url: z.string().url().optional(),
  is_aktif: z.nativeEnum(ProdukStatus).default(ProdukStatus.ACTIVE),
  is_dijual_online: z.boolean().default(false),
  pajak_persen: z.number().min(0).max(100).default(0),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const CreateProdukSchema = ProdukCoreSchema.omit({
  id: true,
  tenant_id: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const UpdateProdukSchema = CreateProdukSchema.partial();

export const SearchProdukQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  kategori_id: z.string().uuid().optional(),
  brand_id: z.string().uuid().optional(),
  supplier_id: z.string().uuid().optional(),
  is_aktif: z.enum(['0', '1']).optional(),
  toko_id: z.string().uuid().optional()
});

export type Produk = z.infer<typeof ProdukCoreSchema>;
export type CreateProduk = z.infer<typeof CreateProdukSchema>;
export type UpdateProduk = z.infer<typeof UpdateProdukSchema>;
export type SearchProdukQuery = z.infer<typeof SearchProdukQuerySchema>;