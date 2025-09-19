import type { PaymentInvoiceData } from '../../PaymentInvoiceModal'

export type PaymentModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (invoice: PaymentInvoiceData) => void
}

export type Customer = {
  id: string | number
  nama?: string | null
  email?: string | null
  telepon?: string | null
}

export type PaymentMethod = 'TUNAI' | 'QRIS' | 'KARTU' | 'TRANSFER' | 'EWALLET'
export type PaymentMethodAPI = 'tunai' | 'kartu' | 'transfer'

export type DiscountType = 'nominal' | 'percent'

export interface PaymentFormState {
  paymentMethod: PaymentMethod
  discountType: DiscountType
  discountValue: number
  amountPaid: number
  customer: Customer | null
  isProcessing: boolean
}

export interface CustomerSearchState {
  query: string
  results: Customer[]
  loading: boolean
  showDropdown: boolean
  selectedIndex: number
}

export interface PaymentMethodConfig {
  value: PaymentMethod
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export interface PaymentProcessingData {
  metode_bayar: PaymentMethodAPI
  jumlah_bayar: number
  catatan: string
  pelanggan_id?: string
  diskon_persen: number
  diskon_nominal: number
  cart_items: Array<{
    produk_id: string
    kuantitas: number
    harga_satuan: number
  }>
}