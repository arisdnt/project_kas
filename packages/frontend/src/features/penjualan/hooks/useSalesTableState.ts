import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { SaleTransaction } from '@/features/penjualan/types'
import {
  FlattenedSaleLine,
  SalesFilters,
  SalesSortState,
  SalesSortableColumn,
  flattenTransactions,
  getSortedSalesItems,
} from '@/features/penjualan/utils/tableUtils'

export function useSalesTableState(transactions: SaleTransaction[]) {
  const [sortState, setSortState] = useState<SalesSortState | null>({ column: 'date', direction: 'desc' })
  const [filters, setFilters] = useState<SalesFilters>({ range: '7d', status: 'ALL' })
  const [activeRowKey, setActiveRowKey] = useState<string | null>(null)
  const [headerElevated, setHeaderElevated] = useState(false)

  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({})
  const hasInitialActive = useRef(false)

  const flattened = useMemo<FlattenedSaleLine[]>(() => flattenTransactions(transactions), [transactions])

  const sortedItems = useMemo(() => getSortedSalesItems(flattened, sortState), [flattened, sortState])

  useEffect(() => {
    if (sortedItems.length === 0) {
      setActiveRowKey(null)
      return
    }
    if (!hasInitialActive.current || !sortedItems.some((item) => item.key === activeRowKey)) {
      const firstKey = sortedItems[0].key
      setActiveRowKey(firstKey)
      hasInitialActive.current = true
    }
  }, [sortedItems, activeRowKey])

  useEffect(() => {
    const root = scrollAreaRef.current
    if (!root) return
    const viewport = root.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement | null
    if (!viewport) return

    const handleScroll = () => {
      setHeaderElevated(viewport.scrollTop > 4)
    }

    handleScroll()
    viewport.addEventListener('scroll', handleScroll)
    return () => viewport.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleSort = (column: SalesSortableColumn) => {
    setSortState((prev) => {
      if (!prev || prev.column !== column) {
        return { column, direction: 'asc' }
      }
      if (prev.direction === 'asc') {
        return { column, direction: 'desc' }
      }
      return null
    })
  }

  const handleRowFocus = (rowKey: string) => {
    setActiveRowKey(rowKey)
  }

  const handleKeyNavigation = (event: KeyboardEvent<HTMLTableRowElement>, rowKey: string) => {
    const index = sortedItems.findIndex((item) => item.key === rowKey)
    if (index === -1) return null

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const next = sortedItems[index + 1]
      if (next) {
        setActiveRowKey(next.key)
        rowRefs.current[next.key]?.focus()
      }
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const prev = sortedItems[index - 1]
      if (prev) {
        setActiveRowKey(prev.key)
        rowRefs.current[prev.key]?.focus()
      }
    }

    return null
  }

  const resetInternalFilters = () => {
    setFilters((prev) => ({ ...prev, status: 'ALL' }))
  }

  return {
    sortState,
    setSortState,
    filters,
    setFilters,
    sortedItems,
    activeRowKey,
    headerElevated,
    scrollAreaRef,
    rowRefs,
    toggleSort,
    handleRowFocus,
    handleKeyNavigation,
    resetInternalFilters,
  }
}
