/**
 * Return Item Model
 * Model for individual items in return transactions
 */

import { z } from 'zod';

// Sales Return Item Schema
export const ItemReturPenjualanSchema = z.object({
  id: z.string().uuid(),
  retur_penjualan_id: z.string().uuid(),
  produk_id: z.string().uuid(),
  kuantitas: z.number().int().min(1).default(1),
  harga_satuan: z.number().min(0),
  diskon_persen: z.number().min(0).max(100).default(0),
  diskon_nominal: z.number().min(0).default(0),
  subtotal: z.number().min(0),
  catatan: z.string().optional(),
  dibuat_pada: z.date()
});

// Purchase Return Item Schema
export const ItemReturPembelianSchema = z.object({
  id: z.string().uuid(),
  retur_pembelian_id: z.string().uuid(),
  produk_id: z.string().uuid(),
  kuantitas: z.number().int().min(1).default(1),
  harga_satuan: z.number().min(0),
  diskon_persen: z.number().min(0).max(100).default(0),
  diskon_nominal: z.number().min(0).default(0),
  subtotal: z.number().min(0),
  catatan: z.string().optional(),
  dibuat_pada: z.date()
});

export const CreateItemReturPenjualanSchema = ItemReturPenjualanSchema.omit({
  id: true,
  dibuat_pada: true
});

export const CreateItemReturPembelianSchema = ItemReturPembelianSchema.omit({
  id: true,
  dibuat_pada: true
});

export const ItemReturWithProductSchema = ItemReturPenjualanSchema.extend({
  produk_nama: z.string(),
  produk_kode: z.string(),
  produk_satuan: z.string(),
  stok_tersedia: z.number().int().optional()
});

export type ItemReturPenjualan = z.infer<typeof ItemReturPenjualanSchema>;
export type ItemReturPembelian = z.infer<typeof ItemReturPembelianSchema>;
export type CreateItemReturPenjualan = z.infer<typeof CreateItemReturPenjualanSchema>;
export type CreateItemReturPembelian = z.infer<typeof CreateItemReturPembelianSchema>;
export type ItemReturWithProduct = z.infer<typeof ItemReturWithProductSchema>;