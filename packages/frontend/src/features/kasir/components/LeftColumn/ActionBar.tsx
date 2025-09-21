import { memo } from 'react'
import { Button } from '@/core/components/ui/button'
import { CreditCard, Save, Printer, Loader2, FileText, Trash2 } from 'lucide-react'

interface ActionBarProps {
  onPayment: () => void
  onSaveDraft: () => void
  onPrint: () => void
  onShowDrafts: () => void
  onClear: () => void
  hasItems: boolean
  isProcessing?: boolean
  grandTotal: number
}

export const ActionBar = memo(({
  onPayment,
  onSaveDraft,
  onPrint,
  onShowDrafts,
  onClear,
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
            onClick={onClear}
            disabled={!hasItems || isProcessing}
            className="h-12 px-4 border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
            data-clear-button
            title="Bersihkan keranjang"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            [F3] Bersihkan
          </Button>

          <Button
            variant="outline"
            onClick={onShowDrafts}
            disabled={isProcessing}
            className="h-12 px-4 border-purple-300 text-purple-700 hover:bg-purple-50 disabled:opacity-50"
            data-drafts-button
          >
            <FileText className="h-4 w-4 mr-2" />
            [F7] Draft
          </Button>

          <Button
            variant="outline"
            onClick={onSaveDraft}
            disabled={!hasItems || isProcessing}
            className="h-12 px-4 border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-50"
            data-save-draft-button
          >
            <Save className="h-4 w-4 mr-2" />
            [F6] Simpan Dulu
          </Button>

          <Button
            variant="outline"
            onClick={onPrint}
            disabled={!hasItems || isProcessing}
            className="h-12 px-4 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            data-print-button
          >
            <Printer className="h-4 w-4 mr-2" />
            [F8] Cetak
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
                [F9] BAYAR
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
})

ActionBar.displayName = 'ActionBar'