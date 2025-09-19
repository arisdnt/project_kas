import * as React from 'react'
import { Sidebar, SidebarContent, SidebarHeader, SidebarTitle, SidebarDescription, SidebarFooter } from '@/core/components/ui/sidebar'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Textarea } from '@/core/components/ui/textarea'
import { CreateKategoriRequest, UIKategori } from '@/features/kategori/types/kategori'
import { ScopeSelector } from '@/core/components/ui/scope-selector'
import { Separator } from '@/core/components/ui/separator'
import { Upload, X, Image } from 'lucide-react'
import { useAuthStore } from '@/core/store/authStore'

type Props = {
  value: CreateKategoriRequest | null
  editingCategory?: UIKategori | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: CreateKategoriRequest, imageFile?: File) => Promise<void>
  onUploadImage?: (categoryId: string, file: File) => Promise<string>
  onRemoveImage?: (categoryId: string) => Promise<void>
  isLoading?: boolean
}

// Helper function to convert MinIO URL to accessible URL
async function convertMinioUrl(minioUrl: string | null | undefined): Promise<string | null> {
  if (!minioUrl || !minioUrl.startsWith('minio://')) {
    return minioUrl || null;
  }

  try {
    const objectKey = minioUrl.replace('minio://pos-files/', '');
    const token = useAuthStore.getState().token;
    const response = await fetch(`http://localhost:3000/api/dokumen/object-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ object_key: objectKey })
    });

    if (response.ok) {
      const result = await response.json();
      return result.data?.url || null;
    }

    return null;
  } catch (error) {
    console.error('Failed to convert MinIO URL:', error);
    return null;
  }
}

// Component untuk menampilkan gambar kategori dengan fallback
function CategoryImage({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) {
  const [imageError, setImageError] = React.useState(false)
  const [imageLoaded, setImageLoaded] = React.useState(false)
  const [actualSrc, setActualSrc] = React.useState<string | null>(null)
  const [converting, setConverting] = React.useState(false)

  React.useEffect(() => {
    async function handleUrl() {
      if (!src) {
        setActualSrc(null);
        return;
      }

      if (src.startsWith('minio://')) {
        setConverting(true);
        try {
          const convertedUrl = await convertMinioUrl(src);
          setActualSrc(convertedUrl);
        } catch (error) {
          console.error('Error converting URL:', error);
          setActualSrc(null);
        } finally {
          setConverting(false);
        }
      } else {
        setActualSrc(src);
      }
    }

    setImageError(false);
    setImageLoaded(false);
    handleUrl();
  }, [src]);

  if (!actualSrc || imageError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <Image className="w-8 h-8 text-gray-400" />
      </div>
    )
  }

  return (
    <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
      {(converting || !imageLoaded) && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}
      {!converting && (
        <img
          src={actualSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}
    </div>
  )
}

export const KategoriEditSidebar = React.forwardRef<HTMLDivElement, Props>(
  ({ value, editingCategory, open, onOpenChange, onSave, onUploadImage, onRemoveImage, isLoading = false }, ref) => {
    const [nama, setNama] = React.useState('')
    const [deskripsi, setDeskripsi] = React.useState('')
    const [iconUrl, setIconUrl] = React.useState('')
    const [urutan, setUrutan] = React.useState(0)
    const [error, setError] = React.useState<string | undefined>()
    const [scopeData, setScopeData] = React.useState<{ targetTenantId?: string; targetStoreId?: string; applyToAllTenants?: boolean; applyToAllStores?: boolean }>({})
    const [uploading, setUploading] = React.useState(false)
    const [selectedImageFile, setSelectedImageFile] = React.useState<File | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
      setNama(value?.nama ?? editingCategory?.nama ?? '')
      setDeskripsi(value?.deskripsi ?? editingCategory?.deskripsi ?? '')
      setIconUrl(value?.icon_url ?? editingCategory?.icon_url ?? '')
      setUrutan(value?.urutan ?? editingCategory?.urutan ?? 0)
      setSelectedImageFile(null)
      setError(undefined)
    }, [value, editingCategory, open])

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      // For create mode, just set as local preview
      if (!editingCategory) {
        setSelectedImageFile(file)
        const reader = new FileReader()
        reader.onload = (e) => {
          setIconUrl(e.target?.result as string)
        }
        reader.readAsDataURL(file)
        return
      }

      // For edit mode, upload to server
      if (editingCategory && onUploadImage) {
        handleImageUpload(file)
      }
    }

    const handleImageUpload = async (file: File) => {
      if (!editingCategory || !onUploadImage) return

      setUploading(true)
      try {
        const newIconUrl = await onUploadImage(editingCategory.id, file)
        setIconUrl(newIconUrl)
      } catch (error) {
        console.error('Error uploading image:', error)
        setError('Gagal upload gambar')
      } finally {
        setUploading(false)
      }
    }

    const handleRemoveImage = async () => {
      if (!editingCategory || !onRemoveImage) return

      setUploading(true)
      try {
        await onRemoveImage(editingCategory.id)
        setIconUrl('')
      } catch (error) {
        console.error('Error removing image:', error)
        setError('Gagal hapus gambar')
      } finally {
        setUploading(false)
      }
    }

    const handleSubmit = async () => {
      const v = nama.trim()
      if (!v) {
        setError('Nama kategori wajib diisi')
        return
      }
      setError(undefined)

      const data: CreateKategoriRequest = {
        nama: v,
        ...(deskripsi.trim() && { deskripsi: deskripsi.trim() }),
        ...(iconUrl.trim() && { icon_url: iconUrl.trim() }),
        urutan
      }

      // Gabungkan scope hanya saat create (value == null menandakan create mode di halaman pemanggil)
      let payload: any = data
      if (!value) {
        payload = {
          ...data,
          ...(scopeData.targetTenantId ? { targetTenantId: scopeData.targetTenantId } : {}),
          ...(scopeData.targetStoreId ? { targetStoreId: scopeData.targetStoreId } : {}),
          ...(scopeData.applyToAllTenants ? { applyToAllTenants: true } : {}),
          ...(scopeData.applyToAllStores ? { applyToAllStores: true } : {}),
        }
      }

      await onSave(payload, selectedImageFile || undefined)
      onOpenChange(false)
    }

    const handleCancel = () => {
      onOpenChange(false)
    }

    return (
      <Sidebar open={open} onOpenChange={onOpenChange}>
        <SidebarContent size="fifty" className="w-full" ref={ref}>
          <SidebarHeader>
            <SidebarTitle>{value ? 'Edit Kategori' : 'Tambah Kategori'}</SidebarTitle>
            <SidebarDescription>Masukkan detail kategori</SidebarDescription>
          </SidebarHeader>
          <div className="flex-1 overflow-y-auto">
            {!value ? (
              // Create mode: 2-column layout
              <div className="grid grid-cols-5 gap-6 h-full">
                {/* Left column: Image Upload */}
                <div className="col-span-2 space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Gambar Kategori</h3>

                    {/* Image Preview */}
                    <div className="aspect-square w-full overflow-hidden rounded-lg border relative">
                      <CategoryImage
                        src={iconUrl}
                        alt="Preview kategori"
                        className="h-full w-full rounded-lg"
                      />
                    </div>

                    {/* Image Upload Controls for Create Mode */}
                    <div className="space-y-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Upload Gambar</label>
                        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            style={{ display: 'none' }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading || isLoading}
                            className="w-full"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {uploading ? 'Uploading...' : 'Pilih Gambar'}
                          </Button>
                          <p className="text-xs text-gray-500 mt-2">
                            JPG, PNG, WebP. Max: 5MB
                          </p>
                        </div>
                      </div>

                      {iconUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIconUrl('')
                            setSelectedImageFile(null)
                          }}
                          disabled={uploading || isLoading}
                          className="w-full"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Hapus Gambar
                        </Button>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Scope Selection</h3>
                      <ScopeSelector
                        onScopeChange={setScopeData}
                        disabled={isLoading}
                        compact={true}
                      />
                    </div>
                  </div>
                </div>

                {/* Right column: Category Details */}
                <div className="col-span-3 space-y-4">
                  <h3 className="text-sm font-medium">Detail Kategori</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="nama" className="text-sm font-medium">Nama Kategori *</label>
                      <Input
                        id="nama"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        className={error ? 'border-red-500' : ''}
                        placeholder="Masukkan nama kategori"
                      />
                      {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="deskripsi" className="text-sm font-medium">Deskripsi</label>
                      <Textarea
                        id="deskripsi"
                        value={deskripsi}
                        onChange={(e) => setDeskripsi(e.target.value)}
                        placeholder="Deskripsi kategori (opsional)"
                        rows={3}
                      />
                    </div>


                    <div className="space-y-2">
                      <label htmlFor="urutan" className="text-sm font-medium">Urutan</label>
                      <Input
                        id="urutan"
                        value={urutan}
                        onChange={(e) => setUrutan(Number(e.target.value) || 0)}
                        placeholder="0"
                        type="number"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Edit mode: 2-column layout (image left, details right)
              <div className="grid grid-cols-2 gap-6 h-full">
                {/* Left Column - Image */}
                <div className="flex flex-col">
                  <div className="aspect-square w-full overflow-hidden rounded-lg border relative">
                    <CategoryImage
                      src={iconUrl}
                      alt={nama || 'Kategori'}
                      className="h-full w-full rounded-lg"
                    />
                  </div>

                  {/* Image Upload Controls */}
                  <div className="mt-4 space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading || isLoading || !onUploadImage}
                        className="flex-1"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? 'Uploading...' : 'Upload'}
                      </Button>

                      {iconUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveImage}
                          disabled={uploading || isLoading || !onRemoveImage}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <p className="text-xs text-gray-500">
                      Format: JPG, PNG, WebP. Max: 5MB
                    </p>
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="nama" className="text-sm font-medium">Nama Kategori *</label>
                    <Input
                      id="nama"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      className={error ? 'border-red-500' : ''}
                      placeholder="Masukkan nama kategori"
                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="deskripsi" className="text-sm font-medium">Deskripsi</label>
                    <Textarea
                      id="deskripsi"
                      value={deskripsi}
                      onChange={(e) => setDeskripsi(e.target.value)}
                      placeholder="Deskripsi kategori (opsional)"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="urutan" className="text-sm font-medium">Urutan</label>
                    <Input
                      id="urutan"
                      value={urutan}
                      onChange={(e) => setUrutan(Number(e.target.value) || 0)}
                      placeholder="0"
                      type="number"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <SidebarFooter className="mt-6">
            {!value ? (
              // Create mode: buttons matching column layout
              <div className="grid grid-cols-5 gap-6">
                <div className="col-span-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Batal
                  </Button>
                </div>
                <div className="col-span-3">
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              </div>
            ) : (
              // Edit mode: buttons matching column layout
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Batal
                  </Button>
                </div>
                <div>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              </div>
            )}
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>
    )
  }
)

KategoriEditSidebar.displayName = 'KategoriEditSidebar'

