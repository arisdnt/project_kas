import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { useRefDataStore } from '@/features/produk/store/refDataStore'
import { useMutasiStokStore } from '../store/mutasiStokStore'
import { Plus, Search, X, Calendar } from 'lucide-react'

type Props = {
  onCreate: () => void
}

export function MutasiStokToolbar({ onCreate }: Props) {
  const { kategori, brand, loadAll } = useRefDataStore()
  const { setSearch, setFilters, loadFirst } = useMutasiStokStore()
  const [query, setQuery] = useState('')
  const [kategoriId, setKategoriId] = useState<number | undefined>()
  const [brandId, setBrandId] = useState<number | undefined>()
  const [jenisMutasi, setJenisMutasi] = useState<'all' | 'masuk' | 'keluar'>('all')
  const [tanggal, setTanggal] = useState<string>('')

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // Debounced search
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(query)
      setFilters({ kategoriId, brandId, jenisMutasi, tanggal: tanggal || undefined })
      loadFirst()
    }, 350)
    return () => clearTimeout(id)
  }, [query, kategoriId, brandId, jenisMutasi, tanggal, setSearch, setFilters, loadFirst])

  const kategoriOpts = useMemo(() => [{ id: -1, nama: 'Semua Kategori' }, ...kategori], [kategori])
  const brandOpts = useMemo(() => [{ id: -1, nama: 'Semua Brand' }, ...brand], [brand])

  const jenisMutasiOpts = [
    { value: 'all', label: 'Semua Jenis' },
    { value: 'masuk', label: 'Stok Masuk' },
    { value: 'keluar', label: 'Stok Keluar' },
  ]

  return (
    <div className="flex flex-col lg:flex-row items-stretch gap-3">
      <div className="flex-1 flex items-center gap-2">
        <div className="relative w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari nama, SKU produk..."
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full lg:w-auto">
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
          value={jenisMutasi}
          onChange={(e) => setJenisMutasi(e.target.value as any)}
        >
          {jenisMutasiOpts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
        <div className="relative">
          <Calendar className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="date"
            placeholder="Tanggal"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="pl-9"
          />
        </div>

        <Button onClick={onCreate} className="whitespace-nowrap">
          <Plus className="h-4 w-4 mr-2" /> Mutasi Stok
        </Button>
      </div>
    </div>
  )
}