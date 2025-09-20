import { memo } from 'react'

interface CartItem {
  id: string
  barcode?: string
  nama: string
  qty: number
  harga: number
  diskon: number
  subtotal: number
}

interface InvoiceItemsProps {
  items: CartItem[]
}

export const InvoiceItems = memo(({ items }: InvoiceItemsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (items.length === 0) {
    return (
      <div className="border-b border-gray-200 pb-4 mb-4">
        <div className="text-center text-xs text-gray-500 py-6">
          Belum ada item dalam keranjang
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col border-b border-gray-200 pb-4 mb-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 flex-shrink-0">
        <h3 className="text-sm font-medium text-gray-900">Daftar Belanja</h3>
        <div className="text-xs text-gray-600">
          {items.length} item • {items.reduce((sum, item) => sum + item.qty, 0)} qty
        </div>
      </div>

      {/* Items List */}
      <div
        className="space-y-1 flex-1 overflow-y-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'transparent transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.scrollbarColor = '#cbd5e1 transparent'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.scrollbarColor = 'transparent transparent'
        }}
      >
        {items.map((item, index) => (
          <div key={item.id} className="py-0.5">
            {/* Line 1: Product Name & Subtotal */}
            <div className="flex justify-between items-center">
              <div className="flex-1 min-w-0 mr-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.nama}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className="text-sm font-medium tabular-nums text-gray-900">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            </div>

            {/* Line 2: Quantity x Price, Barcode, Discount */}
            <div className="flex justify-between items-center text-xs text-gray-600 mt-0.5">
              <div className="flex items-center space-x-1.5">
                <span>
                  {item.qty} x {formatCurrency(item.harga)}
                </span>
                {item.barcode && (
                  <>
                    <span>•</span>
                    <span className="text-gray-500">{item.barcode}</span>
                  </>
                )}
              </div>
              {item.diskon > 0 && (
                <span className="text-orange-600 font-medium">
                  Diskon -{formatCurrency(item.diskon)}
                </span>
              )}
            </div>

            {/* Separator line except for last item */}
            {index !== items.length - 1 && (
              <div className="border-b border-gray-100 mt-1"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
})

InvoiceItems.displayName = 'InvoiceItems'