import { useEffect, useMemo, useRef } from 'react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { useBrandStore, UIBrand } from '@/features/brand/store/brandStore'
import { Eye, Pencil, Trash2 } from 'lucide-react'

type Props = {
  onView: (b: UIBrand) => void
  onEdit: (b: UIBrand) => void
}

export function BrandTable({ onView, onEdit }: Props) {
  const { items, loading, hasNext, loadNext, loadFirst, deleteBrand } = useBrandStore()
  const scrollerRef = useRef<HTMLDivElement | null>(null)

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
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-48" /></td>
          <td className="px-4 py-3"><div className="h-8 bg-gray-200 rounded w-28" /></td>
        </tr>
      ))}
    </tbody>
  ), [])

  const onDelete = async (b: UIBrand) => {
    if (!confirm(`Hapus brand "${b.nama}"?`)) return
    await deleteBrand(b.id)
  }

  return (
    <Card className="w-full h-full flex flex-col min-h-0">
      <CardContent className="p-0 flex-1 flex flex-col min-h-0 overflow-hidden">
        <div ref={scrollerRef} className="flex-1 overflow-auto scrollbar-thin table-scroll-container rounded-md border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white border-b shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-3 font-medium">Nama Brand</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id} className="border-b last:border-0 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{b.nama}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onView(b)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(b)} className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(b)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
    </Card>
  )
}

