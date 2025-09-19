export interface ProductFormData {
  nama: string
  kode: string
  kategori: string
  kategoriId?: string
  brand: string
  brandId?: string
  supplier?: string
  supplierId?: string
  hargaBeli: number
  hargaJual: number
  stok: number
  satuan: string
  deskripsi?: string
  status: 'aktif' | 'nonaktif'
  gambar_url?: string
}

export interface ProductEditSidebarProps {
  product: ProductFormData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (product: ProductFormData) => Promise<any>
  isLoading?: boolean
  className?: string
  isCreate?: boolean
  productId?: number
}

export interface FormErrors {
  nama?: string
  kode?: string
  kategori?: string
  brand?: string
  hargaBeli?: string
  hargaJual?: string
  stok?: string
  satuan?: string
}
export interface ImageUploadState {
  selectedImage: File | null
  imagePreview: string | null
  imageUploading: boolean
}