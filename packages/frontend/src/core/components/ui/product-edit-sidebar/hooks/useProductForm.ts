import * as React from 'react'
import { ProductFormData, FormErrors } from '../types'
import { validateForm } from '../validation/productValidation'

interface UseProductFormProps {
  initialData?: ProductFormData | null
  onSave: (product: ProductFormData) => Promise<any>
  isCreate?: boolean
}

export const useProductForm = ({
  initialData,
  onSave,
  isCreate = false
}: UseProductFormProps) => {
  const [formData, setFormData] = React.useState<ProductFormData>({
    nama: '',
    kode: '',
    kategori: '',
    kategoriId: '',
    brand: '',
    brandId: '',
    supplier: '',
    supplierId: '',
    hargaBeli: 0,
    hargaJual: 0,
    stok: 0,
    satuan: 'pcs',
    deskripsi: '',
    status: 'aktif',
    gambar_url: undefined,
  })

  const [errors, setErrors] = React.useState<FormErrors>({})
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})

  // Update form data when initialData changes
  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData)
      setErrors({})
      setTouched({})
    }
  }, [initialData])

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

  const handleSubmit = async (): Promise<boolean> => {
    const formErrors = validateForm(formData)
    setErrors(formErrors)

    if (Object.keys(formErrors).length === 0) {
      try {
        const payload: any = formData
        await onSave(payload)
        return true
      } catch (error) {
        console.error('Error saving product:', error)
        return false
      }
    }
    return false
  }

  const resetForm = () => {
    setErrors({})
    setTouched({})
  }

  return {
    formData,
    setFormData,
    errors,
    touched,
    handleInputChange,
    handleBlur,
    handleSubmit,
    resetForm
  }
}