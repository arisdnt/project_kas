import * as React from "react"
import { Button } from "../button"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTitle,
  SidebarDescription,
  SidebarFooter,
} from "../sidebar"
import { Save, X } from "lucide-react"
import { cn } from "../../../lib/utils"
import { useProdukStore } from "@/features/produk/store/produkStore"
import { useProductForm } from './hooks/useProductForm'
import { useImageUpload } from './hooks/useImageUpload'
import { CreateModeLayout } from './layouts/CreateModeLayout'
import { EditModeLayout } from './layouts/EditModeLayout'
import type { ProductEditSidebarProps, ProductFormData } from './types'

export const ProductEditSidebar = React.forwardRef<
  HTMLDivElement,
  ProductEditSidebarProps
>(({ product, open, onOpenChange, onSave, isLoading = false, className, isCreate = false, productId }, ref) => {
  const {
    categories,
    brands,
    suppliers,
    loadMasterData,
    masterDataLoading,
    uploadProductImage,
    removeProductImage
  } = useProdukStore()

  // Initialize form with enhanced data including IDs
  const enhancedProduct = React.useMemo(() => {
    if (!product) return null

    const categoryId = categories.find(cat => cat.nama === product.kategori)?.id || ''
    const brandId = brands.find(brand => brand.nama === product.brand)?.id || ''
    const supplierId = suppliers.find(s => s.nama === (product as any).supplier)?.id || ''

    return {
      ...product,
      kategoriId: categoryId,
      brandId: brandId,
      supplierId: supplierId
    }
  }, [product, categories, brands, suppliers])

  const {
    formData,
    setFormData,
    errors,
    touched,
    handleInputChange,
    handleBlur,
    handleSubmit,
    resetForm
  } = useProductForm({
    initialData: enhancedProduct,
    onSave,
    isCreate
  })

  const {
    imageState,
    fileInputRef,
    handleImageSelect,
    handleImageUpload,
    handleImageRemove,
    clearSelection,
    triggerFileInput
  } = useImageUpload({
    onUpload: uploadProductImage,
    onRemove: removeProductImage,
    onFormDataUpdate: (url) => setFormData(prev => ({ ...prev, gambar_url: url }))
  })

  // Load master data when component mounts
  React.useEffect(() => {
    if (open && (categories.length === 0 || brands.length === 0 || suppliers.length === 0)) {
      loadMasterData()
    }
  }, [open, categories.length, brands.length, suppliers.length, loadMasterData])

  // Convert master data to combobox options
  const categoryOptions = React.useMemo(() =>
    categories.map(cat => ({ value: cat.id, label: cat.nama })),
    [categories]
  )

  const brandOptions = React.useMemo(() =>
    brands.map(brand => ({ value: brand.id, label: brand.nama })),
    [brands]
  )

  const supplierOptions = React.useMemo(() =>
    suppliers.map(s => ({ value: s.id, label: s.nama })),
    [suppliers]
  )

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    const selectedCategory = categories.find(cat => cat.id === value)
    setFormData(prev => ({
      ...prev,
      kategoriId: value,
      kategori: selectedCategory?.nama || ''
    }))
    if (errors.kategori) {
      handleInputChange('kategori', selectedCategory?.nama || '')
    }
  }

  // Handle brand selection
  const handleBrandChange = (value: string) => {
    const selectedBrand = brands.find(brand => brand.id === value)
    setFormData(prev => ({
      ...prev,
      brandId: value,
      brand: selectedBrand?.nama || ''
    }))
    if (errors.brand) {
      handleInputChange('brand', selectedBrand?.nama || '')
    }
  }

  // Handle supplier selection
  const handleSupplierChange = (value: string) => {
    const selectedSupplier = suppliers.find(s => s.id === value)
    setFormData(prev => ({
      ...prev,
      supplierId: value,
      supplier: selectedSupplier?.nama || ''
    }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const success = await handleSubmit()
    if (success) {
      // If creating a new product and there's a selected image, upload it
      if (isCreate && imageState.selectedImage) {
        // Note: Image upload for create mode happens in the form submit handler
        // The result should include the product ID for image upload
      }
      resetForm()
      clearSelection()
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    resetForm()
    clearSelection()
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

        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto">
          {isCreate ? (
            <CreateModeLayout
              formData={formData}
              errors={errors}
              touched={touched}
              isLoading={isLoading}
              masterDataLoading={masterDataLoading}
              categoryOptions={categoryOptions}
              brandOptions={brandOptions}
              supplierOptions={supplierOptions}
              imageState={imageState}
              fileInputRef={fileInputRef}
              onInputChange={handleInputChange}
              onBlur={handleBlur}
              onImageSelect={handleImageSelect}
              onClearImageSelection={clearSelection}
              onTriggerFileInput={triggerFileInput}
              onCategoryChange={handleCategoryChange}
              onBrandChange={handleBrandChange}
              onSupplierChange={handleSupplierChange}
            />
          ) : (
            <EditModeLayout
              formData={formData}
              errors={errors}
              touched={touched}
              isLoading={isLoading}
              masterDataLoading={masterDataLoading}
              productId={productId}
              categoryOptions={categoryOptions}
              brandOptions={brandOptions}
              supplierOptions={supplierOptions}
              imageState={imageState}
              fileInputRef={fileInputRef}
              onInputChange={handleInputChange}
              onBlur={handleBlur}
              onImageSelect={handleImageSelect}
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
              onTriggerFileInput={triggerFileInput}
              onCategoryChange={handleCategoryChange}
              onBrandChange={handleBrandChange}
              onSupplierChange={handleSupplierChange}
            />
          )}
        </form>

        <SidebarFooter className="mt-6">
          {isCreate ? (
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
                  disabled={isLoading}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </div>
          ) : (
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

// Re-export types for backward compatibility
export type { ProductFormData, ProductEditSidebarProps } from './types'