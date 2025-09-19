export type Toko = {
  id: string
  tenant_id: string
  nama: string
  kode: string
  alamat?: string
  telepon?: string
  email?: string
  status: 'aktif' | 'nonaktif' | 'tutup_sementara'
  timezone: string
  mata_uang: string
  logo_url?: string
  dibuat_pada?: string
  diperbarui_pada?: string
}

export type CreateTokoDto = {
  tenant_id: string
  nama: string
  kode: string
  alamat?: string
  telepon?: string
  email?: string
  status?: 'aktif' | 'nonaktif' | 'tutup_sementara'
  timezone?: string
  mata_uang?: string
  logo_url?: string
}

export type UpdateTokoDto = Partial<Omit<CreateTokoDto, 'tenant_id'>>

export type TokoConfig = {
  id: string
  toko_id: string
  key: string
  value: string
  tipe: 'string' | 'number' | 'boolean' | 'json'
  deskripsi?: string
  is_public: boolean
  dibuat_pada?: string
  diperbarui_pada?: string
}

export type CreateTokoConfigDto = {
  toko_id: string
  key: string
  value: string
  tipe?: 'string' | 'number' | 'boolean' | 'json'
  deskripsi?: string
  is_public?: boolean
}

export type UpdateTokoConfigDto = {
  value: string
  deskripsi?: string
}

export type TokoOperatingHours = {
  id: string
  toko_id: string
  hari: 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' | 'minggu'
  jam_buka: string
  jam_tutup: string
  is_buka: boolean
  catatan?: string
  dibuat_pada?: string
  diperbarui_pada?: string
}

export type BulkUpdateOperatingHoursDto = {
  operating_hours: Array<{
    hari: 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' | 'minggu'
    jam_buka: string
    jam_tutup: string
    is_buka: boolean
    catatan?: string
  }>
}

export type TokoStats = {
  toko_id: string
  total_products: number
  total_transactions_today: number
  total_sales_today: number
  total_customers: number
  low_stock_items: number
  active_users: number
}

// For the store settings page
export type TokoFormData = {
  nama: string
  kode: string
  alamat: string
  telepon: string
  email: string
  status: 'aktif' | 'nonaktif' | 'tutup_sementara'
  timezone: string
  mata_uang: string
  logo_url: string
}