import { Dialog, DialogContent } from '@/core/components/ui/dialog'
import { Button } from '@/core/components/ui/button'
import { config } from '@/core/config'
import { Printer } from 'lucide-react'

export type PaymentInvoiceItem = {
  id: number | string
  name: string
  sku?: string
  quantity: number
  price: number
  subtotal: number
}

export type PaymentInvoiceData = {
  invoiceNumber: string
  referenceNumber?: string
  issuedAt: string
  cashier?: {
    id?: string | number
    name?: string
  }
  customer?: {
    id?: string | number
    nama?: string | null
    email?: string | null
    telepon?: string | null
  } | null
  payment: {
    method: string
    methodLabel: string
    amountPaid: number
    change: number
  }
  totals: {
    subtotal: number
    tax: number
    discount: number
    total: number
    taxRate?: number
  }
  items: PaymentInvoiceItem[]
  transaction?: any
}

type PaymentInvoiceModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: PaymentInvoiceData | null
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount)

const formatDateTime = (iso: string) => {
  const date = new Date(iso)
  return {
    date: date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }),
    time: date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

export function PaymentInvoiceModal({ open, onOpenChange, data }: PaymentInvoiceModalProps) {
  const handleClose = (openValue: boolean) => {
    onOpenChange(openValue)
  }

  const handlePrint = () => {
    window.print()
  }

  const storeInfo = config.infoToko
  const issuedInfo = data?.issuedAt ? formatDateTime(data.issuedAt) : null
  const items = data?.items ?? []
  const payment = data?.payment
  const totals = data?.totals

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        aria-label="Invoice pembayaran"
        className="w-full sm:w-[70vw] sm:min-w-[70vw] max-w-5xl border-0 bg-transparent p-0 shadow-none outline-none sm:rounded-3xl print:static print:w-full print:min-w-full print:max-w-none print:rounded-none print:border-0 print:p-0"
      >
        <div className="flex h-full flex-col bg-white text-slate-900 print:min-h-screen">
          <header className="border-b border-slate-200 px-8 py-6 print:px-12">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Invoice</p>
                <h1 className="text-2xl font-bold text-slate-900">{storeInfo.nama}</h1>
                <div className="text-sm text-slate-600">
                  <p>{storeInfo.alamat}</p>
                  <p className="mt-1">Telp: {storeInfo.teleponKontak}</p>
                  <p>Email: {storeInfo.emailKontak}</p>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-200 px-6 py-4 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-6">
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-500">No. Invoice</span>
                  <span className="font-semibold text-slate-900">{data?.invoiceNumber}</span>
                </div>
                {data?.referenceNumber && (
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Referensi</span>
                    <span className="font-medium text-slate-900">{data.referenceNumber}</span>
                  </div>
                )}
                {issuedInfo && (
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Diterbitkan</span>
                    <span className="font-semibold text-slate-900">{issuedInfo.date}</span>
                    <span className="text-xs text-slate-500">{issuedInfo.time}</span>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 px-8 py-6 print:px-12">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Untuk</h2>
                <div className="rounded-2xl border border-slate-200 px-5 py-4 text-sm text-slate-600">
                  <p className="text-base font-semibold text-slate-900">
                    {data?.customer?.nama || 'Pelanggan Umum'}
                  </p>
                  {data?.customer?.email && <p className="mt-1">{data.customer.email}</p>}
                  {data?.customer?.telepon && <p>{data.customer.telepon}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Kasir</h2>
                <div className="rounded-2xl border border-slate-200 px-5 py-4 text-sm text-slate-600">
                  <p className="text-base font-semibold text-slate-900">
                    {data?.cashier?.name || 'Kasir'}
                  </p>
                  <p className="mt-1">Metode: {payment?.methodLabel || '-'}</p>
                  {data?.transaction?.toko_id && (
                    <p>ID Toko: {data.transaction.toko_id}</p>
                  )}
                </div>
              </div>
            </div>

            <section className="mt-8 rounded-2xl border border-slate-200">
              <table className="w-full table-fixed text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="w-[40%] px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em]">Item</th>
                    <th className="w-[15%] px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em]">Qty</th>
                    <th className="w-[20%] px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em]">Harga</th>
                    <th className="w-[25%] px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em]">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr className="border-t border-slate-200 text-slate-500">
                      <td className="px-5 py-4 text-center" colSpan={4}>
                        Tidak ada item transaksi.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={`${item.id}-${item.sku || item.name}`} className="border-t border-slate-200 text-slate-700">
                        <td className="px-5 py-3">
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          {item.sku && <p className="text-xs text-slate-500">SKU: {item.sku}</p>}
                        </td>
                        <td className="px-5 py-3 text-right font-mono">{item.quantity}</td>
                        <td className="px-5 py-3 text-right font-mono">{formatCurrency(item.price)}</td>
                        <td className="px-5 py-3 text-right font-mono font-semibold">{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>

            <section className="mt-8 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4 rounded-2xl border border-slate-200 px-5 py-4 text-sm text-slate-600">
                <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Catatan Pembayaran</h3>
                <p>
                  Transaksi telah diselesaikan menggunakan metode pembayaran {payment?.methodLabel?.toLowerCase() ?? '---'}.
                  Simpan invoice ini sebagai bukti resmi pembayaran.
                </p>
                {payment?.method === 'TUNAI' && (
                  <p className="text-xs text-emerald-600">
                    Kembalian yang diberikan: {formatCurrency(payment?.change ?? 0)}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 px-5 py-4 text-sm text-slate-600">
                <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Ringkasan</h3>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatCurrency(totals?.subtotal ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pajak {totals?.taxRate ? `(${Math.round((totals.taxRate || 0) * 100)}%)` : ''}</span>
                    <span className="font-mono">{formatCurrency(totals?.tax ?? 0)}</span>
                  </div>
                  {totals && totals.discount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600">
                      <span>Diskon</span>
                      <span className="font-mono">-{formatCurrency(totals.discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between text-base font-semibold text-slate-900">
                      <span>Total</span>
                      <span className="font-mono">{formatCurrency(totals?.total ?? 0)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dibayar</span>
                    <span className="font-mono">{formatCurrency(payment?.amountPaid ?? 0)}</span>
                  </div>
                  {payment?.method === 'TUNAI' && (
                    <div className="flex items-center justify-between">
                      <span>Kembalian</span>
                      <span className="font-mono">{formatCurrency(payment?.change ?? 0)}</span>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </main>

          <footer className="flex items-center justify-between border-t border-slate-200 px-8 py-4 print:hidden">
            <p className="text-xs text-slate-500">
              Terima kasih telah berbelanja di {storeInfo.nama}. Simpan invoice ini sebagai bukti pembayaran resmi.
            </p>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => handleClose(false)}>
                Selesai
              </Button>
              <Button onClick={handlePrint} className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Cetak
              </Button>
            </div>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  )
}
