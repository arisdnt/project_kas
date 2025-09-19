import * as React from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Textarea } from '@/core/components/ui/textarea'
import { Upload, X, Image, Package, Globe, FileText } from 'lucide-react'
import { useAuthStore } from '@/core/store/authStore'
import { UIBrand } from '../types/brand'
import { BrandAccessPlaceholder } from './BrandAccessPlaceholder'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Label } from '@/core/components/ui/label'

type BrandFormData = {
  nama: string
  deskripsi?: string
  logo_url?: string
  website?: string
}

type Props = {
  value?: {
    nama: string
    deskripsi?: string
    logo_url?: string
    website?: string
  } | null
  editingBrand?: UIBrand | null
  onSave?: (data: BrandFormData, imageFile?: File) => Promise<void>
  onUploadImage?: (brandId: string, file: File) => Promise<string>
  onRemoveImage?: (brandId: string) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function BrandForm({
  value,
  editingBrand,
  onSave,
  onUploadImage,
  onRemoveImage,
  onCancel,
  isLoading = false
}: Props) {
  const { user } = useAuthStore()
  const [form, setForm] = React.useState<BrandFormData>({
    nama: value?.nama || '',
    deskripsi: value?.deskripsi || '',
    logo_url: value?.logo_url || '',
    website: value?.website || ''
  })
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const [removing, setRemoving] = React.useState(false)

  React.useEffect(() => {
    setForm({
      nama: value?.nama || '',
      deskripsi: value?.deskripsi || '',
      logo_url: value?.logo_url || '',
      website: value?.website || ''
    })
  }, [value])

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
    if (!imageFile || !editingBrand || !onUploadImage) return

    setUploading(true)
    try {
      const logoUrl = await onUploadImage(editingBrand.id, imageFile)
      setForm(prev => ({ ...prev, logo_url: logoUrl }))
      setImageFile(null)
      setImagePreview(null)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!editingBrand || !onRemoveImage) return

    setRemoving(true)
    try {
      await onRemoveImage(editingBrand.id)
      setForm(prev => ({ ...prev, logo_url: '' }))
    } catch (error) {
      console.error('Remove failed:', error)
    } finally {
      setRemoving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onSave) return

    try {
      await onSave(form, imageFile || undefined)
      if (!editingBrand) {
        setForm({ nama: '', deskripsi: '', logo_url: '', website: '' })
        setImageFile(null)
        setImagePreview(null)
      }
    } catch (error) {
      console.error('Save failed:', error)
    }
  }


  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">
                {editingBrand ? 'Edit Brand' : 'Tambah Brand Baru'}
              </CardTitle>
              <CardDescription>
                {editingBrand
                  ? 'Perbarui informasi brand di bawah ini.'
                  : 'Lengkapi informasi di bawah ini untuk menambah brand baru.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nama" className="text-sm font-medium">
                  Nama Brand <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="nama"
                    value={form.nama}
                    onChange={(e) => setForm(prev => ({ ...prev, nama: e.target.value }))}
                    placeholder="Masukkan nama brand"
                    required
                    className="pl-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deskripsi" className="text-sm font-medium">
                  Deskripsi
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="deskripsi"
                    value={form.deskripsi || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, deskripsi: e.target.value }))}
                    placeholder="Deskripsi brand (opsional)"
                    rows={3}
                    className="pl-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-medium">
                  Website
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="website"
                    value={form.website || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://website-brand.com"
                    type="url"
                    className="pl-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Logo Section */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Logo Brand
                </Label>
                <div className="space-y-3">
                  {form.logo_url && (
                    <div className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
                      <img
                        src={form.logo_url}
                        alt="Logo brand"
                        className="w-12 h-12 object-contain rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Logo saat ini</p>
                        <p className="text-xs text-gray-500">Klik hapus untuk mengganti</p>
                      </div>
                      {editingBrand && (
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
                      {editingBrand && (
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
                      id="brand-logo-upload"
                    />
                    <label
                      htmlFor="brand-logo-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <div className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                        {imagePreview ? <Image className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {imagePreview ? 'Ganti gambar' : 'Upload logo brand'}
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG maksimal 2MB</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {!editingBrand && user?.level !== 3 && user?.level !== 4 && (
                <BrandAccessPlaceholder className="mt-2" />
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
                disabled={isLoading || !form.nama.trim() || (!editingBrand && user?.level !== 3 && user?.level !== 4)}
                className="px-5 py-2 h-10 bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
                    Menyimpan...
                  </div>
                ) : editingBrand ? (
                  'Perbarui Brand'
                ) : (
                  'Simpan Brand'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}