import { useState } from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Badge } from '@/core/components/ui/badge'
import { Card, CardContent } from '@/core/components/ui/card'
import { usePembelianTableState } from '../hooks/usePembelianTableState'
import { Search, Filter, X, Calendar, Download, ShoppingCart } from 'lucide-react'
import { LiveUpdateBadge } from './LiveUpdateBadge'

interface Props {
  onCreate: () => void
}

export function PembelianToolbar({ onCreate }: Props) {
  const {
    filters,
    setFilters,
    resetFilters,
    statusOptions,
    statusPembayaranOptions,
    supplierOptions,
    sortedItems,
    lastUpdatedAt
  } = usePembelianTableState()

  const [showAdvanced, setShowAdvanced] = useState(false)

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const handleSearchChange = (value: string) => {
    setFilters({ search: value })
  }

  const handleStatusChange = (value: string) => {
    setFilters({ status: value === 'all' ? '' : value })
  }

  const handleStatusPembayaranChange = (value: string) => {
    setFilters({ statusPembayaran: value === 'all' ? '' : value })
  }

  const handleSupplierChange = (value: string) => {
    setFilters({ supplier: value === 'all' ? '' : value })
  }

  const handleTanggalMulaiChange = (value: string) => {
    setFilters({ tanggalMulai: value })
  }

  const handleTanggalAkhirChange = (value: string) => {
    setFilters({ tanggalAkhir: value })
  }

  const exportToCSV = () => {
    if (sortedItems.length === 0) return

    const headers = ['Nomor Transaksi', 'Nomor PO', 'Tanggal', 'Supplier', 'Status', 'Status Pembayaran', 'Subtotal', 'Total']
    const csvContent = [
      headers.join(','),
      ...sortedItems.map(item =>
        [
          item.nomorTransaksi,
          item.nomorPO || '',
          item.tanggal,
          item.supplierNama || '',
          item.status,
          item.statusPembayaran,
          item.subtotal,
          item.total
        ].join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pembelian-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari pembelian..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 w-80"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="relative"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <X className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}

          <LiveUpdateBadge lastUpdatedAt={lastUpdatedAt} />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>

          <Button onClick={onCreate}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Pembelian Baru
          </Button>
        </div>
      </div>

      {showAdvanced && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Status Pembayaran</label>
                <Select value={filters.statusPembayaran || 'all'} onValueChange={handleStatusPembayaranChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    {statusPembayaranOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Supplier</label>
                <Select value={filters.supplier || 'all'} onValueChange={handleSupplierChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Supplier</SelectItem>
                    {supplierOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Tanggal Mulai</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="date"
                    value={filters.tanggalMulai}
                    onChange={(e) => handleTanggalMulaiChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Tanggal Akhir</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="date"
                    value={filters.tanggalAkhir}
                    onChange={(e) => handleTanggalAkhirChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Menampilkan {sortedItems.length} dari {sortedItems.length} pembelian
        </span>
      </div>
    </div>
  )
}