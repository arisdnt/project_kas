/**
 * Sales Transaction Item Model
 * Model for individual items in sales transactions
 */

import { z } from 'zod';

export const ItemTransaksiPenjualanSchema = z.object({
  id: z.string().uuid(),
  transaksi_penjualan_id: z.string().uuid(),
  produk_id: z.string().uuid(),
  kuantitas: z.number().int().min(1).default(1),
  harga_satuan: z.number().min(0),
  diskon_persen: z.number().min(0).max(100).default(0),
  diskon_nominal: z.number().min(0).default(0),
  subtotal: z.number().min(0),
  promo_id: z.string().uuid().optional(),
  catatan: z.string().optional(),
  dibuat_pada: z.date()
});

export const CreateItemTransaksiSchema = ItemTransaksiPenjualanSchema.omit({
  id: true,
  dibuat_pada: true
});

export const UpdateItemTransaksiSchema = CreateItemTransaksiSchema.partial().omit({
  transaksi_penjualan_id: true
});

export const ItemTransaksiWithProductSchema = ItemTransaksiPenjualanSchema.extend({
  produk_nama: z.string(),
  produk_kode: z.string(),
  produk_satuan: z.string(),
  stok_tersedia: z.number().int().optional()
});

export type ItemTransaksiPenjualan = z.infer<typeof ItemTransaksiPenjualanSchema>;
export type CreateItemTransaksi = z.infer<typeof CreateItemTransaksiSchema>;
export type UpdateItemTransaksi = z.infer<typeof UpdateItemTransaksiSchema>;
export type ItemTransaksiWithProduct = z.infer<typeof ItemTransaksiWithProductSchema>;