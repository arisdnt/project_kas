import React, { useState, useEffect } from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Textarea } from '@/core/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Loader2, Save, X, RotateCcw, FileText, Calculator, CreditCard, User, Calendar } from 'lucide-react'
import { RefundTransaction, RefundLine } from '@/features/retur-penjualan/types'

export type ReturPenjualanFormData = {
  originalTransactionId: string
  notes?: string
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED'
  lines: RefundLine[]
}

interface ReturPenjualanFormProps {
  value: ReturPenjualanFormData | null
  editingRetur?: RefundTransaction | null
  onSave: (data: ReturPenjualanFormData) => Promise<void>
  onCancel: () => void
  isLoading: boolean
  isCreate?: boolean
}

export function ReturPenjualanForm({
  value,
  editingRetur,
  onSave,
  onCancel,
  isLoading,
  isCreate = false
}: ReturPenjualanFormProps) {
  const [formData, setFormData] = useState<ReturPenjualanFormData>({
    originalTransactionId: '',
    notes: '',
    status: 'PENDING',
    lines: []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (value) {
      setFormData(value)
    }
  }, [value])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (isCreate && !formData.originalTransactionId.trim()) {
      newErrors.originalTransactionId = 'ID transaksi asli wajib diisi'
    }

    if (!isCreate && !editingRetur) {
      newErrors.general = 'Data retur tidak valid'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSave(formData)
    } catch (error) {
      console.error('Error saving retur penjualan:', error)
    }
  }

  const handleInputChange = (field: keyof ReturPenjualanFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'PROCESSED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Menunggu'
      case 'APPROVED':
        return 'Disetujui'
      case 'REJECTED':
        return 'Ditolak'
      case 'PROCESSED':
        return 'Diproses'
      default:
        return status
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Transaction Information */}
        {isCreate ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
              <RotateCcw className="h-4 w-4" />
              Informasi Transaksi
            </div>

            <div>
              <Label htmlFor="originalTransactionId" className="text-sm font-medium text-gray-700">
                ID Transaksi Asli *
              </Label>
              <Input
                id="originalTransactionId"
                value={formData.originalTransactionId}
                onChange={(e) => handleInputChange('originalTransactionId', e.target.value)}
                placeholder="Masukkan ID transaksi yang akan diretur"
                className={errors.originalTransactionId ? 'border-red-500' : ''}
              />
              {errors.originalTransactionId && <p className="text-sm text-red-500 mt-1">{errors.originalTransactionId}</p>}
            </div>
          </div>
        ) : editingRetur && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
              <RotateCcw className="h-4 w-4" />
              Informasi Retur
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Kode Retur</p>
                  <p className="font-medium">{editingRetur.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transaksi Asli</p>
                  <p className="font-medium">{editingRetur.originalTransactionCode}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tanggal</p>
                  <p className="font-medium">{new Date(editingRetur.date).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kasir</p>
                  <p className="font-medium">{editingRetur.cashier}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(editingRetur.status)}`}>
                    {getStatusLabel(editingRetur.status)}
                  </span>
                </div>
              </div>

              {editingRetur.customer && (
                <div>
                  <p className="text-sm text-gray-500">Pelanggan</p>
                  <p className="font-medium">{editingRetur.customer}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Update (for editing) */}
        {!isCreate && editingRetur && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
              <Calculator className="h-4 w-4" />
              Update Status
            </div>

            <div>
              <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                Status Retur
              </Label>
              <Select
                value={formData.status || editingRetur.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Menunggu</SelectItem>
                  <SelectItem value="APPROVED">Disetujui</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
                  <SelectItem value="PROCESSED">Diproses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Return Items (read-only for editing) */}
        {editingRetur && editingRetur.lines.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
              <Calculator className="h-4 w-4" />
              Item Retur
            </div>

            <div className="space-y-3">
              {editingRetur.lines.map((line, index) => (
                <div key={index} className="bg-blue-50 p-3 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-blue-900">{line.productName}</p>
                      <p className="text-blue-700">{line.sku && `SKU: ${line.sku}`}</p>
                    </div>
                    <div>
                      <p className="text-blue-700">Qty: {line.qty} {line.unit}</p>
                      <p className="text-blue-700">@ {formatCurrency(line.price)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">{formatCurrency(line.total)}</p>
                      <p className="text-xs text-blue-600">{line.reason}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Total Retur:</span>
                  <span className="font-bold text-lg">{formatCurrency(editingRetur.refundAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Information */}
        {editingRetur && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
              <CreditCard className="h-4 w-4" />
              Informasi Pembayaran
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Metode Pembayaran</p>
                  <p className="font-medium">{editingRetur.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jumlah Retur</p>
                  <p className="font-medium text-green-600">{formatCurrency(editingRetur.refundAmount)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
            <FileText className="h-4 w-4" />
            Catatan
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Catatan {isCreate ? '(Alasan retur)' : '(Catatan tambahan)'}
            </Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder={isCreate ? "Jelaskan alasan retur..." : "Catatan tambahan untuk retur ini..."}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        {/* Processing Information */}
        {editingRetur && (editingRetur.processedBy || editingRetur.processedAt) && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
              <User className="h-4 w-4" />
              Informasi Pemrosesan
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                {editingRetur.processedBy && (
                  <div>
                    <p className="text-sm text-gray-500">Diproses Oleh</p>
                    <p className="font-medium">{editingRetur.processedBy}</p>
                  </div>
                )}
                {editingRetur.processedAt && (
                  <div>
                    <p className="text-sm text-gray-500">Waktu Pemrosesan</p>
                    <p className="font-medium">{new Date(editingRetur.processedAt).toLocaleString('id-ID')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2 h-10"
        >
          <X className="h-4 w-4 mr-2" />
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 h-10 bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isCreate ? 'Buat Retur' : 'Update Status'}
        </Button>
      </div>
    </form>
  )
}