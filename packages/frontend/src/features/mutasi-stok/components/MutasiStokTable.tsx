import { useEffect, useMemo, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { useMutasiStokStore, UIMutasiStok } from '../store/mutasiStokStore'
import { Eye, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react'

type Props = {
  onView: (p: UIMutasiStok) => void
  onEdit: (p: UIMutasiStok) => void
}

export function MutasiStokTable({ onView, onEdit }: Props) {
  const { items, loading, hasNext, loadNext, loadFirst, deleteMutasiStok } = useMutasiStokStore()
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
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-24" /></td>
          <td className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-24" /></td>
          <td className="px-4 py-3"><div className="h-8 bg-gray-200 rounded w-32" /></td>
        </tr>
      ))}
    </tbody>
  ), [])

  const onDelete = async (p: UIMutasiStok) => {
    if (!confirm(`Hapus mutasi stok "${p.nama_produk}"?`)) return
    await deleteMutasiStok(p.id)
  }

  const getJenisMutasiBadge = (jenis: 'masuk' | 'keluar') => {
    switch (jenis) {
      case 'masuk':
        return { 
          text: 'Masuk', 
          color: 'text-green-600 bg-green-50',
          icon: TrendingUp
        }
      case 'keluar':
        return { 
          text: 'Keluar', 
          color: 'text-red-600 bg-red-50',
          icon: TrendingDown
        }
    }
  }

  const getJumlahBadge = (jenis: 'masuk' | 'keluar', jumlah: number) => {
    const color = jenis === 'masuk' ? 'text-green-600' : 'text-red-600'
    const prefix = jenis === 'masuk' ? '+' : '-'
    return {
      text: `${prefix}${jumlah}`,
      color
    }
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
                <th className="px-4 py-3 font-medium">Jenis Mutasi</th>
                <th className="px-4 py-3 font-medium text-right">Jumlah</th>
                <th className="px-4 py-3 font-medium text-right">Stok Sebelum</th>
                <th className="px-4 py-3 font-medium text-right">Stok Sesudah</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => {
                const jenisBadge = getJenisMutasiBadge(p.jenis_mutasi)
                const jumlahBadge = getJumlahBadge(p.jenis_mutasi, p.jumlah)
                const IconComponent = jenisBadge.icon
                return (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{p.nama_produk}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.sku ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{p.kategori?.nama ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{p.brand?.nama ?? '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${jenisBadge.color} px-2 py-1 rounded-full inline-flex items-center gap-1`}>
                        <IconComponent className="h-3 w-3" />
                        {jenisBadge.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900 text-right font-medium">
                      <span className={jumlahBadge.color}>
                        {jumlahBadge.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900 text-right">{p.stok_sebelum}</td>
                    <td className="px-4 py-3 text-gray-900 text-right font-medium">{p.stok_sesudah}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {p.tanggal_mutasi ? new Date(p.tanggal_mutasi).toLocaleDateString('id-ID') : '-'}
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
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
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