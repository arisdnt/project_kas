import { TableCell, TableRow } from '@/core/components/ui/table'
import { cn } from '@/core/lib/utils'
import { BRAND_COLUMN_CLASS } from '@/features/brand/utils/tableUtils'

export function BrandTableSkeletonLoader() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, index) => (
        <TableRow key={`brand-skeleton-${index}`} className="border-b border-slate-100">
          <TableCell className={cn(BRAND_COLUMN_CLASS.brand, 'py-[6px] align-middle')}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200/80" />
              <div className="flex-1">
                <div className="mb-1 h-3 w-32 animate-pulse rounded bg-slate-200/80" />
                <div className="h-2.5 w-24 animate-pulse rounded bg-slate-200/60" />
              </div>
            </div>
          </TableCell>
          <TableCell className={cn(BRAND_COLUMN_CLASS.deskripsi, 'py-[6px] align-middle')}>
            <div className="h-3 w-[80%] animate-pulse rounded bg-slate-200/70" />
          </TableCell>
          <TableCell className={cn(BRAND_COLUMN_CLASS.website, 'py-[6px] align-middle')}>
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200/60" />
          </TableCell>
          <TableCell className={cn(BRAND_COLUMN_CLASS.status, 'py-[6px] align-middle')}>
            <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200/80" />
          </TableCell>
          <TableCell className={cn(BRAND_COLUMN_CLASS.updated, 'py-[6px] align-middle')}>
            <div className="h-3 w-16 animate-pulse rounded bg-slate-200/60" />
          </TableCell>
          <TableCell className={cn(BRAND_COLUMN_CLASS.aksi, 'py-[6px] align-middle text-right')}>
            <div className="ml-auto h-6 w-16 animate-pulse rounded-full bg-slate-200/70" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}
