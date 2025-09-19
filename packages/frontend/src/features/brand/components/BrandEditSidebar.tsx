import * as React from 'react'
import { Sidebar, SidebarContent, SidebarHeader, SidebarTitle, SidebarDescription, SidebarFooter } from '@/core/components/ui/sidebar'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Textarea } from '@/core/components/ui/textarea'
import { ScopeSelector } from '@/core/components/ui/scope-selector'
import { Separator } from '@/core/components/ui/separator'
import { Upload, X, Image } from 'lucide-react'
import { useAuthStore } from '@/core/store/authStore'
import { UIBrand } from '../types/brand'

type BrandFormData = {
  nama: string
  deskripsi?: string
  logo_url?: string
  website?: string
  // Scope data
  targetTenantId?: string
  targetStoreId?: string
  applyToAllTenants?: boolean
  applyToAllStores?: boolean
}

type Props = {
  value: { nama: string; deskripsi?: string; logo_url?: string; website?: string } | null
  editingBrand?: UIBrand | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: BrandFormData, imageFile?: File) => Promise<void>
  onUploadImage?: (brandId: string, file: File) => Promise<string>
  onRemoveImage?: (brandId: string) => Promise<void>
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

// Component untuk menampilkan gambar brand dengan fallback
function BrandImage({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) {
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

export const BrandEditSidebar = React.forwardRef<HTMLDivElement, Props>(
  ({ value, editingBrand, open, onOpenChange, onSave, onUploadImage, onRemoveImage, isLoading = false }, ref) => {
    const [nama, setNama] = React.useState('')
    const [deskripsi, setDeskripsi] = React.useState('')
    const [logoUrl, setLogoUrl] = React.useState('')
    const [website, setWebsite] = React.useState('')
    const [error, setError] = React.useState<string | undefined>()
    const [scopeData, setScopeData] = React.useState<{
      targetTenantId?: string
      targetStoreId?: string
      applyToAllTenants?: boolean
      applyToAllStores?: boolean
    }>({})
    const [uploading, setUploading] = React.useState(false)
    const [selectedImageFile, setSelectedImageFile] = React.useState<File | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
      setNama(value?.nama ?? editingBrand?.nama ?? '')
      setDeskripsi(value?.deskripsi ?? editingBrand?.deskripsi ?? '')
      setLogoUrl(value?.logo_url ?? editingBrand?.logo_url ?? '')
      setWebsite(value?.website ?? editingBrand?.website ?? '')
      setSelectedImageFile(null)
      setError(undefined)
      setScopeData({}) // Reset scope data when opening
    }, [value, editingBrand, open])

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      // For create mode, just set as local preview
      if (!editingBrand) {
        setSelectedImageFile(file)
        const reader = new FileReader()
        reader.onload = (e) => {
          setLogoUrl(e.target?.result as string)
        }
        reader.readAsDataURL(file)
        return
      }

      // For edit mode, upload to server
      if (editingBrand && onUploadImage) {
        handleImageUpload(file)
      }
    }

    const handleImageUpload = async (file: File) => {
      if (!editingBrand || !onUploadImage) return

      setUploading(true)
      try {
        const newLogoUrl = await onUploadImage(editingBrand.id, file)
        setLogoUrl(newLogoUrl)
      } catch (error) {
        console.error('Error uploading image:', error)
        setError('Gagal upload gambar')
      } finally {
        setUploading(false)
      }
    }

    const handleRemoveImage = async () => {
      if (!editingBrand || !onRemoveImage) return

      setUploading(true)
      try {
        await onRemoveImage(editingBrand.id)
        setLogoUrl('')
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
        setError('Nama brand wajib diisi')
        return
      }
      setError(undefined)
      await onSave({
        nama: v,
        deskripsi: deskripsi.trim() || undefined,
        logo_url: logoUrl.trim() || undefined,
        website: website.trim() || undefined,
        ...scopeData
      })
      onOpenChange(false)
    }

    const handleCancel = () => {
      onOpenChange(false)
    }

    return (
      <Sidebar open={open} onOpenChange={onOpenChange}>
        <SidebarContent size="fifty" className="w-full" ref={ref}>
          <SidebarHeader>
            <SidebarTitle>{value ? 'Edit Brand' : 'Tambah Brand'}</SidebarTitle>
            <SidebarDescription>Masukkan detail brand</SidebarDescription>
          </SidebarHeader>
          <div className="flex-1 overflow-y-auto">
            {!value ? (
              // Create mode: 2-column layout
              <div className="grid grid-cols-5 gap-6 h-full">
                {/* Left column: Scope Selection */}
                <div className="col-span-2 space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Scope Selection</h3>
                    <ScopeSelector
                      onScopeChange={setScopeData}
                      disabled={isLoading}
                      compact={true}
                    />
                  </div>
                </div>

                {/* Right column: Brand Details */}
                <div className="col-span-3 space-y-4">
                  <h3 className="text-sm font-medium">Detail Brand</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="nama" className="text-sm font-medium">Nama Brand *</label>
                      <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} className={error ? 'border-red-500' : ''} />
                      {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="deskripsi" className="text-sm font-medium">Deskripsi</label>
                      <Textarea id="deskripsi" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={3} />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="logo_url" className="text-sm font-medium">URL Logo</label>
                      <Input id="logo_url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="website" className="text-sm font-medium">Website</label>
                      <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Edit mode: single column
              <div className="space-y-4 px-1">
                <div className="space-y-2">
                  <label htmlFor="nama" className="text-sm font-medium">Nama Brand *</label>
                  <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} className={error ? 'border-red-500' : ''} />
                  {error && <p className="text-sm text-red-500">{error}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="deskripsi" className="text-sm font-medium">Deskripsi</label>
                  <Textarea id="deskripsi" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={3} />
                </div>

                <div className="space-y-2">
                  <label htmlFor="logo_url" className="text-sm font-medium">URL Logo</label>
                  <Input id="logo_url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
                </div>

                <div className="space-y-2">
                  <label htmlFor="website" className="text-sm font-medium">Website</label>
                  <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
                </div>
              </div>
            )}
          </div>
          <SidebarFooter className="mt-6">
            {!value ? (
              // Create mode: buttons matching column layout
              <div className="grid grid-cols-5 gap-6">
                <div className="col-span-2">
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading} className="w-full">
                    Batal
                  </Button>
                </div>
                <div className="col-span-3">
                  <Button type="button" onClick={handleSubmit} disabled={isLoading} className="w-full">
                    {isLoading ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              </div>
            ) : (
              // Edit mode: centered buttons
              <div className="flex gap-2 w-full max-w-md mx-auto">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading} className="flex-1">
                  Batal
                </Button>
                <Button type="button" onClick={handleSubmit} disabled={isLoading} className="flex-1">
                  {isLoading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            )}
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>
    )
  }
)

BrandEditSidebar.displayName = 'BrandEditSidebar'

