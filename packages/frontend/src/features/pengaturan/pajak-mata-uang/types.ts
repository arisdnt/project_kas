export interface PajakSetting {
  id: number
  nama: string
  persentase: number
  deskripsi?: string
  aktif: boolean
  default: boolean
  created_at: string
  updated_at: string
}

export interface MatauangSetting {
  id: number
  kode: string
  nama: string
  simbol: string
  format_tampilan: 'before' | 'after' // Simbol sebelum atau setelah angka
  pemisah_desimal: string
  pemisah_ribuan: string
  jumlah_desimal: number
  aktif: boolean
  default: boolean
  created_at: string
  updated_at: string
}

export interface CreatePajakRequest {
  nama: string
  persentase: number
  deskripsi?: string
  aktif?: boolean
  default?: boolean
}

export interface CreateMatauangRequest {
  kode: string
  nama: string
  simbol: string
  format_tampilan: 'before' | 'after'
  pemisah_desimal: string
  pemisah_ribuan: string
  jumlah_desimal: number
  aktif?: boolean
  default?: boolean
}

export interface UpdatePajakRequest extends Partial<CreatePajakRequest> {}
export interface UpdateMatauangRequest extends Partial<CreateMatauangRequest> {}

export interface PajakMatauangStats {
  total_pajak: number
  pajak_aktif: number
  total_mata_uang: number
  mata_uang_aktif: number
}

export type PajakMatauangFilterType = 'ALL' | 'PAJAK' | 'MATA_UANG'
export type PajakMatauangFilterStatus = 'ALL' | 'AKTIF' | 'NONAKTIF'

export interface PajakMatauangFilters {
  type: PajakMatauangFilterType
  status: PajakMatauangFilterStatus
  query?: string
}