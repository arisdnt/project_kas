import * as React from 'react'
import { Button } from '../../button'
import { Label } from '../../label'
import { Upload, Trash2, Image } from 'lucide-react'
import { ImageUploadState } from '../types'

interface ImageUploadFieldProps {
  currentImageUrl?: string
  imageState: ImageUploadState
  fileInputRef: React.RefObject<HTMLInputElement>
  isCreate?: boolean
  productId?: number
  onImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
  onImageUpload: (productId: number) => void
  onImageRemove: (productId: number) => void
  onClearSelection: () => void
  onTriggerFileInput: () => void
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  currentImageUrl,
  imageState,
  fileInputRef,
  isCreate = false,
  productId,
  onImageSelect,
  onImageUpload,
  onImageRemove,
  onClearSelection,
  onTriggerFileInput
}) => {
  const { selectedImage, imagePreview, imageUploading } = imageState

  return (
    <div className="space-y-2">
      <Label>Gambar Produk</Label>
      <div className="space-y-3">
        {/* Current Image or Preview */}
        {(imagePreview || currentImageUrl) && (
          <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
            <img
              src={imagePreview || currentImageUrl}
              alt="Product preview"
              className="w-full h-full object-cover"
            />
            {!isCreate && currentImageUrl && !selectedImage && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => productId && onImageRemove(productId)}
                disabled={imageUploading}
                className="absolute top-1 right-1 h-6 w-6 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
            {isCreate && selectedImage && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onClearSelection}
                className="absolute top-1 right-1 h-6 w-6 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {/* Upload Button */}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onImageSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={onTriggerFileInput}
            disabled={imageUploading}
            className="flex-1"
          >
            <Image className="h-4 w-4 mr-2" />
            {currentImageUrl || selectedImage ? 'Ganti Gambar' : 'Pilih Gambar'}
          </Button>

          {selectedImage && !isCreate && (
            <Button
              type="button"
              onClick={() => productId && onImageUpload(productId)}
              disabled={imageUploading}
              className="px-4"
            >
              <Upload className="h-4 w-4 mr-2" />
              {imageUploading ? 'Uploading...' : 'Upload'}
            </Button>
          )}
        </div>

        {selectedImage && (
          <p className="text-sm text-muted-foreground">
            File selected: {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
            {isCreate && <span className="block text-xs text-blue-600">Gambar akan diupload setelah produk dibuat</span>}
          </p>
        )}
      </div>
    </div>
  )
}