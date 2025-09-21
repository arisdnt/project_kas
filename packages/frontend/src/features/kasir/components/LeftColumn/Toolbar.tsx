import { useState, useRef } from 'react'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { CustomerSearchInput } from './CustomerSearchInput'
import { Scan, RotateCcw, Trash2, Wifi, WifiOff, Calculator, Maximize, RefreshCw } from 'lucide-react'
import { useKasirStore } from '@/features/kasir/store/kasirStore'
import { ProductSearchDropdown } from './ProductSearchDropdown'

interface ToolbarProps {
  onBarcodeSubmit: (barcode: string) => void
  onAddCustomer: () => void
  onHold: () => void
  onClear: () => void
  isOnline: boolean
  onOpenCalculator?: () => void
  onRefresh?: () => void
}

export function Toolbar({
  onBarcodeSubmit,
  onAddCustomer,
  onHold,
  onClear,
  isOnline,
  onOpenCalculator,
  onRefresh
}: ToolbarProps) {
  const [barcode, setBarcode] = useState('')
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
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

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true)
      onRefresh()
      // Reset animation after a short delay
      setTimeout(() => {
        setIsRefreshing(false)
      }, 1000)
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
            placeholder="Scan barcode atau ketik nama produk... [Alt+S]"
            className="pl-10 h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            autoFocus
            autoComplete="off"
            data-product-search
          />
          <ProductSearchDropdown
            query={barcode}
            isVisible={showSearchDropdown}
            onClose={() => setShowSearchDropdown(false)}
            onProductSelect={handleProductSelect}
          />
        </div>
      </form>

      {/* Customer Search */}
      <CustomerSearchInput
        selectedCustomer={pelanggan ? { id: String(pelanggan.id), nama: pelanggan.nama ?? '' } : null}
        onCustomerSelect={setPelanggan}
        onSearchModalOpen={onAddCustomer}
      />

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onHold}
          className="h-10 px-3 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
          data-hold-button
          title="Hold Transaction"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Hold [F6]
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="h-10 px-3 border-red-300 text-red-700 hover:bg-red-50"
          data-clear-button
          title="Clear Cart [Alt+Q]"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Bersihkan [F3]
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenCalculator}
          disabled={!onOpenCalculator}
          className="h-10 px-3 border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
          data-calculator-button
          title="Kalkulator [Alt+C]"
        >
          <Calculator className="h-4 w-4" />
          [F4]
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (document.fullscreenElement) {
              document.exitFullscreen()
            } else {
              document.documentElement.requestFullscreen()
            }
          }}
          className="h-10 px-3 border-green-300 text-green-700 hover:bg-green-50"
          title="Mode Layar Penuh"
        >
          <Maximize className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing || !onRefresh}
          className="h-10 px-3 border-purple-300 text-purple-700 hover:bg-purple-50 disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw className={`h-4 w-4 transition-transform ${isRefreshing ? 'animate-spin' : ''}`} />
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