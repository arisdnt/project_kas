import React, { useState, useEffect } from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Textarea } from '@/core/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Loader2, Save, X, Gift, Percent, DollarSign, Calendar, ShoppingCart, Package } from 'lucide-react'
import { Promo } from '@/features/promo/types/promo'

export type PromoFormData = {
  nama: string
  deskripsi: string
  tipe: 'diskon_persen' | 'diskon_nominal' | 'beli_n_gratis_n' | 'bundling'
  nilai: string
  syarat_minimum: string
  kuota: string
  mulai_tanggal: string
  selesai_tanggal: string
}

interface PromoFormProps {
  value: PromoFormData | null
  editingPromo?: Promo | null
  onSave: (data: PromoFormData) => Promise<void>
  onCancel: () => void
  isLoading: boolean
  isCreate?: boolean
}

export function PromoForm({
  value,
  editingPromo,
  onSave,
  onCancel,
  isLoading,
  isCreate = false
}: PromoFormProps) {
  const [formData, setFormData] = useState<PromoFormData>({
    nama: '',
    deskripsi: '',
    tipe: 'diskon_persen',
    nilai: '0',
    syarat_minimum: '0',
    kuota: '0',
    mulai_tanggal: '',
    selesai_tanggal: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (value) {
      setFormData(value)
    }
  }, [value])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama promo wajib diisi'
    }

    if (!formData.deskripsi.trim()) {
      newErrors.deskripsi = 'Deskripsi promo wajib diisi'
    }

    if (!formData.nilai.trim()) {
      newErrors.nilai = 'Nilai promo wajib diisi'
    } else if (isNaN(Number(formData.nilai)) || Number(formData.nilai) <= 0) {
      newErrors.nilai = 'Nilai promo harus berupa angka positif'
    } else if (formData.tipe === 'diskon_persen' && Number(formData.nilai) > 100) {
      newErrors.nilai = 'Nilai diskon persen tidak boleh lebih dari 100'
    }

    if (!formData.mulai_tanggal) {
      newErrors.mulai_tanggal = 'Tanggal mulai wajib diisi'
    }

    if (!formData.selesai_tanggal) {
      newErrors.selesai_tanggal = 'Tanggal selesai wajib diisi'
    }

    if (formData.mulai_tanggal && formData.selesai_tanggal) {
      const startDate = new Date(formData.mulai_tanggal)
      const endDate = new Date(formData.selesai_tanggal)
      if (endDate <= startDate) {
        newErrors.selesai_tanggal = 'Tanggal selesai harus setelah tanggal mulai'
      }
    }

    if (formData.syarat_minimum && isNaN(Number(formData.syarat_minimum))) {
      newErrors.syarat_minimum = 'Syarat minimum harus berupa angka'
    }

    if (formData.kuota && (isNaN(Number(formData.kuota)) || Number(formData.kuota) <= 0)) {
      newErrors.kuota = 'Kuota harus berupa angka positif'
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
      console.error('Error saving promo:', error)
    }
  }

  const handleInputChange = (field: keyof PromoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getPromoTypeIcon = (tipe: string) => {
    switch (tipe) {
      case 'diskon_persen':
        return <Percent className="h-4 w-4" />
      case 'diskon_nominal':
        return <DollarSign className="h-4 w-4" />
      case 'beli_n_gratis_n':
        return <Gift className="h-4 w-4" />
      case 'bundling':
        return <Package className="h-4 w-4" />
      default:
        return <Gift className="h-4 w-4" />
    }
  }

  const getPromoTypeLabel = (tipe: string) => {
    switch (tipe) {
      case 'diskon_persen':
        return 'Diskon Persen'
      case 'diskon_nominal':
        return 'Diskon Nominal'
      case 'beli_n_gratis_n':
        return 'Beli N Gratis N'
      case 'bundling':
        return 'Bundling'
      default:
        return 'Tidak Diketahui'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Promo Information */}
        {!isCreate && editingPromo && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
              <Gift className="h-4 w-4" />
              Informasi Promo Saat Ini
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  {getPromoTypeIcon(editingPromo.tipe)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{editingPromo.nama}</p>
                  <p className="text-sm text-gray-500">{getPromoTypeLabel(editingPromo.tipe)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      editingPromo.aktif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {editingPromo.aktif ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Penggunaan</p>
                  <p className="font-medium">
                    {editingPromo.kuota_terpakai || 0} / {editingPromo.kuota || '∞'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
            <Gift className="h-4 w-4" />
            Informasi Dasar
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="nama" className="text-sm font-medium text-gray-700">
                Nama Promo *
              </Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => handleInputChange('nama', e.target.value)}
                placeholder="Contoh: Diskon Akhir Tahun"
                className={errors.nama ? 'border-red-500' : ''}
              />
              {errors.nama && <p className="text-sm text-red-500 mt-1">{errors.nama}</p>}
            </div>

            <div>
              <Label htmlFor="deskripsi" className="text-sm font-medium text-gray-700">
                Deskripsi *
              </Label>
              <Textarea
                id="deskripsi"
                value={formData.deskripsi}
                onChange={(e) => handleInputChange('deskripsi', e.target.value)}
                placeholder="Deskripsi promo..."
                rows={3}
                className={`resize-none ${errors.deskripsi ? 'border-red-500' : ''}`}
              />
              {errors.deskripsi && <p className="text-sm text-red-500 mt-1">{errors.deskripsi}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tipe" className="text-sm font-medium text-gray-700">
                  Tipe Promo *
                </Label>
                <Select
                  value={formData.tipe}
                  onValueChange={(value) => handleInputChange('tipe', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe promo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diskon_persen">Diskon Persen</SelectItem>
                    <SelectItem value="diskon_nominal">Diskon Nominal</SelectItem>
                    <SelectItem value="beli_n_gratis_n">Beli N Gratis N</SelectItem>
                    <SelectItem value="bundling">Bundling</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="nilai" className="text-sm font-medium text-gray-700">
                  Nilai {formData.tipe === 'diskon_persen' ? '(%)' : formData.tipe === 'diskon_nominal' ? '(Rp)' : ''} *
                </Label>
                <Input
                  id="nilai"
                  type="number"
                  min="0"
                  max={formData.tipe === 'diskon_persen' ? 100 : undefined}
                  value={formData.nilai}
                  onChange={(e) => handleInputChange('nilai', e.target.value)}
                  placeholder="0"
                  className={errors.nilai ? 'border-red-500' : ''}
                />
                {errors.nilai && <p className="text-sm text-red-500 mt-1">{errors.nilai}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
            <ShoppingCart className="h-4 w-4" />
            Syarat & Ketentuan
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="syarat_minimum" className="text-sm font-medium text-gray-700">
                Minimum Pembelian (Rp)
              </Label>
              <Input
                id="syarat_minimum"
                type="number"
                min="0"
                value={formData.syarat_minimum}
                onChange={(e) => handleInputChange('syarat_minimum', e.target.value)}
                placeholder="0"
                className={errors.syarat_minimum ? 'border-red-500' : ''}
              />
              {errors.syarat_minimum && <p className="text-sm text-red-500 mt-1">{errors.syarat_minimum}</p>}
            </div>

            <div>
              <Label htmlFor="kuota" className="text-sm font-medium text-gray-700">
                Kuota Penggunaan
              </Label>
              <Input
                id="kuota"
                type="number"
                min="0"
                value={formData.kuota}
                onChange={(e) => handleInputChange('kuota', e.target.value)}
                placeholder="0 (tanpa batas)"
                className={errors.kuota ? 'border-red-500' : ''}
              />
              {errors.kuota && <p className="text-sm text-red-500 mt-1">{errors.kuota}</p>}
            </div>
          </div>
        </div>

        {/* Period */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
            <Calendar className="h-4 w-4" />
            Periode Promo
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="mulai_tanggal" className="text-sm font-medium text-gray-700">
                Tanggal Mulai *
              </Label>
              <Input
                id="mulai_tanggal"
                type="date"
                value={formData.mulai_tanggal}
                onChange={(e) => handleInputChange('mulai_tanggal', e.target.value)}
                className={errors.mulai_tanggal ? 'border-red-500' : ''}
              />
              {errors.mulai_tanggal && <p className="text-sm text-red-500 mt-1">{errors.mulai_tanggal}</p>}
            </div>

            <div>
              <Label htmlFor="selesai_tanggal" className="text-sm font-medium text-gray-700">
                Tanggal Selesai *
              </Label>
              <Input
                id="selesai_tanggal"
                type="date"
                value={formData.selesai_tanggal}
                onChange={(e) => handleInputChange('selesai_tanggal', e.target.value)}
                className={errors.selesai_tanggal ? 'border-red-500' : ''}
              />
              {errors.selesai_tanggal && <p className="text-sm text-red-500 mt-1">{errors.selesai_tanggal}</p>}
            </div>
          </div>
        </div>

        {/* Preview */}
        {formData.nilai && formData.tipe && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">Preview Promo:</p>
            <div className="text-sm text-blue-700">
              <p className="font-medium">{formData.nama || 'Nama Promo'}</p>
              <p className="text-xs">{formData.deskripsi || 'Deskripsi promo'}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  {getPromoTypeLabel(formData.tipe)}
                </span>
                <span className="text-sm font-medium">
                  {formData.tipe === 'diskon_persen' ? `${formData.nilai}%` :
                   formData.tipe === 'diskon_nominal' ? formatCurrency(Number(formData.nilai)) :
                   formData.tipe === 'beli_n_gratis_n' ? `Beli ${Number(formData.nilai) - 1} Gratis 1` :
                   'Paket Bundling'}
                </span>
              </div>
              {formData.syarat_minimum && Number(formData.syarat_minimum) > 0 && (
                <p className="text-xs mt-1">Min. pembelian: {formatCurrency(Number(formData.syarat_minimum))}</p>
              )}
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
          {isCreate ? 'Buat Promo' : 'Update Promo'}
        </Button>
      </div>
    </form>
  )
}