import { useMemo, useState, useEffect } from 'react'
import { Card, CardContent } from '@/core/components/ui/card'
import { MovementFilterBar } from '../components/MovementFilterBar'
import { MovementTable } from '../components/MovementTable'
import { Filters, SaleTransaction } from '../types'
import { exportMovementCSV } from '../utils/exporters'
import { printStrukFromServer, previewStrukFallback } from '../utils/print'
import { PenjualanService, TransaksiPenjualan } from '../services/penjualanService'

function withinRange(d: string, from?: string, to?: string) {
  if (!from && !to) return true
  const x = d
  if (from && x < from) return false
  if (to && x > to) return false
  return true
}

export function PenjualanPage() {
  const [apiTxs, setApiTxs] = useState<TransaksiPenjualan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const today = new Date()
  const dateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const [filters, setFilters] = useState<Filters>({ range: '7d', payment: 'ALL' as any })

  // Fetch data dari API
  const fetchTransactions = async (dateRange: { from?: string; to?: string }) => {
    setLoading(true)
    setError(null)

    try {
      const response = await PenjualanService.searchTransaksi({
        start_date: dateRange.from,
        end_date: dateRange.to,
        limit: 100 // Ambil lebih banyak data untuk UX yang lebih baik
      })

      setApiTxs(response.data)
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
      setError('Gagal memuat data transaksi dari server.')
      setApiTxs([]) // Set ke array kosong jika gagal
    } finally {
      setLoading(false)
    }
  }

  // Fungsi untuk konversi data API ke format lokal
  const convertApiToLocal = (apiData: any[]): SaleTransaction[] => {
    if (!apiData || !Array.isArray(apiData)) {
      return []
    }
    return apiData.map((tx) => ({
      id: parseInt(tx.id),
      code: tx.nomor_transaksi || tx.transaction_code || '',
      date: tx.tanggal ? tx.tanggal.split(' ')[0] : (tx.transaction_date ? tx.transaction_date.split('T')[0] : ''), // Ambil tanggal saja
      time: tx.tanggal ? new Date(tx.tanggal).toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }) : (tx.transaction_date ? new Date(tx.transaction_date).toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }) : ''),
      cashier: tx.kasir_nama || tx.cashier_name || '',
      payment: (tx.metode_bayar || tx.payment_method || 'tunai') as any,
      status: (tx.status || 'selesai') as any,
      total: parseFloat(tx.total || '0'),
      lines: (tx.items || []).map((item: any) => ({
        productId: parseInt(item.product_id || item.produk_id || '0'),
        productName: item.product_name || item.produk_nama || '',
        sku: item.sku || item.produk_kode || '',
        qty: item.quantity || item.kuantitas || 0,
        unit: 'pcs', // Default unit
        price: item.unit_price || item.harga_satuan || 0,
        discount: 0, // Default discount
        tax: 0, // Default tax
        total: item.total_price || item.total_harga || 0,
      })),
    }))
  }

  // Normalize filters untuk menghitung rentang tanggal
  const normalized = useMemo(() => {
    if (filters.range !== 'custom') {
      let from: string | undefined
      if (filters.range === 'today') from = dateStr(today)
      if (filters.range === '7d') { const d = new Date(today); d.setDate(today.getDate() - 6); from = dateStr(d) }
      if (filters.range === '30d') { const d = new Date(today); d.setDate(today.getDate() - 29); from = dateStr(d) }
      return { ...filters, from, to: dateStr(today) }
    }
    return filters
  }, [filters])

  // Effect untuk fetch data ketika filter berubah
  useEffect(() => {
    const { from, to } = normalized
    fetchTransactions({ from, to })
  }, [normalized.from, normalized.to])

  const filtered = useMemo(() => {
    // Pastikan apiTxs adalah array sebelum dikonversi
    if (!Array.isArray(apiTxs)) {
      return []
    }

    // Gunakan data API yang sudah dikonversi
    const sourceData = convertApiToLocal(apiTxs)

    return sourceData.filter((t: SaleTransaction) => {
      if (!withinRange(t.date, normalized.from, normalized.to)) return false
      if (normalized.cashier && t.cashier !== normalized.cashier) return false
      if (normalized.payment && normalized.payment !== 'ALL' && t.payment !== normalized.payment) return false
      if (normalized.query) {
        const q = normalized.query.toLowerCase()
        const hasLine = t.lines.some((l: any) => l.productName.toLowerCase().includes(q) || (l.sku || '').toLowerCase().includes(q))
        if (!(t.code.toLowerCase().includes(q) || hasLine)) return false
      }
      return true
    })
  }, [apiTxs, normalized])

  const onExport = () => exportMovementCSV(filtered)
  const onPrintAll = () => {
    // Print preview kompak dari semua baris yang terlihat
    const total = filtered.reduce((acc: number, t: SaleTransaction) => acc + t.lines.reduce((a: number, b: any) => a + b.total, 0), 0)
    const lines = filtered.flatMap((t: SaleTransaction) => t.lines.map((l: any) => `${t.date} ${t.time || ''} ${t.code} ${l.productName} ${l.qty}${l.unit} Rp${l.total.toLocaleString('id-ID')}`)).join('\n')
    const text = `Pergerakan Penjualan\n\n${lines}\n\nTotal: Rp${total.toLocaleString('id-ID')}`
    
    // Buat window baru untuk preview
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<pre style="font: 12px/1.4 ui-monospace, SFMono-Regular; white-space: pre-wrap;">${text}</pre>`)
    w.document.close()
    w.focus()
  }

  const onPrintTx = (trxId: number) => {
    const tx = filtered.find((t) => t.id === trxId)
    if (!tx) return
    
    printStrukFromServer(trxId).catch(() => {
      // Fallback jika server print gagal
      previewStrukFallback(tx)
    })
  }

  // Ambil daftar kasir unik dari data API
  const cashiers = useMemo(() => {
    if (!apiTxs || !Array.isArray(apiTxs)) {
      return []
    }
    const uniqueCashiers = [...new Set(apiTxs.map(tx => tx.cashier_name).filter(Boolean))]
    return uniqueCashiers.length > 0 ? uniqueCashiers : []
  }, [apiTxs])

  const onPrintStruk = async (id: number) => {
    const ok = await printStrukFromServer(id)
    if (!ok) {
      const tx = filtered.find((t) => t.id === id)
      if (tx) {
        previewStrukFallback(tx)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Pergerakan Penjualan</h2>
          <p className="text-sm text-gray-600">Pergerakan barang berdasarkan transaksi</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <MovementFilterBar
            filters={normalized}
            cashiers={cashiers}
            onChange={(p) => setFilters((f) => ({ ...f, ...p }))}
            onExport={onExport}
            onPrint={onPrintAll}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <MovementTable 
            transactions={filtered} 
            onPrint={onPrintTx}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default PenjualanPage

