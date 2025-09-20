import { cn } from '@/core/lib/utils'
import { TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
import { SlidersHorizontal } from 'lucide-react'
import { SortIcon } from './SortIcon'
import { RangeFilter, Range } from './RangeFilter'
import { DateRangeFilter, DateRange } from './DateRangeFilter'
import { COLUMN_CLASS, SortableColumn, SortState } from '@/features/produk/utils/tableUtils'

type Filters = {
  kategori?: string[]
  brand?: string[]
  supplier?: string[]
  status?: ('aktif' | 'tidak aktif')[]
  stok?: Range
  harga?: Range
  diperbarui?: DateRange
}

type ProductTableHeaderProps = {
  sortState: SortState | null
  onToggleSort: (column: SortableColumn) => void
  filters: Filters
  onFiltersChange: (filters: Partial<Filters>) => void
  categoryOptions: string[]
  brandOptions: string[]
  supplierOptions: string[]
  headerElevated: boolean
}

export function ProductTableHeader({
  sortState,
  onToggleSort,
  filters,
  onFiltersChange,
  categoryOptions,
  brandOptions,
  supplierOptions,
  headerElevated,
}: ProductTableHeaderProps) {
  return (
    <TableHeader
      className={cn(
        'sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-sm transition-shadow',
        headerElevated ? 'shadow-[0_6px_16px_-12px_rgba(15,23,42,0.55)]' : 'shadow-none',
      )}
    >
      <TableRow className="border-b border-slate-200">
        <TableHead className={cn(COLUMN_CLASS.produk, 'py-[6px]')}>
          <button
            type="button"
            onClick={() => onToggleSort('nama')}
            className="flex items-center gap-1 text-left font-medium text-slate-500"
            aria-label="Urut berdasarkan nama"
          >
            Produk
            <SortIcon column="nama" sortState={sortState} />
          </button>
        </TableHead>
        <TableHead className={cn(COLUMN_CLASS.kategori, 'py-[6px]')}>
          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => onToggleSort('kategori')}
              className="flex items-center gap-1 font-medium text-slate-500"
              aria-label="Urut berdasarkan kategori"
            >
              Kategori
              <SortIcon column="kategori" sortState={sortState} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Filter kategori"
                  className={cn(
                    'inline-flex h-6 items-center rounded px-1 text-[11px] transition',
                    filters.kategori?.length
                      ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
                      : 'text-slate-400 hover:text-slate-600',
                  )}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Pilih kategori</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {categoryOptions.length > 0 ? (
                  categoryOptions.map((nama) => (
                    <DropdownMenuCheckboxItem
                      key={nama}
                      checked={filters.kategori?.includes(nama) ?? false}
                      onCheckedChange={(checked) => {
                        const next = new Set(filters.kategori ?? [])
                        if (checked) next.add(nama)
                        else next.delete(nama)
                        const arr = Array.from(next)
                        onFiltersChange({ kategori: arr.length > 0 ? arr : undefined })
                      }}
                    >
                      {nama}
                    </DropdownMenuCheckboxItem>
                  ))
                ) : (
                  <DropdownMenuLabel className="text-xs text-slate-400">
                    Tidak ada kategori terdata.
                  </DropdownMenuLabel>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableHead>
        <TableHead className={cn(COLUMN_CLASS.brand, 'py-[6px]')}>
          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => onToggleSort('brand')}
              className="flex items-center gap-1 font-medium text-slate-500"
              aria-label="Urut berdasarkan brand"
            >
              Brand
              <SortIcon column="brand" sortState={sortState} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Filter brand"
                  className={cn(
                    'inline-flex h-6 items-center rounded px-1 text-[11px] transition',
                    filters.brand?.length
                      ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
                      : 'text-slate-400 hover:text-slate-600',
                  )}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Pilih brand</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {brandOptions.length > 0 ? (
                  brandOptions.map((nama) => (
                    <DropdownMenuCheckboxItem
                      key={nama}
                      checked={filters.brand?.includes(nama) ?? false}
                      onCheckedChange={(checked) => {
                        const next = new Set(filters.brand ?? [])
                        if (checked) next.add(nama)
                        else next.delete(nama)
                        const arr = Array.from(next)
                        onFiltersChange({ brand: arr.length > 0 ? arr : undefined })
                      }}
                    >
                      {nama}
                    </DropdownMenuCheckboxItem>
                  ))
                ) : (
                  <DropdownMenuLabel className="text-xs text-slate-400">
                    Tidak ada brand terdata.
                  </DropdownMenuLabel>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableHead>
        <TableHead className={cn(COLUMN_CLASS.supplier, 'py-[6px]')}>
          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => onToggleSort('supplier')}
              className="flex items-center gap-1 font-medium text-slate-500"
              aria-label="Urut berdasarkan supplier"
            >
              Supplier
              <SortIcon column="supplier" sortState={sortState} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Filter supplier"
                  className={cn(
                    'inline-flex h-6 items-center rounded px-1 text-[11px] transition',
                    filters.supplier?.length
                      ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
                      : 'text-slate-400 hover:text-slate-600',
                  )}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Pilih supplier</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {supplierOptions.length > 0 ? (
                  supplierOptions.map((nama) => (
                    <DropdownMenuCheckboxItem
                      key={nama}
                      checked={filters.supplier?.includes(nama) ?? false}
                      onCheckedChange={(checked) => {
                        const next = new Set(filters.supplier ?? [])
                        if (checked) next.add(nama)
                        else next.delete(nama)
                        const arr = Array.from(next)
                        onFiltersChange({ supplier: arr.length > 0 ? arr : undefined })
                      }}
                    >
                      {nama}
                    </DropdownMenuCheckboxItem>
                  ))
                ) : (
                  <DropdownMenuLabel className="text-xs text-slate-400">
                    Tidak ada supplier terdata.
                  </DropdownMenuLabel>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableHead>
        <TableHead className={cn(COLUMN_CLASS.satuan, 'py-[6px] font-medium text-slate-500')}>
          Satuan
        </TableHead>
        <TableHead className={cn(COLUMN_CLASS.stok, 'py-[6px]')}>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onToggleSort('stok')}
              className="flex items-center gap-1 font-medium text-slate-500"
              aria-label="Urut berdasarkan stok"
            >
              Stok
              <SortIcon column="stok" sortState={sortState} />
            </button>
            <RangeFilter
              label="Filter stok"
              icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
              value={filters.stok}
              onApply={(range) => onFiltersChange({ stok: range })}
            />
          </div>
        </TableHead>
        <TableHead className={cn(COLUMN_CLASS.hargaBeli, 'py-[6px]')}>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onToggleSort('hargaBeli')}
              className="flex items-center gap-1 font-medium text-slate-500"
              aria-label="Urut berdasarkan harga beli"
            >
              Harga Beli
              <SortIcon column="hargaBeli" sortState={sortState} />
            </button>
          </div>
        </TableHead>
        <TableHead className={cn(COLUMN_CLASS.hargaJual, 'py-[6px]')}>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onToggleSort('harga')}
              className="flex items-center gap-1 font-medium text-slate-500"
              aria-label="Urut berdasarkan harga jual"
            >
              Harga Jual
              <SortIcon column="harga" sortState={sortState} />
            </button>
            <RangeFilter
              label="Filter harga jual"
              icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
              value={filters.harga}
              onApply={(range) => onFiltersChange({ harga: range })}
            />
          </div>
        </TableHead>
        <TableHead className={cn(COLUMN_CLASS.status, 'py-[6px]')}>
          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => onToggleSort('status')}
              className="flex items-center gap-1 font-medium text-slate-500"
              aria-label="Urut berdasarkan status"
            >
              Status
              <SortIcon column="status" sortState={sortState} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Filter status"
                  className={cn(
                    'inline-flex h-6 items-center rounded px-1 text-[11px] transition',
                    filters.status?.length
                      ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
                      : 'text-slate-400 hover:text-slate-600',
                  )}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-44">
                <DropdownMenuLabel>Status produk</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {['aktif', 'tidak aktif'].map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={filters.status?.includes(status as 'aktif' | 'tidak aktif') ?? false}
                    onCheckedChange={(checked) => {
                      const next = new Set(filters.status ?? [])
                      if (checked) next.add(status as 'aktif' | 'tidak aktif')
                      else next.delete(status as 'aktif' | 'tidak aktif')
                      const arr = Array.from(next)
                      onFiltersChange({ status: arr.length > 0 ? (arr as ('aktif' | 'tidak aktif')[]) : undefined })
                    }}
                  >
                    {status === 'aktif' ? 'Aktif' : 'Tidak aktif'}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableHead>
        <TableHead className={cn(COLUMN_CLASS.updated, 'py-[6px]')}>
          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => onToggleSort('updated')}
              className="flex items-center gap-1 font-medium text-slate-500"
              aria-label="Urut berdasarkan tanggal pembaruan"
            >
              Diperbarui
              <SortIcon column="updated" sortState={sortState} />
            </button>
            <DateRangeFilter
              label="Rentang pembaruan"
              value={filters.diperbarui}
              onApply={(range) => onFiltersChange({ diperbarui: range })}
            />
          </div>
        </TableHead>
        <TableHead className={cn(COLUMN_CLASS.aksi, 'py-[6px] font-medium text-slate-500')}>
          Aksi
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}