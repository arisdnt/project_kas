import { useMemo, useState } from 'react'
import { useProdukStore } from '@/features/produk/store/produkStore'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { Search, Plus } from 'lucide-react'
import { useKasirStore } from '@/features/kasir/store/kasirStore'

export function ProductQuickSearch() {
  const { items } = useProdukStore()
  const addProduct = useKasirStore((s) => s.addProduct)
  const [q, setQ] = useState('')

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return [] as typeof items
    return items.filter((p) =>
      (p.nama || '').toLowerCase().includes(term) || (p.sku || '').toLowerCase().includes(term),
    ).slice(0, 10)
  }, [items, q])

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari produk (nama / SKU)"
          className="pl-9"
        />
      </div>
      {q && (
        <div className="border border-gray-200 rounded-md max-h-64 overflow-auto">
          {results.length === 0 && (
            <div className="p-3 text-sm text-gray-500">Tidak ada hasil</div>
          )}
          {results.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50">
              <div>
                <div className="text-sm font-medium text-gray-900">{p.nama}</div>
                <div className="text-xs text-gray-500">SKU: {p.sku || '-'}</div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-700 font-medium">{formatCurrency(Number(p.harga || 0))}</div>
                <Button size="sm" onClick={() => addProduct(p)}>
                  <Plus className="h-4 w-4 mr-1" /> Tambah
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n)
}
