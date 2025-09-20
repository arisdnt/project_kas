import { TableCell, TableRow } from '@/core/components/ui/table'
import { DotFilledIcon } from '@radix-ui/react-icons'

export function PelangganEmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={9} className="py-16 text-center text-sm text-slate-500">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <DotFilledIcon className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-700">Tidak ada pelanggan sesuai filter</p>
            <p className="text-[12px] text-slate-500">
              Ubah kata kunci atau bersihkan filter untuk menampilkan daftar pelanggan.
            </p>
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}
