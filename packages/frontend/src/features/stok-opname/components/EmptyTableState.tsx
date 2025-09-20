import { TableRow, TableCell } from '@/core/components/ui/table'
import { Package } from 'lucide-react'

export function EmptyTableState() {
  return (
    <TableRow>
      <TableCell colSpan={10} className="h-64">
        <div className="flex flex-col items-center justify-center text-slate-500">
          <Package className="h-12 w-12 mb-4 text-slate-400" />
          <h3 className="text-lg font-medium mb-2">Tidak ada stok opname</h3>
          <p className="text-sm text-center max-w-sm">
            Belum ada data stok opname yang ditemukan. Mulai dengan membuat stok opname baru atau ubah filter pencarian.
          </p>
        </div>
      </TableCell>
    </TableRow>
  )
}