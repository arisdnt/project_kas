import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { usePenjualanStore, UIPenjualan } from '../store/penjualanStore'
import { useAuthStore } from '@/core/store/authStore'

export interface SortState {
  column: string | null
  direction: 'asc' | 'desc'
}

export interface FilterState {
  search: string
  status: string
  metodeBayar: string
  kasir: string
  tanggalMulai: string
  tanggalAkhir: string
}

interface DeleteDialog {
  open: boolean
  penjualan: UIPenjualan | null
  loading: boolean
}

export function usePenjualanTableState() {
  const {
    items,
    loading,
    lastUpdatedAt,
    recentlyTouched,
    loadPenjualan,
    deletePenjualan,
    clearRecentlyTouched
  } = usePenjualanStore()

  const { user } = useAuthStore()
  const [sortState, setSortState] = useState<SortState>({ column: 'tanggal', direction: 'desc' })
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    metodeBayar: '',
    kasir: '',
    tanggalMulai: '',
    tanggalAkhir: ''
  })
  const [page, setPage] = useState(1)
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialog>({
    open: false,
    penjualan: null,
    loading: false
  })
  const [headerElevated, setHeaderElevated] = useState(false)

  const scrollAreaRef = useRef<any>(null)
  const rowRefs = useRef<Record<string, HTMLElement | null>>({})

  // Filter options
  const statusOptions = useMemo(() => {
    const allStatuses = Array.from(new Set(items.map(p => p.status).filter(Boolean)))
    return allStatuses.map(status => ({ label: status, value: status }))
  }, [items])

  const metodeBayarOptions = useMemo(() => {
    const allMethods = Array.from(new Set(items.map(p => p.metodeBayar).filter(Boolean)))
    return allMethods.map(method => ({ label: method, value: method }))
  }, [items])

  const kasirOptions = useMemo(() => {
    const allKasir = Array.from(new Set(items.map(p => p.kasir).filter(Boolean)))
    return allKasir.map(kasir => ({ label: kasir, value: kasir }))
  }, [items])

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return items.filter(penjualan => {
      if (filters.search) {
        const search = filters.search.toLowerCase()
        const matchesSearch =
          penjualan.kode.toLowerCase().includes(search) ||
          penjualan.kasir.toLowerCase().includes(search) ||
          (penjualan.pelanggan?.toLowerCase().includes(search))
        if (!matchesSearch) return false
      }

      if (filters.status && penjualan.status !== filters.status) return false
      if (filters.metodeBayar && penjualan.metodeBayar !== filters.metodeBayar) return false
      if (filters.kasir && penjualan.kasir !== filters.kasir) return false

      if (filters.tanggalMulai && penjualan.tanggal < filters.tanggalMulai) return false
      if (filters.tanggalAkhir && penjualan.tanggal > filters.tanggalAkhir) return false

      return true
    })
  }, [items, filters])

  const sortedItems = useMemo(() => {
    if (!sortState.column) return filteredItems

    return [...filteredItems].sort((a, b) => {
      let aVal: any = a[sortState.column as keyof UIPenjualan]
      let bVal: any = b[sortState.column as keyof UIPenjualan]

      if (sortState.column === 'total') {
        aVal = Number(aVal) || 0
        bVal = Number(bVal) || 0
      }

      if (aVal < bVal) return sortState.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortState.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredItems, sortState])

  // Actions
  const toggleSort = useCallback((column: string) => {
    setSortState(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: '',
      metodeBayar: '',
      kasir: '',
      tanggalMulai: '',
      tanggalAkhir: ''
    })
    setPage(1)
  }, [])

  const openDeleteDialog = useCallback((penjualan: UIPenjualan) => {
    setDeleteDialog({ open: true, penjualan, loading: false })
  }, [])

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialog({ open: false, penjualan: null, loading: false })
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteDialog.penjualan) return { success: false, error: 'No item selected' }

    setDeleteDialog(prev => ({ ...prev, loading: true }))
    try {
      await deletePenjualan(deleteDialog.penjualan.id)
      return { success: true, penjualan: deleteDialog.penjualan }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Failed to delete' }
    } finally {
      setDeleteDialog(prev => ({ ...prev, loading: false }))
    }
  }, [deleteDialog.penjualan, deletePenjualan])

  const handleRowFocus = useCallback((penjualan: UIPenjualan) => {
    setActiveRowId(penjualan.id)
  }, [])

  const handleKeyNavigation = useCallback((event: React.KeyboardEvent, penjualan: UIPenjualan) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      return { action: 'view' as const, penjualan }
    }
    return null
  }, [])

  // Load data on mount
  useEffect(() => {
    loadPenjualan()
  }, [loadPenjualan])

  return {
    items,
    loading,
    sortedItems,
    sortState,
    activeRowId,
    deleteDialog,
    headerElevated,
    lastUpdatedAt,
    recentlyTouched,
    filters,
    page,
    statusOptions,
    metodeBayarOptions,
    kasirOptions,
    scrollAreaRef,
    rowRefs,
    toggleSort,
    resetFilters,
    setFilters,
    openDeleteDialog,
    closeDeleteDialog,
    handleDeleteConfirm,
    handleRowFocus,
    handleKeyNavigation,
    clearRecentlyTouched
  }
}