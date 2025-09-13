import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { useRefDataStore } from '@/features/produk/store/refDataStore'
import { useProdukStore } from '@/features/produk/store/produkStore'
import { useAuthStore } from '@/core/store/authStore'
import { Plus, Search, X } from 'lucide-react'

type Props = {
  onCreate: () => void
}

export function ProdukToolbar({ onCreate }: Props) {
  const { kategori, brand, supplier, loadAll } = useRefDataStore()
  const { setSearch, setFilters, loadFirst } = useProdukStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [query, setQuery] = useState('')
  const [kategoriId, setKategoriId] = useState<number | undefined>()
  const [brandId, setBrandId] = useState<number | undefined>()
  const [supplierId, setSupplierId] = useState<number | undefined>()

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // Debounced search
  useEffect(() => {
    if (!isAuthenticated) return
    const id = setTimeout(() => {
      setSearch(query)
      setFilters({ kategoriId, brandId, supplierId })
      loadFirst()
    }, 350)
    return () => clearTimeout(id)
  }, [query, kategoriId, brandId, supplierId, setSearch, setFilters, loadFirst, isAuthenticated])

  const kategoriOpts = useMemo(() => [{ id: -1, nama: 'Semua Kategori' }, ...kategori], [kategori])
  const brandOpts = useMemo(() => [{ id: -1, nama: 'Semua Brand' }, ...brand], [brand])
  const supplierOpts = useMemo(() => [{ id: -1, nama: 'Semua Supplier' }, ...supplier], [supplier])

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3">
      <div className="flex-1 flex items-center gap-2">
        <div className="relative w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari nama, SKU, deskripsi..."
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
          value={kategoriId ?? -1}
          onChange={(e) => setKategoriId(Number(e.target.value) === -1 ? undefined : Number(e.target.value))}
        >
          {kategoriOpts.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nama}
            </option>
          ))}
        </select>

        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0"
          value={brandId ?? -1}
          onChange={(e) => setBrandId(Number(e.target.value) === -1 ? undefined : Number(e.target.value))}
        >
          {brandOpts.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nama}
            </option>
          ))}
        </select>

        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0"
          value={supplierId ?? -1}
          onChange={(e) => setSupplierId(Number(e.target.value) === -1 ? undefined : Number(e.target.value))}
        >
          {supplierOpts.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nama}
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
