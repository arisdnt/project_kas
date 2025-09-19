import * as React from 'react'
import { convertMinioUrl } from '../utils/imageUtils'

interface UseProductImageProps {
  src?: string
}

export const useProductImage = ({ src }: UseProductImageProps) => {
  const [imageError, setImageError] = React.useState(false)
  const [imageLoaded, setImageLoaded] = React.useState(false)
  const [actualSrc, setActualSrc] = React.useState<string | null>(null)
  const [converting, setConverting] = React.useState(false)

  React.useEffect(() => {
    async function handleUrl() {
      if (!src) {
        console.log('useProductImage: No src provided')
        setActualSrc(null)
        return
      }

      console.log('useProductImage: Original URL:', src)

      if (src.startsWith('minio://')) {
        console.log('useProductImage: Converting MinIO URL...')
        setConverting(true)
        try {
          const convertedUrl = await convertMinioUrl(src)
          console.log('useProductImage: Converted URL:', convertedUrl)
          setActualSrc(convertedUrl)
        } catch (error) {
          console.error('useProductImage: Error converting URL:', error)
          setActualSrc(null)
        } finally {
          setConverting(false)
        }
      } else {
        console.log('useProductImage: Using URL as-is')
        setActualSrc(src)
      }
    }

    setImageError(false)
    setImageLoaded(false)
    handleUrl()
  }, [src])

  const handleImageLoad = React.useCallback(() => {
    setImageLoaded(true)
  }, [])

  const handleImageError = React.useCallback(() => {
    setImageError(true)
  }, [])

  return {
    actualSrc,
    imageError,
    imageLoaded,
    converting,
    handleImageLoad,
    handleImageError
  }
}