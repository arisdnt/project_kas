import { useMemo, useState } from 'react'
import { PackagePlus } from 'lucide-react'
import { InventarisToolbar } from '@/features/inventaris/components/InventarisToolbar'
import { InventarisTable } from '@/features/inventaris/components/InventarisTable'
import { useInventarisStore, UIInventaris } from '@/features/inventaris/store/inventarisStore'
import { ProductDetailSidebar, Product } from '@/core/components/ui/product-detail-sidebar'
import { ProductEditSidebar, ProductFormData } from '@/core/components/ui/product-edit-sidebar'
import { Button } from '@/core/components/ui/button'
import { useToast } from '@/core/hooks/use-toast'

export function InventarisPage() {
  const { updateInventaris } = useInventarisStore()
  const { toast } = useToast()

  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState<UIInventaris | null>(null)
  const [editing, setEditing] = useState<ProductFormData | null>(null)
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditing({
      nama: '', 
      kode: '', 
      kategori: '', 
      brand: '',
      hargaBeli: 0, 
      hargaJual: 0, 
      stok: 0, 
      satuan: 'pcs', 
      deskripsi: '', 
      status: 'aktif',
    })
    setEditOpen(true)
  }

  const onView = (p: UIInventaris) => {
    setSelected(p)
    setDetailOpen(true)
  }

  const onEdit = (p: UIInventaris) => {
    setSelected(p)
    setEditing({
      nama: p.nama_produk,
      kode: p.sku || '',
      kategori: p.kategori?.nama || '',
      brand: p.brand?.nama || '',
      hargaBeli: p.harga_beli || 0,
      hargaJual: p.harga || 0,
      stok: p.jumlah || 0,
      satuan: 'pcs',
      deskripsi: '',
      status: 'aktif',
    })
    setEditOpen(true)
  }

  const onSave = async (data: ProductFormData) => {
    if (!selected) return
    setSaving(true)
    try {
      await updateInventaris(selected.id, {
        jumlah: Number(data.stok),
        harga: Number(data.hargaJual),
        harga_beli: Number(data.hargaBeli),
      })
      toast({ title: 'Inventaris diperbarui' })
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
      nama: selected.nama_produk,
      kode: selected.sku || '-',
      kategori: selected.kategori?.nama || '-',
      brand: selected.brand?.nama || '-',
      hargaBeli: selected.harga_beli || 0,
      hargaJual: selected.harga || 0,
      stok: selected.jumlah || 0,
      satuan: 'pcs',
      status: 'aktif',
      createdAt: selected.dibuat_pada || new Date().toISOString(),
      updatedAt: selected.diperbarui_pada || new Date().toISOString(),
      createdBy: '—',
      deskripsi: '',
    }
  }, [selected])

  return (
    <div className="flex flex-col min-h-0 h-[calc(100vh-4rem-3rem)] py-4 overflow-hidden">
      <div className="mb-3">
        <InventarisToolbar onCreate={openCreate} />
      </div>

      <div className="flex-1 min-h-0">
        <InventarisTable onView={onView} onEdit={onEdit} />
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
      />
    </div>
  )
}