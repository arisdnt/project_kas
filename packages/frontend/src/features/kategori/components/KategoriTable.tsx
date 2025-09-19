import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { ActionButton } from '@/core/components/ui/action-button'
import { DeleteConfirmationDialog } from '@/core/components/ui/delete-confirmation-dialog'
import { useKategoriStore } from '@/features/kategori/store/kategoriStore'
import { UIKategori } from '@/features/kategori/types/kategori'
import { Image } from 'lucide-react'
import { useAuthStore } from '@/core/store/authStore'
import { useToast } from '@/core/hooks/use-toast'

type Props = {
  onView: (k: UIKategori) => void
  onEdit: (k: UIKategori) => void
}

// Helper function to convert MinIO URL to accessible URL
async function convertMinioUrl(minioUrl: string | null | undefined): Promise<string | null> {
  if (!minioUrl || !minioUrl.startsWith('minio://')) {
    return minioUrl || null;
  }

  try {
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

// Component untuk menampilkan gambar kategori dengan fallback dan hover preview
function CategoryImage({ src, alt, className = "", showHoverPreview = false }: { src?: string; alt: string; className?: string; showHoverPreview?: boolean }) {
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
          x: rect.right + 10,
          y: rect.top + rect.height / 2
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
                  Preview Gambar Kategori
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function KategoriTable({ onView, onEdit }: Props) {
  const { items, loading, hasNext, loadNext, loadFirst, deleteKategori } = useKategoriStore()
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const { toast } = useToast()

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    kategori: UIKategori | null
    loading: boolean
  }>({
    open: false,
    kategori: null,
    loading: false
  })

  useEffect(() => {
    loadFirst()
  }, [loadFirst])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const onScroll = () => {
      if (!el) return
      const threshold = 72
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) {
        if (hasNext && !loading) loadNext()
      }
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [hasNext, loading, loadNext])

  const SkeletonRows = useMemo(() => (
    <tbody>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-3"><div className="w-10 h-10 bg-gray-200 rounded-lg" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-48" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-32" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-12" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-16" /></td>
          <td className="px-4 py-3"><div className="h-5 bg-gray-200 rounded w-16" /></td>
          <td className="px-4 py-3"><div className="h-8 bg-gray-200 rounded w-32" /></td>
        </tr>
      ))}
    </tbody>
  ), [])

  const openDeleteDialog = (kategori: UIKategori) => {
    setDeleteDialog({
      open: true,
      kategori,
      loading: false
    })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      kategori: null,
      loading: false
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.kategori) return

    setDeleteDialog(prev => ({ ...prev, loading: true }))

    try {
      await deleteKategori(deleteDialog.kategori.id)
      toast({
        title: 'Kategori dihapus',
        description: `Kategori "${deleteDialog.kategori.nama}" berhasil dihapus.`
      })
      closeDeleteDialog()
    } catch (error: any) {
      toast({
        title: 'Gagal menghapus kategori',
        description: error?.message || 'Terjadi kesalahan saat menghapus kategori.'
      })
      setDeleteDialog(prev => ({ ...prev, loading: false }))
    }
  }

  return (
    <Card className="w-full h-full flex flex-col min-h-0">
      <CardContent className="p-0 flex-1 flex flex-col min-h-0 overflow-hidden">
        <div ref={scrollerRef} className="flex-1 overflow-auto scrollbar-thin table-scroll-container rounded-md border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white border-b shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-3 font-medium w-16">Gambar</th>
                <th className="px-4 py-3 font-medium">Nama Kategori</th>
                <th className="px-4 py-3 font-medium">Deskripsi</th>
                <th className="px-4 py-3 font-medium">Urutan</th>
                <th className="px-4 py-3 font-medium">Total Produk</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((k) => (
                <tr key={k.id} className="border-b last:border-0 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden relative">
                      <CategoryImage
                        src={k.icon_url}
                        alt={k.nama}
                        className="w-full h-full rounded-lg"
                        showHoverPreview={true}
                      />
                      {/* Debug - show if icon_url exists */}
                      {k.icon_url && (
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full" title={k.icon_url}></div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{k.nama}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {k.deskripsi || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{k.urutan}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{k.jumlah_produk}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={k.status === 'aktif' ? 'default' : 'secondary'}>
                      {k.status === 'aktif' ? 'Aktif' : 'Non-aktif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <ActionButton
                      onView={() => onView(k)}
                      onEdit={() => onEdit(k)}
                      onDelete={() => openDeleteDialog(k)}
                      viewLabel="Lihat Detail Kategori"
                      editLabel="Edit Kategori"
                      deleteLabel="Hapus Kategori"
                    />
                  </td>
                </tr>
              ))}
            </tbody>

            {loading && items.length === 0 ? SkeletonRows : null}
          </table>

          {loading && items.length > 0 && (
            <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 to-transparent h-12 flex items-end justify-center pb-2 border-t">
              <span className="text-xs text-gray-500">Memuat data…</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={closeDeleteDialog}
        title="Hapus Kategori"
        description="Apakah Anda yakin ingin menghapus kategori ini? Semua produk dalam kategori ini akan terpengaruh."
        itemName={deleteDialog.kategori?.nama}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteDialog.loading}
        confirmText="Hapus Kategori"
      />
    </Card>
  )
}

