import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { SortState } from '../hooks/usePenjualanTableState'

interface Props {
  column: string
  sortState: SortState
}

export function SortIcon({ column, sortState }: Props) {
  if (sortState.column !== column) {
    return <ChevronsUpDown className="h-4 w-4 text-slate-400" />
  }

  return sortState.direction === 'asc' ? (
    <ChevronUp className="h-4 w-4 text-slate-700" />
  ) : (
    <ChevronDown className="h-4 w-4 text-slate-700" />
  )
}