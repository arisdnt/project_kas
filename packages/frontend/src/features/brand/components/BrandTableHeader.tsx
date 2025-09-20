import { cn } from '@/core/lib/utils'
import { TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { BRAND_COLUMN_CLASS, BrandSortState, BrandSortableColumn } from '@/features/brand/utils/tableUtils'
import { BrandSortIcon } from './BrandSortIcon'

type BrandTableHeaderProps = {
  sortState: BrandSortState | null
  onToggleSort: (column: BrandSortableColumn) => void
  headerElevated: boolean
}

export function BrandTableHeader({ sortState, onToggleSort, headerElevated }: BrandTableHeaderProps) {
  return (
    <TableHeader
      className={cn(
        'bg-slate-50/80 transition-shadow',
        headerElevated ? 'shadow-[0_6px_16px_-12px_rgba(15,23,42,0.55)]' : 'shadow-none',
      )}
    >
      <TableRow className="border-b border-slate-200">
        <TableHead className={cn(BRAND_COLUMN_CLASS.brand, 'py-[6px]')}>
          <button
            type="button"
            onClick={() => onToggleSort('nama')}
            className="flex items-center gap-1 text-left font-medium text-slate-500"
            aria-label="Urut berdasarkan nama brand"
          >
            Brand
            <BrandSortIcon column="nama" sortState={sortState} />
          </button>
        </TableHead>
        <TableHead className={cn(BRAND_COLUMN_CLASS.deskripsi, 'py-[6px] font-medium text-slate-500')}>
          Deskripsi
        </TableHead>
        <TableHead className={cn(BRAND_COLUMN_CLASS.website, 'py-[6px] font-medium text-slate-500')}>
          Website
        </TableHead>
        <TableHead className={cn(BRAND_COLUMN_CLASS.status, 'py-[6px]')}>
          <button
            type="button"
            onClick={() => onToggleSort('status')}
            className="flex items-center gap-1 font-medium text-slate-500"
            aria-label="Urut berdasarkan status brand"
          >
            Status
            <BrandSortIcon column="status" sortState={sortState} />
          </button>
        </TableHead>
        <TableHead className={cn(BRAND_COLUMN_CLASS.updated, 'py-[6px]')}>
          <button
            type="button"
            onClick={() => onToggleSort('updated')}
            className="flex items-center gap-1 font-medium text-slate-500"
            aria-label="Urut berdasarkan waktu update"
          >
            Diperbarui
            <BrandSortIcon column="updated" sortState={sortState} />
          </button>
        </TableHead>
        <TableHead className={cn(BRAND_COLUMN_CLASS.aksi, 'py-[6px] font-medium text-slate-500')}>
          Aksi
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}
