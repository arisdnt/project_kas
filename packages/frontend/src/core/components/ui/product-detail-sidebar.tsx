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
import { Package, Tag, Calendar, User, BarChart3 } from "lucide-react"
import { cn } from "../../lib/utils"

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

export const ProductDetailSidebar = React.forwardRef<
  HTMLDivElement,
  ProductDetailSidebarProps
>(({ product, open, onOpenChange, onEdit, className }, ref) => {
  if (!product) return null

  const profit = product.hargaJual - product.hargaBeli
  const profitPercentage = ((profit / product.hargaBeli) * 100).toFixed(1)

  return (
    <Sidebar open={open} onOpenChange={onOpenChange}>
      <SidebarContent size="forty" className={cn("w-full", className)} ref={ref}>
        <SidebarHeader>
          <SidebarTitle>Detail Produk</SidebarTitle>
          <SidebarDescription>
            Informasi lengkap produk {product.nama}
          </SidebarDescription>
        </SidebarHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Product Image */}
          {product.gambar && (
            <div className="aspect-square w-full overflow-hidden rounded-lg border">
              <img
                src={product.gambar}
                alt={product.nama}
                className="h-full w-full object-cover"
              />
            </div>
          )}

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