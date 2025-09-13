export type Tenan = {
  id: string
  nama: string
  email: string
  telepon?: string
  alamat?: string
  status: 'aktif' | 'nonaktif' | 'suspended'
  paket: 'basic' | 'premium' | 'enterprise'
  max_toko: number
  max_pengguna: number
  dibuat_pada?: string
  diperbarui_pada?: string
}

export type CreateTenanDto = {
  nama: string
  email: string
  telepon?: string
  alamat?: string
  status?: 'aktif' | 'nonaktif' | 'suspended'
  paket?: 'basic' | 'premium' | 'enterprise'
  max_toko?: number
  max_pengguna?: number
}

export type UpdateTenanDto = Partial<CreateTenanDto>

