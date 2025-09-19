import * as React from 'react'
import { formatCurrency } from '../utils/formatters'

interface TotalsSectionProps {
  subtotal: number
  pajak: number
  discount: number
  total: number
}

export const TotalsSection: React.FC<TotalsSectionProps> = ({
  subtotal,
  pajak,
  discount,
  total
}) => {
  return (
    <div className="space-y-2 text-sm text-slate-600">
      <div className="flex items-center justify-between">
        <span>Subtotal</span>
        <span
          className="font-mono text-slate-900"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formatCurrency(subtotal)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span>Pajak</span>
        <span
          className="font-mono text-slate-900"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formatCurrency(pajak)}
        </span>
      </div>

      {discount > 0 && (
        <div className="flex items-center justify-between text-emerald-600">
          <span>Diskon</span>
          <span
            className="font-mono"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            -{formatCurrency(discount)}
          </span>
        </div>
      )}

      <div className="border-t border-dashed border-slate-300 pt-2" />

      <div className="flex items-center justify-between text-base font-semibold text-slate-900">
        <span>Total</span>
        <span
          className="font-mono"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  )
}