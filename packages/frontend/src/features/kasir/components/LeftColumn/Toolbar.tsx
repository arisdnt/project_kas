import { useState, useRef } from 'react'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Scan, Search, RotateCcw, Trash2, Wifi, WifiOff } from 'lucide-react'
import { useKasirStore } from '@/features/kasir/store/kasirStore'
import { ProductSearchDropdown } from './ProductSearchDropdown'

interface ToolbarProps {
  onBarcodeSubmit: (barcode: string) => void
  onAddCustomer: () => void
  onHold: () => void
  onClear: () => void
  isOnline: boolean
}

export function Toolbar({
  onBarcodeSubmit,
  onAddCustomer,
  onHold,
  onClear,
  isOnline
}: ToolbarProps) {
  const [barcode, setBarcode] = useState('')
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { pelanggan, setPelanggan, addProduct } = useKasirStore()

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (barcode.trim()) {
      onBarcodeSubmit(barcode.trim())
      setBarcode('')
      setShowSearchDropdown(false)
    }
  }

  const handleInputChange = (value: string) => {
    setBarcode(value)
    setShowSearchDropdown(value.length > 0)
  }

  const handleProductSelect = async (product: any) => {
    try {
      await addProduct(product)
      setBarcode('')
      setShowSearchDropdown(false)
      searchInputRef.current?.focus()
    } catch (error) {
      console.error('Error adding product:', error)
    }
  }

  const handleInputBlur = () => {
    // Delay hiding dropdown to allow clicking on items
    setTimeout(() => setShowSearchDropdown(false), 200)
  }

  const handleInputFocus = () => {
    if (barcode.length > 0) {
      setShowSearchDropdown(true)
    }
  }

  return (
    <div className="h-14 px-4 bg-white border-b border-gray-200 flex items-center gap-3 flex-shrink-0">
      {/* Barcode/Search Input */}
      <form onSubmit={handleBarcodeSubmit} className="flex-1">
        <div className="relative">
          <Scan className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={searchInputRef}
            value={barcode}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Scan barcode atau ketik nama produk..."
            className="pl-10 h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            autoFocus
            autoComplete="off"
          />
          <ProductSearchDropdown
            query={barcode}
            isVisible={showSearchDropdown}
            onClose={() => setShowSearchDropdown(false)}
            onProductSelect={handleProductSelect}
          />
        </div>
      </form>

      {/* Customer Selector */}
      <div className="min-w-[180px]">
        <Select
          value={pelanggan?.id || 'umum'}
          onValueChange={async (value) => {
            if (value === 'umum') {
              await setPelanggan(null)
            } else {
              // Handle customer selection - this would need customer list integration
              console.log('Select customer:', value)
            }
          }}
        >
          <SelectTrigger className="h-10 text-sm">
            <SelectValue>
              {pelanggan?.nama || "Pelanggan Umum"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="umum">Pelanggan Umum</SelectItem>
            {/* TODO: Add recent customers or search functionality */}
          </SelectContent>
        </Select>
      </div>

      {/* Search Customer Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onAddCustomer}
        className="h-10 px-3 border-blue-300 text-blue-700 hover:bg-blue-50"
        title="Cari & Pilih Pelanggan"
      >
        <Search className="h-4 w-4" />
      </Button>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onHold}
          className="h-10 px-3 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Hold
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="h-10 px-3 border-red-300 text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Bersihkan
        </Button>

        {/* Connection Status */}
        <Badge variant={isOnline ? "default" : "destructive"} className="h-6 px-2">
          {isOnline ? (
            <>
              <Wifi className="h-3 w-3 mr-1" />
              Live
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 mr-1" />
              Offline
            </>
          )}
        </Badge>
      </div>
    </div>
  )
}