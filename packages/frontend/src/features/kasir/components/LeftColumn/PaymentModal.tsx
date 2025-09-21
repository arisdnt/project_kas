import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Dialog, DialogContentNative } from '@/core/components/ui/dialog'
import { CreditCard, Banknote, Calculator, Printer, X } from 'lucide-react'

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
    }
  }, [open, grandTotal])

  // Handle paid amount input change
  const handleInputChange = (value: string) => {
    const numValue = parseFloat(value.replace(/[^\d]/g, '')) || 0
    setPaidAmount(numValue)
  }

  // Handle quick amount selection
  const handleQuickAmount = (amount: number) => {
    setPaidAmount(amount)
  }

  // Handle payment method change
  const handleMethodChange = (methodId: string) => {
    setSelectedMethod(methodId)
    // For non-cash methods, set exact amount
    if (methodId === 'NON_TUNAI') {
      setPaidAmount(grandTotal)
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

  // Modal-specific keyboard shortcuts (F-keys + Escape to close)
  useEffect(() => {
    if (!open) return

    const handleModalKeyDown = (e: KeyboardEvent) => {
      // Close on Escape regardless of focused element
      if (e.key === 'Escape') {
        e.preventDefault()
        onOpenChange(false)
        return
      }

      // Only handle F-keys for the rest of modal shortcuts
      if (!e.key.startsWith('F')) return

      e.preventDefault()

      switch (e.key) {
        case 'F1':
          // Switch to cash payment method
          handleMethodChange('TUNAI')
          break
        case 'F2':
          // Switch to non-cash payment method
          handleMethodChange('NON_TUNAI')
          break
        case 'F3':
          // Set exact amount (grandTotal)
          handleQuickAmount(grandTotal)
          break
        case 'F4':
          // Quick amount - round up to 50k
          if (quickAmounts.length > 1) {
            handleQuickAmount(quickAmounts[1])
          }
          break
        case 'F5':
          // Quick amount - round up to 100k
          if (quickAmounts.length > 2) {
            handleQuickAmount(quickAmounts[2])
          }
          break
        case 'F6': {
          // Focus amount input
          const amountInput = document.querySelector('[data-payment-amount-input]') as HTMLInputElement
          amountInput?.focus()
          amountInput?.select()
          break
        }
        case 'F7':
          // Cancel/Close modal
          onOpenChange(false)
          break
        case 'F8':
          // Print receipt only
          if (!isProcessing) {
            onPrint()
          }
          break
        // NOTE: Intentionally exclude F9 inside modal to avoid conflict with global opener
        case 'F10':
          // Pay only
          if (isValidPayment) {
            handlePayment()
          }
          break
        case 'F12':
          // Pay and print
          if (isValidPayment) {
            handlePaymentAndPrint()
          }
          break
      }
    }

    document.addEventListener('keydown', handleModalKeyDown)
    return () => document.removeEventListener('keydown', handleModalKeyDown)
  }, [open, selectedMethod, grandTotal, quickAmounts, isValidPayment, handlePayment, handlePaymentAndPrint, handleMethodChange, handleQuickAmount, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContentNative className="w-[85vw] max-w-5xl min-w-[700px] h-[450px] p-0 rounded-none">
        {/* 2 Column Layout */}
        <div className="flex h-full">
          {/* Left Column - Total & Payment Methods */}
          <div className="flex-1 p-6 bg-gray-50 border-r border-gray-200 flex flex-col">
            {/* Total Amount Display - Following kasir design pattern */}
            <div className="mb-4">
              <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Total Pembayaran</div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-gray-900 tabular-nums">
                  {formatCurrency(grandTotal)}
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex-1">
              <label className="text-xs text-gray-600 uppercase tracking-wide mb-2 block">
                Pilih Metode Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleMethodChange(method.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      selectedMethod === method.id
                        ? method.color + ' ring-2 ring-offset-1 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                    disabled={isProcessing}
                  >
                    <method.icon className="h-5 w-5" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-sm">{method.name}</span>
                      <span className="text-xs text-gray-500">
                        [{method.id === 'TUNAI' ? 'F1' : 'F2'}]
                      </span>
                    </div>
                    {selectedMethod === method.id && (
                      <div className="ml-auto w-2.5 h-2.5 bg-current rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Payment Input & Change */}
          <div className="flex-1 p-4 bg-white flex flex-col">
            {/* Payment Amount Input */}
            <div className="mb-4">
              <label className="text-xs text-gray-600 uppercase tracking-wide mb-2 block">
                Uang Diterima
              </label>

              {/* Quick amounts for cash only */}
              {selectedMethod === 'TUNAI' && (
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {quickAmounts.map((amount, index) => (
                    <Button
                      key={amount}
                      variant="outline"
                      onClick={() => handleQuickAmount(amount)}
                      className="h-9 text-xs font-medium"
                      disabled={isProcessing}
                    >
                      <div className="flex flex-col items-center">
                        <span>[F{3 + index}]</span>
                        <span>{formatCurrency(amount)}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              )}

              {/* Amount Input - Following kasir large font pattern */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                <div className="relative">
                  <Input
                    type="text"
                    value={new Intl.NumberFormat('id-ID').format(paidAmount)}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="text-2xl font-bold text-center h-16 text-gray-900 border-2 border-gray-300 bg-white"
                    placeholder="0 [F6 untuk fokus]"
                    disabled={isProcessing || selectedMethod === 'NON_TUNAI'}
                    autoFocus
                    data-payment-amount-input
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 font-medium">
                    IDR
                  </div>
                </div>
              </div>

              {selectedMethod === 'NON_TUNAI' && (
                <div className="text-sm text-gray-500 text-center bg-blue-50 p-2 rounded border border-blue-200">
                  Nominal pembayaran disesuaikan dengan total tagihan
                </div>
              )}
            </div>

            {/* Change Display - Large for Cash */}
            {selectedMethod === 'TUNAI' && (
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Kembalian</div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center shadow-sm">
                  <div className={`text-2xl font-bold tabular-nums ${
                    change >= 0 ? 'text-green-900' : 'text-red-600'
                  }`}>
                    {formatCurrency(change)}
                  </div>
                  {!isValidPayment && (
                    <div className="text-sm text-red-600 mt-2">
                      Uang yang diterima kurang dari total tagihan
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Action Bar - Responsive Button Layout */}
        <div className="bg-white border-t border-gray-200 p-3 shadow-lg backdrop-blur-sm flex-shrink-0">
          <div className="grid grid-cols-4 gap-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="h-10 w-full border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50 text-sm"
              disabled={isProcessing}
            >
              <X className="h-4 w-4 mr-1" />
              [F7] Batal
            </Button>

            <Button
              onClick={onPrint}
              variant="outline"
              className="h-10 w-full border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-sm"
              disabled={isProcessing}
            >
              <Printer className="h-4 w-4 mr-1" />
              [F8] Cetak Resi
            </Button>

            <Button
              onClick={handlePayment}
              disabled={!isValidPayment || isProcessing}
              variant="outline"
              className="h-10 w-full border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-50 text-sm"
            >
              <Calculator className="h-4 w-4 mr-1" />
              [F10] Bayar
            </Button>

            <Button
              onClick={handlePaymentAndPrint}
              disabled={!isValidPayment || isProcessing}
              className="h-10 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 text-sm"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                  Memproses...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-1" />
                  [F12] BAYAR & CETAK
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContentNative>
    </Dialog>
  )
}