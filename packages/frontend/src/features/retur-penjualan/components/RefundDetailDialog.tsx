import React from 'react'
import { Badge } from "@/core/components/ui/badge"
import { Button } from "@/core/components/ui/button"
import { 
  FileText, 
  Calendar, 
  User, 
  CreditCard, 
  Check, 
  X, 
  RotateCcw 
} from 'lucide-react'
import type { RefundTransaction } from '../types'
import { formatCurrency, getStatusColor, getStatusText } from '../data/sampleRefunds'

interface Props {
  refund: RefundTransaction
  isProcessing: number | null
  onApprove: (id: number) => void
  onReject: (id: number) => void
  onProcess: (id: number) => void
  onClose: () => void
}

export function RefundDetailDialog({ 
  refund, 
  isProcessing, 
  onApprove, 
  onReject, 
  onProcess, 
  onClose 
}: Props) {
  return (
    <div className="max-h-[70vh] overflow-y-auto pr-4">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Kode Retur</span>
            </div>
            <p className="font-medium">{refund.code}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Tanggal</span>
            </div>
            <p className="font-medium">{refund.date} {refund.time}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Kasir</span>
            </div>
            <p className="font-medium">{refund.cashier}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Metode Pembayaran</span>
            </div>
            <p className="font-medium">{refund.paymentMethod}</p>
          </div>
        </div>

        {/* Original Transaction */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Transaksi Asli</h4>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-medium">{refund.originalTransactionCode}</p>
            <p className="text-sm text-gray-600">ID: {refund.originalTransactionId}</p>
          </div>
        </div>

        {/* Status */}
        <div>
          <h4 className="font-medium mb-3">Status</h4>
          <Badge className={getStatusColor(refund.status)}>
            {getStatusText(refund.status)}
          </Badge>
        </div>

        {/* Refund Items */}
        <div>
          <h4 className="font-medium mb-3">Barang Dikembalikan</h4>
          <div className="border rounded-lg">
            <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 font-medium text-sm">
              <div className="col-span-5">Produk</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-3 text-right">Harga</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            {refund.lines.map((line, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 p-3 border-t">
                <div className="col-span-5">
                  <div>
                    <p className="font-medium text-sm">{line.productName}</p>
                    <p className="text-xs text-gray-500">{line.sku}</p>
                    <p className="text-xs text-red-600 mt-1">{line.reason}</p>
                  </div>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-sm">{line.qty} {line.unit}</span>
                </div>
                <div className="col-span-3 text-right">
                  <span className="text-sm">{formatCurrency(line.price)}</span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="font-medium text-sm">{formatCurrency(line.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Nilai Retur</span>
            <span className="text-xl font-bold text-blue-600">
              {formatCurrency(refund.refundAmount)}
            </span>
          </div>
        </div>

        {/* Notes */}
        {refund.notes && (
          <div>
            <h4 className="font-medium mb-3">Catatan</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {refund.notes}
            </p>
          </div>
        )}

        {/* Processing Info */}
        {refund.processedBy && (
          <div>
            <h4 className="font-medium mb-3">Informasi Pemrosesan</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Diproses oleh:</span>
                <p className="font-medium">{refund.processedBy}</p>
              </div>
              <div>
                <span className="text-gray-600">Waktu Pemrosesan:</span>
                <p className="font-medium">
                  {new Date(refund.processedAt!).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
          
          {refund.status === 'PENDING' && (
            <>
              <Button 
                variant="outline" 
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => {
                  onReject(refund.id)
                  onClose()
                }}
                disabled={isProcessing === refund.id}
              >
                <X className="h-4 w-4 mr-2" />
                Tolak
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  onApprove(refund.id)
                  onClose()
                }}
                disabled={isProcessing === refund.id}
              >
                <Check className="h-4 w-4 mr-2" />
                Setujui
              </Button>
            </>
          )}
          
          {refund.status === 'APPROVED' && (
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                onProcess(refund.id)
                onClose()
              }}
              disabled={isProcessing === refund.id}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Proses Pengembalian
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}