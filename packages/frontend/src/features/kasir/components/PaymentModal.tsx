import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent } from '@/core/components/ui/dialog'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { useKasirStore, useKasirTotals } from '@/features/kasir/store/kasirStore'
import { useToast } from '@/core/hooks/use-toast'
import { useAuthStore } from '@/core/store/authStore'
import { User, Search, X, CreditCard, Smartphone, Banknote, Wallet, Landmark } from 'lucide-react'

type PaymentModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

type Customer = {
  id: number
  nama?: string
  email?: string
  telepon?: string
}

type PaymentMethod = 'TUNAI' | 'QRIS' | 'KARTU' | 'TRANSFER' | 'EWALLET'

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
  const totals = useKasirTotals()
  const { 
    subtotal, 
    pajak, 
    total, 
    gross, 
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
    clear,
    metode,
    bayar,
    pelanggan
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
      setAmountPaid(metode === 'TUNAI' ? total : total)
      setCustomerLocal(pelanggan)
    }
  }, [open, metode, discountType, discountValue, total, pelanggan])

  // Update amount paid when payment method or total changes
  useEffect(() => {
    if (paymentMethod !== 'TUNAI') {
      setAmountPaid(total)
    }
  }, [paymentMethod, total])

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
    setCustomerLocal(customer)
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
      const lines = items.map((it) => ({ id_produk: it.id, qty: it.qty, line: it.harga * it.qty }))
      const effTotal = gross > 0 ? gross - discount : 0
      const ratio = gross > 0 ? effTotal / gross : 1
      const itemsPayload = lines.map((l) => {
        const lineAfter = Number((l.line * ratio).toFixed(2))
        const unit = l.qty > 0 ? Number((lineAfter / l.qty).toFixed(2)) : 0
        return { id_produk: l.id_produk, jumlah: l.qty, harga: unit }
      })

      const payload = {
        id_pelanggan: customerLocal?.id,
        metode_pembayaran: paymentMethod,
        bayar: amountPaid,
        kembalian: paymentMethod === 'TUNAI' ? Math.max(0, amountPaid - total) : 0,
        items: itemsPayload,
      }

      const res = await fetch('http://localhost:3000/api/penjualan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      const js = await res.json()
      if (!res.ok || !js.success) throw new Error(js.message || 'Gagal memproses pembayaran')

      const changeAmount = paymentMethod === 'TUNAI' ? Math.max(0, amountPaid - total) : 0
      toast({ 
        title: 'Pembayaran Berhasil', 
        description: paymentMethod === 'TUNAI' 
          ? `Kembalian: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(changeAmount)}` 
          : 'Pembayaran non-tunai berhasil diproses'
      })

      onOpenChange(false)
      onSuccess?.()
      clear()

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
      <DialogContent className="max-w-5xl w-[80vw] max-h-[85vh] overflow-hidden flex flex-col pt-8 border border-gray-200">
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Left: Customer & Summary */}
            <div className="bg-blue-900 rounded-lg p-6 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-6">
                {/* Customer Selection */}
                <div>
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-white" />
                    Pelanggan
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-blue-100">
                        Pelanggan Terpilih
                      </div>
                      {customerLocal ? (
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-white">{customerLocal.nama || 'Umum'}</div>
                          <Button variant="secondary" size="sm" onClick={clearCustomer}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                        >
                          Pilih
                        </Button>
                      )}
                    </div>
                    {showCustomerDropdown && (
                      <div className="relative">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            value={customerQuery}
                            onChange={(e) => setCustomerQuery(e.target.value)}
                            onKeyDown={handleCustomerKeyDown}
                            placeholder="Cari pelanggan (nama/email/telp)"
                            className="pl-9 bg-white focus:outline-none focus:ring-0"
                            onFocus={() => setShowCustomerDropdown(true)}
                          />
                        </div>
                        {customerQuery && (
                          <div className="absolute z-20 mt-1 w-full rounded-md border border-blue-300 bg-white shadow-xl max-h-72 overflow-auto">
                            {customerLoading && <div className="p-3 text-sm text-gray-500">Memuat...</div>}
                            {!customerLoading && customerResults.length === 0 && (
                              <div className="p-3 text-sm text-gray-500">Tidak ada hasil</div>
                            )}
                            {customerResults.map((customer, idx) => (
                              <button
                                key={customer.id}
                                type="button"
                                className={`w-full text-left px-3 py-2 flex items-center justify-between ${
                                  idx === selectedCustomerIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                                }`}
                                onClick={() => selectCustomer(customer)}
                              >
                                <div className="flex flex-col">
                                  <span className={`text-sm ${idx === selectedCustomerIndex ? 'text-blue-900' : 'text-gray-900'}`}>
                                    {customer.nama || '-'}
                                  </span>
                                  <span className={`text-xs ${idx === selectedCustomerIndex ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {customer.email || customer.telepon || ''}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h3 className="font-semibold text-white mb-4">Ringkasan Pesanan</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-100">Subtotal</span>
                      <span className="font-medium font-mono text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-100">Pajak</span>
                      <span className="font-medium font-mono text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrency(pajak)}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-300">
                        <span className="">Diskon</span>
                        <span className="font-medium font-mono text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
                          - {formatCurrency(discount)}
                        </span>
                      </div>
                    )}
                    <div className="my-2 border-t border-dotted border-blue-700" />
                    <div className="flex justify-between text-lg font-bold text-white">
                      <span>Total Pembayaran</span>
                      <span className="font-mono text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Cancel Button */}
              <div className="pt-4 mt-auto">
                <Button 
                  variant="secondary" 
                  onClick={() => onOpenChange(false)}
                  className="w-full h-12 text-base bg-white/10 hover:bg-white/20 text-white border-white/20"
                  disabled={isProcessing}
                >
                  Batal
                </Button>
              </div>
            </div>

            {/* Right: Forms */}
            <div className="bg-white rounded-lg p-6 flex flex-col">
              <div className="space-y-6">
                {/* Payment Method */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Metode Pembayaran</h3>
                  <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                    <SelectTrigger className="w-full h-12 text-base focus:outline-none focus:ring-0">
                      <SelectValue placeholder="Pilih metode pembayaran" />
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

                {/* Discount */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Diskon</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-600">Tipe Diskon</label>
                      <Select value={discountTypeLocal} onValueChange={(value: 'nominal' | 'percent') => setDiscountTypeLocal(value)}>
                        <SelectTrigger className="w-full mt-1 h-12 text-base focus:outline-none focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nominal">Nominal (Rp)</SelectItem>
                          <SelectItem value="percent">Persen (%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">
                        Nilai Diskon {discountTypeLocal === 'percent' ? '(%)' : '(Rp)'}
                      </label>
                      {discountTypeLocal === 'percent' ? (
                        <Input
                          type="number"
                          value={discountValueLocal || ''}
                          onChange={(e) => {
                            const v = Math.max(0, Math.min(100, Number(e.target.value) || 0))
                            setDiscountValueLocal(v)
                            setDiscountText(String(v))
                          }}
                          placeholder="0-100"
                          className="mt-1 h-12 text-base focus:outline-none focus:ring-0"
                          min="0"
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
                          className="mt-1 h-12 text-base text-right focus:outline-none focus:ring-0"
                        />
                      )}
                    </div>
                  </div>
                  {discount > 0 && (
                    <div className="text-sm text-green-600 font-medium">
                      Diskon: {formatCurrency(discount)}
                    </div>
                  )}
                </div>

                {/* Amount Input */}
                {paymentMethod === 'TUNAI' && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Uang Diterima</h3>
                    <div className="space-y-2">
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
                        className="text-2xl font-bold h-16 font-mono text-right focus:outline-none focus:ring-0"
                      />
                      <div className="flex justify-between items-center text-lg">
                        <span className="text-gray-600">Kembalian:</span>
                        <span className={`font-bold font-mono ${calculateChange() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(calculateChange())}
                        </span>
                      </div>
                      {amountPaid < total && (
                        <div className="text-sm text-red-600 font-medium">
                          Kurang bayar {formatCurrency(total - amountPaid)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Process Button */}
              <div className="pt-4 mt-auto">
                <Button 
                  onClick={handleProcessPayment}
                  className="w-full h-12 text-base font-semibold"
                  disabled={isProcessing || (paymentMethod === 'TUNAI' && amountPaid < total)}
                >
                  {isProcessing ? 'Memproses...' : `Proses ${formatCurrency(total)}`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}