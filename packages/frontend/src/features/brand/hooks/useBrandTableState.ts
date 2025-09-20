import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useBrandStore } from '@/features/brand/store/brandStore'
import type { UIBrand } from '@/features/brand/store/brandStore'
import {
  BrandFilters,
  BrandSortState,
  BrandSortableColumn,
  getBrandFilteredItems,
  getBrandSortedItems,
} from '@/features/brand/utils/tableUtils'

export function useBrandTableState() {
  const {
    items,
    loading,
    hasNext,
    loadFirst,
    loadNext,
    deleteBrand,
    page,
  } = useBrandStore()

  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({})

  const [sortState, setSortState] = useState<BrandSortState | null>({ column: 'nama', direction: 'asc' })
  const [filters, setFilters] = useState<BrandFilters>({})
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  const [headerElevated, setHeaderElevated] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    brand: UIBrand | null
    loading: boolean
  }>({ open: false, brand: null, loading: false })

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

  const filteredItems = useMemo(() => getBrandFilteredItems(items, filters), [items, filters])
  const sortedItems = useMemo(() => getBrandSortedItems(filteredItems, sortState), [filteredItems, sortState])

  useEffect(() => {
    if (sortedItems.length === 0) {
      setActiveRowId(null)
      return
    }
    if (!activeRowId || !sortedItems.some((item) => item.id === activeRowId)) {
      setActiveRowId(sortedItems[0].id)
    }
  }, [sortedItems, activeRowId])

  const toggleSort = (column: BrandSortableColumn) => {
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
    setFilters({})
  }

  const openDeleteDialog = (brand: UIBrand) => {
    setDeleteDialog({ open: true, brand, loading: false })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, brand: null, loading: false })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.brand) return { success: false, error: 'Brand tidak ditemukan.' as const }

    setDeleteDialog((prev) => ({ ...prev, loading: true }))
    try {
      await deleteBrand(deleteDialog.brand.id)
      return { success: true as const, brand: deleteDialog.brand }
    } catch (error: any) {
      setDeleteDialog((prev) => ({ ...prev, loading: false }))
      return {
        success: false as const,
        error: error?.message || 'Terjadi kesalahan saat menghapus brand.',
      }
    }
  }

  const handleRowFocus = (brand: UIBrand) => {
    setActiveRowId(brand.id)
  }

  const handleKeyNavigation = (event: KeyboardEvent<HTMLTableRowElement>, brand: UIBrand) => {
    const index = sortedItems.findIndex((item) => item.id === brand.id)
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
      return { action: 'view' as const, brand }
    }
    return null
  }

  const brandCount = items.length
  const filteredCount = filteredItems.length
  const logoStats = useMemo(() => {
    let withLogo = 0
    let withoutLogo = 0
    items.forEach((brand) => {
      if (brand.logo_url) withLogo += 1
      else withoutLogo += 1
    })
    return { withLogo, withoutLogo }
  }, [items])

  const websiteStats = useMemo(() => {
    let withWebsite = 0
    let withoutWebsite = 0
    items.forEach((brand) => {
      if (brand.website) withWebsite += 1
      else withoutWebsite += 1
    })
    return { withWebsite, withoutWebsite }
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
    brandCount,
    filteredCount,
    logoStats,
    websiteStats,

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
