import { useEffect, useState } from 'react'
import { useAuthStore } from '@/core/store/authStore'
import { cn } from '@/core/lib/utils'
import { Image as ImageIcon } from 'lucide-react'

async function convertMinioUrl(minioUrl: string | null | undefined): Promise<string | null> {
  if (!minioUrl || !minioUrl.startsWith('minio://')) {
    return minioUrl || null
  }

  try {
    const objectKey = minioUrl.replace('minio://pos-files/', '')
    const token = useAuthStore.getState().token
    const response = await fetch('http://localhost:3000/api/dokumen/object-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ object_key: objectKey }),
    })

    if (response.ok) {
      const result = await response.json()
      return result.data?.url || null
    }

    return null
  } catch (error) {
    console.error('Failed to convert MinIO URL:', error)
    return null
  }
}

type ProductImageProps = {
  src?: string
  alt: string
}

export function ProductImage({ src, alt }: ProductImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [actualSrc, setActualSrc] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function handleUrl() {
      if (!src) {
        if (isMounted) setActualSrc(null)
        return
      }

      if (src.startsWith('minio://')) {
        try {
          const convertedUrl = await convertMinioUrl(src)
          if (isMounted) setActualSrc(convertedUrl)
        } catch (error) {
          console.error('Error converting URL:', error)
          if (isMounted) setActualSrc(null)
        }
      } else {
        setActualSrc(src)
      }
    }

    setImageError(false)
    setImageLoaded(false)
    handleUrl()

    return () => {
      isMounted = false
    }
  }, [src])

  if (!actualSrc || imageError) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 text-slate-400">
        <ImageIcon className="h-4 w-4" />
      </div>
    )
  }

  return (
    <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white">
      {!imageLoaded && <div className="absolute inset-0 animate-pulse rounded-md bg-slate-100" />}
      <img
        src={actualSrc}
        alt={alt}
        className={cn(
          'h-full w-full object-cover transition-opacity duration-300',
          imageLoaded ? 'opacity-100' : 'opacity-0',
        )}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
    </div>
  )
}