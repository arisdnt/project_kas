/**
 * Model Penjualan dan Validasi
 * Mengacu pada tabel: transaksi, item_transaksi, pelanggan
 * Sesuai Blueprint POS Multi-Tenant
 */

import { z } from 'zod'

export const MetodePembayaranEnum = z.enum(['TUNAI', 'KARTU', 'QRIS', 'TRANSFER', 'EWALLET'])

export const ItemTransaksiInputSchema = z.object({
  id_produk: z.number().int().positive(),
  jumlah: z.number().int().positive(),
  harga: z.number().positive(), // harga saat jual (client) - akan divalidasi/diterima apa adanya untuk arsip
})

export const CreateTransaksiSchema = z.object({
  id_pelanggan: z.number().int().positive().optional(),
  metode_pembayaran: MetodePembayaranEnum,
  bayar: z.number().nonnegative().default(0),
  kembalian: z.number().nonnegative().default(0),
  items: z.array(ItemTransaksiInputSchema).min(1, 'Minimal 1 item'),
})

export type MetodePembayaran = z.infer<typeof MetodePembayaranEnum>
export type ItemTransaksiInput = z.infer<typeof ItemTransaksiInputSchema>
export type CreateTransaksi = z.infer<typeof CreateTransaksiSchema>

export interface Transaksi {
  id: number
  kode_transaksi: string
  id_toko: number
  id_pengguna: number
  id_pelanggan?: number | null
  jumlah_total: number
  metode_pembayaran: MetodePembayaran
  status: 'selesai' | 'dibatalkan' | 'tertunda'
  dibuat_pada: string
}

export interface ItemTransaksi {
  id: number
  id_transaksi: number
  id_produk: number
  jumlah: number
  harga_saat_jual: number
}

export interface TransaksiWithItems extends Transaksi {
  items: Array<{
    id_produk: number
    nama: string
    sku?: string | null
    jumlah: number
    harga_saat_jual: number
    subtotal: number
  }>
  pelanggan?: { id: number; nama?: string | null; telepon?: string | null } | null
}

