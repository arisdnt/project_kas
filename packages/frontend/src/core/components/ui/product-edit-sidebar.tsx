import * as React from "react"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Combobox } from "./combobox"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTitle,
  SidebarDescription,
  SidebarFooter,
} from "./sidebar"
import { Save, X, Shuffle } from "lucide-react"
import { cn } from "../../lib/utils"
import { useProdukStore } from "@/features/produk/store/produkStore"
import { ScopeSelector } from '@/core/components/ui/scope-selector'
import { Separator } from './separator'

export interface ProductFormData {
  nama: string
  kode: string
  kategori: string
  kategoriId?: string
  brand: string
  brandId?: string
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
  // Tambahan: indikasi mode create agar kita bisa tampilkan ScopeSelector (scope hanya berlaku create)
  isCreate?: boolean
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

// Common satuan options
const SATUAN_OPTIONS = [
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'gram', label: 'Gram (gram)' },
  { value: 'liter', label: 'Liter (liter)' },
  { value: 'ml', label: 'Mililiter (ml)' },
  { value: 'meter', label: 'Meter (meter)' },
  { value: 'cm', label: 'Centimeter (cm)' },
  { value: 'box', label: 'Box (box)' },
  { value: 'pack', label: 'Pack (pack)' },
  { value: 'lusin', label: 'Lusin (lusin)' },
]

export const ProductEditSidebar = React.forwardRef<
  HTMLDivElement,
  ProductEditSidebarProps
>(({ product, open, onOpenChange, onSave, isLoading = false, className, isCreate = false }, ref) => {
  const { categories, brands, loadMasterData, masterDataLoading } = useProdukStore()

  const [formData, setFormData] = React.useState<ProductFormData>({
    nama: '',
    kode: '',
    kategori: '',
    kategoriId: '',
    brand: '',
    brandId: '',
    hargaBeli: 0,
    hargaJual: 0,
    stok: 0,
    satuan: 'pcs',
    deskripsi: '',
    status: 'aktif',
  })

  const [errors, setErrors] = React.useState<FormErrors>({})
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})
  // Scope data hanya untuk create
  const [scopeData, setScopeData] = React.useState<{ targetTenantId?: string; targetStoreId?: string; applyToAllTenants?: boolean; applyToAllStores?: boolean }>({})

  // Generate product code based on product name
  const generateProductCode = () => {
    const productName = formData.nama.trim()
    if (!productName) return

    // Split into words and create abbreviation
    const words = productName
      .split(/\s+/)
      .filter(word => word.length > 0)
      .slice(0, 3) // Take first 3 words max

    let code = ''

    if (words.length === 1) {
      // Single word: take first 6 characters
      code = words[0].substring(0, 6).toUpperCase()
    } else {
      // Multiple words: take first 2-3 characters from each word
      code = words
        .map(word => {
          // Remove common words like "dan", "atau", etc.
          const commonWords = ['DAN', 'ATAU', 'DENGAN', 'UNTUK', 'DARI', 'THE', 'AND', 'OR', 'WITH', 'FOR', 'FROM']
          if (commonWords.includes(word.toUpperCase()) && words.length > 2) {
            return ''
          }
          return word.substring(0, words.length > 2 ? 2 : 3).toUpperCase()
        })
        .filter(part => part.length > 0)
        .join('')
    }

    // Remove special characters and limit length
    code = code
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 8)

    // Add timestamp suffix for uniqueness (last 4 digits of current timestamp)
    const timestamp = Date.now().toString().slice(-4)
    code = `${code}${timestamp}`

    setFormData(prev => ({ ...prev, kode: code }))

    // Clear kode error if it exists
    if (errors.kode) {
      setErrors(prev => ({ ...prev, kode: undefined }))
    }
  }

  // Load master data when component mounts
  React.useEffect(() => {
    if (open && categories.length === 0 && brands.length === 0) {
      loadMasterData()
    }
  }, [open, categories.length, brands.length, loadMasterData])

  React.useEffect(() => {
    if (product) {
      // Find kategori and brand IDs if they exist
      const categoryId = categories.find(cat => cat.nama === product.kategori)?.id || ''
      const brandId = brands.find(brand => brand.nama === product.brand)?.id || ''

      setFormData({
        ...product,
        kategoriId: categoryId,
        brandId: brandId
      })
      setErrors({})
      setTouched({})
    }
  }, [product, categories, brands])

  // Convert categories and brands to combobox options
  const categoryOptions = React.useMemo(() =>
    categories.map(cat => ({ value: cat.id, label: cat.nama })),
    [categories]
  )

  const brandOptions = React.useMemo(() =>
    brands.map(brand => ({ value: brand.id, label: brand.nama })),
    [brands]
  )


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
        // Gabungkan scopeData hanya saat create
        const payload: any = isCreate ? { ...formData, ...scopeData } : formData
        await onSave(payload)
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
      <SidebarContent size="fifty" className={cn("w-full", className)} ref={ref}>
        <SidebarHeader>
          <SidebarTitle>{formData.nama ? 'Edit Produk' : 'Tambah Produk'}</SidebarTitle>
          <SidebarDescription>
            {formData.nama ? `Ubah informasi produk ${formData.nama}` : 'Tambah produk baru ke sistem'}
          </SidebarDescription>
        </SidebarHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          {isCreate ? (
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

              {/* Right column: Product Details */}
              <div className="col-span-3 space-y-4">
                <h3 className="text-sm font-medium">Detail Produk</h3>
                <div className="space-y-4">
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
                    <div className="flex gap-2">
                      <Input
                        id="kode"
                        value={formData.kode}
                        onChange={(e) => handleInputChange('kode', e.target.value.toUpperCase())}
                        onBlur={() => handleBlur('kode')}
                        placeholder="Masukkan kode produk"
                        className={cn("flex-1", errors.kode ? "border-red-500" : "")}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="default"
                        onClick={generateProductCode}
                        disabled={!formData.nama.trim()}
                        className="px-4 h-10 bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300 min-w-[100px]"
                        title="Generate kode produk dari nama"
                      >
                        <Shuffle className="h-4 w-4 mr-1" />
                        Generate
                      </Button>
                    </div>
                    {errors.kode && touched.kode && (
                      <p className="text-sm text-red-500">{errors.kode}</p>
                    )}
                  </div>

                  {/* Kategori & Brand */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="kategori">Kategori *</Label>
                      <Combobox
                        options={categoryOptions}
                        value={formData.kategoriId}
                        onValueChange={(value) => {
                          const selectedCategory = categories.find(cat => cat.id === value)
                          setFormData(prev => ({
                            ...prev,
                            kategoriId: value,
                            kategori: selectedCategory?.nama || ''
                          }))
                          if (errors.kategori) {
                            setErrors(prev => ({ ...prev, kategori: undefined }))
                          }
                        }}
                        placeholder="Pilih kategori..."
                        searchPlaceholder="Cari kategori..."
                        emptyText="Kategori tidak ditemukan"
                        allowCreate={false}
                        className={errors.kategori ? "border-red-500" : ""}
                        disabled={masterDataLoading}
                      />
                      {errors.kategori && touched.kategori && (
                        <p className="text-sm text-red-500">{errors.kategori}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand *</Label>
                      <Combobox
                        options={brandOptions}
                        value={formData.brandId}
                        onValueChange={(value) => {
                          const selectedBrand = brands.find(brand => brand.id === value)
                          setFormData(prev => ({
                            ...prev,
                            brandId: value,
                            brand: selectedBrand?.nama || ''
                          }))
                          if (errors.brand) {
                            setErrors(prev => ({ ...prev, brand: undefined }))
                          }
                        }}
                        placeholder="Pilih brand..."
                        searchPlaceholder="Cari brand..."
                        emptyText="Brand tidak ditemukan"
                        allowCreate={false}
                        className={errors.brand ? "border-red-500" : ""}
                        disabled={masterDataLoading}
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
                      <Combobox
                        options={SATUAN_OPTIONS}
                        value={formData.satuan}
                        onValueChange={(value) => {
                          setFormData(prev => ({ ...prev, satuan: value }))
                          if (errors.satuan) {
                            setErrors(prev => ({ ...prev, satuan: undefined }))
                          }
                        }}
                        placeholder="Pilih satuan..."
                        searchPlaceholder="Cari satuan..."
                        emptyText="Satuan tidak ditemukan"
                        allowCreate={false}
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
                </div>
              </div>
            </div>
          ) : (
            // Edit mode: single column
            <div className="space-y-4 px-1">
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
                <div className="flex gap-2">
                  <Input
                    id="kode"
                    value={formData.kode}
                    onChange={(e) => handleInputChange('kode', e.target.value.toUpperCase())}
                    onBlur={() => handleBlur('kode')}
                    placeholder="Masukkan kode produk"
                    className={cn("flex-1", errors.kode ? "border-red-500" : "")}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="default"
                    onClick={generateProductCode}
                    disabled={!formData.nama.trim()}
                    className="px-6 h-10 bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300 min-w-[120px]"
                    title="Generate kode produk dari nama"
                  >
                    <Shuffle className="h-5 w-5 mr-2" />
                    Generate
                  </Button>
                </div>
                {errors.kode && touched.kode && (
                  <p className="text-sm text-red-500">{errors.kode}</p>
                )}
              </div>

              {/* Kategori & Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kategori">Kategori *</Label>
                  <Combobox
                    options={categoryOptions}
                    value={formData.kategoriId}
                    onValueChange={(value) => {
                      const selectedCategory = categories.find(cat => cat.id === value)
                      setFormData(prev => ({
                        ...prev,
                        kategoriId: value,
                        kategori: selectedCategory?.nama || ''
                      }))
                      if (errors.kategori) {
                        setErrors(prev => ({ ...prev, kategori: undefined }))
                      }
                    }}
                    placeholder="Pilih kategori..."
                    searchPlaceholder="Cari kategori..."
                    emptyText="Kategori tidak ditemukan"
                    allowCreate={false}
                    className={errors.kategori ? "border-red-500" : ""}
                    disabled={masterDataLoading}
                  />
                  {errors.kategori && touched.kategori && (
                    <p className="text-sm text-red-500">{errors.kategori}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Combobox
                    options={brandOptions}
                    value={formData.brandId}
                    onValueChange={(value) => {
                      const selectedBrand = brands.find(brand => brand.id === value)
                      setFormData(prev => ({
                        ...prev,
                        brandId: value,
                        brand: selectedBrand?.nama || ''
                      }))
                      if (errors.brand) {
                        setErrors(prev => ({ ...prev, brand: undefined }))
                      }
                    }}
                    placeholder="Pilih brand..."
                    searchPlaceholder="Cari brand..."
                    emptyText="Brand tidak ditemukan"
                    allowCreate={false}
                    className={errors.brand ? "border-red-500" : ""}
                    disabled={masterDataLoading}
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
                  <Combobox
                    options={SATUAN_OPTIONS}
                    value={formData.satuan}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, satuan: value }))
                      if (errors.satuan) {
                        setErrors(prev => ({ ...prev, satuan: undefined }))
                      }
                    }}
                    placeholder="Pilih satuan..."
                    searchPlaceholder="Cari satuan..."
                    emptyText="Satuan tidak ditemukan"
                    allowCreate={false}
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
            </div>
          )}
        </form>

        <SidebarFooter className="mt-6">
          {isCreate ? (
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
                  <X className="h-4 w-4 mr-2" />
                  Batal
                </Button>
              </div>
              <div className="col-span-3">
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </div>
          ) : (
            // Edit mode: centered buttons
            <div className="flex gap-2 w-full max-w-md mx-auto">
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
          )}
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  )
})

ProductEditSidebar.displayName = "ProductEditSidebar"