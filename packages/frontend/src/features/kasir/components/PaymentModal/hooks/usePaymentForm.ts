import { useState, useEffect } from 'react'
import { useKasirStore, useKasirTotals } from '@/features/kasir/store/kasirStore'
import { PaymentFormState, PaymentMethod, DiscountType } from '../types'
import { formatNumberID } from '../utils/formatters'

interface UsePaymentFormProps {
  open: boolean
}

export const usePaymentForm = ({ open }: UsePaymentFormProps) => {
  const {
    setBayar,
    setMetode,
    setDiscountType,
    setDiscountValue,
    setPelanggan,
    metode,
    bayar,
    pelanggan,
    discountType,
    discountValue
  } = useKasirStore()

  const totals = useKasirTotals()

  const [formState, setFormState] = useState<PaymentFormState>({
    paymentMethod: metode,
    discountType: discountType,
    discountValue: discountValue,
    amountPaid: bayar || totals.total,
    customer: pelanggan,
    isProcessing: false
  })

  // Text inputs for formatted display
  const [amountPaidText, setAmountPaidText] = useState('')
  const [discountText, setDiscountText] = useState('')

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      const initialAmount = metode === 'TUNAI' ? (bayar || totals.total) : totals.total
      setFormState({
        paymentMethod: metode,
        discountType: discountType,
        discountValue: discountValue,
        amountPaid: initialAmount,
        customer: pelanggan,
        isProcessing: false
      })
    }
  }, [open, metode, discountType, discountValue, totals.total, pelanggan, bayar])

  // Update text inputs when form state changes
  useEffect(() => {
    if (open) {
      const initialAmount = metode === 'TUNAI' ? (bayar || totals.total) : totals.total
      setAmountPaidText(metode === 'TUNAI' && initialAmount ? formatNumberID(initialAmount) : '')

      if (discountType === 'nominal') {
        setDiscountText(discountValue ? formatNumberID(discountValue) : '')
      } else {
        setDiscountText('')
      }
    }
  }, [open, metode, bayar, totals.total, discountType, discountValue])

  // Update amount paid when payment method or total changes
  useEffect(() => {
    if (formState.paymentMethod !== 'TUNAI') {
      updateFormState({ amountPaid: totals.total })
    }
  }, [formState.paymentMethod, totals.total])

  // Update text displays
  useEffect(() => {
    if (formState.paymentMethod === 'TUNAI') {
      setAmountPaidText(formState.amountPaid ? formatNumberID(formState.amountPaid) : '')
    } else {
      setAmountPaidText('')
    }
  }, [formState.paymentMethod, formState.amountPaid])

  useEffect(() => {
    if (formState.discountType !== 'nominal') {
      setDiscountText('')
    } else {
      setDiscountText(formState.discountValue ? formatNumberID(formState.discountValue) : '')
    }
  }, [formState.discountType, formState.discountValue])

  // Sync form state to store for live totals
  useEffect(() => { setMetode(formState.paymentMethod) }, [formState.paymentMethod, setMetode])
  useEffect(() => { setDiscountType(formState.discountType) }, [formState.discountType, setDiscountType])
  useEffect(() => { setDiscountValue(formState.discountValue) }, [formState.discountValue, setDiscountValue])
  useEffect(() => {
    if (formState.paymentMethod === 'TUNAI') setBayar(formState.amountPaid)
  }, [formState.amountPaid, formState.paymentMethod, setBayar])
  useEffect(() => { setPelanggan(formState.customer) }, [formState.customer, setPelanggan])

  const updateFormState = (updates: Partial<PaymentFormState>) => {
    setFormState(prev => ({ ...prev, ...updates }))
  }

  const updatePaymentMethod = (method: PaymentMethod) => {
    updateFormState({ paymentMethod: method })
  }

  const updateDiscountType = (type: DiscountType) => {
    updateFormState({ discountType: type })
  }

  const updateDiscountValue = (value: number) => {
    updateFormState({ discountValue: value })
  }

  const updateAmountPaid = (amount: number) => {
    updateFormState({ amountPaid: amount })
  }

  const updateCustomer = (customer: any) => {
    updateFormState({ customer })
  }

  const setProcessing = (processing: boolean) => {
    updateFormState({ isProcessing: processing })
  }

  return {
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
  }
}