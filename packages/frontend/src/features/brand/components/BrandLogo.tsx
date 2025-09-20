import { useEffect, useRef, useState } from 'react'
import { Image } from 'lucide-react'
import { useAuthStore } from '@/core/store/authStore'

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

type BrandLogoProps = {
  src?: string
  alt: string
  className?: string
  showHoverPreview?: boolean
}

export function BrandLogo({ src, alt, className = '', showHoverPreview = false }: BrandLogoProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [actualSrc, setActualSrc] = useState<string | null>(null)
  const [converting, setConverting] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function handleUrl() {
      if (!src) {
        setActualSrc(null)
        return
      }

      if (src.startsWith('minio://')) {
        setConverting(true)
        try {
          const convertedUrl = await convertMinioUrl(src)
          setActualSrc(convertedUrl)
        } catch (error) {
          console.error('Error converting URL:', error)
          setActualSrc(null)
        } finally {
          setConverting(false)
        }
      } else {
        setActualSrc(src)
      }
    }

    setImageError(false)
    setImageLoaded(false)
    void handleUrl()
  }, [src])

  if (!actualSrc || imageError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <Image className="w-5 h-5 text-gray-400" />
      </div>
    )
  }

  const handleMouseEnter = () => {
    if (showHoverPreview) {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        setMousePos({
          x: rect.right + 10,
          y: rect.top + rect.height / 2,
        })
      }
      setIsHovered(true)
    }
  }

  const handleMouseLeave = () => {
    if (showHoverPreview) {
      setIsHovered(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`bg-gray-100 flex items-center justify-center ${className} ${showHoverPreview ? 'relative cursor-pointer' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {(converting || !imageLoaded) && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}
      {!converting && (
        <>
          <img
            src={actualSrc}
            alt={alt}
            className={`w-full h-full object-cover transition-all duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${showHoverPreview ? 'hover:scale-105' : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          {showHoverPreview && imageLoaded && (
            <div className="absolute top-1 left-1 w-3 h-3 bg-blue-500 rounded-full opacity-80 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          )}
        </>
      )}

      {showHoverPreview && isHovered && actualSrc && imageLoaded && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            transform: 'translateY(-50%)',
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-300 p-6 max-w-sm transition-all duration-200 ease-out scale-100 opacity-100">
            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[12px] border-r-white" />
            <div className="absolute right-full top-1/2 -translate-y-1/2 translate-x-[1px] w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[12px] border-r-gray-300" />

            <div className="space-y-4">
              <div className="w-80 h-80 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                <img
                  src={actualSrc}
                  alt={alt}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900 mb-1">{alt}</div>
                <div className="text-xs text-gray-500">Preview Logo Brand</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
