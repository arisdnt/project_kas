import { useEffect, useRef, useCallback, useState } from 'react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { CartTable } from '@/features/kasir/components/CartTable'
import { ProductSearchForm } from '@/features/kasir/components/ProductSearchForm'
import { PaymentSummary } from '@/features/kasir/components/PaymentSummary'
import { TransactionDraftsModal } from '@/features/kasir/components/TransactionDraftsModal'
import { SaveDraftModal } from '@/features/kasir/components/SaveDraftModal'
import { useKasirStore } from '@/features/kasir/store/kasirStore'
import { useProdukStore } from '@/features/produk/store/produkStore'
import { useAuthStore } from '@/core/store/authStore'
import { useTransactionDrafts } from '@/features/kasir/hooks/useTransactionDrafts'
import { Barcode, Save, FileText } from 'lucide-react'
import { useDataRefresh } from '@/core/hooks/useDataRefresh'
import { useToast } from '@/core/hooks/use-toast'

export function KasirPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showDraftsModal, setShowDraftsModal] = useState(false)
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false)

  const items = useKasirStore((s) => s.items)
  const clearCart = useKasirStore((s) => s.clear)
  const pelanggan = useKasirStore((s) => s.pelanggan)
  const metode = useKasirStore((s) => s.metode)
  const bayar = useKasirStore((s) => s.bayar)
  const discountType = useKasirStore((s) => s.discountType)
  const discountValue = useKasirStore((s) => s.discountValue)
  const loadDraftState = useKasirStore((s) => s.loadDraftState)

  const loadFirst = useProdukStore((s) => s.loadFirst)
  const produkLoading = useProdukStore((s) => s.loading)
  const produkItems = useProdukStore((s) => s.items)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // Draft hooks
  const {
    drafts,
    isLoading: draftsLoading,
    saveDraft,
    deleteDraft,
    duplicateDraft
  } = useTransactionDrafts()

  const { toast } = useToast()

  // Refresh handler untuk navbar refresh button
  const handleRefresh = useCallback(async () => {
    await loadFirst()
  }, [loadFirst])

  // Hook untuk menangani refresh data
  useDataRefresh(handleRefresh)

  // Handler untuk menyimpan draft
  const handleSaveDraft = (data: { name: string; notes?: string }) => {
    try {
      saveDraft({
        name: data.name,
        items: items,
        pelanggan: pelanggan,
        metode: metode,
        bayar: bayar,
        discountType: discountType,
        discountValue: discountValue,
        notes: data.notes
      })

      toast({
        title: '✅ Draft tersimpan',
        description: `Draft "${data.name}" berhasil disimpan`,
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: '❌ Gagal menyimpan draft',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan tidak terduga',
        variant: 'destructive',
        duration: 5000,
      })
    }
  }

  // Handler untuk memuat draft
  const handleLoadDraft = (draft: any) => {
    loadDraftState({
      items: draft.items,
      pelanggan: draft.pelanggan,
      metode: draft.metode,
      bayar: draft.bayar,
      discountType: draft.discountType,
      discountValue: draft.discountValue
    })

    toast({
      title: '✅ Draft dimuat',
      description: `Draft "${draft.name}" berhasil dimuat ke keranjang`,
      duration: 3000,
    })
  }

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
        case 'F5':
          e.preventDefault()
          // Buka modal draft
          setShowDraftsModal(true)
          break
        case 'F6':
          e.preventDefault()
          // Simpan draft (hanya jika ada item di cart)
          if (items.length > 0) {
            setShowSaveDraftModal(true)
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <Barcode className="h-5 w-5" />
                  <span className="font-medium">Cari / Scan Produk</span>
                </div>

                {/* Draft buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDraftsModal(true)}
                    className="flex items-center gap-1 border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600"
                  >
                    <FileText className="h-4 w-4" />
                    Draft ({drafts.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSaveDraftModal(true)}
                    className="flex items-center gap-1 border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600"
                  >
                    <Save className="h-4 w-4" />
                    Simpan Draft
                  </Button>
                </div>
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

      {/* Draft Management Modals */}
      <TransactionDraftsModal
        open={showDraftsModal}
        onOpenChange={setShowDraftsModal}
        drafts={drafts}
        onLoadDraft={handleLoadDraft}
        onDeleteDraft={deleteDraft}
        onDuplicateDraft={duplicateDraft}
        isLoading={draftsLoading}
      />

      <SaveDraftModal
        open={showSaveDraftModal}
        onOpenChange={setShowSaveDraftModal}
        onSave={handleSaveDraft}
      />
    </div>
  )
}
