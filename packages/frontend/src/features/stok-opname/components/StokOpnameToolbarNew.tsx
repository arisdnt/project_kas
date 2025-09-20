import { useState } from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Badge } from '@/core/components/ui/badge'
import { Card, CardContent } from '@/core/components/ui/card'
import { useStokOpnameTableState } from '../hooks/useStokOpnameTableState'
import { Search, Filter, X, Calendar, Download, Package } from 'lucide-react'
import { LiveUpdateBadge } from './LiveUpdateBadge'

interface Props {
  onCreate: () => void
}

export function StokOpnameToolbarNew({ onCreate }: Props) {
  const {
    filters,
    setFilters,
    resetFilters,
    statusOptions,
    kategoriOptions,
    brandOptions,
    supplierOptions,
    sortedItems,
    lastUpdatedAt
  } = useStokOpnameTableState()

  const [showAdvanced, setShowAdvanced] = useState(false)

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const handleSearchChange = (value: string) => {
    setFilters({ search: value })
  }

  const handleStatusChange = (value: string) => {
    setFilters({ status: value === 'all' ? '' : value })
  }

  const handleKategoriChange = (value: string) => {
    setFilters({ kategori: value === 'all' ? '' : value })
  }

  const handleBrandChange = (value: string) => {
    setFilters({ brand: value === 'all' ? '' : value })
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

    const headers = ['Nama Produk', 'SKU', 'Kategori', 'Brand', 'Stok Sistem', 'Stok Fisik', 'Selisih', 'Status', 'Tanggal Opname']
    const csvContent = [
      headers.join(','),
      ...sortedItems.map(item =>
        [
          item.namaProduk,
          item.sku || '',
          item.kategori?.nama || '',
          item.brand?.nama || '',
          item.stokSistem,
          item.stokFisik || '',
          item.selisih || '',
          item.status,
          item.tanggalOpname || ''
        ].join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stok-opname-${new Date().toISOString().split('T')[0]}.csv`
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
              placeholder="Cari stok opname..."
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
            <Package className="mr-2 h-4 w-4" />
            Stok Opname Baru
          </Button>
        </div>
      </div>

      {showAdvanced && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
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
                <label className="text-sm font-medium mb-1 block">Kategori</label>
                <Select value={filters.kategori || 'all'} onValueChange={handleKategoriChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {kategoriOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Brand</label>
                <Select value={filters.brand || 'all'} onValueChange={handleBrandChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Brand</SelectItem>
                    {brandOptions.map(option => (
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
          Menampilkan {sortedItems.length} dari {sortedItems.length} stok opname
        </span>
      </div>
    </div>
  )
}