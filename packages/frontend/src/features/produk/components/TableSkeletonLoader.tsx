import { TableCell, TableRow } from '@/core/components/ui/table'
import { cn } from '@/core/lib/utils'
import { COLUMN_CLASS } from '@/features/produk/utils/tableUtils'

export function TableSkeletonLoader() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, index) => (
        <TableRow key={`skeleton-${index}`} className="border-b border-slate-100">
          <TableCell className={cn(COLUMN_CLASS.produk, 'py-[5px] align-middle')}>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-md bg-slate-200/80" />
              <div className="flex flex-col gap-1">
                <div className="h-3 w-32 animate-pulse rounded bg-slate-200/80" />
                <div className="h-2.5 w-24 animate-pulse rounded bg-slate-200/80" />
              </div>
            </div>
          </TableCell>
          {Array.from({ length: 9 }).map((__, idx) => (
            <TableCell key={idx} className="py-[5px] align-middle">
              <div className="h-2.5 w-20 animate-pulse rounded bg-slate-200/80" />
            </TableCell>
          ))}
          <TableCell className={cn(COLUMN_CLASS.aksi, 'py-[5px] text-right')}>
            <div className="ml-auto h-6 w-16 animate-pulse rounded-full bg-slate-200/80" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}