import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/core/components/ui/card'
import { MovementFilterBar } from '../components/MovementFilterBar'
import { MovementTable } from '../components/MovementTable'
import { Filters, SaleTransaction } from '../types'
import { generateSampleTransactions } from '../data/sampleSalesTx'
import { exportMovementCSV } from '../utils/exporters'
import { printStrukFromServer, previewStrukFallback } from '../utils/print'

const cashiers = ['Andi', 'Budi', 'Citra', 'Dewi']

function withinRange(d: string, from?: string, to?: string) {
  if (!from && !to) return true
  const x = d
  if (from && x < from) return false
  if (to && x > to) return false
  return true
}

export function PenjualanPage() {
  const [txs] = useState<SaleTransaction[]>(() => generateSampleTransactions(14, 28))
  const today = new Date()
  const dateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const [filters, setFilters] = useState<Filters>({ range: '7d', payment: 'ALL' as any })

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

  const filtered = useMemo(() => {
    return txs.filter((t) => {
      if (!withinRange(t.date, normalized.from, normalized.to)) return false
      if (normalized.cashier && t.cashier !== normalized.cashier) return false
      if (normalized.payment && normalized.payment !== 'ALL' && t.payment !== normalized.payment) return false
      if (normalized.query) {
        const q = normalized.query.toLowerCase()
        const hasLine = t.lines.some((l) => l.productName.toLowerCase().includes(q) || (l.sku || '').toLowerCase().includes(q))
        if (!(t.code.toLowerCase().includes(q) || hasLine)) return false
      }
      return true
    })
  }, [txs, normalized])

  const onExport = () => exportMovementCSV(filtered)
  const onPrintAll = () => {
    // Print a compact preview of all visible rows
    const total = filtered.reduce((acc, t) => acc + t.lines.reduce((a, b) => a + b.total, 0), 0)
    const lines = filtered.flatMap((t) => t.lines.map((l) => `${t.date} ${t.time || ''} ${t.code} ${l.productName} ${l.qty}${l.unit} Rp${l.total.toLocaleString('id-ID')}`)).join('\n')
    const text = `Pergerakan Penjualan\n\n${lines}\n\nTotal: Rp${total.toLocaleString('id-ID')}`
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<pre style="font: 12px/1.4 ui-monospace, SFMono-Regular; white-space: pre-wrap;">${text}</pre>`)
    w.document.close()
    w.focus()
  }

  const onPrintStruk = async (id: number) => {
    const ok = await printStrukFromServer(id)
    if (!ok) {
      const tx = filtered.find((t) => t.id === id)
      if (tx) previewStrukFallback(tx)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Aktivitas Penjualan</h2>
        <p className="text-sm text-gray-600">Pergerakan barang berdasarkan transaksi</p>
      </div>
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

      <MovementTable transactions={filtered} onPrint={onPrintStruk} />
    </div>
  )
}

export default PenjualanPage

