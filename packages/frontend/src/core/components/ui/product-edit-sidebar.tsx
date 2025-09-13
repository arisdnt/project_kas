import * as React from "react"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Select } from "./select"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTitle,
  SidebarDescription,
  SidebarFooter,
} from "./sidebar"
import { Save, X } from "lucide-react"
import { cn } from "../../lib/utils"

export interface ProductFormData {
  nama: string
  kode: string
  kategori: string
  brand: string
  hargaBeli: number
  hargaJual: number
  stok: number
  satuan: string
  deskripsi?: string
  status: 'aktif' | 'nonaktif'
}

export interface ProductEditSidebarProps {
  product: ProductFormData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (product: ProductFormData) => Promise<void>
  isLoading?: boolean
  className?: string
}

interface FormErrors {
  nama?: string
  kode?: string
  kategori?: string
  brand?: string
  hargaBeli?: string
  hargaJual?: string
  stok?: string
  satuan?: string
}

const validateForm = (data: ProductFormData): FormErrors => {
  const errors: FormErrors = {}

  if (!data.nama.trim()) {
    errors.nama = "Nama produk wajib diisi"
  }

  if (!data.kode.trim()) {
    errors.kode = "Kode produk wajib diisi"
  }

  if (!data.kategori.trim()) {
    errors.kategori = "Kategori wajib dipilih"
  }

  if (!data.brand.trim()) {
    errors.brand = "Brand wajib diisi"
  }

  if (data.hargaBeli <= 0) {
    errors.hargaBeli = "Harga beli harus lebih dari 0"
  }

  if (data.hargaJual <= 0) {
    errors.hargaJual = "Harga jual harus lebih dari 0"
  }

  if (data.hargaJual <= data.hargaBeli) {
    errors.hargaJual = "Harga jual harus lebih tinggi dari harga beli"
  }

  if (data.stok < 0) {
    errors.stok = "Stok tidak boleh negatif"
  }

  if (!data.satuan.trim()) {
    errors.satuan = "Satuan wajib diisi"
  }

  return errors
}

export const ProductEditSidebar = React.forwardRef<
  HTMLDivElement,
  ProductEditSidebarProps
>(({ product, open, onOpenChange, onSave, isLoading = false, className }, ref) => {
  const [formData, setFormData] = React.useState<ProductFormData>({
    nama: '',
    kode: '',
    kategori: '',
    brand: '',
    hargaBeli: 0,
    hargaJual: 0,
    stok: 0,
    satuan: '',
    deskripsi: '',
    status: 'aktif',
  })

  const [errors, setErrors] = React.useState<FormErrors>({})
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})

  React.useEffect(() => {
    if (product) {
      setFormData(product)
      setErrors({})
      setTouched({})
    }
  }, [product])

  const handleInputChange = (field: keyof ProductFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleBlur = (field: keyof ProductFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    
    // Validate single field on blur
    const fieldErrors = validateForm(formData)
    if (fieldErrors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: fieldErrors[field as keyof FormErrors] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formErrors = validateForm(formData)
    setErrors(formErrors)
    
    if (Object.keys(formErrors).length === 0) {
      try {
        await onSave(formData)
        onOpenChange(false)
      } catch (error) {
        console.error('Error saving product:', error)
      }
    }
  }

  const handleCancel = () => {
    setErrors({})
    setTouched({})
    onOpenChange(false)
  }

  if (!product) return null

  return (
    <Sidebar open={open} onOpenChange={onOpenChange}>
      <SidebarContent className={cn("w-full max-w-md", className)} ref={ref}>
        <SidebarHeader>
          <SidebarTitle>Edit Produk</SidebarTitle>
          <SidebarDescription>
            Ubah informasi produk {formData.nama || 'yang dipilih'}
          </SidebarDescription>
        </SidebarHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4">
          {/* Nama Produk */}
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Produk *</Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => handleInputChange('nama', e.target.value)}
              onBlur={() => handleBlur('nama')}
              placeholder="Masukkan nama produk"
              className={errors.nama ? "border-red-500" : ""}
            />
            {errors.nama && touched.nama && (
              <p className="text-sm text-red-500">{errors.nama}</p>
            )}
          </div>

          {/* Kode Produk */}
          <div className="space-y-2">
            <Label htmlFor="kode">Kode Produk *</Label>
            <Input
              id="kode"
              value={formData.kode}
              onChange={(e) => handleInputChange('kode', e.target.value.toUpperCase())}
              onBlur={() => handleBlur('kode')}
              placeholder="Masukkan kode produk"
              className={errors.kode ? "border-red-500" : ""}
            />
            {errors.kode && touched.kode && (
              <p className="text-sm text-red-500">{errors.kode}</p>
            )}
          </div>

          {/* Kategori & Brand */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kategori">Kategori *</Label>
              <Input
                id="kategori"
                value={formData.kategori}
                onChange={(e) => handleInputChange('kategori', e.target.value)}
                onBlur={() => handleBlur('kategori')}
                placeholder="Kategori"
                className={errors.kategori ? "border-red-500" : ""}
              />
              {errors.kategori && touched.kategori && (
                <p className="text-sm text-red-500">{errors.kategori}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                onBlur={() => handleBlur('brand')}
                placeholder="Brand"
                className={errors.brand ? "border-red-500" : ""}
              />
              {errors.brand && touched.brand && (
                <p className="text-sm text-red-500">{errors.brand}</p>
              )}
            </div>
          </div>

          {/* Harga */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hargaBeli">Harga Beli *</Label>
              <Input
                id="hargaBeli"
                type="number"
                min="0"
                step="100"
                value={formData.hargaBeli}
                onChange={(e) => handleInputChange('hargaBeli', Number(e.target.value))}
                onBlur={() => handleBlur('hargaBeli')}
                placeholder="0"
                className={errors.hargaBeli ? "border-red-500" : ""}
              />
              {errors.hargaBeli && touched.hargaBeli && (
                <p className="text-sm text-red-500">{errors.hargaBeli}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="hargaJual">Harga Jual *</Label>
              <Input
                id="hargaJual"
                type="number"
                min="0"
                step="100"
                value={formData.hargaJual}
                onChange={(e) => handleInputChange('hargaJual', Number(e.target.value))}
                onBlur={() => handleBlur('hargaJual')}
                placeholder="0"
                className={errors.hargaJual ? "border-red-500" : ""}
              />
              {errors.hargaJual && touched.hargaJual && (
                <p className="text-sm text-red-500">{errors.hargaJual}</p>
              )}
            </div>
          </div>

          {/* Stok & Satuan */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stok">Stok *</Label>
              <Input
                id="stok"
                type="number"
                min="0"
                value={formData.stok}
                onChange={(e) => handleInputChange('stok', Number(e.target.value))}
                onBlur={() => handleBlur('stok')}
                placeholder="0"
                className={errors.stok ? "border-red-500" : ""}
              />
              {errors.stok && touched.stok && (
                <p className="text-sm text-red-500">{errors.stok}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="satuan">Satuan *</Label>
              <Input
                id="satuan"
                value={formData.satuan}
                onChange={(e) => handleInputChange('satuan', e.target.value)}
                onBlur={() => handleBlur('satuan')}
                placeholder="pcs, kg, liter"
                className={errors.satuan ? "border-red-500" : ""}
              />
              {errors.satuan && touched.satuan && (
                <p className="text-sm text-red-500">{errors.satuan}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as 'aktif' | 'nonaktif')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Non-aktif</option>
            </select>
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <textarea
              id="deskripsi"
              value={formData.deskripsi}
              onChange={(e) => handleInputChange('deskripsi', e.target.value)}
              placeholder="Deskripsi produk (opsional)"
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </form>

        <SidebarFooter>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  )
})

ProductEditSidebar.displayName = "ProductEditSidebar"