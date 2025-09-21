import { useState, useEffect, useRef } from 'react'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Package, Plus } from 'lucide-react'
import { useKasirStore } from '@/features/kasir/store/kasirStore'

interface ProdukKasir {
  id: string
  nama: string
  barcode: string
  harga: number
  stok: number
  kategori: string
  satuan?: string
}

interface ProductSearchDropdownProps {
  query: string
  isVisible: boolean
  onClose: () => void
  onProductSelect: (product: ProdukKasir) => void
}

export function ProductSearchDropdown({
  query,
  isVisible,
  onClose,
  onProductSelect
}: ProductSearchDropdownProps) {
  const [products, setProducts] = useState<ProdukKasir[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { searchProducts, addByBarcode } = useKasirStore()

  // Search products when query changes
  useEffect(() => {
    if (!query || query.length < 2) {
      setProducts([])
      return
    }

    const searchTimeout = setTimeout(async () => {
      setIsLoading(true)
      try {
        const results = await searchProducts(query)
        setProducts(results)
        setSelectedIndex(-1)
      } catch (error) {
        console.error('Search error:', error)
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [query, searchProducts])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, products.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, -1))
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && products[selectedIndex]) {
            handleProductSelect(products[selectedIndex])
          } else if (products.length === 1) {
            handleProductSelect(products[0])
          } else {
            // Try to add by barcode/code
            handleAddByBarcode()
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, selectedIndex, products, onClose])

  const handleProductSelect = async (product: ProdukKasir) => {
    try {
      onProductSelect(product)
      onClose()
    } catch (error) {
      console.error('Error selecting product:', error)
    }
  }

  const handleAddByBarcode = async () => {
    try {
      await addByBarcode(query)
      onClose()
    } catch (error) {
      console.error('Error adding by barcode:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (!isVisible) return null

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1">
      <div
        ref={dropdownRef}
        className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
      >
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            Mencari produk...
          </div>
        ) : products.length > 0 ? (
          <div className="py-2">
            {products.map((product, index) => (
              <button
                key={product.id}
                onClick={() => handleProductSelect(product)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-l-2 ${
                  index === selectedIndex
                    ? 'bg-blue-50 border-blue-500'
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-gray-900 truncate">
                        {product.nama}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {product.barcode && (
                        <span>Kode: {product.barcode}</span>
                      )}
                      <span>Kategori: {product.kategori}</span>
                      {product.satuan && (
                        <span>Satuan: {product.satuan}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-4">
                    <span className="font-medium text-green-600 tabular-nums">
                      {formatCurrency(product.harga)}
                    </span>
                    <Badge
                      variant={product.stok > 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      Stok: {product.stok}
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : query.length >= 2 ? (
          <div className="p-4 text-center text-gray-500">
            <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <div className="text-sm">Produk tidak ditemukan</div>
            <div className="text-xs text-gray-400 mt-1">
              Coba dengan kata kunci yang berbeda
            </div>
            {query && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddByBarcode}
                className="mt-2 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Tambah "{query}" sebagai barcode
              </Button>
            )}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-400 text-sm">
            Ketik minimal 2 karakter untuk mencari
          </div>
        )}
      </div>
    </div>
  )
}