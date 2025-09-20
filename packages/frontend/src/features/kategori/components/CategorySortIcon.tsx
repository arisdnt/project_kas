import { ArrowDown, ArrowUp, MoveVertical } from 'lucide-react';
import { type KategoriSortableColumn, type KategoriSortState } from '@/features/kategori/utils/tableUtils';

type CategorySortIconProps = {
  column: KategoriSortableColumn;
  sortState: KategoriSortState | null;
};

export function CategorySortIcon({ column, sortState }: CategorySortIconProps) {
  if (!sortState || sortState.column !== column) {
    return <MoveVertical className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />;
  }
  return sortState.direction === 'asc' ? (
    <ArrowUp className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
  );
}

