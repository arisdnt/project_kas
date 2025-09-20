import React, { useState, useEffect } from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Textarea } from '@/core/components/ui/textarea'
import { Loader2, Save, X, Calendar, FileText, BarChart3, TrendingUp } from 'lucide-react'
import { LaporanHarian } from '../types'

export type LaporanHarianFormData = {
  tanggal: string
  catatan: string
}

interface LaporanHarianFormProps {
  value: LaporanHarianFormData | null
  editingLaporan?: LaporanHarian | null
  onSave: (data: LaporanHarianFormData) => Promise<void>
  onCancel: () => void
  isLoading: boolean
  isCreate?: boolean
}

export function LaporanHarianForm({
  value,
  editingLaporan,
  onSave,
  onCancel,
  isLoading,
  isCreate = false
}: LaporanHarianFormProps) {
  const [formData, setFormData] = useState<LaporanHarianFormData>({
    tanggal: new Date().toISOString().split('T')[0],
    catatan: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (value) {
      setFormData(value)
    }
  }, [value])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.tanggal) {
      newErrors.tanggal = 'Tanggal wajib diisi'
    }

    const selectedDate = new Date(formData.tanggal)
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    if (selectedDate > today) {
      newErrors.tanggal = 'Tidak dapat membuat laporan untuk tanggal masa depan'
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
      console.error('Error saving laporan harian:', error)
    }
  }

  const handleInputChange = (field: keyof LaporanHarianFormData, value: string) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Laporan Information */}
        {!isCreate && editingLaporan && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
              <BarChart3 className="h-4 w-4" />
              Informasi Laporan Saat Ini
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{formatDate(editingLaporan.tanggal)}</p>
                  <p className="text-sm text-gray-500">Laporan Harian</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Total Transaksi</p>
                  <p className="font-medium">{editingLaporan.total_transaksi.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Penjualan</p>
                  <p className="font-medium text-green-600">{formatCurrency(editingLaporan.total_penjualan)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Profit</p>
                  <p className="font-medium text-blue-600">{formatCurrency(editingLaporan.total_profit)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Pelanggan</p>
                  <p className="font-medium">{editingLaporan.total_pelanggan.toLocaleString('id-ID')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t">
                <div>
                  <p className="text-gray-500">Produk Terlaris</p>
                  <p className="font-medium">{editingLaporan.produk_terlaris}</p>
                </div>
                <div>
                  <p className="text-gray-500">Jam Tersibuk</p>
                  <p className="font-medium">{editingLaporan.jam_tersibuk}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
            <Calendar className="h-4 w-4" />
            Informasi Laporan
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="tanggal" className="text-sm font-medium text-gray-700">
                Tanggal Laporan *
              </Label>
              <Input
                id="tanggal"
                type="date"
                value={formData.tanggal}
                onChange={(e) => handleInputChange('tanggal', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={errors.tanggal ? 'border-red-500' : ''}
                disabled={!isCreate}
              />
              {errors.tanggal && <p className="text-sm text-red-500 mt-1">{errors.tanggal}</p>}
              {isCreate && (
                <p className="text-xs text-gray-500 mt-1">
                  Laporan akan dihasilkan berdasarkan data transaksi pada tanggal yang dipilih
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="catatan" className="text-sm font-medium text-gray-700">
                Catatan {isCreate ? '(Opsional)' : ''}
              </Label>
              <Textarea
                id="catatan"
                value={formData.catatan}
                onChange={(e) => handleInputChange('catatan', e.target.value)}
                placeholder={isCreate ? "Catatan khusus untuk laporan ini..." : "Update catatan untuk laporan ini..."}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tambahkan catatan khusus atau observasi penting untuk hari ini
              </p>
            </div>
          </div>
        </div>

        {/* Preview Info for Create */}
        {isCreate && formData.tanggal && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-medium text-blue-900">Preview Laporan</p>
            </div>
            <div className="text-sm text-blue-700">
              <p className="font-medium">{formatDate(formData.tanggal)}</p>
              <p className="text-xs mt-1">
                Sistem akan menganalisis semua transaksi, penjualan, dan aktivitas pada tanggal ini
              </p>
              <div className="mt-2 text-xs">
                <p>• Data transaksi dan penjualan</p>
                <p>• Analisis produk terlaris dan jam tersibuk</p>
                <p>• Perhitungan profit dan performa</p>
                <p>• Statistik pelanggan dan pembayaran</p>
              </div>
            </div>
          </div>
        )}

        {/* Financial Summary for Edit */}
        {!isCreate && editingLaporan && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
              <TrendingUp className="h-4 w-4" />
              Ringkasan Keuangan
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-green-900">Rata-rata Transaksi</p>
                  <p className="text-green-700 font-medium">{formatCurrency(editingLaporan.rata_rata_transaksi)}</p>
                </div>
                <div>
                  <p className="font-medium text-green-900">Total Diskon</p>
                  <p className="text-green-700 font-medium">{formatCurrency(editingLaporan.total_diskon)}</p>
                </div>
                <div>
                  <p className="font-medium text-green-900">Total Pajak</p>
                  <p className="text-green-700 font-medium">{formatCurrency(editingLaporan.total_pajak)}</p>
                </div>
              </div>
            </div>

            {(editingLaporan.total_retur > 0 || editingLaporan.stok_rendah > 0) && (
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {editingLaporan.total_retur > 0 && (
                    <div>
                      <p className="font-medium text-amber-900">Total Retur</p>
                      <p className="text-amber-700 font-medium">{formatCurrency(editingLaporan.total_retur)}</p>
                    </div>
                  )}
                  {editingLaporan.stok_rendah > 0 && (
                    <div>
                      <p className="font-medium text-amber-900">Produk Stok Rendah</p>
                      <p className="text-amber-700 font-medium">{editingLaporan.stok_rendah} item</p>
                    </div>
                  )}
                </div>
              </div>
            )}
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
          {isCreate ? 'Generate Laporan' : 'Update Laporan'}
        </Button>
      </div>
    </form>
  )
}