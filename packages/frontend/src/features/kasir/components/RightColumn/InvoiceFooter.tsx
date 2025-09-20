import { memo } from 'react'
import { QrCode } from 'lucide-react'

interface InvoiceFooterProps {
  storeName: string
  storePhone?: string
  storeNPWP?: string
  showQR?: boolean
}

export const InvoiceFooter = memo(({
  storeName,
  storePhone,
  storeNPWP,
  showQR = false
}: InvoiceFooterProps) => {
  return (
    <div className="pt-4 mt-6 border-t border-gray-200 text-center">
      {/* Thank you message */}
      <div className="text-xs text-gray-600 mb-2">
        Terima kasih atas kunjungan Anda
      </div>

      {/* Store contact info */}
      <div className="space-y-1 text-xs text-gray-500">
        {storePhone && (
          <div>Telp: {storePhone}</div>
        )}
        {storeNPWP && (
          <div>NPWP: {storeNPWP}</div>
        )}
      </div>

      {/* Optional QR Code placeholder */}
      {showQR && (
        <div className="mt-3 flex justify-center">
          <div className="w-16 h-16 border-2 border-gray-300 rounded flex items-center justify-center">
            <QrCode className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      )}

      {/* Powered by */}
      <div className="mt-3 text-xs text-gray-400">
        Powered by {storeName} POS
      </div>
    </div>
  )
})

InvoiceFooter.displayName = 'InvoiceFooter'