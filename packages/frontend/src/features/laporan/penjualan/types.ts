export type PaymentMethod = 'CASH' | 'QRIS' | 'DEBIT' | 'TRANSFER'
export type SaleStatus = 'PAID' | 'VOID' | 'REFUND'

export interface SaleRecord {
  id: number
  code: string
  date: string // ISO date string
  cashier: string
  customer?: string
  total: number
  discount: number
  tax: number
  payment: PaymentMethod
  status: SaleStatus
}

export interface Filters {
  range: 'today' | '7d' | '30d' | 'custom'
  from?: string // yyyy-mm-dd
  to?: string // yyyy-mm-dd
  cashier?: string
  payment?: PaymentMethod | 'ALL'
  query?: string
}

export interface Aggregates {
  omzet: number
  transaksi: number
  rataRata: number
  diskon: number
}

