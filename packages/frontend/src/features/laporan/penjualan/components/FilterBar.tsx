import { useMemo } from 'react'
import { Filters, PaymentMethod } from '../types'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/core/components/ui/select'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { Calendar, Download, Printer } from 'lucide-react'

type Props = {
  filters: Filters
  cashiers: string[]
  onChange: (patch: Partial<Filters>) => void
  onExportCSV: () => void
  onPrint: () => void
}

export function FilterBar({ filters, cashiers, onChange, onExportCSV, onPrint }: Props) {
  const showCustom = filters.range === 'custom'
  const paymentOptions: (PaymentMethod | 'ALL')[] = ['ALL', 'CASH', 'QRIS', 'DEBIT', 'TRANSFER']

  const dateLabel = useMemo(() => {
    if (filters.range === 'custom' && filters.from && filters.to) return `${filters.from} s/d ${filters.to}`
    if (filters.range === 'today') return 'Hari ini'
    if (filters.range === '7d') return '7 Hari'
    if (filters.range === '30d') return '30 Hari'
    return 'Pilih rentang'
  }, [filters])

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Rentang Waktu */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-700">Rentang Waktu</label>
          <div className="flex items-center gap-2">
            <Select value={filters.range} onValueChange={(v) => onChange({ range: v as Filters['range'] })}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Pilih rentang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hari ini</SelectItem>
                <SelectItem value="7d">7 Hari</SelectItem>
                <SelectItem value="30d">30 Hari</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-gray-600 flex items-center gap-1"><Calendar className="h-4 w-4" />{dateLabel}</div>
          </div>
          {showCustom && (
            <div className="flex items-center gap-2">
              <Input type="date" value={filters.from || ''} onChange={(e) => onChange({ from: e.target.value })} />
              <span className="text-xs text-gray-500">s/d</span>
              <Input type="date" value={filters.to || ''} onChange={(e) => onChange({ to: e.target.value })} />
            </div>
          )}
        </div>

        {/* Kasir */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-700">Kasir</label>
          <Select value={filters.cashier || 'ALL'} onValueChange={(v) => onChange({ cashier: v === 'ALL' ? undefined : v })}>
            <SelectTrigger>
              <SelectValue placeholder="Semua kasir" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua</SelectItem>
              {cashiers.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pembayaran */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-700">Metode Pembayaran</label>
          <Select value={filters.payment || 'ALL'} onValueChange={(v) => onChange({ payment: v as any })}>
            <SelectTrigger>
              <SelectValue placeholder="Semua metode" />
            </SelectTrigger>
            <SelectContent>
              {paymentOptions.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pencarian */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-700">Pencarian</label>
          <Input
            placeholder="Cari kode transaksi atau pelanggan"
            value={filters.query || ''}
            onChange={(e) => onChange({ query: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">Gunakan filter untuk menganalisis performa penjualan</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExportCSV}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
          <Button size="sm" onClick={onPrint}>
            <Printer className="h-4 w-4 mr-1" /> Cetak
          </Button>
        </div>
      </div>
    </div>
  )
}

