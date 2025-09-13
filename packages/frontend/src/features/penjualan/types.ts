import type { PaymentMethod } from '@/features/laporan/penjualan/types'

export interface SaleLine {
  productId: number
  productName: string
  sku?: string
  qty: number
  unit: string
  price: number
  discount: number
  tax: number
  total: number
}

export interface SaleTransaction {
  id: number
  code: string
  date: string // yyyy-mm-dd
  time?: string // HH:mm
  cashier: string
  customer?: string
  payment: PaymentMethod
  status: 'PAID' | 'VOID' | 'REFUND'
  lines: SaleLine[]
}

export type RangeFilter = 'today' | '7d' | '30d' | 'custom'

export interface Filters {
  range: RangeFilter
  from?: string
  to?: string
  cashier?: string
  payment?: PaymentMethod | 'ALL'
  query?: string
}

