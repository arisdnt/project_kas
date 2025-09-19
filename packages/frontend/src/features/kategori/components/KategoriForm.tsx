import * as React from 'react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Textarea } from '@/core/components/ui/textarea'
import { Upload, X, Image, Tag, FileText, Hash } from 'lucide-react'
import { useAuthStore } from '@/core/store/authStore'
import { UIKategori, CreateKategoriRequest } from '../types/kategori'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Label } from '@/core/components/ui/label'
import { KategoriAccessPlaceholder } from './KategoriAccessPlaceholder'

type Props = {
  value?: CreateKategoriRequest | null
  editingCategory?: UIKategori | null
  onSave?: (data: CreateKategoriRequest, imageFile?: File) => Promise<void>
  onUploadImage?: (categoryId: string, file: File) => Promise<string>
  onRemoveImage?: (categoryId: string) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function KategoriForm({
  value,
  editingCategory,
  onSave,
  onUploadImage,
  onRemoveImage,
  onCancel,
  isLoading = false
}: Props) {
  const { user } = useAuthStore()
  const [form, setForm] = React.useState<CreateKategoriRequest>({
    nama: value?.nama || '',
    deskripsi: value?.deskripsi || '',
    icon_url: value?.icon_url || '',
    urutan: value?.urutan || 0
  })
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const [removing, setRemoving] = React.useState(false)

  React.useEffect(() => {
    setForm({
      nama: value?.nama || '',
      deskripsi: value?.deskripsi || '',
      icon_url: value?.icon_url || '',
      urutan: value?.urutan || 0
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
    if (!imageFile || !editingCategory || !onUploadImage) return

    setUploading(true)
    try {
      const iconUrl = await onUploadImage(editingCategory.id, imageFile)
      setForm(prev => ({ ...prev, icon_url: iconUrl }))
      setImageFile(null)
      setImagePreview(null)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!editingCategory || !onRemoveImage) return

    setRemoving(true)
    try {
      await onRemoveImage(editingCategory.id)
      setForm(prev => ({ ...prev, icon_url: '' }))
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
      if (!editingCategory) {
        setForm({ nama: '', deskripsi: '', icon_url: '', urutan: 0 })
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
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </CardTitle>
              <CardDescription>
                {editingCategory
                  ? 'Perbarui informasi kategori di bawah ini.'
                  : 'Lengkapi informasi di bawah ini untuk menambah kategori baru.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nama" className="text-sm font-medium">
                  Nama Kategori <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="nama"
                    value={form.nama}
                    onChange={(e) => setForm(prev => ({ ...prev, nama: e.target.value }))}
                    placeholder="Masukkan nama kategori"
                    required
                    className="pl-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                    placeholder="Deskripsi kategori (opsional)"
                    rows={3}
                    className="pl-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urutan" className="text-sm font-medium">
                  Urutan
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="urutan"
                    type="number"
                    value={form.urutan}
                    onChange={(e) => setForm(prev => ({ ...prev, urutan: parseInt(e.target.value) || 0 }))}
                    placeholder="Urutan tampilan kategori"
                    className="pl-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Icon Section */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Icon Kategori
                </Label>
                <div className="space-y-3">
                  {form.icon_url && (
                    <div className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
                      <img
                        src={form.icon_url}
                        alt="Icon kategori"
                        className="w-12 h-12 object-contain rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Icon saat ini</p>
                        <p className="text-xs text-gray-500">Klik hapus untuk mengganti</p>
                      </div>
                      {editingCategory && (
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
                    <div className="flex items-center space-x-3 p-3 border rounded-lg bg-orange-50">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-12 h-12 object-contain rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Gambar baru (preview)</p>
                        <p className="text-xs text-gray-500">{imageFile?.name}</p>
                      </div>
                      {editingCategory && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleUploadImage}
                          disabled={uploading}
                          className="bg-orange-600 hover:bg-orange-700"
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
                      id="kategori-icon-upload"
                    />
                    <label
                      htmlFor="kategori-icon-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <div className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                        {imagePreview ? <Image className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {imagePreview ? 'Ganti gambar' : 'Upload icon kategori'}
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG maksimal 2MB</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {!editingCategory && !user?.isGodUser && (
                <KategoriAccessPlaceholder className="mt-2" />
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
                disabled={isLoading || !form.nama.trim()}
                className="px-5 py-2 h-10 bg-orange-600 hover:bg-orange-700"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
                    Menyimpan...
                  </div>
                ) : editingCategory ? (
                  'Perbarui Kategori'
                ) : (
                  'Simpan Kategori'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
