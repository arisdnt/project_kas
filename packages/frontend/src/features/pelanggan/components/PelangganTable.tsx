import { useEffect, useMemo, useRef } from 'react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Eye, Pencil } from 'lucide-react'
import { usePelangganListStore } from '@/features/pelanggan/store/pelangganListStore'

export function PelangganTable() {
  const { items, loading, hasNext, loadNext, loadFirst } = usePelangganListStore()
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
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-40" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-56" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-36" /></td>
          <td className="px-4 py-3"><div className="h-8 bg-gray-200 rounded w-28" /></td>
        </tr>
      ))}
    </tbody>
  ), [])

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
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Telepon</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{c.nama || '-'}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{c.email || '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{c.telepon || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" disabled>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50" disabled>
                        <Pencil className="h-4 w-4" />
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

