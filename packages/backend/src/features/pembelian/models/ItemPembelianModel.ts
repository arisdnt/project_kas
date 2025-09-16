/**
 * Purchase Transaction Item Model
 * Model for individual items in purchase transactions
 */

import { z } from 'zod';

export const ItemTransaksiPembelianSchema = z.object({
  id: z.string().uuid(),
  transaksi_pembelian_id: z.string().uuid(),
  produk_id: z.string().uuid(),
  kuantitas: z.number().int().min(1).default(1),
  harga_satuan: z.number().min(0),
  diskon_persen: z.number().min(0).max(100).default(0),
  diskon_nominal: z.number().min(0).default(0),
  subtotal: z.number().min(0),
  catatan: z.string().optional(),
  dibuat_pada: z.date()
});

export const CreateItemPembelianSchema = ItemTransaksiPembelianSchema.omit({
  id: true,
  dibuat_pada: true
});

export const UpdateItemPembelianSchema = CreateItemPembelianSchema.partial().omit({
  transaksi_pembelian_id: true
});

export const ItemPembelianWithProductSchema = ItemTransaksiPembelianSchema.extend({
  produk_nama: z.string(),
  produk_kode: z.string(),
  produk_satuan: z.string(),
  stok_tersedia: z.number().int().optional()
});

export type ItemTransaksiPembelian = z.infer<typeof ItemTransaksiPembelianSchema>;
export type CreateItemPembelian = z.infer<typeof CreateItemPembelianSchema>;
export type UpdateItemPembelian = z.infer<typeof UpdateItemPembelianSchema>;
export type ItemPembelianWithProduct = z.infer<typeof ItemPembelianWithProductSchema>;