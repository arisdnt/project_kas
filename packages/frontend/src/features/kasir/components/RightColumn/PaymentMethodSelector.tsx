import { memo } from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { CreditCard, Banknote, Smartphone, QrCode } from 'lucide-react'

interface PaymentMethod {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
}

interface PaymentMethodSelectorProps {
  selectedMethod: string
  paidAmount: number
  onMethodSelect: (method: string) => void
  onPaidAmountChange: (amount: number) => void
  grandTotal: number
}

const paymentMethods: PaymentMethod[] = [
  { id: 'cash', name: 'Tunai', icon: Banknote },
  { id: 'debit', name: 'Kartu Debit', icon: CreditCard },
  { id: 'credit', name: 'Kartu Kredit', icon: CreditCard },
  { id: 'qris', name: 'QRIS', icon: QrCode },
  { id: 'emoney', name: 'E-Money', icon: Smartphone }
]

export const PaymentMethodSelector = memo(({
  selectedMethod,
  paidAmount,
  onMethodSelect,
  onPaidAmountChange,
  grandTotal
}: PaymentMethodSelectorProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const quickAmounts = [
    grandTotal,
    Math.ceil(grandTotal / 50000) * 50000, // Round up to nearest 50k
    Math.ceil(grandTotal / 100000) * 100000, // Round up to nearest 100k
  ].filter((amount, index, arr) => arr.indexOf(amount) === index) // Remove duplicates

  return (
    <div className="space-y-4">
      {/* Payment Methods */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Metode Pembayaran</h4>
        <div className="grid grid-cols-2 gap-2">
          {paymentMethods.map((method) => {
            const Icon = method.icon
            return (
              <Button
                key={method.id}
                variant={selectedMethod === method.id ? "default" : "outline"}
                size="sm"
                onClick={() => onMethodSelect(method.id)}
                className="h-10 text-xs justify-start"
              >
                <Icon className="h-3 w-3 mr-2" />
                {method.name}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Payment Amount */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Jumlah Bayar</h4>
        <Input
          type="number"
          value={paidAmount || ''}
          onChange={(e) => onPaidAmountChange(parseFloat(e.target.value) || 0)}
          placeholder="0"
          className="text-right tabular-nums"
        />

        {/* Quick Amount Buttons */}
        {selectedMethod === 'cash' && (
          <div className="mt-2 space-y-1">
            <div className="text-xs text-gray-500 mb-1">Uang Pas:</div>
            <div className="grid grid-cols-1 gap-1">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => onPaidAmountChange(amount)}
                  className="h-8 text-xs tabular-nums"
                >
                  {formatCurrency(amount)}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

PaymentMethodSelector.displayName = 'PaymentMethodSelector'