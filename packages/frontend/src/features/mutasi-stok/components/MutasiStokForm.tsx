import React, { useState, useEffect } from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Textarea } from '@/core/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Loader2, Save, X, Package, ArrowUp, ArrowDown, Hash, Calculator, FileText, Search } from 'lucide-react'
import { UIMutasiStok } from '@/features/mutasi-stok/store/mutasiStokStore'
import { useProdukStore } from '@/features/produk/store/produkStore'

export type MutasiStokFormData = {
  id_produk: string
  jenis_mutasi: 'masuk' | 'keluar'
  jumlah: string
  keterangan: string
}

interface MutasiStokFormProps {
  value: MutasiStokFormData | null
  editingMutasiStok?: UIMutasiStok | null
  onSave: (data: MutasiStokFormData) => Promise<void>
  onCancel: () => void
  isLoading: boolean
  isCreate?: boolean
}

export function MutasiStokForm({
  value,
  editingMutasiStok,
  onSave,
  onCancel,
  isLoading,
  isCreate = false
}: MutasiStokFormProps) {
  const { items: produkItems, loadFirst: loadProduk, loading: produkLoading } = useProdukStore()

  const [formData, setFormData] = useState<MutasiStokFormData>({
    id_produk: '',
    jenis_mutasi: 'masuk',
    jumlah: '',
    keterangan: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [searchProduk, setSearchProduk] = useState('')

  useEffect(() => {
    if (value) {
      setFormData(value)
    }
  }, [value])

  useEffect(() => {
    loadProduk()
  }, [loadProduk])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.id_produk.trim()) {
      newErrors.id_produk = 'Produk wajib dipilih'
    }

    if (!formData.jumlah.trim()) {
      newErrors.jumlah = 'Jumlah wajib diisi'
    } else if (isNaN(Number(formData.jumlah)) || Number(formData.jumlah) <= 0) {
      newErrors.jumlah = 'Jumlah harus berupa angka positif'
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
      console.error('Error saving mutasi stok:', error)
    }
  }

  const handleInputChange = (field: keyof MutasiStokFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const filteredProduk = produkItems.filter(p =>
    p.nama.toLowerCase().includes(searchProduk.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchProduk.toLowerCase()))
  )

  const selectedProduk = produkItems.find(p => p.id.toString() === formData.id_produk)
  const currentStok = editingMutasiStok ? editingMutasiStok.stok_sebelum : selectedProduk?.stok || 0
  const newStok = formData.jumlah ?
    (formData.jenis_mutasi === 'masuk' ? currentStok + Number(formData.jumlah) : currentStok - Number(formData.jumlah))
    : currentStok

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Product Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
            <Package className="h-4 w-4" />
            Informasi Produk
          </div>

          <div className="space-y-3">
            {isCreate ? (
              <div>
                <Label htmlFor="id_produk" className="text-sm font-medium text-gray-700">
                  Produk *
                </Label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Cari produk..."
                      value={searchProduk}
                      onChange={(e) => setSearchProduk(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={formData.id_produk}
                    onValueChange={(value) => handleInputChange('id_produk', value)}
                  >
                    <SelectTrigger className={errors.id_produk ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Pilih produk" />
                    </SelectTrigger>
                    <SelectContent>
                      {produkLoading ? (
                        <SelectItem value="loading" disabled>
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Memuat produk...
                          </div>
                        </SelectItem>
                      ) : filteredProduk.length > 0 ? (
                        filteredProduk.map(produk => (
                          <SelectItem key={produk.id} value={produk.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{produk.nama}</span>
                              <span className="text-xs text-gray-500">
                                SKU: {produk.sku || '-'} | Stok: {produk.stok || 0}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-product" disabled>Tidak ada produk ditemukan</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.id_produk && <p className="text-sm text-red-500 mt-1">{errors.id_produk}</p>}
                </div>
              </div>
            ) : editingMutasiStok && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{editingMutasiStok.nama_produk}</p>
                    <p className="text-sm text-gray-500">
                      SKU: {editingMutasiStok.sku || '-'} | Stok Saat Itu: {editingMutasiStok.stok_sebelum}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedProduk && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-blue-900">Stok Saat Ini</p>
                    <p className="text-blue-700">{selectedProduk.stok || 0}</p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Kategori</p>
                    <p className="text-blue-700">{selectedProduk.kategori?.nama || '-'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mutation Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
            <Calculator className="h-4 w-4" />
            Informasi Mutasi
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="jenis_mutasi" className="text-sm font-medium text-gray-700">
                Jenis Mutasi *
              </Label>
              <Select
                value={formData.jenis_mutasi}
                onValueChange={(value) => handleInputChange('jenis_mutasi', value as 'masuk' | 'keluar')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis mutasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masuk">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4 text-green-600" />
                      <span>Stok Masuk</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="keluar">
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-4 w-4 text-red-600" />
                      <span>Stok Keluar</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="jumlah" className="text-sm font-medium text-gray-700">
                Jumlah *
              </Label>
              <Input
                id="jumlah"
                type="number"
                min="1"
                value={formData.jumlah}
                onChange={(e) => handleInputChange('jumlah', e.target.value)}
                placeholder="Masukkan jumlah mutasi"
                className={errors.jumlah ? 'border-red-500' : ''}
              />
              {errors.jumlah && <p className="text-sm text-red-500 mt-1">{errors.jumlah}</p>}
            </div>

            {(selectedProduk || editingMutasiStok) && formData.jumlah && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Stok Sebelum</p>
                    <p className="text-gray-900">{currentStok}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      {formData.jenis_mutasi === 'masuk' ? 'Tambahan' : 'Pengurangan'}
                    </p>
                    <p className={`font-medium ${
                      formData.jenis_mutasi === 'masuk' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formData.jenis_mutasi === 'masuk' ? '+' : '-'}{formData.jumlah}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Stok Sesudah</p>
                    <p className={`font-medium ${
                      newStok < 0 ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {newStok}
                      {newStok < 0 && ' (Stok Negatif!)'}
                    </p>
                  </div>
                </div>
                {newStok < 0 && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                    ⚠️ Peringatan: Mutasi ini akan mengakibatkan stok negatif
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
            <FileText className="h-4 w-4" />
            Keterangan
          </div>

          <div>
            <Label htmlFor="keterangan" className="text-sm font-medium text-gray-700">
              Keterangan
            </Label>
            <Textarea
              id="keterangan"
              value={formData.keterangan}
              onChange={(e) => handleInputChange('keterangan', e.target.value)}
              placeholder="Keterangan tambahan untuk mutasi stok ini..."
              rows={3}
              className="resize-none"
            />
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
          disabled={isLoading || (newStok < 0 && formData.jenis_mutasi === 'keluar')}
          className="px-6 py-2 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {editingMutasiStok ? 'Perbarui' : 'Simpan'}
        </Button>
      </div>
    </form>
  )
}