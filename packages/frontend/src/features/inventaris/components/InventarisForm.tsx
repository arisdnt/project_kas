import React, { useState, useEffect } from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Loader2, Save, X, Package, DollarSign, Hash, Calculator } from 'lucide-react'
import { UIInventaris } from '@/features/inventaris/store/inventarisStore'

export type InventarisFormData = {
  jumlah: string
  harga: string
  harga_beli: string
}

interface InventarisFormProps {
  value: InventarisFormData | null
  editingInventaris?: UIInventaris | null
  onSave: (data: InventarisFormData) => Promise<void>
  onCancel: () => void
  isLoading: boolean
  isCreate?: boolean
}

export function InventarisForm({
  value,
  editingInventaris,
  onSave,
  onCancel,
  isLoading,
  isCreate = false
}: InventarisFormProps) {
  const [formData, setFormData] = useState<InventarisFormData>({
    jumlah: '',
    harga: '',
    harga_beli: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (value) {
      setFormData(value)
    }
  }, [value])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.jumlah.trim()) {
      newErrors.jumlah = 'Jumlah stok wajib diisi'
    } else if (isNaN(Number(formData.jumlah)) || Number(formData.jumlah) < 0) {
      newErrors.jumlah = 'Jumlah stok harus berupa angka tidak negatif'
    }

    if (!formData.harga.trim()) {
      newErrors.harga = 'Harga jual wajib diisi'
    } else if (isNaN(Number(formData.harga)) || Number(formData.harga) <= 0) {
      newErrors.harga = 'Harga jual harus berupa angka positif'
    }

    if (!formData.harga_beli.trim()) {
      newErrors.harga_beli = 'Harga beli wajib diisi'
    } else if (isNaN(Number(formData.harga_beli)) || Number(formData.harga_beli) <= 0) {
      newErrors.harga_beli = 'Harga beli harus berupa angka positif'
    }

    // Check if harga jual is higher than harga beli
    if (formData.harga && formData.harga_beli &&
        Number(formData.harga) <= Number(formData.harga_beli)) {
      newErrors.harga = 'Harga jual harus lebih tinggi dari harga beli'
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
      console.error('Error saving inventaris:', error)
    }
  }

  const handleInputChange = (field: keyof InventarisFormData, value: string) => {
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

  const margin = formData.harga && formData.harga_beli ?
    Number(formData.harga) - Number(formData.harga_beli) : 0
  const marginPercent = formData.harga_beli && margin > 0 ?
    ((margin / Number(formData.harga_beli)) * 100).toFixed(1) : 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Product Information */}
        {!isCreate && editingInventaris && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
              <Package className="h-4 w-4" />
              Informasi Produk
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Package className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{editingInventaris.nama_produk}</p>
                  <p className="text-sm text-gray-500">
                    SKU: {editingInventaris.sku || '-'}
                  </p>
                  {(editingInventaris.kategori || editingInventaris.brand) && (
                    <p className="text-sm text-gray-500">
                      {editingInventaris.kategori?.nama && `Kategori: ${editingInventaris.kategori.nama}`}
                      {editingInventaris.kategori?.nama && editingInventaris.brand?.nama && ' | '}
                      {editingInventaris.brand?.nama && `Brand: ${editingInventaris.brand.nama}`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
            <Calculator className="h-4 w-4" />
            Informasi Inventaris
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="jumlah" className="text-sm font-medium text-gray-700">
                Jumlah Stok *
              </Label>
              <Input
                id="jumlah"
                type="number"
                min="0"
                value={formData.jumlah}
                onChange={(e) => handleInputChange('jumlah', e.target.value)}
                placeholder="Masukkan jumlah stok"
                className={errors.jumlah ? 'border-red-500' : ''}
              />
              {errors.jumlah && <p className="text-sm text-red-500 mt-1">{errors.jumlah}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="harga_beli" className="text-sm font-medium text-gray-700">
                  Harga Beli *
                </Label>
                <Input
                  id="harga_beli"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.harga_beli}
                  onChange={(e) => handleInputChange('harga_beli', e.target.value)}
                  placeholder="0"
                  className={errors.harga_beli ? 'border-red-500' : ''}
                />
                {errors.harga_beli && <p className="text-sm text-red-500 mt-1">{errors.harga_beli}</p>}
              </div>

              <div>
                <Label htmlFor="harga" className="text-sm font-medium text-gray-700">
                  Harga Jual *
                </Label>
                <Input
                  id="harga"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.harga}
                  onChange={(e) => handleInputChange('harga', e.target.value)}
                  placeholder="0"
                  className={errors.harga ? 'border-red-500' : ''}
                />
                {errors.harga && <p className="text-sm text-red-500 mt-1">{errors.harga}</p>}
              </div>
            </div>

            {/* Price Analysis */}
            {formData.harga && formData.harga_beli && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-blue-900">Margin</p>
                    <p className={`text-blue-700 font-medium ${margin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(margin)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Margin %</p>
                    <p className={`text-blue-700 font-medium ${Number(marginPercent) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {marginPercent}%
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Total Nilai Stok</p>
                    <p className="text-blue-700 font-medium">
                      {formatCurrency(Number(formData.jumlah || 0) * Number(formData.harga || 0))}
                    </p>
                  </div>
                </div>
                {margin <= 0 && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                    ⚠️ Peringatan: Harga jual harus lebih tinggi dari harga beli untuk mendapat profit
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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
          disabled={isLoading || margin <= 0}
          className="px-6 py-2 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isCreate ? 'Simpan' : 'Perbarui'}
        </Button>
      </div>
    </form>
  )
}