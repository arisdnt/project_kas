import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { useStokOpnameStoreNew, UIStokOpname } from '../store/stokOpnameStoreNew'
import { useAuthStore } from '@/core/store/authStore'

export interface SortState {
  column: string | null
  direction: 'asc' | 'desc'
}

export interface FilterState {
  search: string
  status: string
  kategori: string
  brand: string
  supplier: string
  tanggalMulai: string
  tanggalAkhir: string
}

interface DeleteDialog {
  open: boolean
  stokOpname: UIStokOpname | null
  loading: boolean
}

export function useStokOpnameTableState() {
  const {
    items,
    loading,
    lastUpdatedAt,
    recentlyTouched,
    loadStokOpname,
    deleteStokOpname,
    clearRecentlyTouched
  } = useStokOpnameStoreNew()

  const { user } = useAuthStore()
  const [sortState, setSortState] = useState<SortState>({ column: 'tanggalOpname', direction: 'desc' })
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    kategori: '',
    brand: '',
    supplier: '',
    tanggalMulai: '',
    tanggalAkhir: ''
  })
  const [page, setPage] = useState(1)
  const [activeRowId, setActiveRowId] = useState<number | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialog>({
    open: false,
    stokOpname: null,
    loading: false
  })
  const [headerElevated, setHeaderElevated] = useState(false)

  const scrollAreaRef = useRef<any>(null)
  const rowRefs = useRef<Record<number, HTMLElement | null>>({})

  // Filter options
  const statusOptions = useMemo(() => {
    const allStatuses = Array.from(new Set(items.map(p => p.status).filter(Boolean)))
    return allStatuses.map(status => ({
      label: status === 'pending' ? 'Pending' : status === 'completed' ? 'Selesai' : status === 'cancelled' ? 'Dibatalkan' : status,
      value: status
    }))
  }, [items])

  const kategoriOptions = useMemo(() => {
    const allKategori = Array.from(new Set(items.map(p => p.kategori?.nama).filter(Boolean)))
    return allKategori.map(kategori => ({ label: kategori!, value: kategori! }))
  }, [items])

  const brandOptions = useMemo(() => {
    const allBrands = Array.from(new Set(items.map(p => p.brand?.nama).filter(Boolean)))
    return allBrands.map(brand => ({ label: brand!, value: brand! }))
  }, [items])

  const supplierOptions = useMemo(() => {
    const allSuppliers = Array.from(new Set(items.map(p => p.supplier?.nama).filter(Boolean)))
    return allSuppliers.map(supplier => ({ label: supplier!, value: supplier! }))
  }, [items])

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return items.filter(stokOpname => {
      if (filters.search) {
        const search = filters.search.toLowerCase()
        const matchesSearch =
          stokOpname.namaProduk.toLowerCase().includes(search) ||
          (stokOpname.sku?.toLowerCase().includes(search)) ||
          (stokOpname.kategori?.nama.toLowerCase().includes(search)) ||
          (stokOpname.brand?.nama.toLowerCase().includes(search))
        if (!matchesSearch) return false
      }

      if (filters.status && stokOpname.status !== filters.status) return false
      if (filters.kategori && stokOpname.kategori?.nama !== filters.kategori) return false
      if (filters.brand && stokOpname.brand?.nama !== filters.brand) return false
      if (filters.supplier && stokOpname.supplier?.nama !== filters.supplier) return false

      if (filters.tanggalMulai && stokOpname.tanggalOpname && stokOpname.tanggalOpname < filters.tanggalMulai) return false
      if (filters.tanggalAkhir && stokOpname.tanggalOpname && stokOpname.tanggalOpname > filters.tanggalAkhir) return false

      return true
    })
  }, [items, filters])

  const sortedItems = useMemo(() => {
    if (!sortState.column) return filteredItems

    return [...filteredItems].sort((a, b) => {
      let aVal: any = a[sortState.column as keyof UIStokOpname]
      let bVal: any = b[sortState.column as keyof UIStokOpname]

      if (sortState.column === 'stokSistem' || sortState.column === 'stokFisik' || sortState.column === 'selisih') {
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
      kategori: '',
      brand: '',
      supplier: '',
      tanggalMulai: '',
      tanggalAkhir: ''
    })
    setPage(1)
  }, [])

  const openDeleteDialog = useCallback((stokOpname: UIStokOpname) => {
    setDeleteDialog({ open: true, stokOpname, loading: false })
  }, [])

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialog({ open: false, stokOpname: null, loading: false })
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteDialog.stokOpname) return { success: false, error: 'No item selected' }

    setDeleteDialog(prev => ({ ...prev, loading: true }))
    try {
      await deleteStokOpname(deleteDialog.stokOpname.id)
      return { success: true, stokOpname: deleteDialog.stokOpname }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Failed to delete' }
    } finally {
      setDeleteDialog(prev => ({ ...prev, loading: false }))
    }
  }, [deleteDialog.stokOpname, deleteStokOpname])

  const handleRowFocus = useCallback((stokOpname: UIStokOpname) => {
    setActiveRowId(stokOpname.id)
  }, [])

  const handleKeyNavigation = useCallback((event: React.KeyboardEvent, stokOpname: UIStokOpname) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      return { action: 'view' as const, stokOpname }
    }
    return null
  }, [])

  // Load data on mount
  useEffect(() => {
    loadStokOpname()
  }, [loadStokOpname])

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
    kategoriOptions,
    brandOptions,
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