import { TableCell, TableRow } from '@/core/components/ui/table'
import { cn } from '@/core/lib/utils'
import { PELANGGAN_COLUMN_CLASS } from '@/features/pelanggan/utils/tableUtils'

export function PelangganTableSkeletonLoader() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, index) => (
        <TableRow key={`pelanggan-skeleton-${index}`} className="border-b border-slate-100">
          <TableCell className={cn(PELANGGAN_COLUMN_CLASS.kode, 'py-[6px] align-middle')}>
            <div className="h-3 w-20 animate-pulse rounded bg-slate-200/80" />
          </TableCell>
          <TableCell className={cn(PELANGGAN_COLUMN_CLASS.nama, 'py-[6px] align-middle')}>
            <div className="h-3 w-32 animate-pulse rounded bg-slate-200/80" />
            <div className="mt-2 h-2.5 w-36 animate-pulse rounded bg-slate-200/80" />
          </TableCell>
          <TableCell className={cn(PELANGGAN_COLUMN_CLASS.email, 'py-[6px] align-middle')}>
            <div className="h-3 w-32 animate-pulse rounded bg-slate-200/70" />
          </TableCell>
          <TableCell className={cn(PELANGGAN_COLUMN_CLASS.telepon, 'py-[6px] align-middle')}>
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200/70" />
          </TableCell>
          <TableCell className={cn(PELANGGAN_COLUMN_CLASS.tipe, 'py-[6px] align-middle')}>
            <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200/80" />
          </TableCell>
          <TableCell className={cn(PELANGGAN_COLUMN_CLASS.poin, 'py-[6px] align-middle')}>
            <div className="h-3 w-20 animate-pulse rounded bg-slate-200/70" />
          </TableCell>
          <TableCell className={cn(PELANGGAN_COLUMN_CLASS.status, 'py-[6px] align-middle')}>
            <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200/80" />
          </TableCell>
          <TableCell className={cn(PELANGGAN_COLUMN_CLASS.updated, 'py-[6px] align-middle')}>
            <div className="h-3 w-16 animate-pulse rounded bg-slate-200/70" />
          </TableCell>
          <TableCell className={cn(PELANGGAN_COLUMN_CLASS.aksi, 'py-[6px] align-middle text-right')}>
            <div className="ml-auto h-6 w-16 animate-pulse rounded-full bg-slate-200/70" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}
