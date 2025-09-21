import { memo } from 'react'
import { Toolbar } from './Toolbar'
import { CartTable } from './CartTable'
import { ActionBar } from './ActionBar'

interface CartItem {
  id: string
  barcode?: string
  nama: string
  qty: number
  harga: number
  diskon: number
  subtotal: number
}

interface LeftColumnProps {
  items: CartItem[]
  grandTotal: number
  isOnline: boolean
  isProcessing?: boolean
  onBarcodeSubmit: (barcode: string) => void
  onAddCustomer: () => void
  onHold: () => void
  onClear: () => void
  onPayment: () => void
  onSaveDraft: () => void
  onPrint: () => void
  onShowDrafts: () => void
  onOpenCalculator?: () => void
  onRefresh?: () => void
}

export const LeftColumn = memo(({
  items,
  grandTotal,
  isOnline,
  isProcessing = false,
  onBarcodeSubmit,
  onAddCustomer,
  onHold,
  onClear,
  onPayment,
  onSaveDraft,
  onPrint,
  onShowDrafts,
  onOpenCalculator,
  onRefresh
}: LeftColumnProps) => {
  return (
    <div className="w-full min-w-[720px] h-full flex flex-col">
      {/* Toolbar - Fixed Height */}
      <div className="flex-shrink-0">
        <Toolbar
          onBarcodeSubmit={onBarcodeSubmit}
          onAddCustomer={onAddCustomer}
          onHold={onHold}
          onClear={onClear}
          isOnline={isOnline}
          onOpenCalculator={onOpenCalculator}
          onRefresh={onRefresh}
        />
      </div>

      {/* Cart Table Container - Fills available space */}
      <div className="flex-1 min-h-0 p-4">
        <CartTable items={items} />
      </div>

      {/* Action Bar - Fixed at bottom */}
      <div className="flex-shrink-0">
        <ActionBar
          onPayment={onPayment}
          onSaveDraft={onSaveDraft}
          onPrint={onPrint}
          onShowDrafts={onShowDrafts}
          hasItems={items.length > 0}
          isProcessing={isProcessing}
          grandTotal={grandTotal}
        />
      </div>
    </div>
  )
})

LeftColumn.displayName = 'LeftColumn'