import { useMemo, useState } from 'react'
import { StokOpnameToolbar } from '@/features/stok-opname/components/StokOpnameToolbar'
import { StokOpnameTable } from '@/features/stok-opname/components/StokOpnameTable'
import { useStokOpnameStore, UIStokOpname } from '@/features/stok-opname/store/stokOpnameStore'
import { ProductDetailSidebar, Product } from '@/core/components/ui/product-detail-sidebar'
// Removed Button import (no longer used after refactor)
import { useToast } from '@/core/hooks/use-toast'
import { StokOpnameEditSidebar, StokOpnameFormData } from '@/features/stok-opname/components/StokOpnameEditSidebar'

export function StokOpnamePage() {
  const { createStokOpname, updateStokOpname, completeStokOpname, cancelStokOpname } = useStokOpnameStore()
  const { toast } = useToast()

  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState<UIStokOpname | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Form states
  const [formData, setFormData] = useState<StokOpnameFormData>({ id_produk: '', stok_fisik: '', catatan: '' })

  const openCreate = () => {
  setFormData({ id_produk: '', stok_fisik: '', catatan: '' })
    setCreateOpen(true)
  }

  const onView = (p: UIStokOpname) => {
    setSelected(p)
    setDetailOpen(true)
  }

  const onEdit = (p: UIStokOpname) => {
    setSelected(p)
    setFormData({
      id_produk: p.id_produk.toString(),
      stok_fisik: p.stok_fisik?.toString() || '',
      catatan: p.catatan || ''
    })
    setEditOpen(true)
  }

  const onComplete = async (p: UIStokOpname) => {
    try {
      await completeStokOpname(p.id)
      toast({ title: 'Stok opname diselesaikan' })
    } catch (e: any) {
      toast({ title: 'Gagal menyelesaikan', description: e?.message || 'Terjadi kesalahan' })
    }
  }

  const onCancel = async (p: UIStokOpname) => {
    try {
      await cancelStokOpname(p.id)
      toast({ title: 'Stok opname dibatalkan' })
    } catch (e: any) {
      toast({ title: 'Gagal membatalkan', description: e?.message || 'Terjadi kesalahan' })
    }
  }

  const handleCreate = async (data: StokOpnameFormData, scope?: any) => {
    if (!data.id_produk || !data.stok_fisik) {
      toast({ title: 'Form tidak lengkap', description: 'Silakan isi semua field yang required' })
      return
    }
    setSaving(true)
    try {
      await createStokOpname({
        id_produk: parseInt(data.id_produk),
        stok_fisik: parseInt(data.stok_fisik),
        catatan: data.catatan || undefined,
        tanggal_opname: new Date().toISOString().split('T')[0],
        ...scope
      })
      toast({ title: 'Stok opname dibuat' })
    } catch (e: any) {
      toast({ title: 'Gagal membuat', description: e?.message || 'Terjadi kesalahan' })
      throw e
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (data: StokOpnameFormData) => {
    if (!selected || !data.stok_fisik) return
    setSaving(true)
    try {
      await updateStokOpname(selected.id, {
        stok_fisik: parseInt(data.stok_fisik),
        catatan: data.catatan || undefined
      })
      toast({ title: 'Stok opname diperbarui' })
    } catch (e: any) {
      toast({ title: 'Gagal memperbarui', description: e?.message || 'Terjadi kesalahan' })
      throw e
    } finally {
      setSaving(false)
      setEditOpen(false)
      setSelected(null)
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
      hargaBeli: 0,
      hargaJual: 0,
      stok: selected.stok_sistem || 0,
      satuan: 'pcs',
      status: 'aktif',
      createdAt: selected.dibuat_pada || new Date().toISOString(),
      updatedAt: selected.diperbarui_pada || new Date().toISOString(),
      createdBy: selected.dibuat_oleh || '—',
      deskripsi: selected.catatan || '',
    }
  }, [selected])

  return (
    <div className="flex flex-col min-h-0 h-[calc(100vh-4rem-3rem)] py-4 overflow-hidden">
      <div className="mb-3">
        <StokOpnameToolbar onCreate={openCreate} />
      </div>

      <div className="flex-1 min-h-0">
        <StokOpnameTable 
          onView={onView} 
          onEdit={onEdit} 
          onComplete={onComplete} 
          onCancel={onCancel} 
        />
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

      <StokOpnameEditSidebar
        data={formData}
        open={createOpen}
        onOpenChange={(o) => {
          setCreateOpen(o)
          if (!o) {
            setFormData({ id_produk: '', stok_fisik: '', catatan: '' })
          }
        }}
        onSave={async (d, scope) => {
          await handleCreate(d, scope)
          setFormData({ id_produk: '', stok_fisik: '', catatan: '' })
        }}
        isLoading={saving}
        isCreate
      />

      <StokOpnameEditSidebar
        data={selected ? formData : null}
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o)
          if (!o) {
            setSelected(null)
            setFormData({ id_produk: '', stok_fisik: '', catatan: '' })
          }
        }}
        onSave={async (d) => {
          await handleUpdate(d)
        }}
        isLoading={saving}
      />
    </div>
  )
}