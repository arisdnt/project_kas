import * as React from 'react'
import { Sidebar, SidebarContent, SidebarHeader, SidebarTitle, SidebarDescription, SidebarFooter } from '@/core/components/ui/sidebar'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { UIKategori } from '@/features/kategori/types/kategori'
import { Package, Tag, Calendar, Image } from 'lucide-react'
import { useAuthStore } from '@/core/store/authStore'

type Props = {
  kategori: UIKategori | null
  open: boolean
  onOpenChange: (open: boolean) => void
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
function CategoryDetailImage({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) {
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
        <Image className="w-12 h-12 text-gray-400" />
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

const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export const KategoriDetailSidebar = React.forwardRef<HTMLDivElement, Props>(
  ({ kategori, open, onOpenChange }, ref) => {
    if (!kategori) return null

    return (
      <Sidebar open={open} onOpenChange={onOpenChange}>
        <SidebarContent size="fifty" className="w-full" ref={ref}>
          <SidebarHeader>
            <SidebarTitle>Detail Kategori</SidebarTitle>
            <SidebarDescription>
              Informasi lengkap kategori {kategori.nama}
            </SidebarDescription>
          </SidebarHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-6 h-full">
              {/* Left Column - Category Image */}
              <div className="flex flex-col">
                <div className="aspect-square w-full overflow-hidden rounded-lg border relative">
                  <CategoryDetailImage
                    src={kategori.icon_url}
                    alt={kategori.nama}
                    className="h-full w-full rounded-lg"
                  />
                </div>
              </div>

              {/* Right Column - Category Details */}
              <div className="space-y-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Package className="h-4 w-4" />
                      Informasi Dasar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nama Kategori</label>
                      <p className="text-sm font-semibold">{kategori.nama}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">ID</label>
                      <p className="text-sm font-mono">{kategori.id}</p>
                    </div>
                    {kategori.deskripsi && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Deskripsi</label>
                        <p className="text-sm">{kategori.deskripsi}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="mt-1">
                        <Badge variant={kategori.status === 'aktif' ? 'default' : 'secondary'}>
                          {kategori.status === 'aktif' ? 'Aktif' : 'Non-aktif'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Tag className="h-4 w-4" />
                      Informasi Tambahan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Urutan</label>
                      <p className="text-sm">{kategori.urutan}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Jumlah Produk</label>
                      <p className="text-sm font-semibold">{kategori.jumlah_produk}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* System Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calendar className="h-4 w-4" />
                      Informasi Sistem
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Dibuat Pada</label>
                      <p className="text-sm">{formatDate(kategori.dibuat_pada)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Diperbarui Pada</label>
                      <p className="text-sm">{formatDate(kategori.diperbarui_pada)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <SidebarFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Tutup
            </Button>
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>
    )
  }
)

KategoriDetailSidebar.displayName = 'KategoriDetailSidebar'

