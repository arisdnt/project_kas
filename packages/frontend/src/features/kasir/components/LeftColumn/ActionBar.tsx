import { memo } from 'react'
import { Button } from '@/core/components/ui/button'
import { CreditCard, Save, Printer, Loader2, FileText } from 'lucide-react'

interface ActionBarProps {
  onPayment: () => void
  onSaveDraft: () => void
  onPrint: () => void
  onShowDrafts: () => void
  hasItems: boolean
  isProcessing?: boolean
  grandTotal: number
}

export const ActionBar = memo(({
  onPayment,
  onSaveDraft,
  onPrint,
  onShowDrafts,
  hasItems,
  isProcessing = false,
  grandTotal
}: ActionBarProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="bg-white border-t border-gray-200 p-4 shadow-lg backdrop-blur-sm flex-shrink-0">
      <div className="flex items-center justify-between gap-3">
        {/* Grand Total Display - 2 Column Format */}
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-700">
              Total Pembayaran :
            </div>
            <div className="text-4xl font-bold tabular-nums text-gray-900">
              {formatCurrency(grandTotal)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onShowDrafts}
            disabled={isProcessing}
            className="h-12 px-4 border-purple-300 text-purple-700 hover:bg-purple-50 disabled:opacity-50"
          >
            <FileText className="h-4 w-4 mr-2" />
            Draft
          </Button>

          <Button
            variant="outline"
            onClick={onSaveDraft}
            disabled={!hasItems || isProcessing}
            className="h-12 px-4 border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            Simpan Dulu
          </Button>

          <Button
            variant="outline"
            onClick={onPrint}
            disabled={!hasItems || isProcessing}
            className="h-12 px-4 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            <Printer className="h-4 w-4 mr-2" />
            Cetak
          </Button>

          <Button
            onClick={onPayment}
            disabled={!hasItems || isProcessing}
            className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50"
            data-payment-button
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                BAYAR
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
})

ActionBar.displayName = 'ActionBar'