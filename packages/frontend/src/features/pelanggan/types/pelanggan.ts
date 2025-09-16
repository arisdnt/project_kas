export type UIPelanggan = {
  id: string
  kode: string
  nama: string
  email?: string
  telepon?: string
  alamat?: string
  tanggal_lahir?: string
  jenis_kelamin?: 'pria' | 'wanita'
  pekerjaan?: string
  tipe: 'reguler' | 'vip' | 'member' | 'wholesale'
  diskon_persen: number
  limit_kredit: number
  saldo_poin: number
  status: 'aktif' | 'nonaktif' | 'blacklist'
  dibuat_pada?: string
  diperbarui_pada?: string
}

export type PelangganStats = {
  pelanggan_id: string
  total_transactions: number
  total_spent: number
  total_points_earned: number
  total_points_used: number
  average_order_value: number
  last_transaction_date?: string
  favorite_products?: {
    product_id: string
    product_name: string
    purchase_count: number
  }[]
}

export type PelangganTransactionHistory = {
  transaction_id: string
  nomor_transaksi: string
  tanggal: string
  total: number
  status: string
  items_count: number
  points_earned: number
  points_used: number
}

export type PelangganPoinLog = {
  id: string
  pelanggan_id: string
  transaksi_id?: string
  tipe: 'earned' | 'used' | 'expired' | 'adjustment'
  jumlah: number
  saldo_sebelum: number
  saldo_sesudah: number
  keterangan: string
  expired_at?: string
  created_at: string
}

export type PelangganSegmentation = {
  segment: string
  criteria: string
  customer_count: number
  total_value: number
  avg_order_value: number
}

export type PelangganLoyaltyReport = {
  pelanggan_id: string
  nama: string
  tipe: string
  total_spent: number
  total_transactions: number
  points_balance: number
  last_visit?: string
  loyalty_score: number
  segment: string
}