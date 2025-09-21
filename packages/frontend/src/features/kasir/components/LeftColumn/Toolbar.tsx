import { useState, useRef } from 'react'
import { Input } from '@/core/components/ui/input'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Scan, RotateCcw, Wifi, WifiOff, HelpCircle } from 'lucide-react'
import { useKasirStore } from '@/features/kasir/store/kasirStore'
import { ProductSearchDropdown } from './ProductSearchDropdown'
import { CustomerSelector } from '../CustomerSelector'

interface ToolbarProps {
  onBarcodeSubmit: (barcode: string) => void
  onHold: () => void
  onShowHelp: () => void
  isOnline: boolean
}

export function Toolbar({
  onBarcodeSubmit,
  onHold,
  onShowHelp,
  isOnline
}: ToolbarProps) {
  const [barcode, setBarcode] = useState('')
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { addProduct } = useKasirStore()

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
            placeholder="Scan barcode atau ketik nama produk... [F1]"
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

      {/* Customer Selector with Autocomplete */}
      <div className="min-w-[280px] w-[320px]">
        <CustomerSelector />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onHold}
          className="h-10 px-3 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
          data-hold-button
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          [F4] Hold
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onShowHelp}
          className="h-10 px-3 border-blue-300 text-blue-700 hover:bg-blue-50"
          data-help-button
          title="Bantuan Shortcut Keyboard [F10]"
        >
          <HelpCircle className="h-4 w-4 mr-1" />
          [F10]
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