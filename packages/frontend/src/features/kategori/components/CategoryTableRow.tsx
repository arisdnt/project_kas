import { forwardRef, type KeyboardEvent } from 'react';
import { TableCell, TableRow } from '@/core/components/ui/table';
import { Badge } from '@/core/components/ui/badge';
import { ActionButton } from '@/core/components/ui/action-button';
import { cn } from '@/core/lib/utils';
import { CategoryImage } from '@/features/kategori/components/CategoryImage';
import {
  KATEGORI_COLUMN_CLASS,
  KATEGORI_ROW_HEIGHT_PX,
  formatTanggal,
} from '@/features/kategori/utils/tableUtils';
import { type UIKategori } from '@/features/kategori/types/kategori';

type CategoryTableRowProps = {
  kategori: UIKategori;
  isActive: boolean;
  onFocus: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLTableRowElement>) => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export const CategoryTableRow = forwardRef<HTMLTableRowElement, CategoryTableRowProps>(({
  kategori,
  isActive,
  onFocus,
  onKeyDown,
  onView,
  onEdit,
  onDelete,
}, ref) => {
  return (
    <TableRow
      ref={ref}
      tabIndex={isActive ? 0 : -1}
      data-active={isActive}
      onFocus={onFocus}
      onClick={onFocus}
      onKeyDown={onKeyDown}
      className={cn(
        'group/table-row border-0 transition-colors',
        'odd:bg-slate-50/60',
        'hover:bg-sky-100 hover:text-slate-900',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400/70',
        'data-[active=true]:bg-sky-100 data-[active=true]:text-slate-900',
      )}
      style={{ height: KATEGORI_ROW_HEIGHT_PX }}
      aria-selected={isActive}
    >
      <TableCell className={cn(KATEGORI_COLUMN_CLASS.kategori, 'py-[5px] align-middle')}>
        <div className="flex items-center gap-3">
          <CategoryImage src={kategori.icon_url} alt={kategori.nama} />
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-slate-800 group-hover/table-row:text-slate-900 group-data-[active=true]/table-row:text-slate-900" title={kategori.nama}>
              {kategori.nama}
            </div>
            <p className="text-[12px] text-slate-500">ID: {kategori.id}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className={cn(KATEGORI_COLUMN_CLASS.deskripsi, 'py-[5px] align-middle')}>
        <span className="block truncate text-[13px] text-slate-600 group-hover/table-row:text-slate-700 group-data-[active=true]/table-row:text-slate-700">
          {kategori.deskripsi?.trim() || '—'}
        </span>
      </TableCell>
      <TableCell className={cn(KATEGORI_COLUMN_CLASS.urutan, 'py-[5px] align-middle')}>
        <span className="font-semibold text-slate-800 group-hover/table-row:text-slate-900 group-data-[active=true]/table-row:text-slate-900">
          {kategori.urutan ?? '—'}
        </span>
      </TableCell>
      <TableCell className={cn(KATEGORI_COLUMN_CLASS.produk, 'py-[5px] align-middle')}>
        <span className="font-semibold text-slate-800 group-hover/table-row:text-slate-900 group-data-[active=true]/table-row:text-slate-900">
          {kategori.jumlah_produk ?? 0}
        </span>
      </TableCell>
      <TableCell className={cn(KATEGORI_COLUMN_CLASS.status, 'py-[5px] align-middle')}>
        {kategori.status === 'aktif' ? (
          <Badge className="rounded-full border border-emerald-200 bg-emerald-50 text-[12px] font-semibold text-emerald-600">
            Aktif
          </Badge>
        ) : (
          <Badge className="rounded-full border border-rose-200 bg-rose-50 text-[12px] font-semibold text-rose-600">
            Tidak aktif
          </Badge>
        )}
      </TableCell>
      <TableCell className={cn(KATEGORI_COLUMN_CLASS.updated, 'py-[5px] align-middle')}>
        <span className="text-slate-600 group-hover/table-row:text-slate-700 group-data-[active=true]/table-row:text-slate-700">
          {formatTanggal(kategori.diperbarui_pada || kategori.dibuat_pada)}
        </span>
      </TableCell>
      <TableCell className={cn(KATEGORI_COLUMN_CLASS.aksi, 'py-[5px] align-middle')}>
        <ActionButton
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          viewLabel="Lihat detail kategori"
          editLabel="Edit kategori"
          deleteLabel="Hapus kategori"
        />
      </TableCell>
    </TableRow>
  );
});

CategoryTableRow.displayName = 'CategoryTableRow';
