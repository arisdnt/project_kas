import * as React from 'react'
import { ImageUploadState } from '../types'
import { validateImageFile } from '../utils/productCodeGenerator'

interface UseImageUploadProps {
  onUpload: (productId: number, file: File) => Promise<string>
  onRemove: (productId: number) => Promise<void>
  onFormDataUpdate: (url: string | undefined) => void
}

export const useImageUpload = ({
  onUpload,
  onRemove,
  onFormDataUpdate
}: UseImageUploadProps) => {
  const [imageState, setImageState] = React.useState<ImageUploadState>({
    selectedImage: null,
    imagePreview: null,
    imageUploading: false
  })

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const validationError = validateImageFile(file)
      if (validationError) {
        alert(validationError)
        return
      }

      setImageState(prev => ({ ...prev, selectedImage: file }))

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImageState(prev => ({
          ...prev,
          imagePreview: e.target?.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUpload = async (productId: number) => {
    if (!imageState.selectedImage) return

    setImageState(prev => ({ ...prev, imageUploading: true }))
    try {
      const imageUrl = await onUpload(productId, imageState.selectedImage)
      onFormDataUpdate(imageUrl)
      setImageState({
        selectedImage: null,
        imagePreview: null,
        imageUploading: false
      })
    } catch (error: any) {
      alert('Failed to upload image: ' + error.message)
      setImageState(prev => ({ ...prev, imageUploading: false }))
    }
  }

  const handleImageRemove = async (productId: number) => {
    setImageState(prev => ({ ...prev, imageUploading: true }))
    try {
      await onRemove(productId)
      onFormDataUpdate(undefined)
      setImageState({
        selectedImage: null,
        imagePreview: null,
        imageUploading: false
      })
    } catch (error: any) {
      alert('Failed to remove image: ' + error.message)
      setImageState(prev => ({ ...prev, imageUploading: false }))
    }
  }

  const clearSelection = () => {
    setImageState(prev => ({
      ...prev,
      selectedImage: null,
      imagePreview: null
    }))
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return {
    imageState,
    fileInputRef,
    handleImageSelect,
    handleImageUpload,
    handleImageRemove,
    clearSelection,
    triggerFileInput
  }
}