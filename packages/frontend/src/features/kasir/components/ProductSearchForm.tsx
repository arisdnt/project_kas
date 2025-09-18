import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { useProdukStore } from '@/features/produk/store/produkStore'
import { useKasirStore } from '@/features/kasir/store/kasirStore'
import { ProdukKasir } from '@/features/kasir/services/kasirService'
import { Barcode, Search, RefreshCw } from 'lucide-react'

type Props = {
  onLoaded?: () => void
}

export function ProductSearchForm({ onLoaded }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [q, setQ] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [kasirProducts, setKasirProducts] = useState<ProdukKasir[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { items, loadFirst, loading } = useProdukStore()
  const { addByBarcode, addProduct, searchProducts, scanBarcode } = useKasirStore()

  useEffect(() => {
    // Fokus agar siap scan; tetap fokus meski blur tak sengaja
    ref.current?.focus()
  }, [])

  useEffect(() => {
    // Reset selected index saat query berubah
    setSelectedIndex(-1)
  }, [q])

  // Search kasir products via API with debounce
  useEffect(() => {
    const searchKasirProducts = async () => {
      const term = q.trim()
      if (!term) {
        setKasirProducts([])
        return
      }

      setIsSearching(true)
      try {
        const products = await searchProducts(term)
        setKasirProducts(products)
      } catch (error) {
        console.error('Failed to search kasir products:', error)
        setKasirProducts([])
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchKasirProducts, 300)
    return () => clearTimeout(debounceTimer)
  }, [q, searchProducts])

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return [] as (typeof items | ProdukKasir[])

    // Prioritize kasir API results
    if (kasirProducts.length > 0) {
      return kasirProducts.slice(0, 10)
    }

    // Fallback to local produk store
    return items
      .filter(
        (p) => (p.nama || '').toLowerCase().includes(term) || (p.sku || '').toLowerCase().includes(term),
      )
      .slice(0, 10)
  }, [items, kasirProducts, q])

  const handleEnter = async () => {
    const kode = q.trim()
    if (!kode) return

    // Jika ada item yang dipilih dengan arrow keys, tambahkan item tersebut
    if (selectedIndex >= 0 && selectedIndex < results.length) {
      await addProduct(results[selectedIndex])
      setQ('')
      setSelectedIndex(-1)
      return
    }

    // 1) Try kasir barcode scan API first
    try {
      const scannedProduct = await scanBarcode(kode)
      if (scannedProduct) {
        await addProduct(scannedProduct)
        setQ('')
        setSelectedIndex(-1)
        return
      }
    } catch (error) {
      console.error('Barcode scan failed:', error)
    }

    // 2) Fallback to local barcode search
    const beforeCount = useKasirStore.getState().items.length
    await addByBarcode(kode)
    const afterCount = useKasirStore.getState().items.length
    if (afterCount > beforeCount) {
      setQ('')
      setSelectedIndex(-1)
      return
    }

    // 3) Jika tidak ketemu SKU, dan hasil pencarian ada, ambil yang pertama
    if (results.length > 0) {
      await addProduct(results[0])
      setQ('')
      setSelectedIndex(-1)
      return
    }
  }

  const scrollToSelected = useCallback((index: number) => {
    if (!dropdownRef.current || index < 0 || index >= results.length) return
    
    const dropdown = dropdownRef.current
    const items = dropdown.querySelectorAll('button')
    const selectedItem = items[index] as HTMLElement
    
    if (selectedItem) {
      const dropdownRect = dropdown.getBoundingClientRect()
      const itemRect = selectedItem.getBoundingClientRect()
      
      if (itemRect.top < dropdownRect.top) {
        dropdown.scrollTop -= dropdownRect.top - itemRect.top
      } else if (itemRect.bottom > dropdownRect.bottom) {
        dropdown.scrollTop += itemRect.bottom - dropdownRect.bottom
      }
    }
  }, [results.length])

  useEffect(() => {
    if (selectedIndex >= 0) {
      scrollToSelected(selectedIndex)
    }
  }, [selectedIndex, scrollToSelected])

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
            placeholder="Pindai barcode atau cari produk (nama / SKU)"
            className="pl-9"
          />
          {/* Hasil pencarian sebagai dropdown overlay */}
          {q && (
            <div 
              ref={dropdownRef}
              className="absolute z-20 left-0 right-0 top-full mt-1 rounded-md border border-gray-200 bg-white shadow-xl max-h-72 overflow-auto" 
              role="listbox"
            >
              {isSearching && <div className="p-3 text-sm text-gray-500">Mencari...</div>}
              {!isSearching && results.length === 0 && <div className="p-3 text-sm text-gray-500">Tidak ada hasil</div>}
              {results.map((p, index) => (
                <button
                  key={p.id}
                  type="button"
                  role="option"
                  aria-selected={index === selectedIndex}
                  onClick={async () => {
                    await addProduct(p)
                    setQ('')
                    setSelectedIndex(-1)
                    ref.current?.focus()
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                    index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <div className={`text-sm font-medium ${index === selectedIndex ? 'text-blue-900' : 'text-gray-900'}`}>{p.nama}</div>
                    <div className={`text-xs ${index === selectedIndex ? 'text-blue-600' : 'text-gray-500'}`}>
                      {'barcode' in p ? `Barcode: ${p.barcode || '-'}` : `SKU: ${p.sku || '-'}`}
                      {'stok' in p && ` | Stok: ${p.stok}`}
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${index === selectedIndex ? 'text-blue-700' : 'text-gray-700'}`}>
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(p.harga || 0))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <Button variant="secondary" onClick={onLoadProduk} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Muat Produk
        </Button>
      </div>

      {/* Bantuan visual: menandai bahwa input menerima scan */}
      <div className="flex items-center text-xs text-gray-500 gap-1">
        <Barcode className="h-3 w-3" />
        <span>Enter: tambahkan | ↑↓: navigasi | Esc: bersihkan</span>
      </div>

      {/* Dropdown overlay dipindahkan ke dalam container input untuk mencegah layout shift */}
    </div>
  )
}
