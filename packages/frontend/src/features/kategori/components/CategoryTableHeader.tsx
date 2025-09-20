import { TableHead, TableHeader, TableRow } from '@/core/components/ui/table';
import { cn } from '@/core/lib/utils';
import {
  KATEGORI_COLUMN_CLASS,
  type KategoriSortState,
  type KategoriSortableColumn,
} from '@/features/kategori/utils/tableUtils';
import { CategorySortIcon } from '@/features/kategori/components/CategorySortIcon';

type CategoryTableHeaderProps = {
  sortState: KategoriSortState | null;
  onToggleSort: (column: KategoriSortableColumn) => void;
  headerElevated: boolean;
};

export function CategoryTableHeader({ sortState, onToggleSort, headerElevated }: CategoryTableHeaderProps) {
  return (
    <TableHeader
      className={cn(
        'bg-slate-50/80 transition-shadow',
        headerElevated ? 'shadow-[0_6px_16px_-12px_rgba(15,23,42,0.55)]' : 'shadow-none',
      )}
    >
      <TableRow className="border-b border-slate-200">
        <TableHead className={cn(KATEGORI_COLUMN_CLASS.kategori, 'py-[6px]')}>
          <button
            type="button"
            onClick={() => onToggleSort('nama')}
            className="flex items-center gap-1 text-left font-medium text-slate-500"
            aria-label="Urut berdasarkan nama kategori"
          >
            Kategori
            <CategorySortIcon column="nama" sortState={sortState} />
          </button>
        </TableHead>
        <TableHead className={cn(KATEGORI_COLUMN_CLASS.deskripsi, 'py-[6px] font-medium text-slate-500')}>
          Deskripsi
        </TableHead>
        <TableHead className={cn(KATEGORI_COLUMN_CLASS.urutan, 'py-[6px]')}>
          <button
            type="button"
            onClick={() => onToggleSort('urutan')}
            className="flex items-center gap-1 font-medium text-slate-500"
            aria-label="Urut berdasarkan urutan"
          >
            Urutan
            <CategorySortIcon column="urutan" sortState={sortState} />
          </button>
        </TableHead>
        <TableHead className={cn(KATEGORI_COLUMN_CLASS.produk, 'py-[6px]')}>
          <button
            type="button"
            onClick={() => onToggleSort('jumlah_produk')}
            className="flex items-center gap-1 font-medium text-slate-500"
            aria-label="Urut berdasarkan jumlah produk"
          >
            Total Produk
            <CategorySortIcon column="jumlah_produk" sortState={sortState} />
          </button>
        </TableHead>
        <TableHead className={cn(KATEGORI_COLUMN_CLASS.status, 'py-[6px]')}>
          <button
            type="button"
            onClick={() => onToggleSort('status')}
            className="flex items-center gap-1 font-medium text-slate-500"
            aria-label="Urut berdasarkan status"
          >
            Status
            <CategorySortIcon column="status" sortState={sortState} />
          </button>
        </TableHead>
        <TableHead className={cn(KATEGORI_COLUMN_CLASS.updated, 'py-[6px]')}>
          <button
            type="button"
            onClick={() => onToggleSort('updated')}
            className="flex items-center gap-1 font-medium text-slate-500"
            aria-label="Urut berdasarkan waktu pembaruan"
          >
            Diperbarui
            <CategorySortIcon column="updated" sortState={sortState} />
          </button>
        </TableHead>
        <TableHead className={cn(KATEGORI_COLUMN_CLASS.aksi, 'py-[6px] font-medium text-slate-500')}>
          Aksi
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}

