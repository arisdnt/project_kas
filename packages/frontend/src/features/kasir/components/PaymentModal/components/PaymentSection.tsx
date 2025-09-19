import * as React from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { PaymentMethod } from '../types'
import { PAYMENT_METHODS } from '../constants/paymentMethods'
import { formatCurrency, parseNumberID, formatNumberID, calculateChange } from '../utils/formatters'

interface PaymentSectionProps {
  paymentMethod: PaymentMethod
  amountPaid: number
  amountPaidText: string
  total: number
  isProcessing: boolean
  onPaymentMethodChange: (method: PaymentMethod) => void
  onAmountPaidChange: (amount: number) => void
  onAmountPaidTextChange: (text: string) => void
  onCancel: () => void
  onProcessPayment: () => void
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  paymentMethod,
  amountPaid,
  amountPaidText,
  total,
  isProcessing,
  onPaymentMethodChange,
  onAmountPaidChange,
  onAmountPaidTextChange,
  onCancel,
  onProcessPayment
}) => {
  const changeAmount = calculateChange(amountPaid, total, paymentMethod)
  const isShortPaid = paymentMethod === 'TUNAI' && amountPaid < total
  const selectedPaymentLabel = PAYMENT_METHODS.find((method) => method.value === paymentMethod)?.label || 'Metode'

  return (
    <aside className="rounded-3xl border border-slate-900/5 bg-slate-900/95 p-6 text-white shadow-xl lg:p-8">
      <div className="flex h-full flex-col justify-between gap-8">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                Total Pembayaran
              </p>
              <p
                className="mt-3 font-mono text-4xl font-semibold tracking-tight sm:text-5xl"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formatCurrency(total)}
              </p>
            </div>
            <div className="w-full sm:w-auto sm:min-w-[220px]">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                Metode Pembayaran
              </label>
              <Select
                value={paymentMethod}
                onValueChange={(v) => onPaymentMethodChange(v as PaymentMethod)}
              >
                <SelectTrigger className="mt-2 h-11 rounded-xl border-white/20 bg-white/10 text-sm text-white">
                  <SelectValue placeholder="Pilih metode" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon
                    return (
                      <SelectItem key={method.value} value={method.value}>
                        <div className="flex items-center gap-3">
                          <Icon className={`h-5 w-5 ${method.color}`} />
                          <span>{method.label}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {paymentMethod === 'TUNAI' ? (
            <div>
              <label className="text-sm font-medium text-white/80">
                Nominal Tunai Diterima
              </label>
              <Input
                type="text"
                inputMode="numeric"
                value={amountPaidText}
                onChange={(e) => {
                  const val = e.target.value
                  const num = parseNumberID(val)
                  onAmountPaidChange(num)
                  onAmountPaidTextChange(formatNumberID(num))
                }}
                placeholder="Masukkan jumlah uang yang diterima"
                className="mt-2 h-16 rounded-2xl border-white/20 bg-white/10 text-right text-3xl font-semibold text-white shadow-inner backdrop-blur placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-white/30"
              />
              <p className="mt-2 text-xs text-white/70">
                Periksa kembali nominal untuk menghindari kesalahan kembalian.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 text-sm text-white/80">
              Pembayaran {selectedPaymentLabel.toLowerCase()} akan diproses sesuai total transaksi
              tanpa perlu konfirmasi nominal manual.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                Nominal Tercatat
              </p>
              <p
                className="mt-2 font-mono text-2xl font-semibold"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formatCurrency(paymentMethod === 'TUNAI' ? amountPaid : total)}
              </p>
            </div>
            <div
              className={`rounded-2xl border px-4 py-4 ${
                changeAmount > 0
                  ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200'
                  : 'border-white/15 bg-white/5 text-white'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                Kembalian
              </p>
              <p
                className="mt-2 font-mono text-2xl font-semibold"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formatCurrency(changeAmount)}
              </p>
            </div>
          </div>

          {isShortPaid && (
            <div className="rounded-2xl border border-amber-300/40 bg-amber-400/20 px-4 py-3 text-sm font-medium text-amber-100">
              Kekurangan {formatCurrency(total - amountPaid)}. Validasi kembali nominal pembayaran
              sebelum melanjutkan.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="h-11 border border-white/20 text-white hover:bg-white/10 sm:min-w-[140px]"
            disabled={isProcessing}
          >
            Batal
          </Button>
          <Button
            onClick={onProcessPayment}
            className="h-11 bg-white text-slate-900 hover:bg-white/90 sm:min-w-[200px] text-base font-semibold"
            disabled={isProcessing || isShortPaid}
          >
            {isProcessing ? 'Memproses...' : `Proses ${formatCurrency(total)}`}
          </Button>
        </div>
      </div>
    </aside>
  )
}