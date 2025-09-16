import { useEffect, useMemo, useRef, useState } from 'react'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { useProdukStore } from '@/features/produk/store/produkStore'
import { usePembelianStore } from '@/features/pembelian/store/pembelianStore'
import { Barcode, Search, RefreshCw } from 'lucide-react'

type Props = {
  onLoaded?: () => void
}

export function PembelianSearchForm({ onLoaded }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const [q, setQ] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const { items, loadFirst, loading } = useProdukStore()
  const addByBarcode = usePembelianStore((s) => s.addByBarcode)
  const addProduct = usePembelianStore((s) => s.addProduct)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  useEffect(() => {
    setSelectedIndex(-1)
  }, [q])

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return [] as typeof items
    return items
      .filter(
        (p) => (p.nama || '').toLowerCase().includes(term) || (p.sku || '').toLowerCase().includes(term),
      )
      .slice(0, 10)
  }, [items, q])

  const handleEnter = () => {
    const kode = q.trim()
    if (!kode) return

    if (selectedIndex >= 0 && selectedIndex < results.length) {
      addProduct(results[selectedIndex])
      setQ('')
      setSelectedIndex(-1)
      return
    }

    const beforeCount = usePembelianStore.getState().items.length
    addByBarcode(kode)
    const afterCount = usePembelianStore.getState().items.length
    if (afterCount > beforeCount) {
      setQ('')
      setSelectedIndex(-1)
      return
    }

    if (results.length > 0) {
      addProduct(results[0])
      setQ('')
      setSelectedIndex(-1)
      return
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleEnter()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        results.length > 0 ? Math.min(prev + 1, results.length - 1) : -1
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setQ('')
      setSelectedIndex(-1)
    }
  }

  const onLoadProduk = async () => {
    await loadFirst().catch(() => {})
    onLoaded?.()
    ref.current?.focus()
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            ref={ref}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKeyDown}
            // HAPUS refocus otomatis agar user bisa klik menu lain
            // onBlur sebelumnya memaksa fokus kembali sehingga dropdown/ menu lain tidak bisa dipilih
            placeholder="Pindai barcode atau cari produk (nama / SKU)"
            className="pl-9"
          />
        </div>
        <Button variant="secondary" onClick={onLoadProduk} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Muat Produk
        </Button>
      </div>

      <div className="flex items-center text-xs text-gray-500 gap-1">
        <Barcode className="h-3 w-3" />
        <span>Enter: tambahkan | ↑↓: navigasi | Esc: bersihkan</span>
      </div>

      {q && (
        <div className="border border-gray-200 rounded-md max-h-64 overflow-auto">
          {results.length === 0 && <div className="p-3 text-sm text-gray-500">Tidak ada hasil</div>}
          {results.map((p, index) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                addProduct(p)
                setQ('')
                setSelectedIndex(-1)
                ref.current?.focus()
              }}
              className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                index === selectedIndex 
                  ? 'bg-blue-50 border-l-4 border-blue-500' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div>
                <div className={`text-sm font-medium ${
                  index === selectedIndex ? 'text-blue-900' : 'text-gray-900'
                }`}>{p.nama}</div>
                <div className={`text-xs ${
                  index === selectedIndex ? 'text-blue-600' : 'text-gray-500'
                }`}>SKU: {p.sku || '-'} • Stok: {p.stok ?? 0}</div>
              </div>
              <div className={`text-sm font-medium ${
                index === selectedIndex ? 'text-blue-700' : 'text-gray-700'
              }`}>
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(p.hargaBeli || 0))}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

