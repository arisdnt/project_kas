/**
 * Sales Transaction Core Model
 * Based on database schema with multi-tenant, multi-role, multi-store support
 */

import { z } from 'zod';

export enum StatusTransaksi {
  DRAFT = 'draft',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum MetodeBayar {
  TUNAI = 'tunai',
  KARTU_DEBIT = 'kartu_debit',
  KARTU_KREDIT = 'kartu_kredit',
  TRANSFER = 'transfer',
  E_WALLET = 'e_wallet'
}

export const TransaksiPenjualanSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid(),
  pengguna_id: z.string().uuid(),
  pelanggan_id: z.string().uuid().optional(),
  nomor_transaksi: z.string().min(1).max(50),
  tanggal: z.date(),
  subtotal: z.number().min(0).default(0),
  diskon_persen: z.number().min(0).max(100).default(0),
  diskon_nominal: z.number().min(0).default(0),
  pajak_persen: z.number().min(0).max(100).default(0),
  pajak_nominal: z.number().min(0).default(0),
  total: z.number().min(0).default(0),
  bayar: z.number().min(0).default(0),
  kembalian: z.number().min(0).default(0),
  metode_bayar: z.nativeEnum(MetodeBayar).default(MetodeBayar.TUNAI),
  status: z.nativeEnum(StatusTransaksi).default(StatusTransaksi.DRAFT),
  catatan: z.string().optional(),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const CreateTransaksiPenjualanSchema = TransaksiPenjualanSchema.omit({
  id: true,
  nomor_transaksi: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const UpdateTransaksiPenjualanSchema = CreateTransaksiPenjualanSchema.partial().omit({
  tenant_id: true
});

export const SearchTransaksiQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  pelanggan_id: z.string().uuid().optional(),
  status: z.nativeEnum(StatusTransaksi).optional(),
  metode_bayar: z.nativeEnum(MetodeBayar).optional(),
  tanggal_dari: z.string().optional(),
  tanggal_sampai: z.string().optional(),
  toko_id: z.string().uuid().optional()
});

export type TransaksiPenjualan = z.infer<typeof TransaksiPenjualanSchema>;
export type CreateTransaksiPenjualan = z.infer<typeof CreateTransaksiPenjualanSchema>;
export type UpdateTransaksiPenjualan = z.infer<typeof UpdateTransaksiPenjualanSchema>;
export type SearchTransaksiQuery = z.infer<typeof SearchTransaksiQuerySchema>;