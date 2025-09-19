import { PaymentMethod, PaymentMethodAPI } from '../types'
import { PAYMENT_METHOD_API_MAPPING } from '../constants/paymentMethods'

export const getAPIPaymentMethod = (method: PaymentMethod): PaymentMethodAPI => {
  return PAYMENT_METHOD_API_MAPPING[method] || 'tunai'
}

export const getPaymentMethodLabel = (paymentMethods: any[], method: PaymentMethod): string => {
  return paymentMethods.find((m) => m.value === method)?.label || 'Metode'
}

export const validatePaymentAmount = (
  paymentMethod: PaymentMethod,
  amountPaid: number,
  total: number
): { isValid: boolean; error?: string } => {
  if (paymentMethod === 'TUNAI' && amountPaid < total) {
    return {
      isValid: false,
      error: 'Jumlah pembayaran kurang dari total'
    }
  }
  return { isValid: true }
}

export const validateCart = (items: any[]): { isValid: boolean; error?: string } => {
  if (items.length === 0) {
    return {
      isValid: false,
      error: 'Keranjang belanja kosong'
    }
  }
  return { isValid: true }
}