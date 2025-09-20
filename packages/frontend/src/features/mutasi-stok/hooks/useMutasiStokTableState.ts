import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { useMutasiStokStore, UIMutasiStok } from '../store/mutasiStokStore'
import { useAuthStore } from '@/core/store/authStore'

export interface SortState {
  column: string | null
  direction: 'asc' | 'desc'
}

export interface FilterState {
  search: string
  jenisMutasi: string
  kategori: string
  brand: string
  tanggalMulai: string
  tanggalAkhir: string
}

interface DeleteDialog {
  open: boolean
  mutasiStok: UIMutasiStok | null
  loading: boolean
}

export function useMutasiStokTableState() {
  const {
    items,
    loading,
    lastUpdatedAt,
    recentlyTouched,
    loadMutasiStok,
    deleteMutasiStok,
    markRecentlyTouched
  } = useMutasiStokStore()

  const { user } = useAuthStore()
  const [sortState, setSortState] = useState<SortState>({ column: 'tanggalMutasi', direction: 'desc' })
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    jenisMutasi: 'all',
    kategori: 'all',
    brand: 'all',
    tanggalMulai: '',
    tanggalAkhir: ''
  })
  const [page, setPage] = useState(1)
  const [activeRowId, setActiveRowId] = useState<number | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialog>({
    open: false,
    mutasiStok: null,
    loading: false
  })
  const [headerElevated, setHeaderElevated] = useState(false)

  const scrollAreaRef = useRef<any>(null)
  const rowRefs = useRef<Record<number, HTMLElement | null>>({})

  // Filter options
  const jenisMutasiOptions = useMemo(() => [
    { label: 'Semua', value: 'all' },
    { label: 'Stok Masuk', value: 'masuk' },
    { label: 'Stok Keluar', value: 'keluar' }
  ], [])

  const kategoriOptions = useMemo(() => {
    const allKategori = Array.from(new Set(items.map(p => p.kategori?.nama).filter(Boolean)))
    return [
      { label: 'Semua Kategori', value: 'all' },
      ...allKategori.map(kategori => ({ label: kategori!, value: kategori! }))
    ]
  }, [items])

  const brandOptions = useMemo(() => {
    const allBrands = Array.from(new Set(items.map(p => p.brand?.nama).filter(Boolean)))
    return [
      { label: 'Semua Brand', value: 'all' },
      ...allBrands.map(brand => ({ label: brand!, value: brand! }))
    ]
  }, [items])

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return items.filter(mutasiStok => {
      if (filters.search) {
        const search = filters.search.toLowerCase()
        const matchesSearch =
          mutasiStok.namaProduk.toLowerCase().includes(search) ||
          (mutasiStok.sku?.toLowerCase().includes(search)) ||
          (mutasiStok.kategori?.nama.toLowerCase().includes(search)) ||
          (mutasiStok.brand?.nama.toLowerCase().includes(search)) ||
          (mutasiStok.keterangan?.toLowerCase().includes(search))
        if (!matchesSearch) return false
      }

      if (filters.jenisMutasi && filters.jenisMutasi !== 'all' && mutasiStok.jenisMutasi !== filters.jenisMutasi) return false
      if (filters.kategori && filters.kategori !== 'all' && mutasiStok.kategori?.nama !== filters.kategori) return false
      if (filters.brand && filters.brand !== 'all' && mutasiStok.brand?.nama !== filters.brand) return false

      if (filters.tanggalMulai && mutasiStok.tanggalMutasi && mutasiStok.tanggalMutasi < filters.tanggalMulai) return false
      if (filters.tanggalAkhir && mutasiStok.tanggalMutasi && mutasiStok.tanggalMutasi > filters.tanggalAkhir) return false

      return true
    })
  }, [items, filters])

  const sortedItems = useMemo(() => {
    if (!sortState.column) return filteredItems

    return [...filteredItems].sort((a, b) => {
      let aVal: any = a[sortState.column as keyof UIMutasiStok]
      let bVal: any = b[sortState.column as keyof UIMutasiStok]

      if (sortState.column === 'jumlah' || sortState.column === 'stokSebelum' || sortState.column === 'stokSesudah') {
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
      jenisMutasi: 'all',
      kategori: 'all',
      brand: 'all',
      tanggalMulai: '',
      tanggalAkhir: ''
    })
    setPage(1)
  }, [])

  const openDeleteDialog = useCallback((mutasiStok: UIMutasiStok) => {
    setDeleteDialog({ open: true, mutasiStok, loading: false })
  }, [])

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialog({ open: false, mutasiStok: null, loading: false })
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteDialog.mutasiStok) return { success: false, error: 'No item selected' }

    setDeleteDialog(prev => ({ ...prev, loading: true }))
    try {
      await deleteMutasiStok(deleteDialog.mutasiStok.id)
      return { success: true, mutasiStok: deleteDialog.mutasiStok }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Failed to delete' }
    } finally {
      setDeleteDialog(prev => ({ ...prev, loading: false }))
    }
  }, [deleteDialog.mutasiStok, deleteMutasiStok])

  const handleRowFocus = useCallback((mutasiStok: UIMutasiStok) => {
    setActiveRowId(mutasiStok.id)
  }, [])

  const handleKeyNavigation = useCallback((event: React.KeyboardEvent, mutasiStok: UIMutasiStok) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      return { action: 'view' as const, mutasiStok }
    }
    return null
  }, [])

  // Clear recently touched items after some time
  const clearRecentlyTouched = useCallback(() => {
    // This would be implemented in the store if needed
  }, [])

  // Load data on mount
  useEffect(() => {
    loadMutasiStok()
  }, [loadMutasiStok])

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.jenisMutasi && filters.jenisMutasi !== 'all') count++
    if (filters.kategori && filters.kategori !== 'all') count++
    if (filters.brand && filters.brand !== 'all') count++
    if (filters.tanggalMulai) count++
    if (filters.tanggalAkhir) count++
    return count
  }, [filters])

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
    activeFiltersCount,
    jenisMutasiOptions,
    kategoriOptions,
    brandOptions,
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
    clearRecentlyTouched,
    markRecentlyTouched
  }
}