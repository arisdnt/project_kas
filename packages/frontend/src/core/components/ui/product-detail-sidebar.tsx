import * as React from "react"
import { Badge } from "./badge"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTitle,
  SidebarDescription,
  SidebarFooter,
} from "./sidebar"
import { Package, Tag, Calendar, User, BarChart3, Image } from "lucide-react"
import { cn } from "../../lib/utils"
import { useAuthStore } from '@/core/store/authStore'

export interface Product {
  id: string
  nama: string
  kode: string
  kategori: string
  brand: string
  hargaBeli: number
  hargaJual: number
  stok: number
  satuan: string
  deskripsi?: string
  gambar?: string
  status: 'aktif' | 'nonaktif'
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface ProductDetailSidebarProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (product: Product) => void
  className?: string
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
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

// Helper function to convert MinIO URL to accessible URL (same as ProdukTable)
async function convertMinioUrl(minioUrl: string | null | undefined): Promise<string | null> {
  console.log('convertMinioUrl called with:', minioUrl);

  if (!minioUrl || !minioUrl.startsWith('minio://')) {
    console.log('convertMinioUrl: Not a MinIO URL, returning as-is');
    return minioUrl || null;
  }

  try {
    const objectKey = minioUrl.replace('minio://pos-files/', '');
    console.log('convertMinioUrl: Extracted object key:', objectKey);

    const token = useAuthStore.getState().token;
    console.log('convertMinioUrl: Using token:', token ? 'Present' : 'Missing');

    const apiUrl = `http://localhost:3000/api/dokumen/object-url`;
    console.log('convertMinioUrl: Making request to:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ object_key: objectKey })
    });

    console.log('convertMinioUrl: Response status:', response.status);

    if (response.ok) {
      const result = await response.json();
      console.log('convertMinioUrl: Response data:', result);
      return result.data?.url || null;
    } else {
      const errorText = await response.text();
      console.error('convertMinioUrl: API error:', response.status, errorText);
      return null;
    }
  } catch (error) {
    console.error('convertMinioUrl: Exception:', error);
    return null;
  }
}

// Component untuk menampilkan gambar produk dengan fallback
function ProductDetailImage({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) {
  const [imageError, setImageError] = React.useState(false)
  const [imageLoaded, setImageLoaded] = React.useState(false)
  const [actualSrc, setActualSrc] = React.useState<string | null>(null)
  const [converting, setConverting] = React.useState(false)

  // Convert MinIO URL to accessible URL
  React.useEffect(() => {
    async function handleUrl() {
      if (!src) {
        console.log('ProductDetailImage: No src provided');
        setActualSrc(null);
        return;
      }

      console.log('ProductDetailImage: Original URL:', src);

      if (src.startsWith('minio://')) {
        console.log('ProductDetailImage: Converting MinIO URL...');
        setConverting(true);
        try {
          const convertedUrl = await convertMinioUrl(src);
          console.log('ProductDetailImage: Converted URL:', convertedUrl);
          setActualSrc(convertedUrl);
        } catch (error) {
          console.error('ProductDetailImage: Error converting URL:', error);
          setActualSrc(null);
        } finally {
          setConverting(false);
        }
      } else {
        console.log('ProductDetailImage: Using URL as-is');
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

export const ProductDetailSidebar = React.forwardRef<
  HTMLDivElement,
  ProductDetailSidebarProps
>(({ product, open, onOpenChange, onEdit, className }, ref) => {
  if (!product) return null

  const profit = product.hargaJual - product.hargaBeli
  const profitPercentage = ((profit / product.hargaBeli) * 100).toFixed(1)

  return (
    <Sidebar open={open} onOpenChange={onOpenChange}>
      <SidebarContent size="fifty" className={cn("w-full", className)} ref={ref}>
        <SidebarHeader>
          <SidebarTitle>Detail Produk</SidebarTitle>
          <SidebarDescription>
            Informasi lengkap produk {product.nama}
          </SidebarDescription>
        </SidebarHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-6 h-full">
            {/* Left Column - Product Image */}
            <div className="flex flex-col">
              <div className="aspect-square w-full overflow-hidden rounded-lg border relative">
                <ProductDetailImage
                  src={product.gambar}
                  alt={product.nama}
                  className="h-full w-full rounded-lg"
                />
              </div>

              {/* Debug Info - Temporary */}
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
                <div className="font-mono break-all">
                  <div><strong>Original URL:</strong> {product.gambar || 'No URL'}</div>
                  <div><strong>Auth Token:</strong> {useAuthStore.getState().token ? 'Present' : 'Missing'}</div>
                  <div><strong>API Endpoint:</strong> http://localhost:3000/api/dokumen/object-url</div>
                </div>
              </div>
            </div>

            {/* Right Column - Product Details */}
            <div className="space-y-6">`

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
                <label className="text-sm font-medium text-muted-foreground">Nama Produk</label>
                <p className="text-sm font-semibold">{product.nama}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Kode Produk</label>
                <p className="text-sm font-mono">{product.kode}</p>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground">Kategori</label>
                  <p className="text-sm">{product.kategori}</p>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground">Brand</label>
                  <p className="text-sm">{product.brand}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge variant={product.status === 'aktif' ? 'default' : 'secondary'}>
                    {product.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="h-4 w-4" />
                Informasi Harga
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Harga Beli</label>
                  <p className="text-sm font-semibold">{formatCurrency(product.hargaBeli)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Harga Jual</label>
                  <p className="text-sm font-semibold">{formatCurrency(product.hargaJual)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Keuntungan</label>
                <p className="text-sm font-semibold text-green-600">
                  {formatCurrency(profit)} ({profitPercentage}%)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stock Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4" />
                Informasi Stok
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Stok Tersedia</label>
                  <p className="text-sm font-semibold">{product.stok}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Satuan</label>
                  <p className="text-sm">{product.satuan}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {product.deskripsi && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Deskripsi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{product.deskripsi}</p>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
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
                <p className="text-sm">{formatDate(product.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Diperbarui Pada</label>
                <p className="text-sm">{formatDate(product.updatedAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Dibuat Oleh</label>
                <p className="text-sm flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {product.createdBy}
                </p>
              </div>
            </CardContent>
          </Card>
            </div>
          </div>
        </div>

        <SidebarFooter>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Tutup
            </Button>
            {onEdit && (
              <Button
                onClick={() => onEdit(product)}
                className="flex-1"
              >
                Edit Produk
              </Button>
            )}
          </div>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  )
})

ProductDetailSidebar.displayName = "ProductDetailSidebar"