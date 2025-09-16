import { useEffect, useMemo, useRef } from 'react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { useSupplierStore, UISupplier } from '@/features/supplier/store/supplierStore'
import { Eye, Pencil, Trash2 } from 'lucide-react'

type Props = {
  onView: (s: UISupplier) => void
  onEdit: (s: UISupplier) => void
}

export function SupplierTable({ onView, onEdit }: Props) {
  const { items, loading, hasNext, loadNext, loadFirst, deleteSupplier } = useSupplierStore()
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
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-32" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-48" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-32" /></td>
          <td className="px-4 py-3"><div className="h-5 bg-gray-200 rounded w-16" /></td>
          <td className="px-4 py-3"><div className="h-6 bg-gray-200 rounded w-28" /></td>
        </tr>
      ))}
    </tbody>
  ), [])

  const onDelete = async (s: UISupplier) => {
    if (!confirm(`Hapus supplier \"${s.nama}\"?`)) return
    await deleteSupplier(s.id)
  }

  return (
    <Card className="w-full h-full flex flex-col min-h-0">
      <CardContent className="p-0 flex-1 flex flex-col min-h-0 overflow-hidden">
        <div ref={scrollerRef} className="flex-1 overflow-auto scrollbar-thin table-scroll-container rounded-md border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white border-b shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Kontak</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Telepon</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{s.nama}</div>
                    {s.alamat && <div className="text-xs text-gray-500 line-clamp-1">{s.alamat}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{s.kontak_person || '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{s.email || '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{s.telepon || '-'}</td>
                  <td className="px-4 py-3">
                    {s.status && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        s.status === 'aktif' ? 'bg-green-100 text-green-800' :
                        s.status === 'nonaktif' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onView(s)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(s)} className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(s)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
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

