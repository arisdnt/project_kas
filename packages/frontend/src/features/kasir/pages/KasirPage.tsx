import { useEffect, useRef } from 'react'
import { Card, CardContent } from '@/core/components/ui/card'
import { CartTable } from '@/features/kasir/components/CartTable'
import { ProductSearchForm } from '@/features/kasir/components/ProductSearchForm'
import { PaymentSummary } from '@/features/kasir/components/PaymentSummary'
import { useKasirStore } from '@/features/kasir/store/kasirStore'
import { useProdukStore } from '@/features/produk/store/produkStore'
import { useAuthStore } from '@/core/store/authStore'
import { Barcode } from 'lucide-react'

export function KasirPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const items = useKasirStore((s) => s.items)
  const clearCart = useKasirStore((s) => s.clear)
  const loadFirst = useProdukStore((s) => s.loadFirst)
  const produkLoading = useProdukStore((s) => s.loading)
  const produkItems = useProdukStore((s) => s.items)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    // Load produk minimal untuk kebutuhan pencarian lokal (nama/SKU)
    if (isAuthenticated && !produkLoading && produkItems.length === 0) {
      loadFirst().catch(() => {})
    }
  }, [isAuthenticated, loadFirst, produkItems.length, produkLoading])

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Jangan handle jika sedang mengetik di input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case 'F1':
          e.preventDefault()
          // Focus ke search input
          const searchInput = document.querySelector('input[placeholder*="barcode"]') as HTMLInputElement
          searchInput?.focus()
          break
        case 'F2':
          e.preventDefault()
          // Reload produk
          loadFirst().catch(() => {})
          break
        case 'F9':
          e.preventDefault()
          // Clear cart dengan konfirmasi
          if (items.length > 0 && confirm('Hapus semua item dari keranjang?')) {
            clearCart()
          }
          break
        case 'F12':
          e.preventDefault()
          // Focus ke payment summary (untuk proses pembayaran)
          const paymentButton = document.querySelector('[data-payment-button]') as HTMLButtonElement
          paymentButton?.focus()
          break
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [items.length, clearCart, loadFirst])

  return (
    <div 
      ref={containerRef}
      tabIndex={-1}
      className="flex flex-col min-h-0 h-[calc(100vh-4rem-3rem)] py-2 sm:py-3 overflow-hidden focus:outline-none"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Kolom kiri: pencarian & keranjang */}
        <div className="lg:col-span-2 space-y-3 min-h-0">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-gray-700">
                <Barcode className="h-5 w-5" />
                <span className="font-medium">Cari / Scan Produk</span>
              </div>
              <ProductSearchForm onLoaded={() => {}} />
            </CardContent>
          </Card>

          <Card className="min-h-0">
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Keranjang</h3>
                {items.length > 0 && (
                  <span className="text-sm text-gray-600">{items.length} item</span>
                )}
              </div>
              <div className="p-4">
                <CartTable items={items} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom kanan: ringkasan pembayaran */}
        <div className="space-y-3">
          <PaymentSummary />
        </div>
      </div>
    </div>
  )
}
