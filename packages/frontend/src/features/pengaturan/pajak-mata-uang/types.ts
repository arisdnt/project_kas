export interface PajakSetting {
  id: string
  tenant_id: string
  toko_id: string
  nama: string
  persentase: number
  deskripsi?: string
  aktif: boolean
  is_default: boolean
  dibuat_pada: string
  diperbarui_pada: string
  dibuat_oleh?: string
  diperbarui_oleh?: string
}

export interface MatauangSetting {
  id: string
  tenant_id: string
  toko_id: string
  kode: string
  nama: string
  simbol: string
  format_tampilan: 'before' | 'after' // Simbol sebelum atau setelah angka
  pemisah_desimal: string
  pemisah_ribuan: string
  jumlah_desimal: number
  aktif: boolean
  is_default: boolean
  dibuat_pada: string
  diperbarui_pada: string
  dibuat_oleh?: string
  diperbarui_oleh?: string
}

export interface CreatePajakRequest {
  nama: string
  persentase: number
  deskripsi?: string
  aktif?: boolean
  is_default?: boolean
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
  is_default?: boolean
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