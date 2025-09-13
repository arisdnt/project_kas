import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/core/components/ui/card'
import { FilterBar } from '../components/FilterBar'
import { SummaryCards } from '../components/SummaryCards'
import { SalesChart } from '../components/SalesChart'
import { SalesTable } from '../components/SalesTable'
import { Filters, Aggregates, SaleRecord } from '../types'
import { generateSampleSales } from '../data/sampleSales'
import { exportCSV, printSales } from '../utils/exporters'

const cashiers = ['Andi', 'Budi', 'Citra', 'Dewi']

function withinRange(d: string, from?: string, to?: string) {
  if (!from && !to) return true
  const x = d
  if (from && x < from) return false
  if (to && x > to) return false
  return true
}

export function LaporanPenjualanPage() {
  const [all] = useState<SaleRecord[]>(() => generateSampleSales(30, 90))
  const today = new Date()
  const dateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  const [filters, setFilters] = useState<Filters>({ range: '7d', payment: 'ALL' })

  const normalized = useMemo(() => {
    if (filters.range !== 'custom') {
      let from: string | undefined
      if (filters.range === 'today') {
        from = dateStr(today)
      } else if (filters.range === '7d') {
        const d = new Date(today); d.setDate(today.getDate() - 6); from = dateStr(d)
      } else if (filters.range === '30d') {
        const d = new Date(today); d.setDate(today.getDate() - 29); from = dateStr(d)
      }
      return { ...filters, from, to: dateStr(today) }
    }
    return filters
  }, [filters])

  const filtered = useMemo(() => {
    return all.filter((r) => {
      if (!withinRange(r.date, normalized.from, normalized.to)) return false
      if (normalized.cashier && r.cashier !== normalized.cashier) return false
      if (normalized.payment && normalized.payment !== 'ALL' && r.payment !== normalized.payment) return false
      if (normalized.query) {
        const q = normalized.query.toLowerCase()
        if (!(`${r.code}`.toLowerCase().includes(q) || (r.customer || '').toLowerCase().includes(q))) return false
      }
      return true
    })
  }, [all, normalized])

  const aggs: Aggregates = useMemo(() => {
    const omzet = filtered.reduce((a, b) => a + b.total, 0)
    const transaksi = filtered.length
    const rataRata = transaksi ? omzet / transaksi : 0
    const diskon = filtered.reduce((a, b) => a + b.discount, 0)
    return { omzet, transaksi, rataRata, diskon }
  }, [filtered])

  const handleExport = () => exportCSV(filtered)
  const handlePrint = () => printSales(filtered, aggs, normalized)

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Laporan Penjualan</h2>
          <p className="text-sm text-gray-600">Analisis penjualan berdasarkan rentang waktu dan filter</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <FilterBar
            filters={normalized}
            cashiers={cashiers}
            onChange={(p) => setFilters((f) => ({ ...f, ...p }))}
            onExportCSV={handleExport}
            onPrint={handlePrint}
          />
        </CardContent>
      </Card>

      <SummaryCards data={aggs} />

      <SalesChart data={filtered} />

      <Card>
        <CardContent className="p-4">
          <SalesTable data={filtered} />
        </CardContent>
      </Card>
    </div>
  )
}

export default LaporanPenjualanPage

