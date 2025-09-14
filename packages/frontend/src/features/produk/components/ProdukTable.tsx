import { useEffect, useMemo, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { useProdukStore, UIProduk } from '@/features/produk/store/produkStore'
import { Eye, Pencil, Trash2 } from 'lucide-react'

type Props = {
  onView: (p: UIProduk) => void
  onEdit: (p: UIProduk) => void
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
      if (filters.kategoriId && p.kategori?.id && filters.kategoriId !== p.kategori.id) return false
      if (filters.brandId && p.brand?.id && filters.brandId !== p.brand.id) return false
      if (filters.supplierId && p.supplier?.id && filters.supplierId !== p.supplier.id) return false
      return true
    })
  }, [items, search, filters])

  const SkeletonRows = useMemo(() => (
    <tbody>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-40" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-24" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-28" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-28" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-32" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-32" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-24" /></td>
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
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium">Harga Beli</th>
                <th className="px-4 py-3 font-medium">Harga Jual</th>
                <th className="px-4 py-3 font-medium">Margin</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((p) => {
                const hargaBeli = p.hargaBeli ?? 0
                const hargaJual = p.harga ?? 0
                const selisih = hargaJual - hargaBeli
                const marginPersen = hargaBeli > 0 ? ((selisih / hargaBeli) * 100) : 0
                
                return (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{p.nama}</div>
                      <div className="text-xs text-gray-500">Stok: {p.stok ?? 0}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.sku ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{p.kategori?.nama ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{p.brand?.nama ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-900">{formatCurrency(hargaBeli)}</td>
                    <td className="px-4 py-3 text-gray-900">{formatCurrency(hargaJual)}</td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900">{formatCurrency(selisih)}</div>
                      <div className="text-xs text-gray-500">{marginPersen.toFixed(1)}%</div>
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
