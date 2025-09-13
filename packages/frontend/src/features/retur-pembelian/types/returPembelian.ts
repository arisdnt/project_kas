export interface ReturPembelianItem {
  id: number
  id_pembelian: number
  id_produk: number
  jumlah: number
  harga_beli: number
  total: number
  alasan: string
  status: 'pending' | 'disetujui' | 'ditolak' | 'selesai'
  created_at: string
  updated_at: string
  
  // Relasi
  produk?: {
    id: number
    nama: string
    sku: string
    url_gambar?: string
  }
  pembelian?: {
    id: number
    nomor_faktur: string
    tanggal: string
    supplier: {
      id: number
      nama: string
    }
  }
}

export interface ReturPembelianFormData {
  id_pembelian: number
  id_produk: number
  jumlah: number
  alasan: string
}

export interface ReturPembelianFilter {
  status?: 'pending' | 'disetujui' | 'ditolak' | 'selesai'
  id_supplier?: number
  date_from?: string
  date_to?: string
  search?: string
}

export interface ReturPembelianSummary {
  total_pending: number
  total_disetujui: number
  total_ditolak: number
  total_selesai: number
  total_nilai: number
}

export type ReturPembelianSortBy = 'created_at' | 'updated_at' | 'total' | 'status'
export type SortDirection = 'asc' | 'desc'