import React, { useState } from 'react'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { Label } from '@/core/components/ui/label'
import { Badge } from '@/core/components/ui/badge'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  Printer,
  ChevronDown,
  X
} from 'lucide-react'
import type { RefundFilters } from '../types'
import type { PaymentMethod } from '@/features/laporan/penjualan/types'

interface Props {
  filters: RefundFilters
  cashiers: string[]
  onChange: (filters: Partial<RefundFilters>) => void
  onExport?: () => void
  onPrint?: () => void
}

export function RefundFilterBar({ filters, cashiers, onChange, onExport, onPrint }: Props) {
  const [showCustomDate, setShowCustomDate] = useState(filters.range === 'custom')
  
  const statusOptions = [
    { value: 'ALL', label: 'Semua Status' },
    { value: 'PENDING', label: 'Menunggu' },
    { value: 'APPROVED', label: 'Disetujui' },
    { value: 'REJECTED', label: 'Ditolak' },
    { value: 'PROCESSED', label: 'Diproses' }
  ]
  
  const paymentOptions: Array<{ value: PaymentMethod | 'ALL', label: string }> = [
    { value: 'ALL', label: 'Semua Pembayaran' },
    { value: 'CASH', label: 'Tunai' },
    { value: 'CARD', label: 'Kartu' },
    { value: 'QRIS', label: 'QRIS' },
    { value: 'TRANSFER', label: 'Transfer' }
  ]
  
  const rangeOptions = [
    { value: 'today', label: 'Hari Ini' },
    { value: '7d', label: '7 Hari' },
    { value: '30d', label: '30 Hari' },
    { value: 'custom', label: 'Custom' }
  ]

  const handleRangeChange = (range: 'today' | '7d' | '30d' | 'custom') => {
    setShowCustomDate(range === 'custom')
    onChange({ range })
    if (range !== 'custom') {
      onChange({ from: undefined, to: undefined })
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Main Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari retur..."
              value={filters.query || ''}
              onChange={(e) => onChange({ query: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Status Filter */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="outline" className="min-w-40 justify-between">
                <Filter className="h-4 w-4 mr-2" />
                <span>{statusOptions.find(s => s.value === filters.status)?.label}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="min-w-[160px] bg-white rounded-md p-1 shadow border border-gray-200">
                {statusOptions.map((option) => (
                  <DropdownMenu.Item 
                    key={option.value} 
                    className="px-2 py-1.5 text-sm rounded hover:bg-gray-50 outline-none cursor-pointer" 
                    onSelect={() => onChange({ status: option.value as any })}
                  >
                    {option.label}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* Payment Filter */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="outline" className="min-w-40 justify-between">
                <span>{paymentOptions.find(p => p.value === filters.payment)?.label}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="min-w-[160px] bg-white rounded-md p-1 shadow border border-gray-200">
                {paymentOptions.map((option) => (
                  <DropdownMenu.Item 
                    key={option.value} 
                    className="px-2 py-1.5 text-sm rounded hover:bg-gray-50 outline-none cursor-pointer" 
                    onSelect={() => onChange({ payment: option.value as any })}
                  >
                    {option.label}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* Date Range Filter */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="outline" className="min-w-32 justify-between">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{rangeOptions.find(r => r.value === filters.range)?.label}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="min-w-[140px] bg-white rounded-md p-1 shadow border border-gray-200">
                {rangeOptions.map((option) => (
                  <DropdownMenu.Item 
                    key={option.value} 
                    className="px-2 py-1.5 text-sm rounded hover:bg-gray-50 outline-none cursor-pointer" 
                    onSelect={() => handleRangeChange(option.value as any)}
                  >
                    {option.label}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* Export Actions */}
          {onExport && (
            <Button variant="outline" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          
          {onPrint && (
            <Button variant="outline" onClick={onPrint}>
              <Printer className="h-4 w-4 mr-2" />
              Cetak
            </Button>
          )}
        </div>
      </div>

      {/* Custom Date Range */}
      {showCustomDate && (
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <Label htmlFor="from-date" className="text-sm font-medium">Dari Tanggal</Label>
            <Input
              id="from-date"
              type="date"
              value={filters.from || ''}
              onChange={(e) => onChange({ from: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="to-date" className="text-sm font-medium">Sampai Tanggal</Label>
            <Input
              id="to-date"
              type="date"
              value={filters.to || ''}
              onChange={(e) => onChange({ to: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      <div className="flex flex-wrap gap-2">
        {filters.cashier && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Kasir: {filters.cashier}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => onChange({ cashier: undefined })}
            />
          </Badge>
        )}
        
        {filters.range === 'custom' && filters.from && filters.to && (
          <Badge variant="secondary" className="flex items-center gap-1">
            {filters.from} - {filters.to}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => {
                onChange({ range: '7d' as any, from: undefined, to: undefined })
                setShowCustomDate(false)
              }}
            />
          </Badge>
        )}
      </div>
    </div>
  )
}