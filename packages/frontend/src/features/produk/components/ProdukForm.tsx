import * as React from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Textarea } from '@/core/components/ui/textarea'
import { Upload, X, Image, Package2, DollarSign, Hash, Tag, Building, Users } from 'lucide-react'
import { useAuthStore } from '@/core/store/authStore'
import { UIProduk } from '@/features/produk/store/produkStore'
import { ProdukAccessPlaceholder } from './ProdukAccessPlaceholder'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'

export type ProdukFormData = {
  nama: string
  kode: string
  kategori: string
  kategoriId: string
  brand: string
  brandId: string
  hargaBeli: number
  hargaJual: number
  stok: number
  satuan: string
  deskripsi: string
  status: string
  gambar_url?: string
}

type Props = {
  value?: ProdukFormData | null
  editingProduk?: UIProduk | null
  onSave?: (data: ProdukFormData, imageFile?: File) => Promise<void>
  onUploadImage?: (produkId: string, file: File) => Promise<string>
  onRemoveImage?: (produkId: string) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  brands?: Array<{ id: string; nama: string }>
  categories?: Array<{ id: string; nama: string }>
}

export function ProdukForm({
  value,
  editingProduk,
  onSave,
  onUploadImage,
  onRemoveImage,
  onCancel,
  isLoading = false,
  brands = [],
  categories = []
}: Props) {
  const { user } = useAuthStore()

  // Form persistence key
  const FORM_STORAGE_KEY = 'produk_form_data'

  // Load persisted form data or use value
  const getInitialFormData = (): ProdukFormData => {
    // For editing existing product, always use the provided value
    if (editingProduk && value) {
      return {
        nama: value?.nama || '',
        kode: value?.kode || '',
        kategori: value?.kategori || '',
        kategoriId: value?.kategoriId || '',
        brand: value?.brand || '',
        brandId: value?.brandId || '',
        hargaBeli: value?.hargaBeli || 0,
        hargaJual: value?.hargaJual || 0,
        stok: value?.stok || 0,
        satuan: value?.satuan || 'pcs',
        deskripsi: value?.deskripsi || '',
        status: value?.status || 'aktif',
        gambar_url: value?.gambar_url || ''
      }
    }

    // For new form, try to load from localStorage first
    if (!editingProduk) {
      const stored = localStorage.getItem(FORM_STORAGE_KEY)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch {
          // Fall through to default values
        }
      }
    }

    // Default empty form
    return {
      nama: '',
      kode: '',
      kategori: '',
      kategoriId: '',
      brand: '',
      brandId: '',
      hargaBeli: 0,
      hargaJual: 0,
      stok: 0,
      satuan: 'pcs',
      deskripsi: '',
      status: 'aktif',
      gambar_url: ''
    }
  }

  const [form, setForm] = React.useState<ProdukFormData>(getInitialFormData())
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const [removing, setRemoving] = React.useState(false)

  // Persist form data to localStorage when form changes (only for new forms)
  React.useEffect(() => {
    if (!editingProduk && !value) {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(form))
    }
  }, [form, editingProduk, value])

  React.useEffect(() => {
    if (value || editingProduk) {
      setForm({
        nama: value?.nama || '',
        kode: value?.kode || '',
        kategori: value?.kategori || '',
        kategoriId: value?.kategoriId || '',
        brand: value?.brand || '',
        brandId: value?.brandId || '',
        hargaBeli: value?.hargaBeli || 0,
        hargaJual: value?.hargaJual || 0,
        stok: value?.stok || 0,
        satuan: value?.satuan || 'pcs',
        deskripsi: value?.deskripsi || '',
        status: value?.status || 'aktif',
        gambar_url: value?.gambar_url || ''
      })
    }
  }, [value, editingProduk])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleUploadImage = async () => {
    if (!imageFile || !editingProduk || !onUploadImage) return

    setUploading(true)
    try {
      const imageUrl = await onUploadImage(editingProduk.id, imageFile)
      setForm(prev => ({ ...prev, gambar_url: imageUrl }))
      setImageFile(null)
      setImagePreview(null)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!editingProduk || !onRemoveImage) return

    setRemoving(true)
    try {
      await onRemoveImage(editingProduk.id)
      setForm(prev => ({ ...prev, gambar_url: '' }))
    } catch (error) {
      console.error('Remove failed:', error)
    } finally {
      setRemoving(false)
    }
  }

  const clearForm = () => {
    const emptyForm = {
      nama: '',
      kode: '',
      kategori: '',
      kategoriId: '',
      brand: '',
      brandId: '',
      hargaBeli: 0,
      hargaJual: 0,
      stok: 0,
      satuan: 'pcs',
      deskripsi: '',
      status: 'aktif',
      gambar_url: ''
    }
    setForm(emptyForm)
    setImageFile(null)
    setImagePreview(null)
    localStorage.removeItem(FORM_STORAGE_KEY)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onSave) return

    try {
      await onSave(form, imageFile || undefined)
      if (!editingProduk) {
        clearForm()
      }
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  const satuanOptions = [
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'gram', label: 'Gram (g)' },
    { value: 'liter', label: 'Liter (L)' },
    { value: 'ml', label: 'Mililiter (ml)' },
    { value: 'meter', label: 'Meter (m)' },
    { value: 'cm', label: 'Centimeter (cm)' },
    { value: 'box', label: 'Box' },
    { value: 'pack', label: 'Pack' },
    { value: 'lusin', label: 'Lusin' }
  ]

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Package2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">
                {editingProduk ? 'Edit Produk' : 'Tambah Produk Baru'}
              </CardTitle>
              <CardDescription>
                {editingProduk
                  ? 'Perbarui informasi produk di bawah ini.'
                  : 'Lengkapi informasi di bawah ini untuk menambah produk baru.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nama" className="text-sm font-medium">
                  Nama Produk <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Package2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="nama"
                    value={form.nama}
                    onChange={(e) => setForm(prev => ({ ...prev, nama: e.target.value }))}
                    placeholder="Masukkan nama produk"
                    required
                    className="pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kode" className="text-sm font-medium">
                  Kode Produk
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="kode"
                    value={form.kode}
                    onChange={(e) => setForm(prev => ({ ...prev, kode: e.target.value }))}
                    placeholder="SKU atau kode produk"
                    className="pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kategori" className="text-sm font-medium">
                  Kategori
                </Label>
                <Select
                  value={form.kategoriId}
                  onValueChange={(value) => {
                    const category = categories.find(c => c.id === value)
                    setForm(prev => ({
                      ...prev,
                      kategoriId: value,
                      kategori: category?.nama || ''
                    }))
                  }}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand" className="text-sm font-medium">
                  Brand
                </Label>
                <Select
                  value={form.brandId}
                  onValueChange={(value) => {
                    const brand = brands.find(b => b.id === value)
                    setForm(prev => ({
                      ...prev,
                      brandId: value,
                      brand: brand?.nama || ''
                    }))
                  }}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="Pilih brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hargaBeli" className="text-sm font-medium">
                  Harga Beli <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="hargaBeli"
                    type="number"
                    value={form.hargaBeli}
                    onChange={(e) => setForm(prev => ({ ...prev, hargaBeli: Number(e.target.value) }))}
                    placeholder="0"
                    required
                    min="0"
                    className="pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hargaJual" className="text-sm font-medium">
                  Harga Jual <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="hargaJual"
                    type="number"
                    value={form.hargaJual}
                    onChange={(e) => setForm(prev => ({ ...prev, hargaJual: Number(e.target.value) }))}
                    placeholder="0"
                    required
                    min="0"
                    className="pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stok" className="text-sm font-medium">
                  Stok <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="stok"
                    type="number"
                    value={form.stok}
                    onChange={(e) => setForm(prev => ({ ...prev, stok: Number(e.target.value) }))}
                    placeholder="0"
                    required
                    min="0"
                    className="pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="satuan" className="text-sm font-medium">
                  Satuan
                </Label>
                <Select
                  value={form.satuan}
                  onValueChange={(value) => setForm(prev => ({ ...prev, satuan: value }))}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="Pilih satuan" />
                  </SelectTrigger>
                  <SelectContent>
                    {satuanOptions.map((satuan) => (
                      <SelectItem key={satuan.value} value={satuan.value}>
                        {satuan.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deskripsi" className="text-sm font-medium">
                Deskripsi
              </Label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="deskripsi"
                  value={form.deskripsi}
                  onChange={(e) => setForm(prev => ({ ...prev, deskripsi: e.target.value }))}
                  placeholder="Deskripsi produk (opsional)"
                  rows={3}
                  className="pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Gambar Section */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Gambar Produk
              </Label>
              <div className="space-y-3">
                {form.gambar_url && (
                  <div className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
                    <img
                      src={form.gambar_url}
                      alt="Gambar produk"
                      className="w-12 h-12 object-contain rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Gambar saat ini</p>
                      <p className="text-xs text-gray-500">Klik hapus untuk mengganti</p>
                    </div>
                    {editingProduk && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveImage}
                        disabled={removing}
                        className="border-gray-300 hover:bg-gray-50"
                      >
                        {removing ? 'Menghapus...' : 'Hapus'}
                      </Button>
                    )}
                  </div>
                )}

                {imagePreview && (
                  <div className="flex items-center space-x-3 p-3 border rounded-lg bg-blue-50">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-12 h-12 object-contain rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Gambar baru (preview)</p>
                      <p className="text-xs text-gray-500">{imageFile?.name}</p>
                    </div>
                    {editingProduk && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleUploadImage}
                        disabled={uploading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {uploading ? 'Mengupload...' : 'Upload'}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview(null)
                      }}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="produk-image-upload"
                  />
                  <label
                    htmlFor="produk-image-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <div className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                      {imagePreview ? <Image className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {imagePreview ? 'Ganti gambar' : 'Upload gambar produk'}
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG maksimal 2MB</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {!editingProduk && user?.level !== 3 && user?.level !== 4 && (
              <ProdukAccessPlaceholder className="mt-2" />
            )}

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              {!editingProduk && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearForm}
                  className="px-4 py-2 h-10 border-gray-300 hover:bg-gray-50 text-gray-600"
                >
                  Bersihkan Form
                </Button>
              )}
              <div className={`flex gap-3 ${editingProduk ? 'w-full justify-end' : ''}`}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="px-5 py-2 h-10 border-gray-300 hover:bg-gray-50"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !form.nama.trim() || (!editingProduk && user?.level !== 3 && user?.level !== 4)}
                  className="px-5 py-2 h-10 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
                      Menyimpan...
                    </div>
                  ) : editingProduk ? (
                    'Perbarui Produk'
                  ) : (
                    'Simpan Produk'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}