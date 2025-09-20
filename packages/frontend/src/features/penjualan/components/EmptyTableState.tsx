import { TableRow, TableCell } from '@/core/components/ui/table'
import { FileText } from 'lucide-react'

export function EmptyTableState() {
  return (
    <TableRow>
      <TableCell colSpan={9} className="h-64">
        <div className="flex flex-col items-center justify-center text-slate-500">
          <FileText className="h-12 w-12 mb-4 text-slate-400" />
          <h3 className="text-lg font-medium mb-2">Tidak ada transaksi</h3>
          <p className="text-sm text-center max-w-sm">
            Belum ada transaksi penjualan yang ditemukan. Mulai dengan membuat transaksi baru atau ubah filter pencarian.
          </p>
        </div>
      </TableCell>
    </TableRow>
  )
}