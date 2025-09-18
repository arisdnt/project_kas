import { useMemo, useState } from 'react'
import { StokOpnameToolbar } from '@/features/stok-opname/components/StokOpnameToolbar'
import { StokOpnameTable } from '@/features/stok-opname/components/StokOpnameTable'
import { useStokOpnameStore, UIStokOpname } from '@/features/stok-opname/store/stokOpnameStore'
import { ProductDetailSidebar, Product } from '@/core/components/ui/product-detail-sidebar'
import { Button } from '@/core/components/ui/button'
import { useToast } from '@/core/hooks/use-toast'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/core/components/ui/dialog'
import { ScopeSelector } from '@/core/components/ui/scope-selector'
import { Separator } from '@/core/components/ui/separator'

export function StokOpnamePage() {
  const { createStokOpname, updateStokOpname, completeStokOpname, cancelStokOpname } = useStokOpnameStore()
  const { toast } = useToast()

  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState<UIStokOpname | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Form states
  const [formData, setFormData] = useState({
    id_produk: '',
    stok_fisik: '',
    catatan: ''
  })
  const [scopeData, setScopeData] = useState<{
    targetTenantId?: string
    targetStoreId?: string
    applyToAllTenants?: boolean
    applyToAllStores?: boolean
  }>({})

  const openCreate = () => {
    setFormData({ id_produk: '', stok_fisik: '', catatan: '' })
    setScopeData({})
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

  const handleCreate = async () => {
    if (!formData.id_produk || !formData.stok_fisik) {
      toast({ title: 'Form tidak lengkap', description: 'Silakan isi semua field yang required' })
      return
    }

    setSaving(true)
    try {
      await createStokOpname({
        id_produk: parseInt(formData.id_produk),
        stok_fisik: parseInt(formData.stok_fisik),
        catatan: formData.catatan || undefined,
        tanggal_opname: new Date().toISOString().split('T')[0],
        ...scopeData
      })
      toast({ title: 'Stok opname dibuat' })
      setCreateOpen(false)
      setFormData({ id_produk: '', stok_fisik: '', catatan: '' })
      setScopeData({})
    } catch (e: any) {
      toast({ title: 'Gagal membuat', description: e?.message || 'Terjadi kesalahan' })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!selected || !formData.stok_fisik) return

    setSaving(true)
    try {
      await updateStokOpname(selected.id, {
        stok_fisik: parseInt(formData.stok_fisik),
        catatan: formData.catatan || undefined
      })
      toast({ title: 'Stok opname diperbarui' })
      setEditOpen(false)
      setSelected(null)
    } catch (e: any) {
      toast({ title: 'Gagal memperbarui', description: e?.message || 'Terjadi kesalahan' })
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

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={(o) => {
        setCreateOpen(o)
        if (!o) {
          setFormData({ id_produk: '', stok_fisik: '', catatan: '' })
          setScopeData({})
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Stok Opname Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Scope</h3>
              <ScopeSelector onScopeChange={setScopeData} disabled={saving} compact />
              <Separator />
            </div>
            <div className="space-y-2">
              <Label htmlFor="id_produk">ID Produk</Label>
              <Input
                id="id_produk"
                placeholder="Masukkan ID produk"
                value={formData.id_produk}
                onChange={(e) => setFormData(prev => ({ ...prev, id_produk: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stok_fisik">Stok Fisik</Label>
              <Input
                id="stok_fisik"
                type="number"
                placeholder="Masukkan jumlah stok fisik"
                value={formData.stok_fisik}
                onChange={(e) => setFormData(prev => ({ ...prev, stok_fisik: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catatan">Catatan</Label>
              <Input
                id="catatan"
                placeholder="Catatan opsional"
                value={formData.catatan}
                onChange={(e) => setFormData(prev => ({ ...prev, catatan: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleCreate} 
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setCreateOpen(false)}
                disabled={saving}
              >
                Batal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => {
        setEditOpen(o)
        if (!o) {
          setSelected(null)
          setFormData({ id_produk: '', stok_fisik: '', catatan: '' })
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Stok Opname</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Produk</Label>
              <div className="p-2 bg-gray-50 rounded text-sm">
                {selected?.nama_produk}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_stok_fisik">Stok Fisik</Label>
              <Input
                id="edit_stok_fisik"
                type="number"
                placeholder="Masukkan jumlah stok fisik"
                value={formData.stok_fisik}
                onChange={(e) => setFormData(prev => ({ ...prev, stok_fisik: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_catatan">Catatan</Label>
              <Input
                id="edit_catatan"
                placeholder="Catatan opsional"
                value={formData.catatan}
                onChange={(e) => setFormData(prev => ({ ...prev, catatan: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleUpdate} 
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Menyimpan...' : 'Update'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditOpen(false)}
                disabled={saving}
              >
                Batal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}