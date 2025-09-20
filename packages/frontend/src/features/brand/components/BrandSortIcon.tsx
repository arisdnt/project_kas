import { ArrowDown, ArrowUp, MoveVertical } from 'lucide-react'
import { BrandSortState, BrandSortableColumn } from '@/features/brand/utils/tableUtils'

type BrandSortIconProps = {
  column: BrandSortableColumn
  sortState: BrandSortState | null
}

export function BrandSortIcon({ column, sortState }: BrandSortIconProps) {
  if (!sortState || sortState.column !== column) {
    return <MoveVertical className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
  }
  return sortState.direction === 'asc' ? (
    <ArrowUp className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
  )
}
