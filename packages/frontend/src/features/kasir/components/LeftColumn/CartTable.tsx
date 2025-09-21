import { memo } from 'react'
import { CartTableHeader } from './CartTableHeader'
import { CartTableRow } from './CartTableRow'

interface CartItem {
  id: string
  barcode?: string
  nama: string
  qty: number
  harga: number
  diskon: number
  subtotal: number
}

interface CartTableProps {
  items: CartItem[]
}

export const CartTable = memo(({ items }: CartTableProps) => {
  if (items.length === 0) {
    return (
      <div className="h-full border border-gray-200 rounded-lg bg-white flex flex-col">
        <CartTableHeader />
        <div className="flex-1 flex items-center justify-center text-gray-500 min-h-0">
          <div className="text-center">
            <div className="text-sm">Keranjang masih kosong</div>
            <div className="text-xs text-gray-400 mt-1">
              Scan barcode atau cari produk untuk menambahkan item
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full border border-gray-200 rounded-lg bg-white flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <CartTableHeader />
      </div>
      <div className="flex-1 overflow-y-auto min-h-0" data-cart-list>
        {items.map((item, index) => (
          <CartTableRow key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  )
})

CartTable.displayName = 'CartTable'