import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { usePelangganStore } from '@/features/pelanggan/store/pelangganStore'
import type { UIPelanggan } from '@/features/pelanggan/store/pelangganStore'
import {
  PelangganFilters,
  PelangganSortState,
  PelangganSortableColumn,
  getPelangganFilteredItems,
  getPelangganSortedItems,
} from '@/features/pelanggan/utils/tableUtils'

export function usePelangganTableState() {
  const {
    items,
    loading,
    hasNext,
    loadFirst,
    loadNext,
    deletePelanggan,
    setTypeFilter,
    setStatusFilter,
    page,
    total,
  } = usePelangganStore()

  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({})

  const [sortState, setSortState] = useState<PelangganSortState | null>({ column: 'nama', direction: 'asc' })
  const [filters, setFilters] = useState<PelangganFilters>({ status: 'all', tipe: 'all' })
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  const [headerElevated, setHeaderElevated] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    pelanggan: UIPelanggan | null
    loading: boolean
  }>({ open: false, pelanggan: null, loading: false })

  const statusRef = useRef<PelangganFilters['status']>('all')
  const tipeRef = useRef<PelangganFilters['tipe']>('all')
  const initialSyncRef = useRef(false)

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
    const tipe = filters.tipe ?? 'all'

    if (!initialSyncRef.current) {
      initialSyncRef.current = true
      statusRef.current = status
      tipeRef.current = tipe
      if (status !== 'all') setStatusFilter(status)
      if (tipe !== 'all') setTypeFilter(tipe as Exclude<typeof tipe, 'all'>)
      return
    }

    if (statusRef.current !== status) {
      statusRef.current = status
      setStatusFilter(status === 'all' ? undefined : status)
      void loadFirst()
    }

    if (tipeRef.current !== tipe) {
      tipeRef.current = tipe
      setTypeFilter(tipe === 'all' ? undefined : (tipe as Exclude<typeof tipe, 'all'>))
      void loadFirst()
    }
  }, [filters.status, filters.tipe, setStatusFilter, setTypeFilter, loadFirst])

  const filteredItems = useMemo(() => getPelangganFilteredItems(items, filters), [items, filters])
  const sortedItems = useMemo(() => getPelangganSortedItems(filteredItems, sortState), [filteredItems, sortState])

  useEffect(() => {
    if (sortedItems.length === 0) {
      setActiveRowId(null)
      return
    }
    if (!activeRowId || !sortedItems.some((item) => item.id === activeRowId)) {
      setActiveRowId(sortedItems[0].id)
    }
  }, [sortedItems, activeRowId])

  const toggleSort = (column: PelangganSortableColumn) => {
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
    setFilters({ status: 'all', tipe: 'all' })
  }

  const openDeleteDialog = (pelanggan: UIPelanggan) => {
    setDeleteDialog({ open: true, pelanggan, loading: false })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, pelanggan: null, loading: false })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.pelanggan) {
      return { success: false as const, error: 'Pelanggan tidak ditemukan.' }
    }

    setDeleteDialog((prev) => ({ ...prev, loading: true }))
    try {
      await deletePelanggan(deleteDialog.pelanggan.id)
      return { success: true as const, pelanggan: deleteDialog.pelanggan }
    } catch (error: any) {
      setDeleteDialog((prev) => ({ ...prev, loading: false }))
      return {
        success: false as const,
        error: error?.message || 'Terjadi kesalahan saat menghapus pelanggan.',
      }
    }
  }

  const handleRowFocus = (pelanggan: UIPelanggan) => {
    setActiveRowId(pelanggan.id)
  }

  const handleKeyNavigation = (event: KeyboardEvent<HTMLTableRowElement>, pelanggan: UIPelanggan) => {
    const index = sortedItems.findIndex((item) => item.id === pelanggan.id)
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
      return { action: 'view' as const, pelanggan }
    }
    return null
  }

  const totalCount = total ?? items.length
  const filteredCount = sortedItems.length

  const contactStats = useMemo(() => {
    let withContact = 0
    let withoutContact = 0
    items.forEach((pelanggan) => {
      if (pelanggan.telepon) withContact += 1
      else withoutContact += 1
    })
    return { withContact, withoutContact }
  }, [items])

  const emailStats = useMemo(() => {
    let withEmail = 0
    let withoutEmail = 0
    items.forEach((pelanggan) => {
      if (pelanggan.email) withEmail += 1
      else withoutEmail += 1
    })
    return { withEmail, withoutEmail }
  }, [items])

  const pointStats = useMemo(() => {
    let withPoints = 0
    let zeroPoints = 0
    items.forEach((pelanggan) => {
      if ((pelanggan.saldo_poin ?? 0) > 0) withPoints += 1
      else zeroPoints += 1
    })
    return { withPoints, zeroPoints }
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
    pointStats,

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
