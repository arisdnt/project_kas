export type StockOpnameStatus = 'pending' | 'completed' | 'cancelled'

export interface StockOpnameFilters {
  kategoriId?: number
  brandId?: number
  supplierId?: number
  status?: 'all' | StockOpnameStatus
  tanggal?: string
}

export interface StockOpnameFormData {
  id_produk: number
  stok_fisik: number
  catatan?: string
  tanggal_opname?: string
}