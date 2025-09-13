import { useMemo, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { MutasiStokToolbar } from '@/features/mutasi-stok/components/MutasiStokToolbar'
import { MutasiStokTable } from '@/features/mutasi-stok/components/MutasiStokTable'
import { useMutasiStokStore, UIMutasiStok, MutasiStokFormData } from '@/features/mutasi-stok/store/mutasiStokStore'
import { ProductDetailSidebar, Product } from '@/core/components/ui/product-detail-sidebar'
import { Button } from '@/core/components/ui/button'
import { useToast } from '@/core/hooks/use-toast'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/core/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select'

export function MutasiStokPage() {
  const { createMutasiStok, updateMutasiStok, deleteMutasiStok } = useMutasiStokStore()
  const { toast } = useToast()

  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState<UIMutasiStok | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Form states
  const [formData, setFormData] = useState({
    id_produk: '',
    jenis_mutasi: 'masuk' as 'masuk' | 'keluar',
    jumlah: '',
    keterangan: ''
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

  const handleCreate = async () => {
    if (!formData.id_produk || !formData.jumlah) {
      toast({ title: 'Form tidak lengkap', description: 'Silakan isi semua field yang required' })
      return
    }

    setSaving(true)
    try {
      await createMutasiStok({
        id_produk: parseInt(formData.id_produk),
        jenis_mutasi: formData.jenis_mutasi,
        jumlah: parseInt(formData.jumlah),
        keterangan: formData.keterangan || undefined,
        tanggal_mutasi: new Date().toISOString().split('T')[0]
      })
      toast({ title: 'Mutasi stok dibuat' })
      setCreateOpen(false)
      setFormData({ id_produk: '', jenis_mutasi: 'masuk', jumlah: '', keterangan: '' })
    } catch (e: any) {
      toast({ title: 'Gagal membuat', description: e?.message || 'Terjadi kesalahan' })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!selected || !formData.jumlah) return

    setSaving(true)
    try {
      await updateMutasiStok(selected.id, {
        jenis_mutasi: formData.jenis_mutasi,
        jumlah: parseInt(formData.jumlah),
        keterangan: formData.keterangan || undefined
      })
      toast({ title: 'Mutasi stok diperbarui' })
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

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Mutasi Stok Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              <Label htmlFor="jenis_mutasi">Jenis Mutasi</Label>
              <Select
                value={formData.jenis_mutasi}
                onValueChange={(value: 'masuk' | 'keluar') => 
                  setFormData(prev => ({ ...prev, jenis_mutasi: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis mutasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masuk">Stok Masuk</SelectItem>
                  <SelectItem value="keluar">Stok Keluar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jumlah">Jumlah</Label>
              <Input
                id="jumlah"
                type="number"
                placeholder="Masukkan jumlah mutasi"
                value={formData.jumlah}
                onChange={(e) => setFormData(prev => ({ ...prev, jumlah: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Input
                id="keterangan"
                placeholder="Keterangan opsional"
                value={formData.keterangan}
                onChange={(e) => setFormData(prev => ({ ...prev, keterangan: e.target.value }))}
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
          setFormData({ id_produk: '', jenis_mutasi: 'masuk', jumlah: '', keterangan: '' })
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Mutasi Stok</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Produk</Label>
              <div className="p-2 bg-gray-50 rounded text-sm">
                {selected?.nama_produk}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_jenis_mutasi">Jenis Mutasi</Label>
              <Select
                value={formData.jenis_mutasi}
                onValueChange={(value: 'masuk' | 'keluar') => 
                  setFormData(prev => ({ ...prev, jenis_mutasi: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis mutasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masuk">Stok Masuk</SelectItem>
                  <SelectItem value="keluar">Stok Keluar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_jumlah">Jumlah</Label>
              <Input
                id="edit_jumlah"
                type="number"
                placeholder="Masukkan jumlah mutasi"
                value={formData.jumlah}
                onChange={(e) => setFormData(prev => ({ ...prev, jumlah: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_keterangan">Keterangan</Label>
              <Input
                id="edit_keterangan"
                placeholder="Keterangan opsional"
                value={formData.keterangan}
                onChange={(e) => setFormData(prev => ({ ...prev, keterangan: e.target.value }))}
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