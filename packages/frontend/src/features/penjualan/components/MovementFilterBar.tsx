import { Filters } from '../types'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/core/components/ui/select'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { Calendar, Download, Printer, RefreshCw } from 'lucide-react'
import { useMemo } from 'react'

type Props = {
  filters: Filters
  cashiers: string[]
  onChange: (patch: Partial<Filters>) => void
  onExport: () => void
  onPrint: () => void
  onRefresh?: () => void
  loading?: boolean
}

export function MovementFilterBar({ filters, cashiers, onChange, onExport, onPrint, onRefresh, loading }: Props) {
  const showCustom = filters.range === 'custom'
  const dateLabel = useMemo(() => {
    if (filters.range === 'custom' && filters.from && filters.to) return `${filters.from} s/d ${filters.to}`
    if (filters.range === 'today') return 'Hari ini'
    if (filters.range === '7d') return '7 Hari'
    if (filters.range === '30d') return '30 Hari'
    return 'Pilih rentang'
  }, [filters])

  return (
    <div className="space-y-3">
      {/* Main filter row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Time Range */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Periode:</label>
          <Select value={filters.range} onValueChange={(v) => onChange({ range: v as Filters['range'] })}>
            <SelectTrigger className="w-28 h-8 text-sm">
              <SelectValue placeholder="Pilih" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hari ini</SelectItem>
              <SelectItem value="7d">7 Hari</SelectItem>
              <SelectItem value="30d">30 Hari</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {dateLabel}
          </div>
        </div>

        {/* Cashier */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Kasir:</label>
          <Select value={filters.cashier || 'ALL'} onValueChange={(v) => onChange({ cashier: v === 'ALL' ? undefined : v })}>
            <SelectTrigger className="w-24 h-8 text-sm">
              <SelectValue placeholder="Semua" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua</SelectItem>
              {cashiers.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Payment Method */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Pembayaran:</label>
          <Select value={filters.payment || 'ALL'} onValueChange={(v) => onChange({ payment: v as any })}>
            <SelectTrigger className="w-24 h-8 text-sm">
              <SelectValue placeholder="Semua" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua</SelectItem>
              <SelectItem value="CASH">CASH</SelectItem>
              <SelectItem value="QRIS">QRIS</SelectItem>
              <SelectItem value="DEBIT">DEBIT</SelectItem>
              <SelectItem value="TRANSFER">TRANSFER</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Cari:</label>
          <Input
            className="h-8 text-sm flex-1 min-w-40"
            placeholder="Kode / Produk / SKU"
            value={filters.query || ''}
            onChange={(e) => onChange({ query: e.target.value })}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 ml-auto">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-8 px-2 text-sm gap-1" onClick={onExport}>
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button size="sm" className="h-8 px-2 text-sm gap-1" onClick={onPrint}>
            <Printer className="h-4 w-4" />
            Cetak
          </Button>
        </div>
      </div>

      {/* Custom date inputs (shown when custom is selected) */}
      {showCustom && (
        <div className="flex items-center gap-2 pl-16">
          <Input
            type="date"
            className="w-36 h-8 text-sm"
            value={filters.from || ''}
            onChange={(e) => onChange({ from: e.target.value })}
          />
          <span className="text-sm text-gray-500">s/d</span>
          <Input
            type="date"
            className="w-36 h-8 text-sm"
            value={filters.to || ''}
            onChange={(e) => onChange({ to: e.target.value })}
          />
        </div>
      )}

      {/* Info note */}
      <div className="text-sm text-gray-500 border-t pt-2">
        Pergerakan barang berdasarkan transaksi penjualan
      </div>
    </div>
  )
}

