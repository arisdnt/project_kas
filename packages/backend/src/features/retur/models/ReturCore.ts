/**
 * Return Core Model
 * Based on database schema for sales and purchase returns
 */

import { z } from 'zod';

export enum StatusRetur {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed'
}

export enum MetodePengembalian {
  TUNAI = 'tunai',
  TRANSFER = 'transfer',
  KREDIT = 'kredit',
  TUKAR_BARANG = 'tukar_barang'
}

// Sales Return Schema
export const ReturPenjualanSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid(),
  pengguna_id: z.string().uuid(),
  transaksi_penjualan_id: z.string().uuid(),
  pelanggan_id: z.string().uuid().optional(),
  nomor_retur: z.string().min(1).max(50),
  tanggal: z.date(),
  alasan_retur: z.string().min(1),
  subtotal: z.number().min(0).default(0),
  diskon_persen: z.number().min(0).max(100).default(0),
  diskon_nominal: z.number().min(0).default(0),
  pajak_persen: z.number().min(0).max(100).default(0),
  pajak_nominal: z.number().min(0).default(0),
  total: z.number().min(0).default(0),
  metode_pengembalian: z.nativeEnum(MetodePengembalian).default(MetodePengembalian.TUNAI),
  status: z.nativeEnum(StatusRetur).default(StatusRetur.DRAFT),
  catatan: z.string().optional(),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

// Purchase Return Schema
export const ReturPembelianSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid(),
  pengguna_id: z.string().uuid(),
  transaksi_pembelian_id: z.string().uuid(),
  supplier_id: z.string().uuid(),
  nomor_retur: z.string().min(1).max(50),
  tanggal: z.date(),
  alasan_retur: z.string().min(1),
  subtotal: z.number().min(0).default(0),
  diskon_persen: z.number().min(0).max(100).default(0),
  diskon_nominal: z.number().min(0).default(0),
  pajak_persen: z.number().min(0).max(100).default(0),
  pajak_nominal: z.number().min(0).default(0),
  total: z.number().min(0).default(0),
  metode_pengembalian: z.nativeEnum(MetodePengembalian).default(MetodePengembalian.TUNAI),
  status: z.nativeEnum(StatusRetur).default(StatusRetur.DRAFT),
  catatan: z.string().optional(),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const CreateReturPenjualanSchema = ReturPenjualanSchema.omit({
  id: true,
  nomor_retur: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const CreateReturPembelianSchema = ReturPembelianSchema.omit({
  id: true,
  nomor_retur: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const UpdateReturSchema = z.object({
  alasan_retur: z.string().optional(),
  metode_pengembalian: z.nativeEnum(MetodePengembalian).optional(),
  status: z.nativeEnum(StatusRetur).optional(),
  catatan: z.string().optional()
});

export const SearchReturQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  status: z.nativeEnum(StatusRetur).optional(),
  metode_pengembalian: z.nativeEnum(MetodePengembalian).optional(),
  tanggal_dari: z.string().optional(),
  tanggal_sampai: z.string().optional(),
  toko_id: z.string().uuid().optional(),
  type: z.enum(['penjualan', 'pembelian']).optional()
});

export type ReturPenjualan = z.infer<typeof ReturPenjualanSchema>;
export type ReturPembelian = z.infer<typeof ReturPembelianSchema>;
export type CreateReturPenjualan = z.infer<typeof CreateReturPenjualanSchema>;
export type CreateReturPembelian = z.infer<typeof CreateReturPembelianSchema>;
export type UpdateRetur = z.infer<typeof UpdateReturSchema>;
export type SearchReturQuery = z.infer<typeof SearchReturQuerySchema>;