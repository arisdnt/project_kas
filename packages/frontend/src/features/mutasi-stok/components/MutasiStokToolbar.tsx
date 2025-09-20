import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Badge } from '@/core/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/core/components/ui/popover'
import { Calendar } from '@/core/components/ui/calendar'
import { Calendar as CalendarIcon, Search, Filter, Download, Plus, RotateCcw, X } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import { useMutasiStokTableState } from '../hooks/useMutasiStokTableState'

interface Props {
  onCreate: () => void
}

export function MutasiStokToolbar({ onCreate }: Props) {
  const {
    sortedItems,
    filters,
    setFilters,
    resetFilters,
    jenisMutasiOptions,
    kategoriOptions,
    brandOptions
  } = useMutasiStokTableState()

  const [dateFromOpen, setDateFromOpen] = useState(false)
  const [dateToOpen, setDateToOpen] = useState(false)

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.jenisMutasi) count++
    if (filters.kategori) count++
    if (filters.brand) count++
    if (filters.tanggalMulai) count++
    if (filters.tanggalAkhir) count++
    return count
  }, [filters])

  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }, [setFilters])

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [setFilters])

  const clearFilter = useCallback((key: string) => {
    if (key === 'jenisMutasi' || key === 'kategori' || key === 'brand') {
      setFilters(prev => ({ ...prev, [key]: 'all' }))
    } else {
      setFilters(prev => ({ ...prev, [key]: '' }))
    }
  }, [setFilters])

  const handleDateSelect = useCallback((date: Date | undefined, type: 'from' | 'to') => {
    if (date) {
      const dateStr = format(date, 'yyyy-MM-dd')
      if (type === 'from') {
        setFilters(prev => ({ ...prev, tanggalMulai: dateStr }))
        setDateFromOpen(false)
      } else {
        setFilters(prev => ({ ...prev, tanggalAkhir: dateStr }))
        setDateToOpen(false)
      }
    }
  }, [setFilters])

  const exportToCsv = useCallback(() => {
    if (sortedItems.length === 0) return

    const headers = [
      'ID',
      'Nama Produk',
      'SKU',
      'Jenis Mutasi',
      'Jumlah',
      'Stok Sebelum',
      'Stok Sesudah',
      'Keterangan',
      'Tanggal Mutasi',
      'Kategori',
      'Brand',
      'Dibuat Oleh',
      'Dibuat Pada'
    ]

    const csvContent = [
      headers.join(','),
      ...sortedItems.map(item => [
        item.id,
        `"${item.namaProduk}"`,
        `"${item.sku || ''}"`,
        item.jenisMutasi === 'masuk' ? 'Stok Masuk' : 'Stok Keluar',
        item.jumlah,
        item.stokSebelum,
        item.stokSesudah,
        `"${item.keterangan || ''}"`,
        item.tanggalMutasi,
        `"${item.kategori?.nama || ''}"`,
        `"${item.brand?.nama || ''}"`,
        `"${item.dibuatOleh || ''}"`,
        item.dibuatPada
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `mutasi-stok-${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
  }, [sortedItems])

  return (
    <div className="space-y-4">
      {/* Main toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari produk, SKU, atau keterangan..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Quick filters */}
          <div className="flex gap-2">
            <Select value={filters.jenisMutasi} onValueChange={(value) => handleFilterChange('jenisMutasi', value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Jenis Mutasi" />
              </SelectTrigger>
              <SelectContent>
                {jenisMutasiOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.kategori} onValueChange={(value) => handleFilterChange('kategori', value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                {kategoriOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.brand} onValueChange={(value) => handleFilterChange('brand', value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                {brandOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCsv}
            disabled={sortedItems.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            onClick={onCreate}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Mutasi
          </Button>
        </div>
      </div>

      {/* Date range filter */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-gray-600 font-medium">Filter Tanggal:</span>

        <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-8 gap-2 text-xs">
              <CalendarIcon className="h-3 w-3" />
              {filters.tanggalMulai ? format(parseISO(filters.tanggalMulai), 'dd MMM yyyy', { locale: id }) : 'Dari'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.tanggalMulai ? parseISO(filters.tanggalMulai) : undefined}
              onSelect={(date) => handleDateSelect(date, 'from')}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <span className="text-xs text-gray-400">sampai</span>

        <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-8 gap-2 text-xs">
              <CalendarIcon className="h-3 w-3" />
              {filters.tanggalAkhir ? format(parseISO(filters.tanggalAkhir), 'dd MMM yyyy', { locale: id }) : 'Sampai'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.tanggalAkhir ? parseISO(filters.tanggalAkhir) : undefined}
              onSelect={(date) => handleDateSelect(date, 'to')}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-8 gap-2 text-xs"
          >
            <RotateCcw className="h-3 w-3" />
            Reset ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Active filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Pencarian: {filters.search}
              <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('search')} />
            </Badge>
          )}
          {filters.jenisMutasi && (
            <Badge variant="secondary" className="gap-1">
              Jenis: {jenisMutasiOptions.find(o => o.value === filters.jenisMutasi)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('jenisMutasi')} />
            </Badge>
          )}
          {filters.kategori && (
            <Badge variant="secondary" className="gap-1">
              Kategori: {filters.kategori}
              <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('kategori')} />
            </Badge>
          )}
          {filters.brand && (
            <Badge variant="secondary" className="gap-1">
              Brand: {filters.brand}
              <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('brand')} />
            </Badge>
          )}
          {filters.tanggalMulai && (
            <Badge variant="secondary" className="gap-1">
              Dari: {format(parseISO(filters.tanggalMulai), 'dd MMM yyyy', { locale: id })}
              <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('tanggalMulai')} />
            </Badge>
          )}
          {filters.tanggalAkhir && (
            <Badge variant="secondary" className="gap-1">
              Sampai: {format(parseISO(filters.tanggalAkhir), 'dd MMM yyyy', { locale: id })}
              <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter('tanggalAkhir')} />
            </Badge>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Menampilkan {sortedItems.length} mutasi stok
        {activeFiltersCount > 0 && ' (terfilter)'}
      </div>
    </div>
  )
}