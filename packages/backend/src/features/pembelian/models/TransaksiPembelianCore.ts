/**
 * Purchase Transaction Core Model
 * Based on database schema with multi-tenant, multi-role, multi-store support
 */

import { z } from 'zod';

export enum StatusPembelian {
  DRAFT = 'draft',
  PENDING = 'pending',
  RECEIVED = 'received',
  CANCELLED = 'cancelled'
}

export enum StatusPembayaran {
  BELUM_BAYAR = 'belum_bayar',
  SEBAGIAN_BAYAR = 'sebagian_bayar',
  LUNAS = 'lunas'
}

export const TransaksiPembelianSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid(),
  pengguna_id: z.string().uuid(),
  supplier_id: z.string().uuid(),
  nomor_transaksi: z.string().min(1).max(50),
  nomor_po: z.string().max(50).optional(),
  tanggal: z.date(),
  jatuh_tempo: z.date().optional(),
  subtotal: z.number().min(0).default(0),
  diskon_persen: z.number().min(0).max(100).default(0),
  diskon_nominal: z.number().min(0).default(0),
  pajak_persen: z.number().min(0).max(100).default(0),
  pajak_nominal: z.number().min(0).default(0),
  total: z.number().min(0).default(0),
  status: z.nativeEnum(StatusPembelian).default(StatusPembelian.DRAFT),
  status_pembayaran: z.nativeEnum(StatusPembayaran).default(StatusPembayaran.BELUM_BAYAR),
  catatan: z.string().optional(),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const CreateTransaksiPembelianSchema = TransaksiPembelianSchema.omit({
  id: true,
  nomor_transaksi: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const UpdateTransaksiPembelianSchema = CreateTransaksiPembelianSchema.partial().omit({
  tenant_id: true
});

export const SearchPembelianQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  supplier_id: z.string().uuid().optional(),
  status: z.nativeEnum(StatusPembelian).optional(),
  status_pembayaran: z.nativeEnum(StatusPembayaran).optional(),
  tanggal_dari: z.string().optional(),
  tanggal_sampai: z.string().optional(),
  toko_id: z.string().uuid().optional()
});

export type TransaksiPembelian = z.infer<typeof TransaksiPembelianSchema>;
export type CreateTransaksiPembelian = z.infer<typeof CreateTransaksiPembelianSchema>;
export type UpdateTransaksiPembelian = z.infer<typeof UpdateTransaksiPembelianSchema>;
export type SearchPembelianQuery = z.infer<typeof SearchPembelianQuerySchema>;