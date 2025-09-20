import { SaleTransaction } from '@/features/penjualan/types'

export type SalesSortableColumn =
  | 'code'
  | 'date'
  | 'cashier'
  | 'product'
  | 'qty'
  | 'price'
  | 'discount'
  | 'tax'
  | 'total'
  | 'payment'
  | 'status'

export type SalesSortState = {
  column: SalesSortableColumn
  direction: 'asc' | 'desc'
}

export const SALES_COLUMN_CLASS = {
  code: 'w-[10%] min-w-[120px] pr-3',
  date: 'w-[10%] min-w-[120px]',
  time: 'w-[8%] min-w-[90px]',
  cashier: 'w-[10%] min-w-[140px]',
  product: 'w-[20%] min-w-[200px] pr-3',
  sku: 'w-[10%] min-w-[120px]',
  qty: 'w-[6%] min-w-[80px]',
  price: 'w-[9%] min-w-[110px]',
  discount: 'w-[8%] min-w-[110px]',
  tax: 'w-[8%] min-w-[110px]',
  total: 'w-[10%] min-w-[140px]',
  payment: 'w-[7%] min-w-[100px]',
  status: 'w-[7%] min-w-[110px]',
  action: 'w-[6%] min-w-[90px] pr-0 text-right',
} as const

export const SALES_ROW_HEIGHT_PX = 44

export type FlattenedSaleLine = {
  key: string
  trxId: number
  code: string
  date: string
  time?: string
  cashier: string
  payment: string
  status: string
  product: string
  sku?: string
  qty: number
  unit: string
  price: number
  discount: number
  tax: number
  total: number
}

export function flattenTransactions(transactions: SaleTransaction[]): FlattenedSaleLine[] {
  return transactions.flatMap((tx) =>
    tx.lines.map((line, index) => ({
      key: `${tx.id}-${index}`,
      trxId: tx.id,
      code: tx.code,
      date: tx.date,
      time: tx.time,
      cashier: tx.cashier,
      payment: tx.payment,
      status: tx.status,
      product: line.productName,
      sku: line.sku,
      qty: line.qty,
      unit: line.unit,
      price: line.price,
      discount: line.discount,
      tax: line.tax,
      total: line.total,
    })),
  )
}

export function getSortedSalesItems(items: FlattenedSaleLine[], sortState: SalesSortState | null): FlattenedSaleLine[] {
  if (!sortState) return items
  const sorted = [...items]
  const direction = sortState.direction === 'asc' ? 1 : -1

  sorted.sort((a, b) => {
    const valueA = getSortableValue(a, sortState.column)
    const valueB = getSortableValue(b, sortState.column)

    if (valueA < valueB) return -1 * direction
    if (valueA > valueB) return 1 * direction
    return 0
  })

  return sorted
}

function getSortableValue(item: FlattenedSaleLine, column: SalesSortableColumn): string | number {
  switch (column) {
    case 'code':
      return item.code.toLowerCase()
    case 'date':
      return `${item.date} ${item.time ?? ''}`
    case 'cashier':
      return item.cashier.toLowerCase()
    case 'product':
      return item.product.toLowerCase()
    case 'qty':
      return item.qty
    case 'price':
      return item.price
    case 'discount':
      return item.discount
    case 'tax':
      return item.tax
    case 'total':
      return item.total
    case 'payment':
      return item.payment.toLowerCase()
    case 'status':
      return item.status.toLowerCase()
    default:
      return 0
  }
}

export function resolveStatusTone(status: string) {
  switch (status) {
    case 'PAID':
      return 'rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[12px] font-semibold text-emerald-600'
    case 'VOID':
      return 'rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[12px] font-semibold text-slate-600'
    case 'REFUND':
      return 'rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[12px] font-semibold text-amber-600'
    default:
      return 'rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[12px] font-semibold text-slate-600'
  }
}

export function resolvePaymentTone(payment: string) {
  switch (payment) {
    case 'CASH':
      return 'rounded bg-slate-100 px-2 py-0.5 text-[12px] font-medium text-slate-700'
    case 'QRIS':
      return 'rounded bg-purple-100 px-2 py-0.5 text-[12px] font-medium text-purple-700'
    case 'DEBIT':
      return 'rounded bg-blue-100 px-2 py-0.5 text-[12px] font-medium text-blue-700'
    case 'TRANSFER':
      return 'rounded bg-indigo-100 px-2 py-0.5 text-[12px] font-medium text-indigo-700'
    default:
      return 'rounded bg-slate-100 px-2 py-0.5 text-[12px] font-medium text-slate-700'
  }
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

export type SalesFilters = FiltersExtended

export type FiltersExtended = {
  range: 'today' | '7d' | '30d' | 'custom'
  from?: string
  to?: string
  cashier?: string
  payment?: string
  status?: 'ALL' | 'PAID' | 'VOID' | 'REFUND'
  query?: string
}

export function getTotals(transactions: SaleTransaction[]) {
  const totals = transactions.reduce(
    (acc, tx) => {
      const txTotal = tx.lines.reduce((sum, line) => sum + line.total, 0)
      acc.transactions += 1
      acc.lines += tx.lines.length
      acc.amount += txTotal
      return acc
    },
    { transactions: 0, lines: 0, amount: 0 },
  )

  return totals
}
