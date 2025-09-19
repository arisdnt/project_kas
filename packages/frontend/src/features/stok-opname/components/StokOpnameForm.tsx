import React, { useState, useEffect } from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Textarea } from '@/core/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Loader2, Save, X, Package, Hash, Calculator, FileText, Search } from 'lucide-react'
import { UIStokOpname } from '@/features/stok-opname/store/stokOpnameStore'
import { useProdukStore } from '@/features/produk/store/produkStore'

export type StokOpnameFormData = {
  id_produk: string
  stok_fisik: string
  catatan: string
}

interface StokOpnameFormProps {
  value: StokOpnameFormData | null
  editingStokOpname?: UIStokOpname | null
  onSave: (data: StokOpnameFormData) => Promise<void>
  onCancel: () => void
  isLoading: boolean
  isCreate?: boolean
}

export function StokOpnameForm({
  value,
  editingStokOpname,
  onSave,
  onCancel,
  isLoading,
  isCreate = false
}: StokOpnameFormProps) {
  const { items: produkItems, loadFirst: loadProduk, loading: produkLoading } = useProdukStore()

  const [formData, setFormData] = useState<StokOpnameFormData>({
    id_produk: '',
    stok_fisik: '',
    catatan: ''
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

    if (!formData.stok_fisik.trim()) {
      newErrors.stok_fisik = 'Stok fisik wajib diisi'
    } else if (isNaN(Number(formData.stok_fisik)) || Number(formData.stok_fisik) < 0) {
      newErrors.stok_fisik = 'Stok fisik harus berupa angka positif'
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
      console.error('Error saving stok opname:', error)
    }
  }

  const handleInputChange = (field: keyof StokOpnameFormData, value: string) => {
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
  const selisih = selectedProduk && formData.stok_fisik ?
    Number(formData.stok_fisik) - (selectedProduk.stok || 0) : 0

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
            ) : editingStokOpname && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{editingStokOpname.nama_produk}</p>
                    <p className="text-sm text-gray-500">
                      SKU: {editingStokOpname.sku || '-'} | Stok Sistem: {editingStokOpname.stok_sistem || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedProduk && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-blue-900">Stok Sistem</p>
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

        {/* Stock Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
            <Calculator className="h-4 w-4" />
            Informasi Stok
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="stok_fisik" className="text-sm font-medium text-gray-700">
                Stok Fisik *
              </Label>
              <Input
                id="stok_fisik"
                type="number"
                min="0"
                value={formData.stok_fisik}
                onChange={(e) => handleInputChange('stok_fisik', e.target.value)}
                placeholder="Masukkan jumlah stok fisik"
                className={errors.stok_fisik ? 'border-red-500' : ''}
              />
              {errors.stok_fisik && <p className="text-sm text-red-500 mt-1">{errors.stok_fisik}</p>}
            </div>

            {(selectedProduk || editingStokOpname) && formData.stok_fisik && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Stok Sistem</p>
                    <p className="text-gray-900">
                      {editingStokOpname ? editingStokOpname.stok_sistem : selectedProduk?.stok || 0}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Stok Fisik</p>
                    <p className="text-gray-900">{formData.stok_fisik}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Selisih</p>
                    <p className={`font-medium ${
                      selisih > 0 ? 'text-green-600' : selisih < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {selisih > 0 ? '+' : ''}{selisih}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
            <FileText className="h-4 w-4" />
            Catatan
          </div>

          <div>
            <Label htmlFor="catatan" className="text-sm font-medium text-gray-700">
              Catatan
            </Label>
            <Textarea
              id="catatan"
              value={formData.catatan}
              onChange={(e) => handleInputChange('catatan', e.target.value)}
              placeholder="Catatan tambahan untuk stok opname ini..."
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
          disabled={isLoading}
          className="px-6 py-2 h-10 bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {editingStokOpname ? 'Perbarui' : 'Simpan'}
        </Button>
      </div>
    </form>
  )
}