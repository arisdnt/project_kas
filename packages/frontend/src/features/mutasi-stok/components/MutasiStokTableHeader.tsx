import { TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Button } from '@/core/components/ui/button'
import { ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import { SortState } from '../hooks/useMutasiStokTableState'
import { cn } from '@/core/lib/utils'

interface Props {
  sortState: SortState
  onToggleSort: (column: string) => void
  headerElevated: boolean
}

export function MutasiStokTableHeader({ sortState, onToggleSort, headerElevated }: Props) {
  const getSortIcon = (column: string) => {
    if (sortState.column !== column) {
      return <ArrowUpDown className="ml-2 h-3 w-3 text-gray-400" />
    }
    return sortState.direction === 'asc' ? (
      <ChevronUp className="ml-2 h-3 w-3" />
    ) : (
      <ChevronDown className="ml-2 h-3 w-3" />
    )
  }

  const SortableHeader = ({ column, children, className }: { column: string; children: React.ReactNode; className?: string }) => (
    <TableHead className={cn("p-0", className)}>
      <Button
        variant="ghost"
        className="h-full w-full justify-start px-3 py-3 font-medium text-gray-700 hover:bg-gray-50"
        onClick={() => onToggleSort(column)}
      >
        {children}
        {getSortIcon(column)}
      </Button>
    </TableHead>
  )

  return (
    <TableHeader className={cn(
      "sticky top-0 z-10 bg-white transition-shadow duration-200",
      headerElevated && "shadow-sm"
    )}>
      <TableRow className="border-b border-gray-200 hover:bg-transparent">
        <SortableHeader column="namaProduk" className="min-w-[200px]">
          Produk
        </SortableHeader>
        <SortableHeader column="jenisMutasi" className="w-32">
          Jenis
        </SortableHeader>
        <SortableHeader column="jumlah" className="w-24">
          Jumlah
        </SortableHeader>
        <SortableHeader column="stokSebelum" className="w-28">
          Stok Sebelum
        </SortableHeader>
        <SortableHeader column="stokSesudah" className="w-28">
          Stok Sesudah
        </SortableHeader>
        <SortableHeader column="tanggalMutasi" className="w-32">
          Tanggal
        </SortableHeader>
        <TableHead className="w-48 px-3 py-3 font-medium text-gray-700">
          Keterangan
        </TableHead>
        <TableHead className="w-24 px-3 py-3 font-medium text-gray-700 text-center">
          Aksi
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}