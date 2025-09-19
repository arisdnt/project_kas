import * as React from 'react'
import { Image } from 'lucide-react'
import { ProductImageProps } from '../types'
import { useProductImage } from '../hooks/useProductImage'

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = ""
}) => {
  const {
    actualSrc,
    imageError,
    imageLoaded,
    converting,
    handleImageLoad,
    handleImageError
  } = useProductImage({ src })

  if (!actualSrc || imageError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <Image className="w-12 h-12 text-gray-400" />
      </div>
    )
  }

  return (
    <div className={`bg-gray-100 flex items-center justify-center relative ${className}`}>
      {(converting || !imageLoaded) && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}
      {!converting && (
        <img
          src={actualSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  )
}