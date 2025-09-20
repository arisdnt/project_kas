import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/core/components/ui/dialog'
import { CreditCard, Banknote, Smartphone, QrCode, Calculator, Printer, X } from 'lucide-react'

interface PaymentMethod {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  grandTotal: number
  onPayment: (method: string, paidAmount: number) => Promise<void>
  onPrint: () => void
  isProcessing?: boolean
}

const paymentMethods: PaymentMethod[] = [
  { id: 'TUNAI', name: 'Tunai', icon: Banknote, color: 'bg-green-100 text-green-700 border-green-300' },
  { id: 'NON_TUNAI', name: 'Non Tunai', icon: CreditCard, color: 'bg-blue-100 text-blue-700 border-blue-300' }
]

export function PaymentModal({
  open,
  onOpenChange,
  grandTotal,
  onPayment,
  onPrint,
  isProcessing = false
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState('TUNAI')
  const [paidAmount, setPaidAmount] = useState(grandTotal)
  const [inputValue, setInputValue] = useState(grandTotal.toString())

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Calculate change
  const change = Math.max(0, paidAmount - grandTotal)
  const isValidPayment = paidAmount >= grandTotal

  // Quick amount buttons for cash
  const quickAmounts = [
    grandTotal,
    Math.ceil(grandTotal / 50000) * 50000, // Round up to nearest 50k
    Math.ceil(grandTotal / 100000) * 100000, // Round up to nearest 100k
  ].filter((amount, index, arr) => arr.indexOf(amount) === index) // Remove duplicates

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setSelectedMethod('TUNAI')
      setPaidAmount(grandTotal)
      setInputValue(grandTotal.toString())
    }
  }, [open, grandTotal])

  // Handle paid amount input change
  const handleInputChange = (value: string) => {
    setInputValue(value)
    const numValue = parseFloat(value.replace(/[^\d]/g, '')) || 0
    setPaidAmount(numValue)
  }

  // Handle quick amount selection
  const handleQuickAmount = (amount: number) => {
    setPaidAmount(amount)
    setInputValue(amount.toString())
  }

  // Handle payment method change
  const handleMethodChange = (methodId: string) => {
    setSelectedMethod(methodId)
    // For non-cash methods, set exact amount
    if (methodId === 'NON_TUNAI') {
      setPaidAmount(grandTotal)
      setInputValue(grandTotal.toString())
    }
  }

  // Handle payment submission
  const handlePayment = useCallback(async () => {
    if (!isValidPayment) return
    try {
      await onPayment(selectedMethod, paidAmount)
      onOpenChange(false)
    } catch (error) {
      console.error('Payment error:', error)
    }
  }, [selectedMethod, paidAmount, isValidPayment, onPayment, onOpenChange])

  // Handle payment and print
  const handlePaymentAndPrint = useCallback(async () => {
    if (!isValidPayment) return
    try {
      await onPayment(selectedMethod, paidAmount)
      onPrint()
      onOpenChange(false)
    } catch (error) {
      console.error('Payment error:', error)
    }
  }, [selectedMethod, paidAmount, isValidPayment, onPayment, onPrint, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[50vh] overflow-hidden p-0">
        {/* 2 Column Layout */}
        <div className="flex h-[40vh] min-h-[300px]">
          {/* Left Column - Total & Payment Methods */}
          <div className="flex-1 p-6 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            {/* Total Amount Display - Following kasir design pattern */}
            <div className="mb-6">
              <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Total Pembayaran</div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center shadow-sm">
                <div className="text-5xl font-bold text-gray-900 tabular-nums">
                  {formatCurrency(grandTotal)}
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <label className="text-xs text-gray-600 uppercase tracking-wide mb-3 block">
                Pilih Metode Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleMethodChange(method.id)}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      selectedMethod === method.id
                        ? method.color + ' ring-2 ring-offset-1 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                    disabled={isProcessing}
                  >
                    <method.icon className="h-6 w-6" />
                    <span className="font-medium text-base">{method.name}</span>
                    {selectedMethod === method.id && (
                      <div className="ml-auto w-3 h-3 bg-current rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Payment Input & Change */}
          <div className="flex-1 p-6 bg-white overflow-y-auto">
            {/* Payment Amount Input */}
            <div className="mb-6">
              <label className="text-xs text-gray-600 uppercase tracking-wide mb-3 block">
                Uang Diterima
              </label>

              {/* Quick amounts for cash only */}
              {selectedMethod === 'TUNAI' && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {quickAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      onClick={() => handleQuickAmount(amount)}
                      className="h-12 text-sm font-medium"
                      disabled={isProcessing}
                    >
                      {formatCurrency(amount)}
                    </Button>
                  ))}
                </div>
              )}

              {/* Amount Input - Following kasir large font pattern */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="relative">
                  <Input
                    type="text"
                    value={new Intl.NumberFormat('id-ID').format(paidAmount)}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="text-4xl font-bold text-center h-20 text-gray-900 border-2 border-gray-300 bg-white"
                    placeholder="0"
                    disabled={isProcessing || selectedMethod === 'NON_TUNAI'}
                    autoFocus
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-lg text-gray-500 font-medium">
                    IDR
                  </div>
                </div>
              </div>

              {selectedMethod === 'NON_TUNAI' && (
                <div className="text-sm text-gray-500 text-center bg-blue-50 p-3 rounded border border-blue-200">
                  Nominal pembayaran disesuaikan dengan total tagihan
                </div>
              )}
            </div>

            {/* Change Display - Large for Cash */}
            {selectedMethod === 'TUNAI' && (
              <div className="mb-6">
                <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Kembalian</div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center shadow-sm">
                  <div className={`text-4xl font-bold tabular-nums ${
                    change >= 0 ? 'text-green-900' : 'text-red-600'
                  }`}>
                    {formatCurrency(change)}
                  </div>
                  {!isValidPayment && (
                    <div className="text-sm text-red-600 mt-3">
                      Uang yang diterima kurang dari total tagihan
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Action Bar - Responsive Button Layout */}
        <div className="bg-white border-t border-gray-200 p-4 shadow-lg backdrop-blur-sm flex-shrink-0">
          <div className="grid grid-cols-4 gap-3">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="h-12 w-full border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
              disabled={isProcessing}
            >
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>

            <Button
              onClick={onPrint}
              variant="outline"
              className="h-12 w-full border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              disabled={isProcessing}
            >
              <Printer className="h-4 w-4 mr-2" />
              Cetak Resi
            </Button>

            <Button
              onClick={handlePayment}
              disabled={!isValidPayment || isProcessing}
              variant="outline"
              className="h-12 w-full border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Bayar
            </Button>

            <Button
              onClick={handlePaymentAndPrint}
              disabled={!isValidPayment || isProcessing}
              className="h-12 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Memproses...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  BAYAR & CETAK
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}