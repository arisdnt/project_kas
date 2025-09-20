import { memo } from 'react'

export const CartTableHeader = memo(() => {
  return (
    <div className="bg-white border-b border-gray-200 flex-shrink-0">
      <div className="grid grid-cols-[48px_140px_1fr_96px_120px_100px_140px_48px] gap-2 px-3 py-3 text-xs font-medium text-gray-600 uppercase tracking-wide">
        <div className="text-center">No</div>
        <div>Barcode</div>
        <div>Nama Item</div>
        <div className="text-center">Qty</div>
        <div className="text-right">Harga</div>
        <div className="text-right">Diskon</div>
        <div className="text-right">Subtotal</div>
        <div className="text-center">Aksi</div>
      </div>
    </div>
  )
})

CartTableHeader.displayName = 'CartTableHeader'