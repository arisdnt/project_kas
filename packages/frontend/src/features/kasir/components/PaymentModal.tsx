import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/core/components/ui/dialog'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { useKasirStore, useKasirTotals } from '@/features/kasir/store/kasirStore'
import { useToast } from '@/core/hooks/use-toast'
import { useAuthStore } from '@/core/store/authStore'
import { kasirService } from '@/features/kasir/services/kasirService'
import { Search, X, CreditCard, Smartphone, Banknote, Wallet, Landmark } from 'lucide-react'
import type { PaymentInvoiceData } from './PaymentInvoiceModal'

type PaymentModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (invoice: PaymentInvoiceData) => void
}

// Local customer representation (broader) used only inside modal
type Customer = {
  id: string | number
  nama?: string | null
  email?: string | null
  telepon?: string | null
}

type PaymentMethod = 'TUNAI' | 'QRIS' | 'KARTU' | 'TRANSFER' | 'EWALLET'
// Internal mapping -> backend expects: 'tunai' | 'transfer' | 'kartu' | 'kredit' | 'poin'
type PaymentMethodAPI = 'tunai' | 'kartu' | 'transfer'

const paymentMethods = [
  { value: 'TUNAI', label: 'Tunai', icon: Banknote, color: 'text-green-600' },
  { value: 'QRIS', label: 'QRIS', icon: Smartphone, color: 'text-blue-600' },
  { value: 'KARTU', label: 'Kartu', icon: CreditCard, color: 'text-purple-600' },
  { value: 'TRANSFER', label: 'Transfer', icon: Landmark, color: 'text-orange-600' },
  { value: 'EWALLET', label: 'E-Wallet', icon: Wallet, color: 'text-indigo-600' },
]

export function PaymentModal({ open, onOpenChange, onSuccess }: PaymentModalProps) {
  const { toast } = useToast()
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const totals = useKasirTotals()
  const { 
    subtotal, 
    pajak, 
    total, 
    discount, 
    discountType, 
    discountValue
  } = totals

  const {
    setBayar,
    setMetode,
    setDiscountType,
    setDiscountValue,
    setPelanggan,
    items,
    metode,
    bayar,
    pelanggan,
    invoiceNumber
  } = useKasirStore()

  const [paymentMethod, setPaymentMethod] = useState(metode)
  const [discountTypeLocal, setDiscountTypeLocal] = useState(discountType)
  const [discountValueLocal, setDiscountValueLocal] = useState(discountValue)
  const [amountPaid, setAmountPaid] = useState(bayar)
  const [customerLocal, setCustomerLocal] = useState(pelanggan)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Customer search state
  const [customerQuery, setCustomerQuery] = useState('')
  const [customerResults, setCustomerResults] = useState<Customer[]>([])
  const [customerLoading, setCustomerLoading] = useState(false)
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState(-1)
  
  // Form state
  const [amountPaidText, setAmountPaidText] = useState('')
  const [discountText, setDiscountText] = useState('')

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setPaymentMethod(metode)
      setDiscountTypeLocal(discountType)
      setDiscountValueLocal(discountValue)
      setAmountPaid(metode === 'TUNAI' ? (bayar || total) : total)
      setCustomerLocal(pelanggan)
    }
  }, [open, metode, discountType, discountValue, total, pelanggan])

  useEffect(() => {
    if (open) {
      const initialAmount = metode === 'TUNAI' ? (bayar || total) : total
      setAmountPaid(initialAmount)
      setAmountPaidText(metode === 'TUNAI' && initialAmount ? formatNumberID(initialAmount) : '')
      if (discountType === 'nominal') {
        setDiscountText(discountValue ? formatNumberID(discountValue) : '')
      } else {
        setDiscountText('')
      }
    }
  }, [open, metode, bayar, total, discountType, discountValue])

  // Update amount paid when payment method or total changes
  useEffect(() => {
    if (paymentMethod !== 'TUNAI') {
      setAmountPaid(total)
    }
  }, [paymentMethod, total])

  useEffect(() => {
    if (paymentMethod === 'TUNAI') {
      setAmountPaidText(amountPaid ? formatNumberID(amountPaid) : '')
    } else {
      setAmountPaidText('')
    }
  }, [paymentMethod, amountPaid])

  useEffect(() => {
    if (discountTypeLocal !== 'nominal') {
      setDiscountText('')
    } else {
      setDiscountText(discountValueLocal ? formatNumberID(discountValueLocal) : '')
    }
  }, [discountTypeLocal, discountValueLocal])

  useEffect(() => {
    if (!customerQuery) {
      setShowCustomerDropdown(false)
    }
  }, [customerQuery])

  useEffect(() => {
    setSelectedCustomerIndex(-1)
  }, [customerQuery])

  // Sync form locals to store for live totals
  useEffect(() => { setMetode(paymentMethod) }, [paymentMethod, setMetode])
  useEffect(() => { setDiscountType(discountTypeLocal) }, [discountTypeLocal, setDiscountType])
  useEffect(() => { setDiscountValue(discountValueLocal) }, [discountValueLocal, setDiscountValue])
  useEffect(() => { if (paymentMethod === 'TUNAI') setBayar(amountPaid) }, [amountPaid, paymentMethod, setBayar])
  useEffect(() => { setPelanggan(customerLocal) }, [customerLocal, setPelanggan])

  // Customer search with debouncing
  const searchCustomers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setCustomerResults([])
      return
    }
    
    setCustomerLoading(true)
    try {
      const res = await fetch(`http://localhost:3000/api/pelanggan/search?q=${encodeURIComponent(query)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      const js = await res.json()
      if (res.ok && js.success) {
        setCustomerResults(js.data || [])
      }
    } catch {
      setCustomerResults([])
    } finally {
      setCustomerLoading(false)
    }
  }, [token])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (customerQuery) {
        searchCustomers(customerQuery)
      }
    }, 300)
    
    return () => clearTimeout(timeout)
  }, [customerQuery, searchCustomers])

  // Customer selection handlers
  const selectCustomer = (customer: Customer) => {
    setCustomerLocal(customer as any)
    setShowCustomerDropdown(false)
    setCustomerQuery('')
    setSelectedCustomerIndex(-1)
  }

  const clearCustomer = () => {
    setCustomerLocal(null)
    setCustomerQuery('')
    setShowCustomerDropdown(false)
  }

  const handleCustomerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedCustomerIndex(prev => Math.min(prev + 1, customerResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedCustomerIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedCustomerIndex >= 0 && customerResults[selectedCustomerIndex]) {
        selectCustomer(customerResults[selectedCustomerIndex])
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setShowCustomerDropdown(false)
      setCustomerQuery('')
    }
  }

  // Numeric helpers for pretty input
  const formatNumberID = (n: number) => {
    if (!isFinite(n)) return ''
    return new Intl.NumberFormat('id-ID').format(Math.floor(n))
  }

  const parseNumberID = (s: string) => {
    const digits = s.replace(/[^0-9]/g, '')
    return digits ? Number(digits) : 0
  }

  const formatCurrency = (n: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n)
  }

  const calculateChange = () => {
    if (paymentMethod === 'TUNAI') {
      return Math.max(0, amountPaid - total)
    }
    return 0
  }

  const changeAmount = calculateChange()
  const isShortPaid = paymentMethod === 'TUNAI' && amountPaid < total
  const selectedPaymentLabel = paymentMethods.find((method) => method.value === paymentMethod)?.label || 'Metode'

  // Convert payment method to API format
  const getAPIPaymentMethod = (method: PaymentMethod): PaymentMethodAPI => {
    switch (method) {
      case 'TUNAI': return 'tunai'
      case 'KARTU': return 'kartu'
      case 'TRANSFER': return 'transfer'
      case 'EWALLET': // map e-wallet to transfer (closest non-cash, non-card channel)
      case 'QRIS':
        return 'transfer'
      default: return 'tunai'
    }
  }

  const handleProcessPayment = async () => {
    if (items.length === 0) {
      toast({ title: 'Error', description: 'Keranjang belanja kosong', variant: 'destructive' })
      return
    }

    if (paymentMethod === 'TUNAI' && amountPaid < total) {
      toast({ title: 'Error', description: 'Jumlah pembayaran kurang dari total', variant: 'destructive' })
      return
    }

    setIsProcessing(true)
    try {
      // Use kasir API for payment processing
      // Build cart_items in backend expected shape
      const cartItemsPayload = items.map((it: any) => ({
        produk_id: typeof it._rawId === 'string' ? it._rawId : String(it.id),
        kuantitas: it.qty,
        harga_satuan: it.harga
      }))

      const paymentPayload = {
        metode_bayar: getAPIPaymentMethod(paymentMethod),
        jumlah_bayar: amountPaid,
        catatan: `Pembayaran ${selectedPaymentLabel}`,
        pelanggan_id: customerLocal ? String(customerLocal.id) : undefined,
        diskon_persen: discountTypeLocal === 'percent' ? discountValueLocal : 0,
        diskon_nominal: discountTypeLocal === 'nominal' ? discountValueLocal : 0,
        cart_items: cartItemsPayload
      }

      const result = await kasirService.processPayment(paymentPayload)

      const changeAmountServer = typeof result.kembalian === 'number' ? result.kembalian : calculateChange()
      const transactionDetail = result.transaksi

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

      const invoiceCustomer = transactionDetail?.pelanggan
        ? {
            id: transactionDetail.pelanggan.id,
            nama: transactionDetail.pelanggan.nama,
            email: (customerLocal as any)?.email || null,
            telepon: (customerLocal as any)?.telepon || null,
          }
        : customerLocal
          ? {
              id: customerLocal.id,
              nama: customerLocal.nama || null,
              email: (customerLocal as any).email || null,
              telepon: (customerLocal as any).telepon || null,
            }
          : null

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
          subtotal,
          tax: pajak,
          discount,
          total,
          taxRate: totals.taxRate,
        },
        items: invoiceItems,
        transaction: transactionDetail,
      }

      toast({ 
        title: 'Pembayaran Berhasil', 
        description: paymentMethod === 'TUNAI' 
          ? `Kembalian: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(changeAmountServer)}` 
          : 'Pembayaran non-tunai berhasil diproses'
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
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-label="Proses pembayaran kasir"
        className="w-full sm:w-[70vw] sm:min-w-[70vw] max-w-[95vw] border-0 p-0 sm:rounded-3xl shadow-2xl md:max-h-[90vh]"
      >
        <DialogTitle className="sr-only">Pembayaran Kasir</DialogTitle>
        <DialogDescription className="sr-only">Form untuk memproses pembayaran transaksi di kasir.</DialogDescription>
        <div className="flex min-h-[70vh] flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
          <div className="flex-1 px-6 py-6 sm:px-8 sm:py-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:items-stretch">
              <section className="rounded-3xl border border-slate-200/70 bg-white/70 p-6 shadow-sm backdrop-blur">
                <div className="flex h-full flex-col space-y-7">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">Pelanggan</h3>
                        <p className="text-sm text-slate-500">Opsional, cantumkan data pelanggan untuk referensi laporan.</p>
                      </div>
                      {customerLocal && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={clearCustomer}
                          className="h-8 w-8 text-slate-500 hover:text-slate-900"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="rounded-2xl bg-white/70 px-4 py-3 shadow-sm ring-1 ring-inset ring-slate-200/60">
                      <div className="font-medium text-slate-900">{customerLocal ? customerLocal.nama || 'Umum' : 'Umum'}</div>
                      {customerLocal && (
                        <div className="mt-1 text-xs text-slate-500">
                          {[(customerLocal as any).email, (customerLocal as any).telepon].filter(Boolean).join(' • ')}
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <label className="text-sm font-medium text-slate-700">Cari Pelanggan</label>
                      <div className="mt-2">
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            value={customerQuery}
                            onChange={(e) => setCustomerQuery(e.target.value)}
                            onFocus={() => setShowCustomerDropdown(true)}
                            onKeyDown={handleCustomerKeyDown}
                            placeholder="Nama, email, atau nomor telepon"
                            className="h-11 rounded-xl border-slate-300 bg-white/80 pl-10"
                          />
                        </div>
                      </div>
                      {showCustomerDropdown && customerQuery && (
                        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
                          {customerLoading && <div className="px-4 py-3 text-sm text-slate-500">Memuat...</div>}
                          {!customerLoading && customerResults.length === 0 && (
                            <div className="px-4 py-3 text-sm text-slate-500">Tidak ada hasil</div>
                          )}
                          {!customerLoading &&
                            customerResults.map((customer, idx) => (
                              <button
                                key={customer.id}
                                type="button"
                                className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm ${
                                  idx === selectedCustomerIndex ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-50'
                                }`}
                                onClick={() => selectCustomer(customer)}
                              >
                                <div>
                                  <div className="font-medium">{customer.nama || '-'}</div>
                                  <div className="text-xs text-slate-500">
                                    {[customer.email, customer.telepon].filter(Boolean).join(' • ')}
                                  </div>
                                </div>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="h-px w-full bg-slate-200/80" />

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Pengaturan Diskon</h3>
                      <p className="text-sm text-slate-500">Pastikan promo diterapkan sesuai kebijakan toko.</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Tipe Diskon</label>
                        <Select value={discountTypeLocal} onValueChange={(value: 'nominal' | 'percent') => setDiscountTypeLocal(value)}>
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
                          Nilai Diskon {discountTypeLocal === 'percent' ? '(%)' : '(Rp)'}
                        </label>
                        {discountTypeLocal === 'percent' ? (
                          <Input
                            type="number"
                            value={discountValueLocal || ''}
                            onChange={(e) => {
                              const v = Math.max(0, Math.min(100, Number(e.target.value) || 0))
                              setDiscountValueLocal(v)
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
                              setDiscountValueLocal(num)
                              setDiscountText(formatNumberID(num))
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

                  <div className="h-px w-full bg-slate-200/80" />

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono text-slate-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pajak</span>
                      <span className="font-mono text-slate-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrency(pajak)}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex items-center justify-between text-emerald-600">
                        <span>Diskon</span>
                        <span className="font-mono" style={{ fontVariantNumeric: 'tabular-nums' }}>
                          -{formatCurrency(discount)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-dashed border-slate-300 pt-2" />
                    <div className="flex items-center justify-between text-base font-semibold text-slate-900">
                      <span>Total</span>
                      <span className="font-mono" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <aside className="rounded-3xl border border-slate-900/5 bg-slate-900/95 p-6 text-white shadow-xl lg:p-8">
                <div className="flex h-full flex-col justify-between gap-8">
                  <div className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Total Pembayaran</p>
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
                        <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                          <SelectTrigger className="mt-2 h-11 rounded-xl border-white/20 bg-white/10 text-sm text-white">
                            <SelectValue placeholder="Pilih metode" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.map((method) => {
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
                        <label className="text-sm font-medium text-white/80">Nominal Tunai Diterima</label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={amountPaidText}
                          onChange={(e) => {
                            const val = e.target.value
                            const num = parseNumberID(val)
                            setAmountPaid(num)
                            setAmountPaidText(formatNumberID(num))
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
                        Pembayaran {selectedPaymentLabel.toLowerCase()} akan diproses sesuai total transaksi tanpa perlu konfirmasi nominal manual.
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Nominal Tercatat</p>
                        <p
                          className="mt-2 font-mono text-2xl font-semibold"
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {formatCurrency(paymentMethod === 'TUNAI' ? amountPaid : total)}
                        </p>
                      </div>
                      <div
                        className={`rounded-2xl border px-4 py-4 ${
                          changeAmount > 0 ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200' : 'border-white/15 bg-white/5 text-white'
                        }`}
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Kembalian</p>
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
                        Kekurangan {formatCurrency(total - amountPaid)}. Validasi kembali nominal pembayaran sebelum melanjutkan.
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => onOpenChange(false)}
                      className="h-11 border border-white/20 text-white hover:bg-white/10 sm:min-w-[140px]"
                      disabled={isProcessing}
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={handleProcessPayment}
                      className="h-11 bg-white text-slate-900 hover:bg-white/90 sm:min-w-[200px] text-base font-semibold"
                      disabled={isProcessing || isShortPaid}
                    >
                      {isProcessing ? 'Memproses...' : `Proses ${formatCurrency(total)}`}
                    </Button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
