import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { useProdukStore } from '@/features/produk/store/produkStore'
import { useAuthStore } from '@/core/store/authStore'
import { Plus, Search, X } from 'lucide-react'

type Props = {
  onCreate: () => void
}

export function ProdukToolbar({ onCreate }: Props) {
  const { items, setSearch, setFilters, loadFirst } = useProdukStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [query, setQuery] = useState('')
  const [kategoriFilter, setKategoriFilter] = useState<string | undefined>()
  const [brandFilter, setBrandFilter] = useState<string | undefined>()
  const [supplierFilter, setSupplierFilter] = useState<string | undefined>()

  // Generate unique values from loaded items
  const kategoriOptions = useMemo(() => {
    const unique = Array.from(new Set(items.map(item => item.kategori?.nama).filter(Boolean)))
    return [{ value: 'all', label: 'Semua Kategori' }, ...unique.map(nama => ({ value: nama!, label: nama! }))]
  }, [items])

  const brandOptions = useMemo(() => {
    const unique = Array.from(new Set(items.map(item => item.brand?.nama).filter(Boolean)))
    return [{ value: 'all', label: 'Semua Brand' }, ...unique.map(nama => ({ value: nama!, label: nama! }))]
  }, [items])

  const supplierOptions = useMemo(() => {
    const unique = Array.from(new Set(items.map(item => item.supplier?.nama).filter(Boolean)))
    return [{ value: 'all', label: 'Semua Supplier' }, ...unique.map(nama => ({ value: nama!, label: nama! }))]
  }, [items])

  // Debounced search & filters
  useEffect(() => {
    if (!isAuthenticated) return
    const id = setTimeout(() => {
      setSearch(query)
      setFilters({
        kategoriFilter: kategoriFilter === 'all' ? undefined : kategoriFilter,
        brandFilter: brandFilter === 'all' ? undefined : brandFilter,
        supplierFilter: supplierFilter === 'all' ? undefined : supplierFilter
      })
      loadFirst()
    }, 250)
    return () => clearTimeout(id)
  }, [query, kategoriFilter, brandFilter, supplierFilter, setSearch, setFilters, loadFirst, isAuthenticated])

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3">
      <div className="flex-1 flex items-center gap-2">
        <div className="relative w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari nama produk atau kode..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 w-full sm:w-auto">
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0"
          value={kategoriFilter ?? 'all'}
          onChange={(e) => setKategoriFilter(e.target.value === 'all' ? undefined : e.target.value)}
        >
          {kategoriOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0"
          value={brandFilter ?? 'all'}
          onChange={(e) => setBrandFilter(e.target.value === 'all' ? undefined : e.target.value)}
        >
          {brandOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0"
          value={supplierFilter ?? 'all'}
          onChange={(e) => setSupplierFilter(e.target.value === 'all' ? undefined : e.target.value)}
        >
          {supplierOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center">
        <Button onClick={onCreate} className="whitespace-nowrap">
          <Plus className="h-4 w-4 mr-2" /> Tambah Produk
        </Button>
      </div>
    </div>
  )
}
