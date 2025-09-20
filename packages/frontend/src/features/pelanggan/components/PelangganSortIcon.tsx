import { ArrowDown, ArrowUp, MoveVertical } from 'lucide-react'
import { PelangganSortState, PelangganSortableColumn } from '@/features/pelanggan/utils/tableUtils'

type PelangganSortIconProps = {
  column: PelangganSortableColumn
  sortState: PelangganSortState | null
}

export function PelangganSortIcon({ column, sortState }: PelangganSortIconProps) {
  if (!sortState || sortState.column !== column) {
    return <MoveVertical className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
  }
  return sortState.direction === 'asc' ? (
    <ArrowUp className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
  )
}
