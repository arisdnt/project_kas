import * as React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTitle,
  SidebarDescription,
  SidebarFooter
} from '@/core/components/ui/sidebar'
import { Button } from '@/core/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Image as ImageIcon, Globe, Info, BadgeCheck } from 'lucide-react'
import { useAuthStore } from '@/core/store/authStore'
import { UIBrand } from '@/features/brand/store/brandStore'

type Props = {
  brand: UIBrand | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const BrandDetailSidebar = React.forwardRef<HTMLDivElement, Props>(
  ({ brand, open, onOpenChange }, ref) => {
    if (!brand) return null
    // Helper to convert MinIO URL to presigned HTTP URL
    async function convertMinioUrl(minioUrl: string | null | undefined): Promise<string | null> {
      if (!minioUrl || !minioUrl.startsWith('minio://')) return minioUrl || null
      try {
        // Extract object key after bucket
        const m = minioUrl.match(/^minio:\/\/[^/]+\/(.+)$/)
        const objectKey = m ? m[1] : minioUrl.replace('minio://pos-files/', '')
        const token = useAuthStore.getState().token
        const response = await fetch(`http://localhost:3000/api/dokumen/object-url`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ object_key: objectKey })
        })
        if (response.ok) {
          const result = await response.json()
          return result.data?.url || null
        }
        return null
      } catch (e) {
        console.error('convertMinioUrl error:', e)
        return null
      }
    }

    function BrandDetailImage({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) {
      const [imageError, setImageError] = React.useState(false)
      const [imageLoaded, setImageLoaded] = React.useState(false)
      const [actualSrc, setActualSrc] = React.useState<string | null>(null)
      const [converting, setConverting] = React.useState(false)

      React.useEffect(() => {
        async function handleUrl() {
          if (!src) { setActualSrc(null); return }
          if (src.startsWith('minio://')) {
            setConverting(true)
            try {
              const converted = await convertMinioUrl(src)
              setActualSrc(converted)
            } catch {
              setActualSrc(null)
            } finally {
              setConverting(false)
            }
          } else {
            setActualSrc(src)
          }
        }
        setImageError(false)
        setImageLoaded(false)
        handleUrl()
      }, [src])

      if (!actualSrc || imageError) {
        return (
          <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
            <ImageIcon className="w-12 h-12 text-gray-400" />
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

    return (
      <Sidebar open={open} onOpenChange={onOpenChange}>
        <SidebarContent size="fifty" className="w-full" ref={ref}>
          <SidebarHeader>
            <SidebarTitle>Detail Brand</SidebarTitle>
            <SidebarDescription>Informasi brand produk</SidebarDescription>
          </SidebarHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-6 h-full">
              {/* Left Column - Brand Image */}
              <div className="flex flex-col">
                <div className="aspect-square w-full overflow-hidden rounded-lg border relative">
                  <BrandDetailImage src={brand.logo_url} alt={brand.nama} className="h-full w-full rounded-lg" />
                </div>
                {/* Optional debug */}
                {/* <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600 font-mono break-all">{brand.logo_url || 'No logo URL'}</div> */}
              </div>

              {/* Right Column - Brand Details */}
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Info className="h-4 w-4" />
                      Informasi Dasar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nama Brand</label>
                      <p className="text-sm font-semibold">{brand.nama}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">ID</label>
                      <p className="text-xs font-mono break-all">{brand.id}</p>
                    </div>
                    {brand.status && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <p className="text-sm capitalize flex items-center gap-1"><BadgeCheck className="h-3 w-3" />{brand.status}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {brand.website && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Globe className="h-4 w-4" />
                        Website
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                        {brand.website}
                      </a>
                    </CardContent>
                  </Card>
                )}

                {brand.deskripsi && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Deskripsi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{brand.deskripsi}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          <SidebarFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Tutup</Button>
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>
    )
  }
)

BrandDetailSidebar.displayName = 'BrandDetailSidebar'

