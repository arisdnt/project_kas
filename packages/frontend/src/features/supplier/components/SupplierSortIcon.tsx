import { ArrowDown, ArrowUp, MoveVertical } from 'lucide-react'
import { SupplierSortState, SupplierSortableColumn } from '@/features/supplier/utils/tableUtils'

type SupplierSortIconProps = {
  column: SupplierSortableColumn
  sortState: SupplierSortState | null
}

export function SupplierSortIcon({ column, sortState }: SupplierSortIconProps) {
  if (!sortState || sortState.column !== column) {
    return <MoveVertical className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
  }
  return sortState.direction === 'asc' ? (
    <ArrowUp className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
  )
}
