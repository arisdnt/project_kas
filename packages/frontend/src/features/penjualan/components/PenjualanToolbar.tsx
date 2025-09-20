import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { usePenjualanTableState } from '../hooks/usePenjualanTableState'
import { Search, X, Calendar, Download } from 'lucide-react'
import { LiveUpdateBadge } from './LiveUpdateBadge'

interface Props {}

export function PenjualanToolbar({}: Props) {
  const {
    filters,
    setFilters,
    resetFilters,
    statusOptions,
    metodeBayarOptions,
    kasirOptions,
    sortedItems,
    lastUpdatedAt
  } = usePenjualanTableState()

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const handleSearchChange = (value: string) => {
    setFilters({ search: value })
  }

  const handleStatusChange = (value: string) => {
    setFilters({ status: value === 'all' ? '' : value })
  }

  const handleMetodeBayarChange = (value: string) => {
    setFilters({ metodeBayar: value === 'all' ? '' : value })
  }

  const handleKasirChange = (value: string) => {
    setFilters({ kasir: value === 'all' ? '' : value })
  }

  const handleTanggalMulaiChange = (value: string) => {
    setFilters({ tanggalMulai: value })
  }

  const handleTanggalAkhirChange = (value: string) => {
    setFilters({ tanggalAkhir: value })
  }

  const exportToCSV = () => {
    if (sortedItems.length === 0) return

    const headers = ['Kode', 'Tanggal', 'Waktu', 'Kasir', 'Pelanggan', 'Metode Bayar', 'Status', 'Total']
    const csvContent = [
      headers.join(','),
      ...sortedItems.map(item =>
        [
          item.kode,
          item.tanggal,
          item.waktu || '',
          item.kasir,
          item.pelanggan || '',
          item.metodeBayar,
          item.status,
          item.total
        ].join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `penjualan-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Main filter row */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative w-[25%]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari transaksi..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        {/* Status Filter */}
        <div className="w-[12%]">
          <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
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

        {/* Payment Method Filter */}
        <div className="w-[12%]">
          <Select value={filters.metodeBayar || 'all'} onValueChange={handleMetodeBayarChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pembayaran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Metode</SelectItem>
              {metodeBayarOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cashier Filter */}
        <div className="w-[12%]">
          <Select value={filters.kasir || 'all'} onValueChange={handleKasirChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Kasir" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kasir</SelectItem>
              {kasirOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filters */}
        <div className="relative w-[12%]">
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="date"
            value={filters.tanggalMulai}
            onChange={(e) => handleTanggalMulaiChange(e.target.value)}
            className="pl-10 w-full"
            placeholder="Dari"
          />
        </div>

        <div className="relative w-[12%]">
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="date"
            value={filters.tanggalAkhir}
            onChange={(e) => handleTanggalAkhirChange(e.target.value)}
            className="pl-10 w-full"
            placeholder="Sampai"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-[15%] justify-end">
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <X className="mr-2 h-4 w-4" />
              Reset ({activeFilterCount})
            </Button>
          )}

          <LiveUpdateBadge lastUpdatedAt={lastUpdatedAt} />

          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Menampilkan {sortedItems.length} dari {sortedItems.length} transaksi
        </span>
      </div>
    </div>
  )
}