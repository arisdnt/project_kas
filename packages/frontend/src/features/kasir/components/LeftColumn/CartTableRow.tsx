import { memo, useState, useEffect, useRef } from 'react'
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
  const [quantityFeedback, setQuantityFeedback] = useState<string | null>(null)
  const { setQty, remove } = useKasirStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)

  // Auto-focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select() // Select all text for easy replacement
    }
  }, [isEditing])

  // Show quantity change feedback
  const showQuantityChange = (change: string) => {
    setQuantityFeedback(change)
    setTimeout(() => {
      setQuantityFeedback(null)
    }, 800)
  }

  const handleQtyChange = async (newQty: number) => {
    try {
      // Use item.id directly - store functions now accept string | number
      if (newQty <= 0) {
        await remove(item.id)
      } else {
        await setQty(item.id, newQty)
      }
    } catch (error) {
      console.error('Error updating cart item:', error)
      // Reset edit state if there was an error
      setEditQty(item.qty.toString())
    }
  }

  const handleQtyEdit = () => {
    const qty = parseInt(editQty)
    if (!isNaN(qty) && qty > 0) {
      handleQtyChange(qty)
    } else {
      // Reset to original quantity if invalid input
      setEditQty(item.qty.toString())
    }
    setIsEditing(false)

    // Return focus to row after editing
    setTimeout(() => {
      if (rowRef.current) {
        rowRef.current.focus()
      }
    }, 0)
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
      ref={rowRef}
      className={`grid grid-cols-[48px_140px_1fr_96px_120px_100px_140px_48px] gap-2 px-3 py-3 border-b border-gray-100 transition-colors duration-150 focus:outline-none ${
        isEditing
          ? 'bg-yellow-50 border-yellow-200'
          : 'hover:bg-gray-50 focus:bg-blue-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-300'
      }`}
      title="↑↓: Navigate • Enter: Edit • Del: Remove • +/-: Adjust • 1-9: Set qty • *: Set 10 • /: Set 1"
      data-cart-row
      tabIndex={0}
      onKeyDown={(e) => {
        // Don't handle key events if we're editing quantity
        if (isEditing) return

        // Handle different key presses
        switch (e.key) {
          case 'ArrowDown':
          case 'ArrowUp':
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
            break

          case 'Enter':
            e.preventDefault()
            // Focus to quantity edit mode
            setIsEditing(true)
            setEditQty(item.qty.toString())
            break

          case 'Delete':
          case 'Backspace':
            e.preventDefault()
            // Remove item from cart
            handleQtyChange(0) // This will call remove() since qty <= 0
            break

          case '+':
          case '=':
          case 'NumpadAdd':
            e.preventDefault()
            // Increase quantity
            handleQtyChange(item.qty + 1)
            // Visual feedback
            showQuantityChange('+1')
            break

          case '-':
          case '_':
          case 'NumpadSubtract':
            e.preventDefault()
            // Decrease quantity only if greater than 1
            if (item.qty > 1) {
              handleQtyChange(item.qty - 1)
              showQuantityChange('-1')
            } else {
              // Show blocked feedback when qty is already 1
              showQuantityChange('Min: 1')
            }
            break

          case '*':
          case 'NumpadMultiply':
            e.preventDefault()
            // Quick set quantity to 10
            handleQtyChange(10)
            showQuantityChange('→10')
            break

          case '/':
          case 'NumpadDivide':
            e.preventDefault()
            // Quick set quantity to 1
            handleQtyChange(1)
            showQuantityChange('→1')
            break

          default:
            // For number keys 1-9, set quantity directly
            if (/^[1-9]$/.test(e.key)) {
              e.preventDefault()
              const newQty = parseInt(e.key)
              handleQtyChange(newQty)
              showQuantityChange(`→${newQty}`)
            }
            break
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
      <div className="flex items-center justify-center gap-1 relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQtyChange(item.qty - 1)}
          className="h-7 w-7 p-0 border-gray-300"
          data-dec
        >
          <Minus className="h-3 w-3" />
        </Button>

        <div className="relative">
          {isEditing ? (
            <Input
              ref={inputRef}
              value={editQty}
              onChange={(e) => setEditQty(e.target.value)}
              onBlur={handleQtyEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation() // Prevent parent row handler
                  handleQtyEdit()
                }
                if (e.key === 'Escape') {
                  e.stopPropagation() // Prevent parent row handler
                  setEditQty(item.qty.toString())
                  setIsEditing(false)
                  // Return focus to row
                  setTimeout(() => {
                    if (rowRef.current) {
                      rowRef.current.focus()
                    }
                  }, 0)
                }
              }}
              className="h-7 w-12 text-center text-xs px-1"
              type="number"
              min="1"
            />
          ) : (
            <span
              className="text-sm font-medium tabular-nums cursor-pointer min-w-[24px] text-center block"
              onClick={() => {
                setIsEditing(true)
                setEditQty(item.qty.toString())
              }}
            >
              {item.qty}
            </span>
          )}

          {/* Quantity change feedback */}
          {quantityFeedback && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg z-10 animate-pulse">
              {quantityFeedback}
            </div>
          )}
        </div>

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
          onClick={async () => {
            try {
              await remove(item.id)
            } catch (error) {
              console.error('Error removing cart item:', error)
            }
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