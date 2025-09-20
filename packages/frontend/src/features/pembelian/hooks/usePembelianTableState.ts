import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { usePembelianStore, UIPembelian } from '../store/pembelianStore'
import { useAuthStore } from '@/core/store/authStore'

export interface SortState {
  column: string | null
  direction: 'asc' | 'desc'
}

export interface FilterState {
  search: string
  status: string
  statusPembayaran: string
  supplier: string
  tanggalMulai: string
  tanggalAkhir: string
}

interface DeleteDialog {
  open: boolean
  pembelian: UIPembelian | null
  loading: boolean
}

export function usePembelianTableState() {
  const {
    items,
    loading,
    lastUpdatedAt,
    recentlyTouched,
    loadPembelian,
    deletePembelian,
    clearRecentlyTouched
  } = usePembelianStore()

  const { user } = useAuthStore()
  const [sortState, setSortState] = useState<SortState>({ column: 'tanggal', direction: 'desc' })
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    statusPembayaran: '',
    supplier: '',
    tanggalMulai: '',
    tanggalAkhir: ''
  })
  const [page, setPage] = useState(1)
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialog>({
    open: false,
    pembelian: null,
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

  const statusPembayaranOptions = useMemo(() => {
    const allStatuses = Array.from(new Set(items.map(p => p.statusPembayaran).filter(Boolean)))
    return allStatuses.map(status => ({ label: status, value: status }))
  }, [items])

  const supplierOptions = useMemo(() => {
    const allSuppliers = Array.from(new Set(items.map(p => p.supplierNama).filter(Boolean)))
    return allSuppliers.map(supplier => ({ label: supplier!, value: supplier! }))
  }, [items])

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return items.filter(pembelian => {
      if (filters.search) {
        const search = filters.search.toLowerCase()
        const matchesSearch =
          pembelian.nomorTransaksi.toLowerCase().includes(search) ||
          (pembelian.nomorPO?.toLowerCase().includes(search)) ||
          (pembelian.supplierNama?.toLowerCase().includes(search)) ||
          (pembelian.pembeliNama?.toLowerCase().includes(search))
        if (!matchesSearch) return false
      }

      if (filters.status && pembelian.status !== filters.status) return false
      if (filters.statusPembayaran && pembelian.statusPembayaran !== filters.statusPembayaran) return false
      if (filters.supplier && pembelian.supplierNama !== filters.supplier) return false

      if (filters.tanggalMulai && pembelian.tanggal < filters.tanggalMulai) return false
      if (filters.tanggalAkhir && pembelian.tanggal > filters.tanggalAkhir) return false

      return true
    })
  }, [items, filters])

  const sortedItems = useMemo(() => {
    if (!sortState.column) return filteredItems

    return [...filteredItems].sort((a, b) => {
      let aVal: any = a[sortState.column as keyof UIPembelian]
      let bVal: any = b[sortState.column as keyof UIPembelian]

      if (sortState.column === 'total' || sortState.column === 'subtotal') {
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
      statusPembayaran: '',
      supplier: '',
      tanggalMulai: '',
      tanggalAkhir: ''
    })
    setPage(1)
  }, [])

  const openDeleteDialog = useCallback((pembelian: UIPembelian) => {
    setDeleteDialog({ open: true, pembelian, loading: false })
  }, [])

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialog({ open: false, pembelian: null, loading: false })
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteDialog.pembelian) return { success: false, error: 'No item selected' }

    setDeleteDialog(prev => ({ ...prev, loading: true }))
    try {
      await deletePembelian(deleteDialog.pembelian.id)
      return { success: true, pembelian: deleteDialog.pembelian }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Failed to delete' }
    } finally {
      setDeleteDialog(prev => ({ ...prev, loading: false }))
    }
  }, [deleteDialog.pembelian, deletePembelian])

  const handleRowFocus = useCallback((pembelian: UIPembelian) => {
    setActiveRowId(pembelian.id)
  }, [])

  const handleKeyNavigation = useCallback((event: React.KeyboardEvent, pembelian: UIPembelian) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      return { action: 'view' as const, pembelian }
    }
    return null
  }, [])

  // Load data on mount
  useEffect(() => {
    loadPembelian()
  }, [loadPembelian])

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
    statusPembayaranOptions,
    supplierOptions,
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