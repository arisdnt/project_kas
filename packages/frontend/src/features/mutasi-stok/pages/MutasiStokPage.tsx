import { useMemo, useState } from 'react'
import { MutasiStokToolbar } from '@/features/mutasi-stok/components/MutasiStokToolbar'
import { MutasiStokTable } from '@/features/mutasi-stok/components/MutasiStokTable'
import { useMutasiStokStore, UIMutasiStok } from '@/features/mutasi-stok/store/mutasiStokStore'
import { ProductDetailSidebar, Product } from '@/core/components/ui/product-detail-sidebar'
import { useToast } from '@/core/hooks/use-toast'
import { MutasiStokEditSidebar, MutasiStokFormData } from '@/features/mutasi-stok/components/MutasiStokEditSidebar'

export function MutasiStokPage() {
  const { createMutasiStok, updateMutasiStok } = useMutasiStokStore()
  const { toast } = useToast()

  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState<UIMutasiStok | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Form states
  const [formData, setFormData] = useState<MutasiStokFormData>({
    id_produk: '', jenis_mutasi: 'masuk', jumlah: '', keterangan: ''
  })

  const openCreate = () => {
    setFormData({ id_produk: '', jenis_mutasi: 'masuk', jumlah: '', keterangan: '' })
    setCreateOpen(true)
  }

  const onView = (p: UIMutasiStok) => {
    setSelected(p)
    setDetailOpen(true)
  }

  const onEdit = (p: UIMutasiStok) => {
    setSelected(p)
    setFormData({
      id_produk: p.id_produk.toString(),
      jenis_mutasi: p.jenis_mutasi,
      jumlah: p.jumlah.toString(),
      keterangan: p.keterangan || ''
    })
    setEditOpen(true)
  }

  const handleCreate = async (data: MutasiStokFormData, scope?: any) => {
    if (!data.id_produk || !data.jumlah) {
      toast({ title: 'Form tidak lengkap', description: 'Silakan isi semua field yang required' })
      return
    }
    setSaving(true)
    try {
      await createMutasiStok({
        id_produk: parseInt(data.id_produk),
        jenis_mutasi: data.jenis_mutasi,
        jumlah: parseInt(data.jumlah),
        keterangan: data.keterangan || undefined,
        tanggal_mutasi: new Date().toISOString().split('T')[0],
        ...scope
      })
      toast({ title: 'Mutasi stok dibuat' })
    } catch (e: any) {
      toast({ title: 'Gagal membuat', description: e?.message || 'Terjadi kesalahan' })
      throw e
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (data: MutasiStokFormData) => {
    if (!selected || !data.jumlah) return
    setSaving(true)
    try {
      await updateMutasiStok(selected.id, {
        jenis_mutasi: data.jenis_mutasi,
        jumlah: parseInt(data.jumlah),
        keterangan: data.keterangan || undefined
      })
      toast({ title: 'Mutasi stok diperbarui' })
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
      stok: selected.stok_sesudah || 0,
      satuan: 'pcs',
      status: 'aktif',
      createdAt: selected.dibuat_pada || new Date().toISOString(),
      updatedAt: selected.diperbarui_pada || new Date().toISOString(),
      createdBy: selected.dibuat_oleh || '—',
      deskripsi: `${selected.jenis_mutasi === 'masuk' ? 'Stok Masuk' : 'Stok Keluar'}: ${selected.jumlah} unit\n${selected.keterangan || ''}`,
    }
  }, [selected])

  return (
    <div className="flex flex-col min-h-0 h-[calc(100vh-4rem-3rem)] py-4 overflow-hidden">
      <div className="mb-3">
        <MutasiStokToolbar onCreate={openCreate} />
      </div>

      <div className="flex-1 min-h-0">
        <MutasiStokTable 
          onView={onView} 
          onEdit={onEdit} 
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

      <MutasiStokEditSidebar
        data={formData}
        open={createOpen}
        onOpenChange={(o) => {
          setCreateOpen(o)
          if (!o) {
            setFormData({ id_produk: '', jenis_mutasi: 'masuk', jumlah: '', keterangan: '' })
          }
        }}
        onSave={async (d, scope) => {
          await handleCreate(d, scope)
          setFormData({ id_produk: '', jenis_mutasi: 'masuk', jumlah: '', keterangan: '' })
        }}
        isLoading={saving}
        isCreate
      />

      <MutasiStokEditSidebar
        data={selected ? formData : null}
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o)
          if (!o) {
            setSelected(null)
            setFormData({ id_produk: '', jenis_mutasi: 'masuk', jumlah: '', keterangan: '' })
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