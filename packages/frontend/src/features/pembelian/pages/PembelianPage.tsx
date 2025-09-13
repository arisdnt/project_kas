import { useEffect, useRef } from 'react'
import { Card, CardContent } from '@/core/components/ui/card'
import { PembelianSearchForm } from '@/features/pembelian/components/PembelianSearchForm'
import { RestockTable } from '@/features/pembelian/components/RestockTable'
import { RestockSummary } from '@/features/pembelian/components/RestockSummary'
import { usePembelianStore } from '@/features/pembelian/store/pembelianStore'
import { useProdukStore } from '@/features/produk/store/produkStore'
import { Barcode } from 'lucide-react'

export function PembelianPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const items = usePembelianStore((s) => s.items)
  const clear = usePembelianStore((s) => s.clear)
  const loadFirst = useProdukStore((s) => s.loadFirst)
  const produkLoading = useProdukStore((s) => s.loading)
  const produkItems = useProdukStore((s) => s.items)

  useEffect(() => {
    if (!produkLoading && produkItems.length === 0) {
      loadFirst().catch(() => {})
    }
  }, [loadFirst, produkItems.length, produkLoading])

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case 'F1':
          e.preventDefault()
          ;(document.querySelector('input[placeholder*="barcode"]') as HTMLInputElement)?.focus()
          break
        case 'F2':
          e.preventDefault()
          loadFirst().catch(() => {})
          break
        case 'F9':
          e.preventDefault()
          if (items.length > 0 && confirm('Hapus semua item pembelian?')) {
            clear()
          }
          break
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [items.length, clear, loadFirst])

  return (
    <div 
      ref={containerRef}
      tabIndex={-1}
      className="flex flex-col min-h-0 h-[calc(100vh-4rem-3rem)] py-2 sm:py-3 overflow-hidden focus:outline-none"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Kolom kiri: pencarian & daftar pembelian */}
        <div className="lg:col-span-2 space-y-3 min-h-0">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-gray-700">
                <Barcode className="h-5 w-5" />
                <span className="font-medium">Cari / Scan Produk untuk Restok</span>
              </div>
              <PembelianSearchForm onLoaded={() => {}} />
            </CardContent>
          </Card>

          <Card className="min-h-0">
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Daftar Pembelian</h3>
                {items.length > 0 && (
                  <span className="text-sm text-gray-600">{items.length} item</span>
                )}
              </div>
              <div className="p-4">
                <RestockTable items={items} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom kanan: ringkasan */}
        <div className="space-y-3">
          <RestockSummary />

          <Card>
            <CardContent className="p-3">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Keyboard Shortcuts</h4>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between"><span>F1</span><span>Focus Pencarian</span></div>
                <div className="flex justify-between"><span>F2</span><span>Reload Produk</span></div>
                <div className="flex justify-between"><span>F9</span><span>Bersihkan Daftar</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

