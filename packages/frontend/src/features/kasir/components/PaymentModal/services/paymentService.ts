import { kasirService } from '@/features/kasir/services/kasirService'
import { useAuthStore } from '@/core/store/authStore'
import { useKasirStore } from '@/features/kasir/store/kasirStore'
import type { PaymentInvoiceData } from '../../PaymentInvoiceModal'
import { PaymentProcessingData, PaymentMethod, Customer } from '../types'
import { getAPIPaymentMethod, getPaymentMethodLabel } from '../utils/paymentHelpers'
import { PAYMENT_METHODS } from '../constants/paymentMethods'
import { calculateChange, formatCurrency } from '../utils/formatters'

interface ProcessPaymentParams {
  paymentMethod: PaymentMethod
  amountPaid: number
  customer: Customer | null
  discountType: 'nominal' | 'percent'
  discountValue: number
  items: any[]
  totals: any
  invoiceNumber: string
}

export const processPayment = async (params: ProcessPaymentParams): Promise<PaymentInvoiceData> => {
  const {
    paymentMethod,
    amountPaid,
    customer,
    discountType,
    discountValue,
    items,
    totals,
    invoiceNumber
  } = params

  const user = useAuthStore.getState().user
  const selectedPaymentLabel = getPaymentMethodLabel(PAYMENT_METHODS, paymentMethod)

  // Build cart items in backend expected shape
  const cartItemsPayload = items.map((item: any) => ({
    produk_id: typeof item._rawId === 'string' ? item._rawId : String(item.id),
    kuantitas: item.qty,
    harga_satuan: item.harga
  }))

  const paymentPayload: PaymentProcessingData = {
    metode_bayar: getAPIPaymentMethod(paymentMethod),
    jumlah_bayar: amountPaid,
    catatan: `Pembayaran ${selectedPaymentLabel}`,
    pelanggan_id: customer ? String(customer.id) : undefined,
    diskon_persen: discountType === 'percent' ? discountValue : 0,
    diskon_nominal: discountType === 'nominal' ? discountValue : 0,
    cart_items: cartItemsPayload
  }

  const result = await kasirService.processPayment(paymentPayload)

  const changeAmountServer = typeof result.kembalian === 'number'
    ? result.kembalian
    : calculateChange(amountPaid, totals.total, paymentMethod)

  const transactionDetail = result.transaksi

  // Build invoice items
  const invoiceItems = (transactionDetail?.items && transactionDetail.items.length > 0)
    ? transactionDetail.items.map((item) => ({
        id: item.produk_id,
        name: item.nama_produk,
        quantity: item.quantity,
        price: item.harga_satuan,
        subtotal: item.subtotal,
      }))
    : items.map((item) => ({
        id: item.id,
        name: item.nama,
        sku: item.sku,
        quantity: item.qty,
        price: item.harga,
        subtotal: item.harga * item.qty,
      }))

  // Build invoice customer
  const invoiceCustomer = transactionDetail?.pelanggan
    ? {
        id: transactionDetail.pelanggan.id,
        nama: transactionDetail.pelanggan.nama,
        email: (customer as any)?.email || null,
        telepon: (customer as any)?.telepon || null,
      }
    : customer
      ? {
          id: customer.id,
          nama: customer.nama || null,
          email: (customer as any).email || null,
          telepon: (customer as any).telepon || null,
        }
      : null

  // Build final invoice payload
  const invoicePayload: PaymentInvoiceData = {
    invoiceNumber,
    referenceNumber: transactionDetail?.nomor_transaksi,
    issuedAt: transactionDetail?.created_at || new Date().toISOString(),
    cashier: {
      id: user?.id,
      name: user?.namaLengkap || user?.fullName || user?.nama || user?.username,
    },
    customer: invoiceCustomer,
    payment: {
      method: paymentMethod,
      methodLabel: selectedPaymentLabel,
      amountPaid,
      change: changeAmountServer,
    },
    totals: {
      subtotal: totals.subtotal,
      tax: totals.pajak,
      discount: totals.discount,
      total: totals.total,
      taxRate: totals.taxRate,
    },
    items: invoiceItems,
    transaction: transactionDetail,
  }

  return invoicePayload
}

export const getPaymentSuccessMessage = (
  paymentMethod: PaymentMethod,
  changeAmount: number
): { title: string; description: string } => {
  return {
    title: 'Pembayaran Berhasil',
    description: paymentMethod === 'TUNAI'
      ? `Kembalian: ${formatCurrency(changeAmount)}`
      : 'Pembayaran non-tunai berhasil diproses'
  }
}