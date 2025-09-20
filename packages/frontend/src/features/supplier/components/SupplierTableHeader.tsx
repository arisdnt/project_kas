import { cn } from '@/core/lib/utils'
import { TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { SUPPLIER_COLUMN_CLASS, SupplierSortState, SupplierSortableColumn } from '@/features/supplier/utils/tableUtils'
import { SupplierSortIcon } from './SupplierSortIcon'

type SupplierTableHeaderProps = {
  sortState: SupplierSortState | null
  onToggleSort: (column: SupplierSortableColumn) => void
  headerElevated: boolean
}

export function SupplierTableHeader({ sortState, onToggleSort, headerElevated }: SupplierTableHeaderProps) {
  return (
    <TableHeader
      className={cn(
        'bg-slate-50/80 transition-shadow',
        headerElevated ? 'shadow-[0_6px_16px_-12px_rgba(15,23,42,0.55)]' : 'shadow-none',
      )}
    >
      <TableRow className="border-b border-slate-200">
        <TableHead className={cn(SUPPLIER_COLUMN_CLASS.supplier, 'py-[6px]')}>
          <button
            type="button"
            onClick={() => onToggleSort('nama')}
            className="flex items-center gap-1 text-left font-medium text-slate-500"
            aria-label="Urut berdasarkan nama supplier"
          >
            Supplier
            <SupplierSortIcon column="nama" sortState={sortState} />
          </button>
        </TableHead>
        <TableHead className={cn(SUPPLIER_COLUMN_CLASS.contact, 'py-[6px]')}>
          <button
            type="button"
            onClick={() => onToggleSort('kontak')}
            className="flex items-center gap-1 font-medium text-slate-500"
            aria-label="Urut berdasarkan kontak"
          >
            Kontak
            <SupplierSortIcon column="kontak" sortState={sortState} />
          </button>
        </TableHead>
        <TableHead className={cn(SUPPLIER_COLUMN_CLASS.email, 'py-[6px]')}>
          <button
            type="button"
            onClick={() => onToggleSort('email')}
            className="flex items-center gap-1 font-medium text-slate-500"
            aria-label="Urut berdasarkan email"
          >
            Email
            <SupplierSortIcon column="email" sortState={sortState} />
          </button>
        </TableHead>
        <TableHead className={cn(SUPPLIER_COLUMN_CLASS.phone, 'py-[6px] font-medium text-slate-500')}>
          Telepon
        </TableHead>
        <TableHead className={cn(SUPPLIER_COLUMN_CLASS.status, 'py-[6px]')}>
          <button
            type="button"
            onClick={() => onToggleSort('status')}
            className="flex items-center gap-1 font-medium text-slate-500"
            aria-label="Urut berdasarkan status"
          >
            Status
            <SupplierSortIcon column="status" sortState={sortState} />
          </button>
        </TableHead>
        <TableHead className={cn(SUPPLIER_COLUMN_CLASS.updated, 'py-[6px]')}>
          <button
            type="button"
            onClick={() => onToggleSort('updated')}
            className="flex items-center gap-1 font-medium text-slate-500"
            aria-label="Urut berdasarkan pembaruan terakhir"
          >
            Diperbarui
            <SupplierSortIcon column="updated" sortState={sortState} />
          </button>
        </TableHead>
        <TableHead className={cn(SUPPLIER_COLUMN_CLASS.aksi, 'py-[6px] font-medium text-slate-500')}>
          Aksi
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}
