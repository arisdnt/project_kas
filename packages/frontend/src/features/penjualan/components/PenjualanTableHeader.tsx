import { TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { SortIcon } from './SortIcon'
import { SortState } from '../hooks/usePenjualanTableState'

interface Props {
  sortState: SortState
  onToggleSort: (column: string) => void
  headerElevated: boolean
}

export function PenjualanTableHeader({ sortState, onToggleSort, headerElevated }: Props) {
  return (
    <TableHeader
      className={`sticky top-0 z-10 bg-white transition-shadow duration-200 ${
        headerElevated ? 'shadow-sm border-b-2 border-slate-200' : ''
      }`}
    >
      <TableRow className="hover:bg-transparent border-slate-200">
        <TableHead className="w-[140px] font-semibold text-slate-600">
          <button
            className="flex items-center gap-1 hover:text-slate-900 transition-colors"
            onClick={() => onToggleSort('kode')}
          >
            Kode Transaksi
            <SortIcon column="kode" sortState={sortState} />
          </button>
        </TableHead>

        <TableHead className="w-[120px] font-semibold text-slate-600">
          <button
            className="flex items-center gap-1 hover:text-slate-900 transition-colors"
            onClick={() => onToggleSort('tanggal')}
          >
            Tanggal
            <SortIcon column="tanggal" sortState={sortState} />
          </button>
        </TableHead>

        <TableHead className="w-[80px] font-semibold text-slate-600">
          Waktu
        </TableHead>

        <TableHead className="w-[120px] font-semibold text-slate-600">
          <button
            className="flex items-center gap-1 hover:text-slate-900 transition-colors"
            onClick={() => onToggleSort('kasir')}
          >
            Kasir
            <SortIcon column="kasir" sortState={sortState} />
          </button>
        </TableHead>

        <TableHead className="w-[120px] font-semibold text-slate-600">
          Pelanggan
        </TableHead>

        <TableHead className="w-[110px] font-semibold text-slate-600">
          <button
            className="flex items-center gap-1 hover:text-slate-900 transition-colors"
            onClick={() => onToggleSort('metodeBayar')}
          >
            Metode Bayar
            <SortIcon column="metodeBayar" sortState={sortState} />
          </button>
        </TableHead>

        <TableHead className="w-[100px] font-semibold text-slate-600">
          <button
            className="flex items-center gap-1 hover:text-slate-900 transition-colors"
            onClick={() => onToggleSort('status')}
          >
            Status
            <SortIcon column="status" sortState={sortState} />
          </button>
        </TableHead>

        <TableHead className="w-[120px] font-semibold text-slate-600 text-right">
          <button
            className="flex items-center gap-1 hover:text-slate-900 transition-colors ml-auto"
            onClick={() => onToggleSort('total')}
          >
            Total
            <SortIcon column="total" sortState={sortState} />
          </button>
        </TableHead>

        <TableHead className="w-[100px] font-semibold text-slate-600 text-right">
          Aksi
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}