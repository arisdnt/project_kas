import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { useProdukStore } from '@/features/produk/store/produkStore'
import { useAuthStore } from '@/core/store/authStore'
import { Plus, Search, X, RotateCcw } from 'lucide-react'
import { CategoryFilter } from './CategoryFilter'
import { BrandFilter } from './BrandFilter'
import { SupplierFilter } from './SupplierFilter'
import { StatusFilter } from './StatusFilter'

type Props = {
  onCreate: () => void
}

export function ProdukToolbar({ onCreate }: Props) {
  const {
    items,
    categories,
    brands,
    suppliers,
    filters,
    setSearch,
    setFilters,
    loadFirst,
  } = useProdukStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [query, setQuery] = useState('')

  const categoryOptions = useMemo(() => {
    const master = categories.map((c) => c.nama).filter(Boolean)
    if (master.length > 0) return Array.from(new Set(master)) as string[]
    return Array.from(
      new Set(
        items
          .map((item) => item.kategori?.nama)
          .filter((nama): nama is string => Boolean(nama)),
      ),
    )
  }, [categories, items])

  const brandOptions = useMemo(() => {
    const master = brands.map((b) => b.nama).filter(Boolean)
    if (master.length > 0) return Array.from(new Set(master)) as string[]
    return Array.from(
      new Set(
        items
          .map((item) => item.brand?.nama)
          .filter((nama): nama is string => Boolean(nama)),
      ),
    )
  }, [brands, items])

  const supplierOptions = useMemo(() => {
    const master = suppliers.map((s) => s.nama).filter(Boolean)
    if (master.length > 0) return Array.from(new Set(master)) as string[]
    return Array.from(
      new Set(
        items
          .map((item) => item.supplier?.nama)
          .filter((nama): nama is string => Boolean(nama)),
      ),
    )
  }, [suppliers, items])

  // Debounced global search synced dengan store & backend
  useEffect(() => {
    if (!isAuthenticated) return
    const id = setTimeout(() => {
      setSearch(query)
      loadFirst()
    }, 250)
    return () => clearTimeout(id)
  }, [query, setSearch, loadFirst, isAuthenticated])

  const handleClear = () => {
    setQuery('')
  }

  const handleCategoryChange = (value?: string[]) => {
    setFilters({ kategori: value })
  }

  const handleBrandChange = (value?: string[]) => {
    setFilters({ brand: value })
  }

  const handleSupplierChange = (value?: string[]) => {
    setFilters({ supplier: value })
  }

  const handleStatusChange = (value?: ('aktif' | 'tidak aktif')[]) => {
    setFilters({ status: value })
  }

  const resetFilters = () => {
    setFilters({
      kategori: undefined,
      brand: undefined,
      supplier: undefined,
      status: undefined,
    })
  }

  const hasActiveFilters = filters.kategori?.length || filters.brand?.length || filters.supplier?.length || filters.status?.length

  return (
    <div className="space-y-3">
      {/* First Row: Search, Filters, and Add Button */}
      <div className="flex w-full items-center gap-2">
        {/* Search Form - 40% */}
        <div className="relative w-[40%]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Cari nama produk atau kode"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 rounded-lg border-slate-200 pl-9 text-[13px] w-full"
            aria-label="Cari produk"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100"
              aria-label="Kosongkan pencarian"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Buttons - 50% */}
        <div className="flex w-[50%] items-center gap-2">
          <div className="flex-1">
            <CategoryFilter
              value={filters.kategori}
              options={categoryOptions}
              onChange={handleCategoryChange}
            />
          </div>

          <div className="flex-1">
            <BrandFilter
              value={filters.brand}
              options={brandOptions}
              onChange={handleBrandChange}
            />
          </div>

          <div className="flex-1">
            <SupplierFilter
              value={filters.supplier}
              options={supplierOptions}
              onChange={handleSupplierChange}
            />
          </div>

          <div className="flex-1">
            <StatusFilter
              value={filters.status}
              onChange={handleStatusChange}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="h-9 gap-1 rounded-lg px-3 text-[13px] border-red-200 text-red-600 hover:bg-red-50"
            aria-label="Bersihkan filter"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Reset</span>
          </Button>
        </div>

        {/* Add Button - 10% */}
        <div className="w-[10%]">
          <Button onClick={onCreate} size="sm" className="h-9 gap-1 rounded-lg px-2 text-[13px] w-full">
            <Plus className="h-4 w-4" />
            <span className="hidden xl:inline">Tambah</span>
          </Button>
        </div>
      </div>

      {/* Second Row: Live Update Info and Active Filters */}
      <div className="flex w-full items-center gap-4">
        {/* Live Update Info - 40% */}
        <div className="w-[40%]">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
              <span className="relative flex h-2 w-2 items-center justify-center">
                <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live {new Date().toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </div>
            <span>Halaman 1</span>
            <span>Menampilkan 1 dari 25 produk</span>
          </div>
        </div>

        {/* Active Filters - 60% */}
        <div className="w-[60%]">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            {filters.kategori?.length && (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 font-medium text-blue-600">
                Kategori: {filters.kategori.join(', ')}
              </span>
            )}
            {filters.brand?.length && (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 font-medium text-blue-600">
                Brand: {filters.brand.join(', ')}
              </span>
            )}
            {filters.supplier?.length && (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 font-medium text-blue-600">
                Supplier: {filters.supplier.join(', ')}
              </span>
            )}
            {filters.status?.length && (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 font-medium text-blue-600">
                Status: {filters.status.join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
