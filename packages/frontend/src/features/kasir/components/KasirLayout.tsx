import { memo, useState, useCallback } from 'react'
import { LeftColumn } from './LeftColumn/LeftColumn'
import { RightColumn } from './RightColumn/RightColumn'
import { CustomerSearchModal } from './LeftColumn/CustomerSearchModal'
import { DraftModal } from './LeftColumn/DraftModal'
import { PaymentModal } from './LeftColumn/PaymentModal'
import { useKasirStore } from '@/features/kasir/store/kasirStore'
import { useAuthStore } from '@/core/store/authStore'
import { kasirService } from '@/features/kasir/services/kasirService'

interface CartItem {
  id: string
  barcode?: string
  nama: string
  qty: number
  harga: number
  diskon: number
  subtotal: number
}

export const KasirLayout = memo(() => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isOnline] = useState(true) // TODO: Implement real connection status
  const [showCustomerSearchModal, setShowCustomerSearchModal] = useState(false)
  const [showDraftModal, setShowDraftModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Kasir store
  const {
    items,
    pelanggan,
    taxRate,
    bayar,
    metode,
    discountType,
    discountValue,
    clear,
    setBayar,
    setMetode
  } = useKasirStore()

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.harga * item.qty), 0)
  const discountTotal = discountValue
  const taxTotal = subtotal * (taxRate / 100)
  const grandTotal = subtotal - discountTotal + taxTotal
  const paid = bayar
  const change = Math.max(0, paid - grandTotal)

  // Auth store
  const { user } = useAuthStore()

  // Mock data - replace with real data from stores
  const storeName = "Toko ABC"
  const storeAddress = "Jl. Contoh No. 123, Jakarta"
  const storePhone = "021-12345678"
  const storeNPWP = "12.345.678.9-012.345"
  const invoiceNumber = `INV-${Date.now()}`
  const dateTime = new Date().toLocaleString('id-ID')
  const cashierName = user?.nama || "Kasir"
  const customerName = pelanggan?.nama || "Pelanggan Umum"

  // Event handlers
  const handleBarcodeSubmit = useCallback(async (barcode: string) => {
    try {
      // TODO: Implement barcode scanning logic
      console.log('Scanning barcode:', barcode)
    } catch (error) {
      console.error('Error scanning barcode:', error)
    }
  }, [])

  const handleAddCustomer = useCallback(() => {
    setShowCustomerSearchModal(true)
  }, [])

  const handleHold = useCallback(() => {
    // TODO: Implement hold transaction
    console.log('Hold transaction clicked')
  }, [])

  const handleClear = useCallback(async () => {
    if (items.length > 0 && confirm('Hapus semua item dari keranjang?')) {
      await clear()
    }
  }, [items.length, clear])

  const handlePayment = useCallback(() => {
    if (items.length === 0) return
    setShowPaymentModal(true)
  }, [items.length])

  const handleProcessPayment = useCallback(async (selectedMethod: string, paidAmount: number) => {
    if (items.length === 0) return

    try {
      setIsProcessing(true)

      // Prepare cart items for payment
      const cartItems = items.map(item => ({
        produk_id: (item as any)._rawId || item.id.toString(),
        kuantitas: item.qty,
        harga_satuan: item.harga,
        diskon_persen: 0,
        diskon_nominal: 0
      }))

      // Create payment request
      const paymentData = {
        metode_bayar: selectedMethod.toLowerCase() as 'tunai' | 'transfer' | 'kartu' | 'kredit' | 'poin',
        jumlah_bayar: paidAmount,
        cart_items: cartItems,
        pelanggan_id: pelanggan?.id,
        diskon_persen: discountType === 'percent' ? discountValue : 0,
        diskon_nominal: discountType === 'nominal' ? discountValue : 0,
        catatan: ''
      }

      console.log('Processing payment with data:', paymentData)

      // Process payment through service
      const result = await kasirService.processPayment(paymentData)

      console.log('Payment successful:', result)

      // Clear cart after successful payment
      await clear()

      // Show success message
      const kembalian = Math.max(0, paidAmount - grandTotal)
      alert(`Pembayaran berhasil! Kembalian: ${new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
      }).format(kembalian)}`)

    } catch (error) {
      console.error('Payment error:', error)
      alert('Gagal memproses pembayaran. Silakan coba lagi.')
      throw error // Re-throw to let modal handle it
    } finally {
      setIsProcessing(false)
    }
  }, [items, pelanggan, discountType, discountValue, clear, grandTotal])

  const handleSaveDraft = useCallback(async () => {
    try {
      const { saveDraft } = useKasirStore.getState()
      const draftId = await saveDraft()
      alert('Draft berhasil disimpan!')
      console.log('Draft saved with ID:', draftId)
    } catch (error: any) {
      alert(error.message || 'Gagal menyimpan draft')
      console.error('Error saving draft:', error)
    }
  }, [])

  const handlePrint = useCallback(() => {
    // TODO: Implement print receipt
    console.log('Print receipt clicked')
  }, [])

  const handleShowDrafts = useCallback(() => {
    setShowDraftModal(true)
  }, [])


  // Transform items to match CartItem interface
  const cartItems: CartItem[] = items.map(item => ({
    id: item.id.toString(),
    barcode: item.sku,
    nama: item.nama,
    qty: item.qty,
    harga: item.harga,
    diskon: 0, // TODO: Calculate item discount
    subtotal: item.harga * item.qty
  }))

  return (
    <div className="w-full h-full flex bg-gray-50">
      {/* Left Column (~68%) */}
      <div className="flex-1 min-w-[720px] bg-white">
        <LeftColumn
          items={cartItems}
          grandTotal={grandTotal}
          isOnline={isOnline}
          isProcessing={isProcessing}
          onBarcodeSubmit={handleBarcodeSubmit}
          onAddCustomer={handleAddCustomer}
          onHold={handleHold}
          onClear={handleClear}
          onPayment={handlePayment}
          onSaveDraft={handleSaveDraft}
          onPrint={handlePrint}
          onShowDrafts={handleShowDrafts}
        />
      </div>

      {/* Right Column (~32%) */}
      <div className="w-[360px] min-w-[340px] max-w-[360px] bg-gray-50 p-3">
        <RightColumn
          items={cartItems}
          storeName={storeName}
          storeAddress={storeAddress}
          storePhone={storePhone}
          storeNPWP={storeNPWP}
          invoiceNumber={invoiceNumber}
          dateTime={dateTime}
          cashierName={cashierName}
          customerName={customerName}
          subtotal={subtotal}
          discount={discountTotal}
          tax={taxTotal}
          grandTotal={grandTotal}
        />
      </div>

      {/* Customer Search Modal */}
      <CustomerSearchModal
        open={showCustomerSearchModal}
        onOpenChange={setShowCustomerSearchModal}
      />

      {/* Draft Modal */}
      <DraftModal
        open={showDraftModal}
        onOpenChange={setShowDraftModal}
      />

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        grandTotal={grandTotal}
        onPayment={handleProcessPayment}
        onPrint={handlePrint}
        isProcessing={isProcessing}
      />
    </div>
  )
})

KasirLayout.displayName = 'KasirLayout'