import { Search, X, CreditCard, Smartphone, Banknote, Wallet, Landmark } from 'lucide-react'
import { PaymentMethodConfig, PaymentMethod, PaymentMethodAPI } from '../types'

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  { value: 'TUNAI', label: 'Tunai', icon: Banknote, color: 'text-green-600' },
  { value: 'QRIS', label: 'QRIS', icon: Smartphone, color: 'text-blue-600' },
  { value: 'KARTU', label: 'Kartu', icon: CreditCard, color: 'text-purple-600' },
  { value: 'TRANSFER', label: 'Transfer', icon: Landmark, color: 'text-orange-600' },
  { value: 'EWALLET', label: 'E-Wallet', icon: Wallet, color: 'text-indigo-600' },
]

export const PAYMENT_METHOD_API_MAPPING: Record<PaymentMethod, PaymentMethodAPI> = {
  TUNAI: 'tunai',
  KARTU: 'kartu',
  TRANSFER: 'transfer',
  EWALLET: 'transfer', // map e-wallet to transfer
  QRIS: 'transfer'
}

export const DISCOUNT_TYPES = [
  { value: 'nominal', label: 'Nominal (Rp)' },
  { value: 'percent', label: 'Persen (%)' }
] as const

export const CUSTOMER_SEARCH_DEBOUNCE_MS = 300