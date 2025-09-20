import { memo } from 'react'

interface InvoiceTotalsProps {
  subtotal: number
  discount: number
  tax: number
  grandTotal: number
}

export const InvoiceTotals = memo(({
  subtotal,
  discount,
  tax,
  grandTotal
}: InvoiceTotalsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }


  return (
    <div className="space-y-2">
      {/* Subtotal */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Subtotal</span>
        <div className="flex-1 border-b border-dotted border-gray-300 mx-2 mb-1"></div>
        <span className="font-medium tabular-nums">{formatCurrency(subtotal)}</span>
      </div>

      {/* Discount */}
      {discount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Diskon</span>
          <div className="flex-1 border-b border-dotted border-gray-300 mx-2 mb-1"></div>
          <span className="font-medium tabular-nums text-orange-600">-{formatCurrency(discount)}</span>
        </div>
      )}

      {/* Tax */}
      {tax > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Pajak</span>
          <div className="flex-1 border-b border-dotted border-gray-300 mx-2 mb-1"></div>
          <span className="font-medium tabular-nums">{formatCurrency(tax)}</span>
        </div>
      )}

      {/* Double line separator */}
      <div className="border-t-2 border-gray-300 pt-2 mt-3">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">GRAND TOTAL</span>
          <span className="text-xl font-bold tabular-nums text-gray-900">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      </div>
    </div>
  )
})

InvoiceTotals.displayName = 'InvoiceTotals'