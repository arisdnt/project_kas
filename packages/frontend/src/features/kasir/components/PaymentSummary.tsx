import { useState } from 'react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { PaymentModal } from './PaymentModal'
import { useKasirStore, useKasirTotals } from '@/features/kasir/store/kasirStore'
import { ShoppingCart, CreditCard, Store } from 'lucide-react'
import { config } from '@/core/config'

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
          <div className="space-y-4">
            {/* Header Toko */}
            <div className="grid grid-cols-3 gap-4">
              {/* Identitas Toko - Kiri */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-gray-800" />
                  <h3 className="text-base font-bold text-gray-900">{config.infoToko.nama}</h3>
                </div>
                <p className="text-sm text-gray-700">{config.infoToko.alamat}</p>
                <p className="text-xs text-gray-600">Telp: {config.infoToko.teleponKontak}</p>
              </div>
              
              {/* Judul INVOICE - Tengah */}
              <div className="text-center space-y-1 flex flex-col justify-center">
                <p className="text-lg font-bold text-gray-800">INVOICE</p>
                <div className="h-px bg-gray-300 my-1"></div>
                <p className="text-sm font-bold text-gray-800">
                  {Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}
                </p>
              </div>
              
              {/* Email & Tanggal - Kanan */}
              <div className="text-right space-y-1">
                <p className="text-xs text-gray-600">Email: {config.infoToko.emailKontak}</p>
                <p className="text-xs text-gray-600">
                  Tanggal: {new Date().toLocaleDateString('id-ID', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric'
                  })}
                </p>
                <p className="text-xs text-gray-600">
                  Jam: {new Date().toLocaleTimeString('id-ID', { 
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            {/* Daftar Barang */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">Daftar Barang</h4>
              {items.length === 0 ? (
                <div className="text-center py-4 text-gray-500 border border-gray-300 rounded">
                  <p className="text-xs">Keranjang kosong</p>
                </div>
              ) : (
                <div className="space-y-1 text-sm font-mono border border-gray-300 rounded">
                  <div className="bg-gray-100 border-b border-gray-300 px-2 py-1 font-semibold text-gray-800 grid grid-cols-12 gap-1">
                    <div className="col-span-6">Nama Barang</div>
                    <div className="col-span-3 text-right">Qty x Harga</div>
                    <div className="col-span-3 text-right">Jumlah</div>
                  </div>
                  {items.map((item, index) => (
                    <div key={index} className="px-2 py-1 border-b border-gray-200 last:border-b-0 grid grid-cols-12 gap-1 items-center">
                      <div className="col-span-6 text-gray-900 font-medium">{item.nama}</div>
                      <div className="col-span-3 text-right">{item.qty} x {formatCurrency(item.harga)}</div>
                      <div className="col-span-3 text-right font-semibold">{formatCurrency(item.qty * item.harga)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ringkasan Pembayaran */}
            {items.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">Ringkasan Pembayaran</h4>
                <div className="space-y-2 border border-gray-300 rounded p-3 bg-gray-50">
                  <div className="flex justify-between text-sm border-b border-gray-200 pb-1">
                    <span className="text-gray-700 font-medium">Subtotal</span>
                    <span className="font-mono font-semibold">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-200 pb-1">
                    <span className="text-gray-700 font-medium">Pajak (11%)</span>
                    <span className="font-mono font-semibold">{formatCurrency(pajak)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 border-b border-gray-200 pb-1">
                      <span className="font-medium">Diskon</span>
                      <span className="font-mono font-semibold">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold text-red-600">
                      <span>TOTAL BAYAR</span>
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