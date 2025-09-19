import * as React from 'react'
import { Input } from '@/core/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { DiscountType } from '../types'
import { formatNumberID, parseNumberID, formatCurrency } from '../utils/formatters'

interface DiscountSectionProps {
  discountType: DiscountType
  discountValue: number
  discountText: string
  discount: number
  onDiscountTypeChange: (type: DiscountType) => void
  onDiscountValueChange: (value: number) => void
  onDiscountTextChange: (text: string) => void
}

export const DiscountSection: React.FC<DiscountSectionProps> = ({
  discountType,
  discountValue,
  discountText,
  discount,
  onDiscountTypeChange,
  onDiscountValueChange,
  onDiscountTextChange
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Pengaturan Diskon</h3>
        <p className="text-sm text-slate-500">
          Pastikan promo diterapkan sesuai kebijakan toko.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">Tipe Diskon</label>
          <Select
            value={discountType}
            onValueChange={(value: DiscountType) => onDiscountTypeChange(value)}
          >
            <SelectTrigger className="mt-2 h-11 rounded-xl border-slate-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nominal">Nominal (Rp)</SelectItem>
              <SelectItem value="percent">Persen (%)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Nilai Diskon {discountType === 'percent' ? '(%)' : '(Rp)'}
          </label>
          {discountType === 'percent' ? (
            <Input
              type="number"
              value={discountValue || ''}
              onChange={(e) => {
                const v = Math.max(0, Math.min(100, Number(e.target.value) || 0))
                onDiscountValueChange(v)
              }}
              placeholder="0-100"
              className="mt-2 h-11 rounded-xl"
              min={0}
              max={100}
            />
          ) : (
            <Input
              type="text"
              inputMode="numeric"
              value={discountText}
              onChange={(e) => {
                const val = e.target.value
                const num = parseNumberID(val)
                onDiscountValueChange(num)
                onDiscountTextChange(formatNumberID(num))
              }}
              placeholder="0"
              className="mt-2 h-11 rounded-xl text-right"
            />
          )}
        </div>
      </div>

      {discount > 0 && (
        <div className="rounded-2xl bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200/70">
          Diskon diterapkan: {formatCurrency(discount)}
        </div>
      )}
    </div>
  )
}