import { cn } from '@/core/lib/utils'
import { TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { PELANGGAN_COLUMN_CLASS, PelangganSortState, PelangganSortableColumn } from '@/features/pelanggan/utils/tableUtils'
import { PelangganSortIcon } from './PelangganSortIcon'

type PelangganTableHeaderProps = {
  sortState: PelangganSortState | null
  onToggleSort: (column: PelangganSortableColumn) => void
  headerElevated: boolean
}

export function PelangganTableHeader({ sortState, onToggleSort, headerElevated }: PelangganTableHeaderProps) {
  return (
    <TableHeader
      className={cn(
        'bg-slate-50/80 transition-shadow',
        headerElevated ? 'shadow-[0_6px_16px_-12px_rgba(15,23,42,0.55)]' : 'shadow-none',
      )}
    >
      <TableRow className="border-b border-slate-200">
        <TableHead className={cn(PELANGGAN_COLUMN_CLASS.kode, 'py-[6px]')}>
          <button
            type="button"
            onClick={() => onToggleSort('kode')}
            className="flex items-center gap-1 font-medium text-slate-500"
            aria-label="Urut berdasarkan kode"
          >
            Kode
            <PelangganSortIcon column="kode" sortState={sortState} />
          </button>
        </TableHead>
        <TableHead className={cn(PELANGGAN_COLUMN_CLASS.nama, 'py-[6px]')}>
          <button
            type="button"
            onClick={() => onToggleSort('nama')}
            className="flex items-center gap-1 text-left font-medium text-slate-500"
            aria-label="Urut berdasarkan nama"
          >
            Pelanggan
            <PelangganSortIcon column="nama" sortState={sortState} />
          </button>
        </TableHead>
        <TableHead className={cn(PELANGGAN_COLUMN_CLASS.email, 'py-[6px]')}>
          <button
            type="button"
            onClick={() => onToggleSort('email')}
            className="flex items-center gap-1 font-medium text-slate-500"
            aria-label="Urut berdasarkan email"
          >
            Email
            <PelangganSortIcon column="email" sortState={sortState} />
          </button>
        </TableHead>
        <TableHead className={cn(PELANGGAN_COLUMN_CLASS.telepon, 'py-[6px] font-medium text-slate-500')}>
          Telepon
        </TableHead>
        <TableHead className={cn(PELANGGAN_COLUMN_CLASS.tipe, 'py-[6px]')}>
          <button
            type="button"
            onClick={() => onToggleSort('tipe')}
            className="flex items-center gap-1 font-medium text-slate-500"
            aria-label="Urut berdasarkan tipe"
          >
            Tipe
            <PelangganSortIcon column="tipe" sortState={sortState} />
          </button>
        </TableHead>
        <TableHead className={cn(PELANGGAN_COLUMN_CLASS.poin, 'py-[6px]')}>
          <button
            type="button"
            onClick={() => onToggleSort('poin')}
            className="flex items-center gap-1 font-medium text-slate-500"
            aria-label="Urut berdasarkan poin"
          >
            Poin
            <PelangganSortIcon column="poin" sortState={sortState} />
          </button>
        </TableHead>
        <TableHead className={cn(PELANGGAN_COLUMN_CLASS.status, 'py-[6px]')}>
          <button
            type="button"
            onClick={() => onToggleSort('status')}
            className="flex items-center gap-1 font-medium text-slate-500"
            aria-label="Urut berdasarkan status"
          >
            Status
            <PelangganSortIcon column="status" sortState={sortState} />
          </button>
        </TableHead>
        <TableHead className={cn(PELANGGAN_COLUMN_CLASS.updated, 'py-[6px]')}>
          <button
            type="button"
            onClick={() => onToggleSort('updated')}
            className="flex items-center gap-1 font-medium text-slate-500"
            aria-label="Urut berdasarkan pembaruan"
          >
            Diperbarui
            <PelangganSortIcon column="updated" sortState={sortState} />
          </button>
        </TableHead>
        <TableHead className={cn(PELANGGAN_COLUMN_CLASS.aksi, 'py-[6px] font-medium text-slate-500 text-right')}>
          Aksi
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}
