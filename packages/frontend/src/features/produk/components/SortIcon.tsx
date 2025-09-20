import { ArrowDown, ArrowUp, MoveVertical } from 'lucide-react'
import { SortableColumn, SortState } from '@/features/produk/utils/tableUtils'

type SortIconProps = {
  column: SortableColumn
  sortState: SortState | null
}

export function SortIcon({ column, sortState }: SortIconProps) {
  if (!sortState || sortState.column !== column) {
    return <MoveVertical className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
  }
  return sortState.direction === 'asc' ? (
    <ArrowUp className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
  )
}