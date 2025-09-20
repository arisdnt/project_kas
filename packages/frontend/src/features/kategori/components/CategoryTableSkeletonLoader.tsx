import { TableCell, TableRow } from '@/core/components/ui/table';
import { cn } from '@/core/lib/utils';
import { KATEGORI_COLUMN_CLASS } from '@/features/kategori/utils/tableUtils';

export function CategoryTableSkeletonLoader() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, index) => (
        <TableRow key={`kategori-skeleton-${index}`} className="border-b border-slate-100">
          <TableCell className={cn(KATEGORI_COLUMN_CLASS.kategori, 'py-[5px] align-middle')}>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-md bg-slate-200/80" />
              <div className="flex flex-col gap-1">
                <div className="h-3 w-32 animate-pulse rounded bg-slate-200/80" />
                <div className="h-2.5 w-20 animate-pulse rounded bg-slate-200/80" />
              </div>
            </div>
          </TableCell>
          <TableCell className={cn(KATEGORI_COLUMN_CLASS.deskripsi, 'py-[5px] align-middle')}>
            <div className="h-2.5 w-40 animate-pulse rounded bg-slate-200/80" />
          </TableCell>
          <TableCell className={cn(KATEGORI_COLUMN_CLASS.urutan, 'py-[5px] align-middle')}>
            <div className="h-2.5 w-10 animate-pulse rounded bg-slate-200/80" />
          </TableCell>
          <TableCell className={cn(KATEGORI_COLUMN_CLASS.produk, 'py-[5px] align-middle')}>
            <div className="h-2.5 w-12 animate-pulse rounded bg-slate-200/80" />
          </TableCell>
          <TableCell className={cn(KATEGORI_COLUMN_CLASS.status, 'py-[5px] align-middle')}>
            <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200/80" />
          </TableCell>
          <TableCell className={cn(KATEGORI_COLUMN_CLASS.updated, 'py-[5px] align-middle')}>
            <div className="h-2.5 w-20 animate-pulse rounded bg-slate-200/80" />
          </TableCell>
          <TableCell className={cn(KATEGORI_COLUMN_CLASS.aksi, 'py-[5px] align-middle text-right')}>
            <div className="ml-auto h-6 w-16 animate-pulse rounded-full bg-slate-200/80" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

