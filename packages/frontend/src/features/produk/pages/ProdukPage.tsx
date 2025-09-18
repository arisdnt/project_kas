import { useMemo, useState, useEffect, useCallback } from 'react'
import { ProdukToolbar } from '@/features/produk/components/ProdukToolbar'
import { ProdukTable } from '@/features/produk/components/ProdukTable'
import { useProdukStore, UIProduk } from '@/features/produk/store/produkStore'
import { ProductDetailSidebar, Product } from '@/core/components/ui/product-detail-sidebar'
import { ProductEditSidebar, ProductFormData } from '@/core/components/ui/product-edit-sidebar'
import { useProdukRealtime } from '@/features/produk/hooks/useProdukRealtime'
import { useToast } from '@/core/hooks/use-toast'
import { useDataRefresh } from '@/core/hooks/useDataRefresh'

export function ProdukPage() {
  const { createProduk, updateProduk, loadMasterData } = useProdukStore()
  const { toast } = useToast()

  // Realtime subscription (no-ops if server doesn't emit yet)
  useProdukRealtime()

  // Refresh handler untuk navbar refresh button
  const handleRefresh = useCallback(async () => {
    await loadMasterData()
  }, [loadMasterData])

  // Hook untuk menangani refresh data
  useDataRefresh(handleRefresh)

  // Load master data on component mount
  useEffect(() => {
    loadMasterData()
  }, [loadMasterData])

  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState<UIProduk | null>(null)
  const [editing, setEditing] = useState<ProductFormData | null>(null)
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditing({
      nama: '', kode: '', kategori: '', kategoriId: '', brand: '', brandId: '',
      hargaBeli: 0, hargaJual: 0, stok: 0, satuan: 'pcs', deskripsi: '', status: 'aktif',
    })
    setEditOpen(true)
  }

  const onView = (p: UIProduk) => {
    setSelected(p)
    setDetailOpen(true)
  }

  const onEdit = (p: UIProduk) => {
    setSelected(p)
    setEditing({
      nama: p.nama,
      kode: p.sku || '',
      kategori: p.kategori?.nama || '',
      kategoriId: p.kategori?.id || '',
      brand: p.brand?.nama || '',
      brandId: p.brand?.id || '',
      hargaBeli: p.hargaBeli || 0,
      hargaJual: p.harga || 0,
      stok: p.stok || 0,
      satuan: p.satuan || 'pcs',
      deskripsi: p.deskripsi || '',
      status: 'aktif',
    })
    setEditOpen(true)
  }

  const onSave = async (data: ProductFormData) => {
    setSaving(true)
    try {
      if (selected) {
        await updateProduk(selected.id, data)
        toast({ title: 'Produk diperbarui' })
      } else {
        await createProduk(data)
        toast({ title: 'Produk dibuat' })
      }
    } catch (e: any) {
      toast({ title: 'Gagal menyimpan', description: e?.message || 'Terjadi kesalahan' })
      throw e
    } finally {
      setSaving(false)
    }
  }

  const productDetailData: Product | null = useMemo(() => {
    if (!selected) return null
    return {
      id: String(selected.id),
      nama: selected.nama,
      kode: selected.sku || '-',
      kategori: selected.kategori?.nama || '-',
      brand: selected.brand?.nama || '-',
      hargaBeli: selected.hargaBeli || 0,
      hargaJual: selected.harga || 0,
      stok: selected.stok || 0,
      satuan: 'pcs',
      status: 'aktif',
      createdAt: selected.dibuatPada || new Date().toISOString(),
      updatedAt: selected.diperbaruiPada || new Date().toISOString(),
      createdBy: '—',
      deskripsi: '',
    }
  }, [selected])

  return (
    <div className="flex flex-col min-h-0 h-[calc(100vh-4rem-3rem)] py-4 overflow-hidden">
      <div className="mb-3">
        <ProdukToolbar onCreate={openCreate} />
      </div>

      <div className="flex-1 min-h-0">
        <ProdukTable onView={onView} onEdit={onEdit} />
      </div>

      {/* Detail Sidebar */}
      <ProductDetailSidebar
        product={productDetailData}
        open={detailOpen}
        onOpenChange={(o) => setDetailOpen(o)}
        onEdit={() => {
          setDetailOpen(false)
          if (selected) onEdit(selected)
        }}
      />

      {/* Edit/Create Sidebar */}
      <ProductEditSidebar
        product={editing}
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o)
          if (!o) {
            setSelected(null)
            setEditing(null)
          }
        }}
        onSave={onSave}
        isLoading={saving}
        isCreate={!selected}
      />
    </div>
  )
}
