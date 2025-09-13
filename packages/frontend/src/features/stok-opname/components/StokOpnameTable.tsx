import { useEffect, useMemo, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { useStokOpnameStore, UIStokOpname } from '../store/stokOpnameStore'
import { Eye, Pencil, Trash2, Check, X, FileText } from 'lucide-react'

type Props = {
  onView: (p: UIStokOpname) => void
  onEdit: (p: UIStokOpname) => void
  onComplete: (p: UIStokOpname) => void
  onCancel: (p: UIStokOpname) => void
}

export function StokOpnameTable({ onView, onEdit, onComplete, onCancel }: Props) {
  const { items, loading, hasNext, loadNext, loadFirst, deleteStokOpname } = useStokOpnameStore()
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    loadFirst()
  }, [loadFirst])

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

  const SkeletonRows = useMemo(() => (
    <tbody>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-40" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-24" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-28" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-28" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-20" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-20" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-20" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-24" /></td>
          <td className="px-4 py-3"><div className="h-8 bg-gray-200 rounded w-32" /></td>
        </tr>
      ))}
    </tbody>
  ), [])

  const onDelete = async (p: UIStokOpname) => {
    if (!confirm(`Hapus stok opname "${p.nama_produk}"?`)) return
    await deleteStokOpname(p.id)
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return { text: 'Selesai', color: 'text-green-600 bg-green-50' }
      case 'cancelled':
        return { text: 'Dibatalkan', color: 'text-red-600 bg-red-50' }
      default:
        return { text: 'Pending', color: 'text-yellow-600 bg-yellow-50' }
    }
  }

  const getSelisihBadge = (selisih?: number) => {
    if (!selisih) return { text: '0', color: 'text-gray-600 bg-gray-50' }
    if (selisih > 0) return { text: `+${selisih}`, color: 'text-green-600 bg-green-50' }
    if (selisih < 0) return { text: `${selisih}`, color: 'text-red-600 bg-red-50' }
    return { text: '0', color: 'text-gray-600 bg-gray-50' }
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
                <th className="px-4 py-3 font-medium">Nama Produk</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium text-right">Stok Sistem</th>
                <th className="px-4 py-3 font-medium text-right">Stok Fisik</th>
                <th className="px-4 py-3 font-medium text-right">Selisih</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => {
                const statusBadge = getStatusBadge(p.status)
                const selisihBadge = getSelisihBadge(p.selisih)
                return (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{p.nama_produk}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.sku ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{p.kategori?.nama ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{p.brand?.nama ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{p.supplier?.nama ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-900 text-right">{p.stok_sistem ?? 0}</td>
                    <td className="px-4 py-3 text-gray-900 text-right">{p.stok_fisik ?? 0}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-medium ${selisihBadge.color} px-2 py-1 rounded-full`}>
                        {selisihBadge.text}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${statusBadge.color} px-2 py-1 rounded-full`}>
                        {statusBadge.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {p.tanggal_opname ? new Date(p.tanggal_opname).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onView(p)} 
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onEdit(p)} 
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          title="Edit"
                          disabled={p.status === 'completed' || p.status === 'cancelled'}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {p.status === 'pending' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => onComplete(p)} 
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Selesaikan"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => onCancel(p)} 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Batalkan"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onDelete(p)} 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Hapus"
                        >
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