import { memo, useState } from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useKasirStore } from '@/features/kasir/store/kasirStore'

interface CartItem {
  id: string
  barcode?: string
  nama: string
  qty: number
  harga: number
  diskon: number
  subtotal: number
}

interface CartTableRowProps {
  item: CartItem
  index: number
}

export const CartTableRow = memo(({ item, index }: CartTableRowProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editQty, setEditQty] = useState(item.qty.toString())
  const { setQty, remove } = useKasirStore()

  const handleQtyChange = (newQty: number) => {
    // Convert item.id to number consistently
    const itemId = typeof item.id === 'string' ? (isNaN(parseInt(item.id)) ? item.id : parseInt(item.id)) : item.id
    if (newQty <= 0) {
      remove(itemId as number)
    } else {
      setQty(itemId as number, newQty)
    }
  }

  const handleQtyEdit = () => {
    const qty = parseInt(editQty)
    if (!isNaN(qty) && qty > 0) {
      handleQtyChange(qty)
    }
    setIsEditing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div
      className="grid grid-cols-[48px_140px_1fr_96px_120px_100px_140px_48px] gap-2 px-3 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus:bg-blue-50"
      data-cart-row
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
        e.preventDefault()
        const current = e.currentTarget as HTMLElement
        if (e.key === 'ArrowDown') {
          let next: HTMLElement | null = current.nextElementSibling as HTMLElement | null
          while (next && !next.hasAttribute('data-cart-row')) {
            next = next.nextElementSibling as HTMLElement | null
          }
          if (next) {
            next.focus()
            next.scrollIntoView({ block: 'nearest' })
          }
        } else if (e.key === 'ArrowUp') {
          let prev: HTMLElement | null = current.previousElementSibling as HTMLElement | null
          while (prev && !prev.hasAttribute('data-cart-row')) {
            prev = prev.previousElementSibling as HTMLElement | null
          }
          if (prev) {
            prev.focus()
            prev.scrollIntoView({ block: 'nearest' })
          }
        }
      }}
    >
      {/* No */}
      <div className="text-center text-xs text-gray-500 flex items-center justify-center">
        {index + 1}
      </div>

      {/* Barcode */}
      <div className="text-xs text-gray-600 flex items-center">
        <span className="truncate">{item.barcode || '-'}</span>
      </div>

      {/* Nama Item */}
      <div className="text-sm flex items-center">
        <span className="truncate font-medium" title={item.nama}>
          {item.nama}
        </span>
      </div>

      {/* Quantity */}
      <div className="flex items-center justify-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQtyChange(item.qty - 1)}
          className="h-7 w-7 p-0 border-gray-300"
          data-dec
        >
          <Minus className="h-3 w-3" />
        </Button>

        {isEditing ? (
          <Input
            value={editQty}
            onChange={(e) => setEditQty(e.target.value)}
            onBlur={handleQtyEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleQtyEdit()
              if (e.key === 'Escape') {
                setEditQty(item.qty.toString())
                setIsEditing(false)
              }
            }}
            className="h-7 w-12 text-center text-xs px-1"
            autoFocus
          />
        ) : (
          <span
            className="text-sm font-medium tabular-nums cursor-pointer min-w-[24px] text-center"
            onClick={() => {
              setIsEditing(true)
              setEditQty(item.qty.toString())
            }}
          >
            {item.qty}
          </span>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQtyChange(item.qty + 1)}
          className="h-7 w-7 p-0 border-gray-300"
          data-inc
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Harga */}
      <div className="text-sm text-right flex items-center justify-end">
        <span className="tabular-nums">{formatCurrency(item.harga)}</span>
      </div>

      {/* Diskon */}
      <div className="text-sm text-right flex items-center justify-end">
        <span className="tabular-nums text-orange-600">
          {item.diskon > 0 ? formatCurrency(item.diskon) : '-'}
        </span>
      </div>

      {/* Subtotal */}
      <div className="text-sm text-right flex items-center justify-end">
        <span className="tabular-nums font-medium">{formatCurrency(item.subtotal)}</span>
      </div>

      {/* Aksi */}
      <div className="flex items-center justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const itemId = typeof item.id === 'string' ? (isNaN(parseInt(item.id)) ? item.id : parseInt(item.id)) : item.id
            remove(itemId as number)
          }}
          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
})

CartTableRow.displayName = 'CartTableRow'