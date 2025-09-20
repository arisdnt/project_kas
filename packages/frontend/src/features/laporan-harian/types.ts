export interface LaporanHarian {
  id: number
  tanggal: string
  total_transaksi: number
  total_penjualan: number
  total_profit: number
  total_pelanggan: number
  produk_terlaris: string
  jam_tersibuk: string
  metode_pembayaran_populer: string
  rata_rata_transaksi: number
  total_diskon: number
  total_pajak: number
  total_retur: number
  stok_rendah: number
  created_at: string
  updated_at: string
}

export interface CreateLaporanHarianRequest {
  tanggal: string
  catatan?: string
}

export interface LaporanHarianStats {
  total_laporan: number
  rata_rata_penjualan: number
  pertumbuhan_hari_ini: number
  transaksi_hari_ini: number
}

export type LaporanHarianFilterStatus = 'ALL' | 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'THIS_MONTH'
export type RangeFilter = 'today' | '7d' | '30d' | 'custom'

export interface LaporanHarianFilters {
  status: LaporanHarianFilterStatus
  range: RangeFilter
  from?: string
  to?: string
  query?: string
}