import type { PaymentMethod } from '@/features/laporan/penjualan/types'

export interface RefundLine {
  productId: number
  productName: string
  sku?: string
  qty: number
  unit: string
  price: number
  reason: string
  total: number
}

export interface RefundTransaction {
  id: number
  code: string
  originalTransactionCode: string
  originalTransactionId: number
  date: string // yyyy-mm-dd
  time?: string // HH:mm
  cashier: string
  customer?: string
  paymentMethod: PaymentMethod
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED'
  refundAmount: number
  lines: RefundLine[]
  notes?: string
  processedBy?: string
  processedAt?: string
}

export type RefundFilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED'
export type RangeFilter = 'today' | '7d' | '30d' | 'custom'

export interface RefundFilters {
  status: RefundFilterStatus
  range: RangeFilter
  from?: string
  to?: string
  cashier?: string
  payment?: PaymentMethod | 'ALL'
  query?: string
}

export interface CreateRefundRequest {
  originalTransactionId: number
  lines: Omit<RefundLine, 'total'>[]
  notes?: string
  paymentMethod: PaymentMethod
}

export interface UpdateRefundRequest {
  status?: 'APPROVED' | 'REJECTED' | 'PROCESSED'
  notes?: string
}

export interface RefundStats {
  totalRefunds: number
  pendingRefunds: number
  approvedRefunds: number
  rejectedRefunds: number
  totalRefundAmount: number
  averageRefundAmount: number
}