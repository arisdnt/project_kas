import { useEffect, useMemo, useRef } from 'react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { usePelangganStore } from '@/features/pelanggan/store/pelangganStore'

type Props = {
  onView: (p: any) => void
  onEdit: (p: any) => void
}

export function PelangganTable({ onView, onEdit }: Props) {
  const { items, loading, hasNext, loadNext, loadFirst, deletePelanggan } = usePelangganStore()
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

  const onDelete = async (p: any) => {
    if (!confirm(`Hapus pelanggan "${p.nama}"?`)) return
    await deletePelanggan(p.id)
  }

  const SkeletonRows = useMemo(() => (
    <tbody>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-40" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-32" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-56" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-36" /></td>
          <td className="px-4 py-3"><div className="h-5 bg-gray-200 rounded w-16" /></td>
          <td className="px-4 py-3"><div className="h-5 bg-gray-200 rounded w-20" /></td>
          <td className="px-4 py-3"><div className="h-5 bg-gray-200 rounded w-16" /></td>
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
                <th className="px-4 py-3 font-medium">Kode</th>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Telepon</th>
                <th className="px-4 py-3 font-medium">Tipe</th>
                <th className="px-4 py-3 font-medium">Poin</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="font-mono text-sm text-gray-600">{c.kode}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{c.nama}</div>
                    {c.alamat && <div className="text-xs text-gray-500 line-clamp-1">{c.alamat}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{c.email || '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{c.telepon || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      c.tipe === 'vip' ? 'bg-purple-100 text-purple-800' :
                      c.tipe === 'member' ? 'bg-blue-100 text-blue-800' :
                      c.tipe === 'wholesale' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {c.tipe.charAt(0).toUpperCase() + c.tipe.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{c.saldo_poin.toLocaleString()}</div>
                    {c.diskon_persen > 0 && (
                      <div className="text-xs text-green-600">Diskon {c.diskon_persen}%</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      c.status === 'aktif' ? 'bg-green-100 text-green-800' :
                      c.status === 'nonaktif' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onView(c)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(c)} className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(c)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
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

