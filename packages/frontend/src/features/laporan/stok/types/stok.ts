export interface StokItem {
  id: number
  produkId: number
  namaProduk: string
  sku: string
  kategori: string
  brand: string
  supplier: string
  jumlahStok: number
  nilaiStok: number
  hargaBeli: number
  hargaJual: number
  satuan: string
  lokasi: string
  statusStok: 'tersedia' | 'habis' | 'sedikit' | 'berlebih'
  terakhirDiperbarui: Date
  dipindahPada: Date | null
}

export interface StokSummary {
  totalProduk: number
  totalNilaiStok: number
  produkHabis: number
  produkSedikit: number
  produkBerlebih: number
  kategoriTersering: string[]
  brandTersering: string[]
}

export interface StokFilter {
  kategori: string[]
  brand: string[]
  supplier: string[]
  statusStok: string[]
  lokasi: string[]
  dateRange: {
    start: Date | null
    end: Date | null
  }
  searchQuery: string
}

export interface StokMutasi {
  id: number
  produkId: number
  namaProduk: string
  jenisMutasi: 'masuk' | 'keluar' | 'penyesuaian'
  jumlah: number
  keterangan: string
  tanggal: Date
  pengguna: string
  referensi: string | null
}

export interface StokMovementData {
  produk: StokItem
  mutasi: StokMutasi[]
  trend: {
    tanggal: Date
    stokMasuk: number
    stokKeluar: number
    saldoAkhir: number
  }[]
}

export type SortField = 'namaProduk' | 'jumlahStok' | 'nilaiStok' | 'hargaJual' | 'terakhirDiperbarui'
export type SortDirection = 'asc' | 'desc'

export interface StokReportState {
  data: StokItem[]
  summary: StokSummary
  filters: StokFilter
  loading: boolean
  error: string | null
  sortField: SortField
  sortDirection: SortDirection
}