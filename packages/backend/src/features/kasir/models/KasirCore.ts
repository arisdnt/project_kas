/**
 * Kasir Models - Core Types dan Interfaces untuk POS System
 * Mendukung multi-tenant, real-time, dan operasi kasir modern
 */

import { z } from 'zod';

/**
 * Enum untuk status transaksi POS
 */
export enum StatusTransaksi {
  DRAFT = 'draft',
  SELESAI = 'selesai',
  BATAL = 'batal',
  PENDING = 'pending'
}

/**
 * Enum untuk metode pembayaran
 */
export enum MetodeBayar {
  TUNAI = 'tunai',
  TRANSFER = 'transfer',
  KARTU = 'kartu',
  KREDIT = 'kredit',
  POIN = 'poin'
}

/**
 * Interface untuk item dalam keranjang POS
 */
export interface KasirCartItem {
  produk_id: string;
  nama_produk: string;
  kode_produk: string;
  barcode?: string;
  harga_satuan: number;
  kuantitas: number;
  subtotal: number;
  diskon_persen?: number;
  diskon_nominal?: number;
  promo_id?: string;
  catatan?: string;
  // Data inventaris untuk validasi stok
  stok_tersedia: number;
  stok_reserved: number;
}

/**
 * Interface untuk session kasir aktif
 */
export interface KasirSession {
  id: string;
  user_id: string;
  toko_id: string;
  tenant_id: string;
  cart_items: KasirCartItem[];
  total_items: number;
  subtotal: number;
  diskon_persen: number;
  diskon_nominal: number;
  pajak_persen: number;
  pajak_nominal: number;
  total_akhir: number;
  pelanggan_id?: string;
  metode_bayar: MetodeBayar;
  jumlah_bayar: number;
  kembalian: number;
  catatan?: string;
  dibuat_pada: Date;
  diperbarui_pada: Date;
}

/**
 * Interface untuk transaksi penjualan yang akan disimpan
 */
export interface TransaksiPenjualanData {
  id?: string;
  tenant_id: string;
  toko_id: string;
  pengguna_id: string;
  pelanggan_id?: string;
  nomor_transaksi: string;
  tanggal: Date;
  subtotal: number;
  diskon_persen: number;
  diskon_nominal: number;
  pajak_persen: number;
  pajak_nominal: number;
  total: number;
  bayar: number;
  kembalian: number;
  metode_bayar: MetodeBayar;
  status: StatusTransaksi;
  catatan?: string;
  items: ItemTransaksiPenjualanData[];
}

/**
 * Interface untuk item transaksi penjualan
 */
export interface ItemTransaksiPenjualanData {
  id?: string;
  produk_id: string;
  kuantitas: number;
  harga_satuan: number;
  diskon_persen: number;
  diskon_nominal: number;
  subtotal: number;
  promo_id?: string;
  catatan?: string;
}

/**
 * Interface untuk data produk dalam konteks kasir
 */
export interface ProdukKasir {
  id: string;
  tenant_id: string;
  toko_id: string;
  kategori_id: string;
  kategori_nama: string;
  brand_id: string;
  brand_nama: string;
  kode: string;
  barcode?: string;
  nama: string;
  deskripsi?: string;
  satuan: string;
  harga_jual: number;
  pajak_persen: number;
  gambar_url?: string;
  is_aktif: boolean;
  // Data inventaris real-time
  stok_tersedia: number;
  stok_reserved: number;
  stok_minimum: number;
  harga_jual_toko?: number;
  lokasi_rak?: string;
}

/**
 * Interface untuk pencarian produk
 */
export interface SearchProdukParams {
  query?: string;
  kategori_id?: string;
  brand_id?: string;
  barcode?: string;
  stok_minimum?: boolean;
  aktif_only?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Interface untuk response pencarian produk
 */
export interface SearchProdukResponse {
  products: ProdukKasir[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

/**
 * Interface untuk data pelanggan dalam konteks kasir
 */
export interface PelangganKasir {
  id: string;
  kode: string;
  nama: string;
  email?: string;
  telepon?: string;
  tipe: 'reguler' | 'member' | 'vip';
  diskon_persen: number;
  limit_kredit: number;
  saldo_poin: number;
  status: 'aktif' | 'nonaktif' | 'blacklist';
}

/**
 * Interface untuk summary penjualan kasir
 */
export interface SummaryKasir {
  tanggal: string;
  total_transaksi: number;
  total_item_terjual: number;
  total_pendapatan: number;
  total_tunai: number;
  total_non_tunai: number;
  rata_rata_transaksi: number;
  transaksi_per_jam: { jam: string; count: number; total: number }[];
}

/**
 * Schema validasi untuk menambah item ke cart
 */
export const AddCartItemSchema = z.object({
  produk_id: z.string().uuid('ID produk harus berformat UUID yang valid'),
  kuantitas: z.number().int().min(1, 'Kuantitas minimal 1').max(1000, 'Kuantitas maksimal 1000'),
  harga_satuan: z.number().min(0, 'Harga satuan tidak boleh negatif').optional(),
  diskon_persen: z.number().min(0).max(100).optional(),
  diskon_nominal: z.number().min(0).optional(),
  catatan: z.string().max(255).optional()
});

/**
 * Schema validasi untuk update item cart
 */
export const UpdateCartItemSchema = z.object({
  kuantitas: z.number().int().min(0, 'Kuantitas tidak boleh negatif').max(1000, 'Kuantitas maksimal 1000'),
  diskon_persen: z.number().min(0).max(100).optional(),
  diskon_nominal: z.number().min(0).optional(),
  catatan: z.string().max(255).optional()
});

/**
 * Schema validasi untuk set pelanggan
 */
export const SetPelangganSchema = z.object({
  pelanggan_id: z.string().uuid('ID pelanggan harus berformat UUID yang valid').optional(),
  kode_pelanggan: z.string().optional(),
});

/**
 * Schema validasi untuk set diskon transaksi
 */
export const SetDiskonSchema = z.object({
  diskon_persen: z.number().min(0).max(100).optional(),
  diskon_nominal: z.number().min(0).optional(),
  catatan: z.string().max(255).optional()
});

/**
 * Schema validasi untuk pembayaran transaksi
 */
export const PembayaranSchema = z.object({
  metode_bayar: z.enum(['tunai', 'transfer', 'kartu', 'kredit', 'poin']),
  jumlah_bayar: z.number().min(0, 'Jumlah bayar tidak boleh negatif'),
  cart_items: z.array(z.object({
    produk_id: z.string().uuid('ID produk harus berformat UUID yang valid'),
    kuantitas: z.number().int().min(1, 'Kuantitas minimal 1'),
    harga_satuan: z.number().min(0, 'Harga satuan tidak boleh negatif'),
    diskon_persen: z.number().min(0).max(100).optional(),
    diskon_nominal: z.number().min(0).optional()
  })).min(1, 'Cart items tidak boleh kosong'),
  pelanggan_id: z.string().uuid().optional(),
  diskon_persen: z.number().min(0).max(100).optional(),
  diskon_nominal: z.number().min(0).optional(),
  catatan: z.string().max(500).optional()
});

/**
 * Schema validasi untuk pencarian produk
 */
export const SearchProdukSchema = z.object({
  q: z.string().min(1, 'Query pencarian minimal 1 karakter').optional(),
  query: z.string().min(1, 'Query pencarian minimal 1 karakter').optional(),
  kategori_id: z.string().uuid().optional(),
  brand_id: z.string().uuid().optional(),
  barcode: z.string().optional(),
  stok_minimum: z.string().transform(val => val === 'true').optional(),
  aktif_only: z.string().transform(val => val !== 'false').default('true'),
  limit: z.string().transform(val => parseInt(val) || 20).pipe(z.number().int().min(1).max(100)).default('20'),
  offset: z.string().transform(val => parseInt(val) || 0).pipe(z.number().int().min(0)).default('0')
});

/**
 * Schema validasi untuk scan barcode
 */
export const ScanBarcodeSchema = z.object({
  barcode: z.string().min(1, 'Barcode tidak boleh kosong'),
  kuantitas: z.number().int().min(1).max(1000).default(1)
});

export type AddCartItemRequest = z.infer<typeof AddCartItemSchema>;
export type UpdateCartItemRequest = z.infer<typeof UpdateCartItemSchema>;
export type SetPelangganRequest = z.infer<typeof SetPelangganSchema>;
export type SetDiskonRequest = z.infer<typeof SetDiskonSchema>;
export type PembayaranRequest = z.infer<typeof PembayaranSchema>;
export type SearchProdukRequest = z.infer<typeof SearchProdukSchema>;
export type ScanBarcodeRequest = z.infer<typeof ScanBarcodeSchema>;

/**
 * Interface untuk response API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Interface untuk real-time events
 */
export interface KasirSocketEvents {
  // Cart events
  'cart:item_added': { session_id: string; item: KasirCartItem };
  'cart:item_updated': { session_id: string; produk_id: string; item: Partial<KasirCartItem> };
  'cart:item_removed': { session_id: string; produk_id: string };
  'cart:cleared': { session_id: string };

  // Transaction events
  'transaction:started': { session_id: string; nomor_transaksi: string };
  'transaction:completed': { session_id: string; transaksi: TransaksiPenjualanData };
  'transaction:cancelled': { session_id: string; reason: string };

  // Inventory events
  'inventory:stock_updated': { produk_id: string; stok_tersedia: number; stok_reserved: number };
  'inventory:low_stock_alert': { produk_id: string; nama_produk: string; stok_tersedia: number; stok_minimum: number };

  // System events
  'kasir:session_expired': { session_id: string };
  'kasir:offline_mode': { enabled: boolean };
}