import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { useProdukStore, UIProduk } from '@/features/produk/store/produkStore'
import { useAuthStore } from '@/core/store/authStore'
import { Eye, Pencil, Trash2, Image } from 'lucide-react'

type Props = {
  onView: (p: UIProduk) => void
  onEdit: (p: UIProduk) => void
}

// Helper function to convert MinIO URL to accessible URL
async function convertMinioUrl(minioUrl: string | null | undefined): Promise<string | null> {
  if (!minioUrl || !minioUrl.startsWith('minio://')) {
    return minioUrl || null;
  }

  try {
    // Extract object key from minio:// URL
    const objectKey = minioUrl.replace('minio://pos-files/', '');

    const token = useAuthStore.getState().token;
    const response = await fetch(`http://localhost:3000/api/dokumen/object-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ object_key: objectKey })
    });

    if (response.ok) {
      const result = await response.json();
      return result.data?.url || null;
    }

    return null;
  } catch (error) {
    console.error('Failed to convert MinIO URL:', error);
    return null;
  }
}

// Component untuk menampilkan gambar produk dengan fallback dan hover preview
function ProductImage({ src, alt, className = "", showHoverPreview = false }: { src?: string; alt: string; className?: string; showHoverPreview?: boolean }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [actualSrc, setActualSrc] = useState<string | null>(null)
  const [converting, setConverting] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Convert MinIO URL to accessible URL
  useEffect(() => {
    async function handleUrl() {
      if (!src) {
        setActualSrc(null);
        return;
      }

      if (src.startsWith('minio://')) {
        setConverting(true);
        try {
          const convertedUrl = await convertMinioUrl(src);
          setActualSrc(convertedUrl);
        } catch (error) {
          console.error('Error converting URL:', error);
          setActualSrc(null);
        } finally {
          setConverting(false);
        }
      } else {
        setActualSrc(src);
      }
    }

    setImageError(false);
    setImageLoaded(false);
    handleUrl();
  }, [src]);

  if (!actualSrc || imageError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <Image className="w-5 h-5 text-gray-400" />
      </div>
    )
  }

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (showHoverPreview) {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        setMousePos({
          x: rect.right + 10, // Position to the right of the thumbnail
          y: rect.top + rect.height / 2 // Center vertically
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
          {/* Hover indicator */}
          {showHoverPreview && imageLoaded && (
            <div className="absolute top-1 left-1 w-3 h-3 bg-blue-500 rounded-full opacity-80 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          )}
        </>
      )}

      {/* Hover Preview Portal */}
      {showHoverPreview && isHovered && actualSrc && imageLoaded && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-300 p-6 max-w-sm transition-all duration-200 ease-out scale-100 opacity-100">
            {/* Arrow pointing to the thumbnail */}
            <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[12px] border-r-white"></div>
            <div className="absolute right-full top-1/2 transform -translate-y-1/2 translate-x-[1px] w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[12px] border-r-gray-300"></div>

            <div className="space-y-4">
              <div className="w-80 h-80 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                <img
                  src={actualSrc}
                  alt={alt}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900 mb-1">
                  {alt}
                </div>
                <div className="text-xs text-gray-500">
                  Preview Gambar Produk
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function ProdukTable({ onView, onEdit }: Props) {
  const { items, loading, hasNext, loadNext, loadFirst, deleteProduk } = useProdukStore()
  const page = useProdukStore((s) => s.page)
  const search = useProdukStore((s) => s.search)
  const filters = useProdukStore((s) => s.filters)
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    loadFirst()
  }, [loadFirst])

  // Reset scroll position when a new search/filter starts (page reset to 1)
  useEffect(() => {
    if (page === 1) {
      const el = scrollerRef.current
      if (el) el.scrollTop = 0
    }
  }, [page])

  // Infinite scroll handler
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const onScroll = () => {
      if (!el) return
      const threshold = 72 // px from bottom
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) {
        if (hasNext && !loading) loadNext()
      }
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [hasNext, loading, loadNext])

  const displayItems = useMemo(() => {
    const s = (search || '').trim().toLowerCase()
    return items.filter((p) => {
      if (s) {
        const hay = `${p.nama ?? ''} ${(p.sku ?? '').toString()}`.toLowerCase()
        if (!hay.includes(s)) return false
      }
      if (filters.kategoriFilter && p.kategori?.nama !== filters.kategoriFilter) return false
      if (filters.brandFilter && p.brand?.nama !== filters.brandFilter) return false
      if (filters.supplierFilter && p.supplier?.nama !== filters.supplierFilter) return false
      return true
    })
  }, [items, search, filters])

  const SkeletonRows = useMemo(() => (
    <tbody>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-3"><div className="w-10 h-10 bg-gray-200 rounded-lg" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-40" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-24" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-28" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-28" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-28" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-20" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-16" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-32" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-32" /></td>
          <td className="px-4 py-3"><div className="h-6 bg-gray-200 rounded w-20" /></td>
          <td className="px-4 py-3"><div className="h-8 bg-gray-200 rounded w-28" /></td>
        </tr>
      ))}
    </tbody>
  ), [])

  const onDelete = async (p: UIProduk) => {
    if (!confirm(`Hapus produk "${p.nama}"?`)) return
    await deleteProduk(p.id)
  }

  return (
    <Card className="w-full h-full flex flex-col min-h-0">
      <CardContent className="p-0 flex-1 flex flex-col min-h-0 overflow-hidden">
        <div
          ref={scrollerRef}
          className="flex-1 overflow-auto scrollbar-thin table-scroll-container rounded-md border"
        >
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white border-b shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-3 font-medium w-16">Gambar</th>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Kode</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium">Satuan</th>
                <th className="px-4 py-3 font-medium">Stok</th>
                <th className="px-4 py-3 font-medium">Harga Beli</th>
                <th className="px-4 py-3 font-medium">Harga Jual</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((p) => {
                const hargaBeli = p.hargaBeli ?? 0
                const hargaJual = p.harga ?? 0

                return (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden relative">
                        <ProductImage
                          src={p.gambar_url}
                          alt={p.nama}
                          className="w-full h-full rounded-lg"
                          showHoverPreview={true}
                        />
                        {/* Debug - show if gambar_url exists */}
                        {p.gambar_url && (
                          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full" title={p.gambar_url}></div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{p.nama}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.sku ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{p.kategori?.nama ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{p.brand?.nama ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{p.supplier?.nama ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{p.satuan ?? 'pcs'}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{p.stok ?? 0}</td>
                    <td className="px-4 py-3 text-gray-900">{formatCurrency(hargaBeli)}</td>
                    <td className="px-4 py-3 text-gray-900">{formatCurrency(hargaJual)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        p.status === 'aktif'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {p.status ?? 'aktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onView(p)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onEdit(p)} className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDelete(p)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>

            {loading && items.length === 0 ? SkeletonRows : null}
          </table>
          
          {/* Lazy-loading indicator - positioned outside scroll area */}
          {loading && items.length > 0 && (
            <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 to-transparent h-12 flex items-end justify-center pb-2 border-t">
              <span className="text-xs text-gray-500">Memuat data…</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}
