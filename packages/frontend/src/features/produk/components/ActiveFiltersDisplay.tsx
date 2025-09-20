import { Button } from '@/core/components/ui/button'
import { formatCurrency } from '@/features/produk/utils/tableUtils'
import { Range, DateRange } from './RangeFilter'

type Filters = {
  kategori?: string[]
  brand?: string[]
  supplier?: string[]
  status?: ('aktif' | 'tidak aktif')[]
  stok?: Range
  harga?: Range
  diperbarui?: DateRange
}

type ActiveFiltersDisplayProps = {
  filters: Filters
  onReset: () => void
}

export function ActiveFiltersDisplay({ filters, onReset }: ActiveFiltersDisplayProps) {
  const activeFilters: string[] = []

  if (filters.kategori?.length) activeFilters.push(`Kategori: ${filters.kategori.join(', ')}`)
  if (filters.brand?.length) activeFilters.push(`Brand: ${filters.brand.join(', ')}`)
  if (filters.supplier?.length) activeFilters.push(`Supplier: ${filters.supplier.join(', ')}`)
  if (filters.status?.length) activeFilters.push(`Status: ${filters.status.join(', ')}`)

  if (filters.stok && (filters.stok.min != null || filters.stok.max != null)) {
    activeFilters.push(
      `Stok: ${filters.stok.min != null ? filters.stok.min : '0'}–${
        filters.stok.max != null ? filters.stok.max : '∞'
      }`
    )
  }

  if (filters.harga && (filters.harga.min != null || filters.harga.max != null)) {
    activeFilters.push(
      `Harga: ${filters.harga.min != null ? formatCurrency(filters.harga.min) : '0'}–${
        filters.harga.max != null ? formatCurrency(filters.harga.max) : '∞'
      }`
    )
  }

  if (filters.diperbarui && (filters.diperbarui.from || filters.diperbarui.to)) {
    activeFilters.push(
      `Tanggal: ${filters.diperbarui.from || 'awal'} → ${filters.diperbarui.to || 'sekarang'}`
    )
  }

  if (activeFilters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 pb-3 text-[11px]">
      {activeFilters.map((label) => (
        <span
          key={label}
          className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 font-medium text-blue-600"
        >
          {label}
        </span>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 whitespace-nowrap px-2 text-slate-500"
        onClick={onReset}
      >
        Bersihkan filter
      </Button>
    </div>
  )
}