export type UIKategori = {
  id: string
  tenant_id: string
  toko_id: string
  nama: string
  deskripsi?: string
  icon_url?: string
  urutan: number
  status: 'aktif' | 'nonaktif'
  dibuat_pada: string
  diperbarui_pada: string
  jumlah_produk: number
}

export type CreateKategoriRequest = {
  nama: string
  deskripsi?: string
  icon_url?: string
  urutan?: number
}

export type UpdateKategoriRequest = {
  nama?: string
  deskripsi?: string
  icon_url?: string
  urutan?: number
  status?: 'aktif' | 'nonaktif'
}

export type ProductByCategory = {
  id: string
  kode: string
  barcode?: string
  nama: string
  deskripsi?: string
  satuan: string
  harga_beli: number
  harga_jual: number
  margin_persen: number
  stok_minimum: number
  berat: number
  dimensi?: string
  gambar_url?: string
  is_aktif: boolean
  is_dijual_online: boolean
  pajak_persen: number
  dibuat_pada: string
  diperbarui_pada: string
  kategori_nama: string
  brand_nama: string
  supplier_nama: string
  total_stok: number
}

export type ProductsByCategoryResponse = {
  data: ProductByCategory[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

