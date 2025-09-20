import { UIProduk } from '@/features/produk/store/produkStore'
import { Range, DateRange } from '@/features/produk/components/RangeFilter'

export type SortableColumn =
  | 'nama'
  | 'kategori'
  | 'brand'
  | 'supplier'
  | 'stok'
  | 'hargaBeli'
  | 'harga'
  | 'status'
  | 'updated'

export type SortState = {
  column: SortableColumn
  direction: 'asc' | 'desc'
}

export const COLUMN_CLASS = {
  produk: 'w-[18%] min-w-[160px] pr-3',
  kategori: 'w-[8%] min-w-[80px]',
  brand: 'w-[8%] min-w-[80px]',
  supplier: 'w-[9%] min-w-[100px]',
  satuan: 'w-[6%] min-w-[60px]',
  stok: 'w-[7%] min-w-[70px]',
  hargaBeli: 'w-[10%] min-w-[100px]',
  hargaJual: 'w-[10%] min-w-[100px]',
  status: 'w-[7%] min-w-[80px]',
  updated: 'w-[9%] min-w-[100px]',
  aksi: 'w-[8%] min-w-[90px] pr-0',
} as const

export const ROW_HEIGHT_PX = 30
export const CELL_VERTICAL_PADDING = 5

export function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n)
}

export function formatDate(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function getSortedItems(items: UIProduk[], sortState: SortState | null): UIProduk[] {
  if (!sortState) return items
  const sorted = [...items]
  sorted.sort((a, b) => {
    const direction = sortState.direction === 'asc' ? 1 : -1
    const getValue = (item: UIProduk): string | number => {
      switch (sortState.column) {
        case 'nama':
          return item.nama?.toLowerCase() || ''
        case 'kategori':
          return item.kategori?.nama?.toLowerCase() || ''
        case 'brand':
          return item.brand?.nama?.toLowerCase() || ''
        case 'supplier':
          return item.supplier?.nama?.toLowerCase() || ''
        case 'stok':
          return item.stok ?? -Infinity
        case 'hargaBeli':
          return item.hargaBeli ?? -Infinity
        case 'harga':
          return item.harga ?? -Infinity
        case 'status':
          return item.status === 'aktif' ? 1 : 0
        case 'updated':
          return new Date(item.diperbaruiPada || item.dibuatPada || 0).getTime()
        default:
          return 0
      }
    }
    const valueA = getValue(a)
    const valueB = getValue(b)
    if (valueA < valueB) return -1 * direction
    if (valueA > valueB) return 1 * direction
    return 0
  })
  return sorted
}

type Filters = {
  kategori?: string[]
  brand?: string[]
  supplier?: string[]
  status?: ('aktif' | 'tidak aktif')[]
  stok?: Range
  harga?: Range
  diperbarui?: DateRange
}

export function getFilteredItems(items: UIProduk[], filters: Filters): UIProduk[] {
  return items.filter((item) => {
    if (filters.kategori && filters.kategori.length > 0) {
      if (!filters.kategori.includes(item.kategori?.nama ?? '')) return false
    }
    if (filters.brand && filters.brand.length > 0) {
      if (!filters.brand.includes(item.brand?.nama ?? '')) return false
    }
    if (filters.supplier && filters.supplier.length > 0) {
      if (!filters.supplier.includes(item.supplier?.nama ?? '')) return false
    }
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes((item.status as 'aktif' | 'tidak aktif') ?? 'aktif')) return false
    }
    if (filters.stok) {
      const stok = item.stok ?? 0
      if (filters.stok.min != null && stok < filters.stok.min) return false
      if (filters.stok.max != null && stok > filters.stok.max) return false
    }
    if (filters.harga) {
      const harga = item.harga ?? 0
      if (filters.harga.min != null && harga < filters.harga.min) return false
      if (filters.harga.max != null && harga > filters.harga.max) return false
    }
    if (filters.diperbarui && (filters.diperbarui.from || filters.diperbarui.to)) {
      const updatedAt = item.diperbaruiPada || item.dibuatPada
      if (!updatedAt) return false
      const updated = new Date(updatedAt)
      if (filters.diperbarui.from) {
        const fromDate = new Date(filters.diperbarui.from)
        if (updated < fromDate) return false
      }
      if (filters.diperbarui.to) {
        const toDate = new Date(filters.diperbarui.to)
        if (updated > toDate) return false
      }
    }
    return true
  })
}