import { useState } from 'react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { PaymentModal } from './PaymentModal'
import { useKasirStore, useKasirTotals } from '@/features/kasir/store/kasirStore'
import { ShoppingCart, CreditCard } from 'lucide-react'

export function PaymentSummary() {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const items = useKasirStore((s) => s.items)
  const clear = useKasirStore((s) => s.clear)
  const { subtotal, pajak, discount, total } = useKasirTotals()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const handlePaymentSuccess = () => {
    clear()
    setShowPaymentModal(false)
  }

  return (
    <>
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-gray-700">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-medium">Ringkasan Pembayaran</span>
          </div>

          <div className="space-y-4">
            {/* Daftar Barang */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 border-b pb-1">Daftar Barang</h4>
              {items.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-xs">Keranjang kosong</p>
                </div>
              ) : (
                <div className="space-y-1 text-xs font-mono">
                  {items.map((item, index) => (
                    <div key={index} className="space-y-0.5">
                      <div className="text-gray-900 font-medium">{item.nama}</div>
                      <div className="flex justify-between text-gray-600">
                        <span>{item.qty} x {formatCurrency(item.harga)}</span>
                        <span>{formatCurrency(item.qty * item.harga)}</span>
                      </div>
                      {index < items.length - 1 && <div className="border-b border-dotted border-gray-200 my-1"></div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ringkasan Pembayaran */}
            {items.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 border-b pb-1">Ringkasan</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-mono">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pajak</span>
                    <span className="font-mono">{formatCurrency(pajak)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Diskon</span>
                      <span className="font-mono">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="font-mono">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full h-12 text-base font-semibold"
                  data-payment-button
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Proses Pembayaran
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        onSuccess={handlePaymentSuccess}
      />
    </>
  )
}