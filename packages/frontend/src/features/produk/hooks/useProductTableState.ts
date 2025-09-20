import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useProdukStore, UIProduk } from '@/features/produk/store/produkStore'
import { SortableColumn, SortState, getSortedItems, getFilteredItems } from '@/features/produk/utils/tableUtils'

export function useProductTableState() {
  const {
    items,
    loading,
    hasNext,
    loadNext,
    loadFirst,
    deleteProduk,
    categories,
    brands,
    suppliers,
    filters,
    search,
    page,
    setFilters,
  } = useProdukStore()

  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const rowRefs = useRef<Record<number, HTMLTableRowElement | null>>({})

  const [sortState, setSortState] = useState<SortState | null>(null)
  const [activeRowId, setActiveRowId] = useState<number | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    product: UIProduk | null
    loading: boolean
  }>({ open: false, product: null, loading: false })
  const [headerElevated, setHeaderElevated] = useState(false)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number>(() => Date.now())
  const previousItemsRef = useRef<Map<number, UIProduk>>(new Map())
  const touchTimeouts = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const [recentlyTouched, setRecentlyTouched] = useState<Record<number, 'new' | 'updated'>>({})

  useEffect(() => {
    loadFirst()
  }, [filters, loadFirst])

  useEffect(() => {
    return () => {
      Object.values(touchTimeouts.current).forEach(clearTimeout)
    }
  }, [])

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
  }, [page, search, filters])

  useEffect(() => {
    const prevMap = previousItemsRef.current
    const nextMap = new Map<number, UIProduk>()
    const touched: Record<number, 'new' | 'updated'> = {}

    items.forEach((item) => {
      nextMap.set(item.id, item)
      const prev = prevMap.get(item.id)
      if (!prev) {
        touched[item.id] = 'new'
        return
      }
      if (
        prev.stok !== item.stok ||
        prev.harga !== item.harga ||
        prev.hargaBeli !== item.hargaBeli ||
        prev.status !== item.status
      ) {
        touched[item.id] = 'updated'
      }
    })

    if (prevMap.size !== nextMap.size) {
      setLastUpdatedAt(Date.now())
    }

    if (Object.keys(touched).length > 0) {
      setLastUpdatedAt(Date.now())
      setRecentlyTouched((prev) => ({ ...prev, ...touched }))
      Object.keys(touched).forEach((idStr) => {
        const id = Number(idStr)
        if (touchTimeouts.current[id]) {
          clearTimeout(touchTimeouts.current[id])
        }
        touchTimeouts.current[id] = setTimeout(() => {
          setRecentlyTouched((prevState) => {
            const next = { ...prevState }
            delete next[id]
            return next
          })
          delete touchTimeouts.current[id]
        }, 3200)
      })
    }

    previousItemsRef.current = nextMap
  }, [items])

  const filteredItems = useMemo(() => getFilteredItems(items, filters), [items, filters])

  const categoryOptions = useMemo(() => {
    if (categories.length > 0) {
      return Array.from(new Set(categories.map((c) => c.nama))).filter(Boolean)
    }
    return Array.from(
      new Set(items.map((item) => item.kategori?.nama).filter((nama): nama is string => Boolean(nama))),
    )
  }, [categories, items])

  const brandOptions = useMemo(() => {
    if (brands.length > 0) {
      return Array.from(new Set(brands.map((b) => b.nama))).filter(Boolean)
    }
    return Array.from(
      new Set(items.map((item) => item.brand?.nama).filter((nama): nama is string => Boolean(nama))),
    )
  }, [brands, items])

  const supplierOptions = useMemo(() => {
    if (suppliers.length > 0) {
      return Array.from(new Set(suppliers.map((s) => s.nama))).filter(Boolean)
    }
    return Array.from(
      new Set(items.map((item) => item.supplier?.nama).filter((nama): nama is string => Boolean(nama))),
    )
  }, [suppliers, items])

  const sortedItems = useMemo(() => getSortedItems(filteredItems, sortState), [filteredItems, sortState])

  useEffect(() => {
    if (sortedItems.length === 0) {
      setActiveRowId(null)
      return
    }
    if (!activeRowId || !sortedItems.some((item) => item.id === activeRowId)) {
      setActiveRowId(sortedItems[0].id)
    }
  }, [sortedItems, activeRowId])

  const toggleSort = (column: SortableColumn) => {
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
    setFilters({}, { replace: true })
  }

  const openDeleteDialog = (product: UIProduk) => {
    setDeleteDialog({ open: true, product, loading: false })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, product: null, loading: false })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.product) return
    setDeleteDialog((prev) => ({ ...prev, loading: true }))
    try {
      await deleteProduk(deleteDialog.product.id)
      return { success: true, product: deleteDialog.product }
    } catch (error: any) {
      setDeleteDialog((prev) => ({ ...prev, loading: false }))
      return { success: false, error: error?.message || 'Terjadi kesalahan saat menghapus produk.' }
    }
  }

  const handleRowFocus = (product: UIProduk) => {
    setActiveRowId(product.id)
  }

  const handleKeyNavigation = (event: KeyboardEvent<HTMLTableRowElement>, product: UIProduk) => {
    const currentIndex = sortedItems.findIndex((item) => item.id === product.id)
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const next = sortedItems[currentIndex + 1]
      if (next) {
        setActiveRowId(next.id)
        rowRefs.current[next.id]?.focus()
      }
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const prev = sortedItems[currentIndex - 1]
      if (prev) {
        setActiveRowId(prev.id)
        rowRefs.current[prev.id]?.focus()
      }
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      return { action: 'view', product }
    }
    return null
  }

  return {
    // State
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
    categoryOptions,
    brandOptions,
    supplierOptions,

    // Refs
    scrollAreaRef,
    rowRefs,

    // Actions
    toggleSort,
    resetFilters,
    setFilters,
    openDeleteDialog,
    closeDeleteDialog,
    handleDeleteConfirm,
    handleRowFocus,
    handleKeyNavigation,
  }
}