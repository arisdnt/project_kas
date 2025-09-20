import { TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { SortIcon } from './SortIcon'
import { SortState } from '../hooks/usePembelianTableState'

interface Props {
  sortState: SortState
  onToggleSort: (column: string) => void
  headerElevated: boolean
}

export function PembelianTableHeader({ sortState, onToggleSort, headerElevated }: Props) {
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
            onClick={() => onToggleSort('nomorTransaksi')}
          >
            No. Transaksi
            <SortIcon column="nomorTransaksi" sortState={sortState} />
          </button>
        </TableHead>

        <TableHead className="w-[120px] font-semibold text-slate-600">
          <button
            className="flex items-center gap-1 hover:text-slate-900 transition-colors"
            onClick={() => onToggleSort('nomorPO')}
          >
            No. PO
            <SortIcon column="nomorPO" sortState={sortState} />
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

        <TableHead className="w-[150px] font-semibold text-slate-600">
          <button
            className="flex items-center gap-1 hover:text-slate-900 transition-colors"
            onClick={() => onToggleSort('supplierNama')}
          >
            Supplier
            <SortIcon column="supplierNama" sortState={sortState} />
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

        <TableHead className="w-[130px] font-semibold text-slate-600">
          <button
            className="flex items-center gap-1 hover:text-slate-900 transition-colors"
            onClick={() => onToggleSort('statusPembayaran')}
          >
            Status Bayar
            <SortIcon column="statusPembayaran" sortState={sortState} />
          </button>
        </TableHead>

        <TableHead className="w-[120px] font-semibold text-slate-600 text-right">
          <button
            className="flex items-center gap-1 hover:text-slate-900 transition-colors ml-auto"
            onClick={() => onToggleSort('subtotal')}
          >
            Subtotal
            <SortIcon column="subtotal" sortState={sortState} />
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