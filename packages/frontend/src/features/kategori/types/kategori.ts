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

