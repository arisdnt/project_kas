import { useKasirStore, CartItem } from '@/features/kasir/store/kasirStore'
import { Button } from '@/core/components/ui/button'
import { Trash2, Minus, Plus } from 'lucide-react'

type Props = {
  items: CartItem[]
  compact?: boolean
}

export function CartItemList({ items, compact = false }: Props) {
  const inc = useKasirStore((s) => s.inc)
  const dec = useKasirStore((s) => s.dec)
  const setQty = useKasirStore((s) => s.setQty)
  const remove = useKasirStore((s) => s.remove)

  if (compact) {
    return (
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{it.nama}</div>
              <div className="text-xs text-gray-500">{it.sku || '-'}</div>
              <div className="text-xs text-gray-600">
                {formatCurrency(it.harga)} × {it.qty}
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-2">
              <div className="text-right">
                <div className="font-medium text-gray-900">{formatCurrency(it.harga * it.qty)}</div>
              </div>
              <div className="flex items-center space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => dec(it.id)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-xs font-medium w-6 text-center">{it.qty}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => inc(it.id)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  onClick={() => remove(it.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            Keranjang kosong
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
          <div className="col-span-5">Item</div>
          <div className="col-span-2 text-right">Harga</div>
          <div className="col-span-2 text-center">Jml</div>
          <div className="col-span-2 text-right">Subtotal</div>
          <div className="col-span-1"></div>
        </div>
      </div>
      
      {/* Items */}
      <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
        {items.map((it, index) => (
          <div 
            key={it.id} 
            className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
              index === items.length - 1 ? 'rounded-b-lg' : ''
            }`}
          >
            <div className="grid grid-cols-12 gap-2 items-center text-sm">
              {/* Product Info */}
              <div className="col-span-5 min-w-0">
                <div className="font-semibold text-gray-900 leading-tight">{it.nama}</div>
                <div className="text-xs text-gray-500 mt-1 font-mono">
                  {it.sku || 'No SKU'}
                </div>
              </div>
              
              {/* Price */}
              <div className="col-span-2 text-right">
                <div className="font-mono text-gray-700 font-medium">
                  {formatCurrency(it.harga)}
                </div>
              </div>
              
              {/* Quantity */}
              <div className="col-span-2">
                <div className="flex items-center justify-center space-x-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-100"
                    onClick={() => dec(it.id)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      className="w-14 text-center border-2 border-gray-200 rounded-lg py-1.5 text-sm font-bold text-gray-900 focus:border-blue-500 focus:outline-none"
                      value={it.qty}
                      onChange={(e) => setQty(it.id, Math.max(1, Number(e.target.value) || 1))}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-100"
                    onClick={() => inc(it.id)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {/* Subtotal */}
              <div className="col-span-2 text-right">
                <div className="font-bold text-gray-900 text-base">
                  {formatCurrency(it.harga * it.qty)}
                </div>
              </div>
              
              {/* Actions */}
              <div className="col-span-1 flex justify-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  onClick={() => remove(it.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="px-4 py-12 text-center bg-gray-50 rounded-b-lg">
            <div className="text-gray-400 text-sm mb-2">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-gray-500 text-sm font-medium">
              Keranjang Belanja Kosong
            </div>
            <div className="text-gray-400 text-xs mt-1">
              Pindai barcode atau cari produk untuk menambahkan item
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n)
}