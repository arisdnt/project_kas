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

export interface ProductImageProps {
  src?: string
  alt: string
  className?: string
}

export interface ProductInfoCardProps {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  className?: string
}