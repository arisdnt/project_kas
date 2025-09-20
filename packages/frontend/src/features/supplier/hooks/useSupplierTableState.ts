import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useSupplierStore } from '@/features/supplier/store/supplierStore'
import type { UISupplier } from '@/features/supplier/store/supplierStore'
import {
  SupplierFilters,
  SupplierSortState,
  SupplierSortableColumn,
  getSupplierFilteredItems,
  getSupplierSortedItems,
} from '@/features/supplier/utils/tableUtils'

export function useSupplierTableState() {
  const {
    items,
    loading,
    hasNext,
    loadFirst,
    loadNext,
    deleteSupplier,
    setStatusFilter,
    page,
    total,
  } = useSupplierStore()

  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({})

  const [sortState, setSortState] = useState<SupplierSortState | null>({ column: 'nama', direction: 'asc' })
  const [filters, setFilters] = useState<SupplierFilters>({ status: 'all' })
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  const [headerElevated, setHeaderElevated] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    supplier: UISupplier | null
    loading: boolean
  }>({ open: false, supplier: null, loading: false })

  const statusRef = useRef<SupplierFilters['status']>('all')
  const hasAppliedInitialStatusRef = useRef(false)

  useEffect(() => {
    loadFirst()
  }, [loadFirst])

  const hasNextRef = useRef(hasNext)
  const loadingRef = useRef(loading)

  useEffect(() => {
    hasNextRef.current = hasNext
  }, [hasNext])

  useEffect(() => {
    loadingRef.current = loading
  }, [loading])

  useEffect(() => {
    const root = scrollAreaRef.current
    if (!root) return

    const viewport = root.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement | null
    if (!viewport) return

    viewportRef.current = viewport

    const handleScroll = () => {
      if (viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 80) {
        if (hasNextRef.current && !loadingRef.current) {
          void loadNext()
        }
      }
      setHeaderElevated(viewport.scrollTop > 4)
    }

    handleScroll()
    viewport.addEventListener('scroll', handleScroll)
    return () => viewport.removeEventListener('scroll', handleScroll)
  }, [loadNext])

  useEffect(() => {
    if (page === 1) {
      const viewport = viewportRef.current
      if (viewport) viewport.scrollTop = 0
    }
  }, [page])

  useEffect(() => {
    const status = filters.status ?? 'all'

    if (!hasAppliedInitialStatusRef.current) {
      hasAppliedInitialStatusRef.current = true
      statusRef.current = status
      if (status === 'all') {
        setStatusFilter(undefined)
        return
      }
    }

    if (statusRef.current === status) {
      return
    }

    statusRef.current = status
    if (status === 'all') {
      setStatusFilter(undefined)
    } else {
      setStatusFilter(status)
    }
    void loadFirst()
  }, [filters.status, setStatusFilter, loadFirst])

  const filteredItems = useMemo(() => getSupplierFilteredItems(items, filters), [items, filters])
  const sortedItems = useMemo(() => getSupplierSortedItems(filteredItems, sortState), [filteredItems, sortState])

  useEffect(() => {
    if (sortedItems.length === 0) {
      setActiveRowId(null)
      return
    }
    if (!activeRowId || !sortedItems.some((item) => item.id === activeRowId)) {
      setActiveRowId(sortedItems[0].id)
    }
  }, [sortedItems, activeRowId])

  const toggleSort = (column: SupplierSortableColumn) => {
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

  const resetFilters = () => {
    setFilters({ status: 'all' })
  }

  const openDeleteDialog = (supplier: UISupplier) => {
    setDeleteDialog({ open: true, supplier, loading: false })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, supplier: null, loading: false })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.supplier) {
      return { success: false as const, error: 'Supplier tidak ditemukan.' }
    }

    setDeleteDialog((prev) => ({ ...prev, loading: true }))
    try {
      await deleteSupplier(deleteDialog.supplier.id)
      return { success: true as const, supplier: deleteDialog.supplier }
    } catch (error: any) {
      setDeleteDialog((prev) => ({ ...prev, loading: false }))
      return {
        success: false as const,
        error: error?.message || 'Terjadi kesalahan saat menghapus supplier.',
      }
    }
  }

  const handleRowFocus = (supplier: UISupplier) => {
    setActiveRowId(supplier.id)
  }

  const handleKeyNavigation = (event: KeyboardEvent<HTMLTableRowElement>, supplier: UISupplier) => {
    const index = sortedItems.findIndex((item) => item.id === supplier.id)
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const next = sortedItems[index + 1]
      if (next) {
        setActiveRowId(next.id)
        rowRefs.current[next.id]?.focus()
      }
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const prev = sortedItems[index - 1]
      if (prev) {
        setActiveRowId(prev.id)
        rowRefs.current[prev.id]?.focus()
      }
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      return { action: 'view' as const, supplier }
    }
    return null
  }

  const totalCount = total ?? items.length
  const filteredCount = sortedItems.length

  const contactStats = useMemo(() => {
    let withContact = 0
    let withoutContact = 0
    items.forEach((supplier) => {
      if (supplier.kontak_person || supplier.telepon) withContact += 1
      else withoutContact += 1
    })
    return { withContact, withoutContact }
  }, [items])

  const emailStats = useMemo(() => {
    let withEmail = 0
    let withoutEmail = 0
    items.forEach((supplier) => {
      if (supplier.email) withEmail += 1
      else withoutEmail += 1
    })
    return { withEmail, withoutEmail }
  }, [items])

  const bankStats = useMemo(() => {
    let withBank = 0
    let withoutBank = 0
    items.forEach((supplier) => {
      if (supplier.bank_nama || supplier.bank_rekening || supplier.bank_atas_nama) withBank += 1
      else withoutBank += 1
    })
    return { withBank, withoutBank }
  }, [items])

  return {
    // state
    items,
    loading,
    sortState,
    filters,
    sortedItems,
    activeRowId,
    deleteDialog,
    headerElevated,
    page,
    totalCount,
    filteredCount,
    contactStats,
    emailStats,
    bankStats,

    // refs
    scrollAreaRef,
    rowRefs,

    // actions
    setFilters,
    toggleSort,
    resetFilters,
    openDeleteDialog,
    closeDeleteDialog,
    handleDeleteConfirm,
    handleRowFocus,
    handleKeyNavigation,
  }
}
