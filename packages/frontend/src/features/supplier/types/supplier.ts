export type UISupplier = {
  id: string
  nama: string
  kontak_person?: string
  email?: string
  telepon?: string
  alamat?: string
  npwp?: string
  bank_nama?: string
  bank_rekening?: string
  bank_atas_nama?: string
  status?: 'aktif' | 'nonaktif' | 'blacklist'
  dibuat_pada?: string
  diperbarui_pada?: string
}

export type SupplierStats = {
  supplier_id: string
  total_purchases: number
  total_amount: number
  total_products_supplied: number
  average_order_value: number
  last_purchase_date?: string
  outstanding_balance: number
  payment_performance: 'excellent' | 'good' | 'fair' | 'poor'
}

export type SupplierPurchaseHistory = {
  purchase_id: string
  nomor_pembelian: string
  tanggal: string
  total: number
  status: string
  items_count: number
  payment_status?: string
  due_date?: string
}

export type SupplierProduct = {
  product_id: string
  product_name: string
  product_code: string
  category_name?: string
  last_purchase_price: number
  last_purchase_date?: string
  total_purchased: number
}

