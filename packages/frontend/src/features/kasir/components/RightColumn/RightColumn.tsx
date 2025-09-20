import { memo } from 'react'
import { InvoiceHeader } from './InvoiceHeader'
import { InvoiceItems } from './InvoiceItems'
import { InvoiceTotals } from './InvoiceTotals'
import { InvoiceFooter } from './InvoiceFooter'

interface CartItem {
  id: string
  barcode?: string
  nama: string
  qty: number
  harga: number
  diskon: number
  subtotal: number
}

interface RightColumnProps {
  items: CartItem[]
  storeName: string
  storeAddress: string
  storePhone?: string
  storeNPWP?: string
  invoiceNumber: string
  dateTime: string
  cashierName: string
  customerName: string
  subtotal: number
  discount: number
  tax: number
  grandTotal: number
}

export const RightColumn = memo(({
  items,
  storeName,
  storeAddress,
  storePhone,
  storeNPWP,
  invoiceNumber,
  dateTime,
  cashierName,
  customerName,
  subtotal,
  discount,
  tax,
  grandTotal
}: RightColumnProps) => {

  return (
    <div className="w-full min-w-[340px] max-w-[360px] h-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="h-full flex flex-col p-4">
        {/* Invoice Header - Fixed */}
        <div className="flex-shrink-0">
          <InvoiceHeader
            storeName={storeName}
            storeAddress={storeAddress}
            invoiceNumber={invoiceNumber}
            dateTime={dateTime}
            cashierName={cashierName}
            customerName={customerName}
          />
        </div>

        {/* Invoice Items - Flexible space */}
        <div className="flex-1 min-h-0">
          <InvoiceItems items={items} />
        </div>

        {/* Invoice Totals & Footer - Sticky bottom */}
        <div className="flex-shrink-0">
          <InvoiceTotals
            subtotal={subtotal}
            discount={discount}
            tax={tax}
            grandTotal={grandTotal}
          />

          <InvoiceFooter
            storeName={storeName}
            storePhone={storePhone}
            storeNPWP={storeNPWP}
            showQR={false}
          />
        </div>
      </div>
    </div>
  )
})

RightColumn.displayName = 'RightColumn'