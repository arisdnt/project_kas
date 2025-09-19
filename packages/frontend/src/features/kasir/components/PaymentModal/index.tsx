import * as React from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/core/components/ui/dialog'
import { useToast } from '@/core/hooks/use-toast'
import { useKasirStore } from '@/features/kasir/store/kasirStore'
import { PaymentModalProps } from './types'
import { usePaymentForm } from './hooks/usePaymentForm'
import { CustomerSection } from './components/CustomerSection'
import { DiscountSection } from './components/DiscountSection'
import { TotalsSection } from './components/TotalsSection'
import { PaymentSection } from './components/PaymentSection'
import { processPayment, getPaymentSuccessMessage } from './services/paymentService'
import { validateCart, validatePaymentAmount } from './utils/paymentHelpers'
import { parseNumberID } from './utils/formatters'

export function PaymentModal({ open, onOpenChange, onSuccess }: PaymentModalProps) {
  const { toast } = useToast()
  const { items, invoiceNumber } = useKasirStore()

  const {
    formState,
    amountPaidText,
    setAmountPaidText,
    discountText,
    setDiscountText,
    updatePaymentMethod,
    updateDiscountType,
    updateDiscountValue,
    updateAmountPaid,
    updateCustomer,
    setProcessing,
    totals
  } = usePaymentForm({ open })

  const handleProcessPayment = async () => {
    // Validate cart
    const cartValidation = validateCart(items)
    if (!cartValidation.isValid) {
      toast({
        title: 'Error',
        description: cartValidation.error,
        variant: 'destructive'
      })
      return
    }

    // Validate payment amount
    const paymentValidation = validatePaymentAmount(
      formState.paymentMethod,
      formState.amountPaid,
      totals.total
    )
    if (!paymentValidation.isValid) {
      toast({
        title: 'Error',
        description: paymentValidation.error,
        variant: 'destructive'
      })
      return
    }

    setProcessing(true)
    try {
      const invoicePayload = await processPayment({
        paymentMethod: formState.paymentMethod,
        amountPaid: formState.amountPaid,
        customer: formState.customer,
        discountType: formState.discountType,
        discountValue: formState.discountValue,
        items,
        totals,
        invoiceNumber
      })

      const successMessage = getPaymentSuccessMessage(
        formState.paymentMethod,
        invoicePayload.payment.change
      )

      toast({
        title: successMessage.title,
        description: successMessage.description
      })

      onSuccess?.(invoicePayload)
      onOpenChange(false)
    } catch (e: any) {
      toast({
        title: 'Gagal Memproses Pembayaran',
        description: e?.message || 'Terjadi kesalahan',
        variant: 'destructive'
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleDiscountTextChange = (text: string) => {
    setDiscountText(text)
  }

  const handleAmountPaidTextChange = (text: string) => {
    setAmountPaidText(text)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-label="Proses pembayaran kasir"
        className="w-full sm:w-[70vw] sm:min-w-[70vw] max-w-[95vw] border-0 p-0 sm:rounded-3xl shadow-2xl md:max-h-[90vh]"
      >
        <DialogTitle className="sr-only">Pembayaran Kasir</DialogTitle>
        <DialogDescription className="sr-only">
          Form untuk memproses pembayaran transaksi di kasir.
        </DialogDescription>
        <div className="flex min-h-[70vh] flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
          <div className="flex-1 px-6 py-6 sm:px-8 sm:py-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:items-stretch">
              <section className="rounded-3xl border border-slate-200/70 bg-white/70 p-6 shadow-sm backdrop-blur">
                <div className="flex h-full flex-col space-y-7">
                  <CustomerSection
                    customer={formState.customer}
                    onCustomerChange={updateCustomer}
                  />

                  <div className="h-px w-full bg-slate-200/80" />

                  <DiscountSection
                    discountType={formState.discountType}
                    discountValue={formState.discountValue}
                    discountText={discountText}
                    discount={totals.discount}
                    onDiscountTypeChange={updateDiscountType}
                    onDiscountValueChange={updateDiscountValue}
                    onDiscountTextChange={handleDiscountTextChange}
                  />

                  <div className="h-px w-full bg-slate-200/80" />

                  <TotalsSection
                    subtotal={totals.subtotal}
                    pajak={totals.pajak}
                    discount={totals.discount}
                    total={totals.total}
                  />
                </div>
              </section>

              <PaymentSection
                paymentMethod={formState.paymentMethod}
                amountPaid={formState.amountPaid}
                amountPaidText={amountPaidText}
                total={totals.total}
                isProcessing={formState.isProcessing}
                onPaymentMethodChange={updatePaymentMethod}
                onAmountPaidChange={updateAmountPaid}
                onAmountPaidTextChange={handleAmountPaidTextChange}
                onCancel={() => onOpenChange(false)}
                onProcessPayment={handleProcessPayment}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Re-export types
export type { PaymentModalProps } from './types'