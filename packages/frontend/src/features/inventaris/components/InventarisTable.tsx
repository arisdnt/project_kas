import { useEffect, useMemo, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { useInventarisStore, UIInventaris } from '../store/inventarisStore'
import { Eye, Pencil, Trash2 } from 'lucide-react'

type Props = {
  onView: (p: UIInventaris) => void
  onEdit: (p: UIInventaris) => void
}

export function InventarisTable({ onView, onEdit }: Props) {
  const { items, loading, hasNext, loadNext, loadFirst, deleteInventaris } = useInventarisStore()
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
        <tr key={`skeleton-${i}`} className="animate-pulse">
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-40" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-24" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-28" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-28" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-28" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-24" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-24" /></td>
          <td className="px-4 py-3"><div className="h-8 bg-gray-200 rounded w-28" /></td>
          <td className="px-4 py-3"><div className="h-8 bg-gray-200 rounded w-28" /></td>
        </tr>
      ))}
    </tbody>
  ), [])

  const onDelete = async (p: UIInventaris) => {
    if (!confirm(`Hapus inventaris "${p.nama_produk}"?`)) return
    await deleteInventaris(p.id)
  }

  const getStockStatus = (jumlah?: number) => {
    if (!jumlah || jumlah <= 0) return { text: 'Habis', color: 'text-red-600 bg-red-50' }
    if (jumlah < 10) return { text: 'Rendah', color: 'text-amber-600 bg-amber-50' }
    return { text: 'Tersedia', color: 'text-green-600 bg-green-50' }
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
                <th className="px-4 py-3 font-medium text-right">Harga Beli</th>
                <th className="px-4 py-3 font-medium text-right">Harga Jual</th>
                <th className="px-4 py-3 font-medium text-right">Stok</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => {
                const stockStatus = getStockStatus(p.jumlah)
                return (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{p.nama_produk}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.sku ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{p.kategori?.nama ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{p.brand?.nama ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{p.supplier?.nama ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-900 text-right">{formatCurrency(p.harga_beli ?? 0)}</td>
                    <td className="px-4 py-3 text-gray-900 text-right">{formatCurrency(p.harga ?? 0)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`text-sm font-medium ${stockStatus.color} px-2 py-1 rounded-full`}>
                          {p.jumlah ?? 0}
                        </span>
                      </div>
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