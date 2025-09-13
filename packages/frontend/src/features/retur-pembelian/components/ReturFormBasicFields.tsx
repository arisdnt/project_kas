import React from 'react'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Textarea } from '@/core/components/ui/textarea'
import { Card, CardContent } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Search, Package, AlertTriangle } from 'lucide-react'
import { ReturPembelianFormData } from '../types/returPembelian'

interface ReturFormBasicFieldsProps {
  formData: ReturPembelianFormData
  onFormDataChange: (data: Partial<ReturPembelianFormData>) => void
  validationErrors: Record<string, string>
  selectedProduk: any
  selectedPembelian: any
}

export function ReturFormBasicFields({
  formData,
  onFormDataChange,
  validationErrors,
  selectedProduk,
  selectedPembelian
}: ReturFormBasicFieldsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      {/* Jumlah */}
      <div className="space-y-2">
        <Label htmlFor="jumlah">Jumlah Retur</Label>
        <Input
          id="jumlah"
          type="number"
          min="1"
          value={formData.jumlah}
          onChange={(e) => onFormDataChange({ 
            jumlah: parseInt(e.target.value) || 1 
          })}
          className={validationErrors.jumlah ? 'border-red-500' : ''}
        />
        {validationErrors.jumlah && (
          <p className="text-sm text-red-600">{validationErrors.jumlah}</p>
        )}
      </div>

      {/* Total Estimasi */}
      {selectedProduk && formData.jumlah > 0 && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Estimasi:</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency((selectedProduk.harga_beli || 0) * formData.jumlah)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alasan Retur */}
      <div className="space-y-2">
        <Label htmlFor="alasan">Alasan Retur</Label>
        <Textarea
          id="alasan"
          placeholder="Jelaskan alasan retur barang..."
          value={formData.alasan}
          onChange={(e) => onFormDataChange({ alasan: e.target.value })}
          rows={3}
          className={validationErrors.alasan ? 'border-red-500' : ''}
        />
        {validationErrors.alasan && (
          <p className="text-sm text-red-600">{validationErrors.alasan}</p>
        )}
      </div>
    </div>
  )
}