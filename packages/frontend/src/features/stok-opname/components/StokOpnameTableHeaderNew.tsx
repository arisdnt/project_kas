import { TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { SortIcon } from './SortIcon'
import { SortState } from '../hooks/useStokOpnameTableState'

interface Props {
  sortState: SortState
  onToggleSort: (column: string) => void
  headerElevated: boolean
}

export function StokOpnameTableHeaderNew({ sortState, onToggleSort, headerElevated }: Props) {
  return (
    <TableHeader
      className={`sticky top-0 z-10 bg-white transition-shadow duration-200 ${
        headerElevated ? 'shadow-sm border-b-2 border-slate-200' : ''
      }`}
    >
      <TableRow className="hover:bg-transparent border-slate-200">
        <TableHead className="w-[200px] font-semibold text-slate-600">
          <button
            className="flex items-center gap-1 hover:text-slate-900 transition-colors"
            onClick={() => onToggleSort('namaProduk')}
          >
            Nama Produk
            <SortIcon column="namaProduk" sortState={sortState} />
          </button>
        </TableHead>

        <TableHead className="w-[120px] font-semibold text-slate-600">
          <button
            className="flex items-center gap-1 hover:text-slate-900 transition-colors"
            onClick={() => onToggleSort('sku')}
          >
            SKU
            <SortIcon column="sku" sortState={sortState} />
          </button>
        </TableHead>

        <TableHead className="w-[120px] font-semibold text-slate-600">
          <button
            className="flex items-center gap-1 hover:text-slate-900 transition-colors"
            onClick={() => onToggleSort('kategori')}
          >
            Kategori
            <SortIcon column="kategori" sortState={sortState} />
          </button>
        </TableHead>

        <TableHead className="w-[120px] font-semibold text-slate-600">
          <button
            className="flex items-center gap-1 hover:text-slate-900 transition-colors"
            onClick={() => onToggleSort('brand')}
          >
            Brand
            <SortIcon column="brand" sortState={sortState} />
          </button>
        </TableHead>

        <TableHead className="w-[100px] font-semibold text-slate-600 text-right">
          <button
            className="flex items-center gap-1 hover:text-slate-900 transition-colors ml-auto"
            onClick={() => onToggleSort('stokSistem')}
          >
            Stok Sistem
            <SortIcon column="stokSistem" sortState={sortState} />
          </button>
        </TableHead>

        <TableHead className="w-[100px] font-semibold text-slate-600 text-right">
          <button
            className="flex items-center gap-1 hover:text-slate-900 transition-colors ml-auto"
            onClick={() => onToggleSort('stokFisik')}
          >
            Stok Fisik
            <SortIcon column="stokFisik" sortState={sortState} />
          </button>
        </TableHead>

        <TableHead className="w-[100px] font-semibold text-slate-600 text-right">
          <button
            className="flex items-center gap-1 hover:text-slate-900 transition-colors ml-auto"
            onClick={() => onToggleSort('selisih')}
          >
            Selisih
            <SortIcon column="selisih" sortState={sortState} />
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

        <TableHead className="w-[120px] font-semibold text-slate-600">
          <button
            className="flex items-center gap-1 hover:text-slate-900 transition-colors"
            onClick={() => onToggleSort('tanggalOpname')}
          >
            Tanggal
            <SortIcon column="tanggalOpname" sortState={sortState} />
          </button>
        </TableHead>

        <TableHead className="w-[100px] font-semibold text-slate-600 text-right">
          Aksi
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}