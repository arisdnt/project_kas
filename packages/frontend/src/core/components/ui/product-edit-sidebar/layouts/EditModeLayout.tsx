import * as React from 'react'
import { Input } from '../../input'
import { Label } from '../../label'
import { Combobox } from '../../combobox'
import { ProductCodeField } from '../components/ProductCodeField'
import { PriceFields } from '../components/PriceFields'
import { StockAndUnitFields } from '../components/StockAndUnitFields'
import { ImageUploadField } from '../components/ImageUploadField'
import { ProductFormData, FormErrors, ImageUploadState } from '../types'

interface EditModeLayoutProps {
  formData: ProductFormData
  errors: FormErrors
  touched: Record<string, boolean>
  isLoading: boolean
  masterDataLoading: boolean
  productId?: number
  categoryOptions: Array<{ value: string; label: string }>
  brandOptions: Array<{ value: string; label: string }>
  supplierOptions: Array<{ value: string; label: string }>
  imageState: ImageUploadState
  fileInputRef: React.RefObject<HTMLInputElement>
  onInputChange: (field: keyof ProductFormData, value: string | number) => void
  onBlur: (field: keyof ProductFormData) => void
  onImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
  onImageUpload: (productId: number) => void
  onImageRemove: (productId: number) => void
  onTriggerFileInput: () => void
  onCategoryChange: (value: string, categories: any[]) => void
  onBrandChange: (value: string, brands: any[]) => void
  onSupplierChange: (value: string, suppliers: any[]) => void
}

export const EditModeLayout: React.FC<EditModeLayoutProps> = ({
  formData,
  errors,
  touched,
  isLoading,
  masterDataLoading,
  productId,
  categoryOptions,
  brandOptions,
  supplierOptions,
  imageState,
  fileInputRef,
  onInputChange,
  onBlur,
  onImageSelect,
  onImageUpload,
  onImageRemove,
  onTriggerFileInput,
  onCategoryChange,
  onBrandChange,
  onSupplierChange
}) => {
  return (
    <div className="space-y-4 px-1">
      {/* Nama Produk */}
      <div className="space-y-2">
        <Label htmlFor="nama">Nama Produk *</Label>
        <Input
          id="nama"
          value={formData.nama}
          onChange={(e) => onInputChange('nama', e.target.value)}
          onBlur={() => onBlur('nama')}
          placeholder="Masukkan nama produk"
          className={errors.nama ? "border-red-500" : ""}
        />
        {errors.nama && touched.nama && (
          <p className="text-sm text-red-500">{errors.nama}</p>
        )}
      </div>

      {/* Kode Produk */}
      <ProductCodeField
        value={formData.kode}
        productName={formData.nama}
        error={errors.kode}
        touched={touched.kode}
        onChange={(value) => onInputChange('kode', value)}
        onBlur={() => onBlur('kode')}
        className="[&_button]:min-w-[120px] [&_button]:px-6 [&_button_.h-4]:h-5 [&_button_.w-4]:w-5 [&_button_.mr-1]:mr-2"
      />

      {/* Kategori & Brand */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="kategori">Kategori *</Label>
          <Combobox
            options={categoryOptions}
            value={formData.kategoriId}
            onValueChange={onCategoryChange}
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
            onValueChange={onBrandChange}
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

      {/* Supplier */}
      <div className="space-y-2">
        <Label htmlFor="supplier">Supplier *</Label>
        <Combobox
          options={supplierOptions}
          value={formData.supplierId}
          onValueChange={onSupplierChange}
          placeholder="Pilih supplier..."
          searchPlaceholder="Cari supplier..."
          emptyText="Supplier tidak ditemukan"
          allowCreate={false}
          disabled={masterDataLoading}
        />
      </div>

      {/* Harga */}
      <PriceFields
        hargaBeli={formData.hargaBeli}
        hargaJual={formData.hargaJual}
        errors={errors}
        touched={touched}
        onChange={onInputChange}
        onBlur={onBlur}
      />

      {/* Stok & Satuan */}
      <StockAndUnitFields
        stok={formData.stok}
        satuan={formData.satuan}
        errors={errors}
        touched={touched}
        onChange={onInputChange}
        onBlur={onBlur}
      />

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => onInputChange('status', e.target.value as 'aktif' | 'nonaktif')}
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
          onChange={(e) => onInputChange('deskripsi', e.target.value)}
          placeholder="Deskripsi produk (opsional)"
          rows={3}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Image Upload */}
      <ImageUploadField
        currentImageUrl={formData.gambar_url}
        imageState={imageState}
        fileInputRef={fileInputRef}
        isCreate={false}
        productId={productId}
        onImageSelect={onImageSelect}
        onImageUpload={onImageUpload}
        onImageRemove={onImageRemove}
        onClearSelection={() => {}}
        onTriggerFileInput={onTriggerFileInput}
      />
    </div>
  )
}