import { memo } from 'react'

interface InvoiceHeaderProps {
  storeName: string
  storeAddress: string
  invoiceNumber: string
  dateTime: string
  cashierName: string
  customerName: string
}

export const InvoiceHeader = memo(({
  storeName,
  storeAddress,
  invoiceNumber,
  dateTime,
  cashierName,
  customerName
}: InvoiceHeaderProps) => {
  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      {/* Store Info */}
      <div className="text-center mb-3">
        <h2 className="text-lg font-bold text-gray-900">{storeName}</h2>
        <p className="text-xs text-gray-600 leading-tight">{storeAddress}</p>
      </div>

      {/* Transaction Info */}
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">No. Invoice:</span>
          <span className="font-medium tabular-nums">{invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tanggal/Jam:</span>
          <span className="font-medium tabular-nums">{dateTime}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Kasir:</span>
          <span className="font-medium">{cashierName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Pelanggan:</span>
          <span className="font-medium">{customerName}</span>
        </div>
      </div>
    </div>
  )
})

InvoiceHeader.displayName = 'InvoiceHeader'