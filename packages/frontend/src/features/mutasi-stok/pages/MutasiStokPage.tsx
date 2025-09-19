import { useState } from 'react'
import { MutasiStokToolbar } from '@/features/mutasi-stok/components/MutasiStokToolbar'
import { MutasiStokTable } from '@/features/mutasi-stok/components/MutasiStokTable'
import { UIMutasiStok } from '@/features/mutasi-stok/store/mutasiStokStore'
import { useMutasiStokStore } from '@/features/mutasi-stok/store/mutasiStokStore'
import { useToast } from '@/core/hooks/use-toast'
import { useAuthStore } from '@/core/store/authStore'
import { MutasiStokDrawer, MutasiStokDrawerContent, MutasiStokDrawerHeader, MutasiStokDrawerTitle } from '@/features/mutasi-stok/components/MutasiStokDrawer'
import { MutasiStokForm, MutasiStokFormData } from '@/features/mutasi-stok/components/MutasiStokForm'
import { MutasiStokAccessPlaceholder } from '@/features/mutasi-stok/components/MutasiStokAccessPlaceholder'
import { Plus, Edit2, Eye, Package, Hash, Calculator, Calendar, Building, ArrowUp, ArrowDown, FileText } from 'lucide-react'
import { Button } from '@/core/components/ui/button'

export function MutasiStokPage() {
  const { createMutasiStok, updateMutasiStok } = useMutasiStokStore()
  const { toast } = useToast()
  const { user } = useAuthStore()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('create')
  const [selected, setSelected] = useState<UIMutasiStok | null>(null)
  const [editing, setEditing] = useState<MutasiStokFormData | null>(null)
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditing({
      id_produk: '',
      jenis_mutasi: 'masuk',
      jumlah: '',
      keterangan: ''
    })
    setSelected(null)
    setDrawerMode('create')
    setDrawerOpen(true)
  }

  const onView = (m: UIMutasiStok) => {
    setSelected(m)
    setDrawerMode('view')
    setDrawerOpen(true)
  }

  const onEdit = (m: UIMutasiStok) => {
    setSelected(m)
    setEditing({
      id_produk: m.id_produk.toString(),
      jenis_mutasi: m.jenis_mutasi,
      jumlah: m.jumlah.toString(),
      keterangan: m.keterangan || ''
    })
    setDrawerMode('edit')
    setDrawerOpen(true)
  }

  const onSave = async (data: MutasiStokFormData) => {
    setSaving(true)
    try {
      if (selected) {
        await updateMutasiStok(selected.id, {
          jenis_mutasi: data.jenis_mutasi,
          jumlah: parseInt(data.jumlah),
          keterangan: data.keterangan || undefined
        })
        toast({ title: 'Mutasi stok diperbarui' })
      } else {
        await createMutasiStok({
          id_produk: parseInt(data.id_produk),
          jenis_mutasi: data.jenis_mutasi,
          jumlah: parseInt(data.jumlah),
          keterangan: data.keterangan || undefined,
          tanggal_mutasi: new Date().toISOString().split('T')[0]
        })
        toast({ title: 'Mutasi stok dibuat' })
      }
      setDrawerOpen(false)
      setSelected(null)
      setEditing(null)
    } catch (e: any) {
      toast({ title: 'Gagal menyimpan', description: e?.message || 'Terjadi kesalahan' })
      throw e
    } finally {
      setSaving(false)
    }
  }

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

      <MutasiStokDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <MutasiStokDrawerContent className="!w-[40vw] !max-w-none">
          <MutasiStokDrawerHeader className="border-b border-gray-200 pb-4 px-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  drawerMode === 'create' ? 'bg-green-100 text-green-600' :
                  drawerMode === 'edit' ? 'bg-blue-100 text-blue-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {drawerMode === 'create' ? (
                    <Plus className="h-5 w-5" />
                  ) : drawerMode === 'edit' ? (
                    <Edit2 className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </div>
                <MutasiStokDrawerTitle className="text-xl font-semibold">
                  {drawerMode === 'create' ? 'Tambah Mutasi Stok' :
                   drawerMode === 'edit' ? 'Edit Mutasi Stok' : 'Detail Mutasi Stok'}
                </MutasiStokDrawerTitle>
              </div>
            </div>
          </MutasiStokDrawerHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {drawerMode === 'view' && selected ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Produk</p>
                      <p className="text-lg font-semibold">{selected.nama_produk}</p>
                    </div>
                  </div>

                  {selected.sku && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                        <Hash className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">SKU</p>
                        <p className="text-gray-700">{selected.sku}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {selected.kategori && (
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                          <Building className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Kategori</p>
                          <p className="text-gray-700">{selected.kategori.nama}</p>
                        </div>
                      </div>
                    )}
                    {selected.brand && (
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                          <Building className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Brand</p>
                          <p className="text-gray-700">{selected.brand.nama}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
                      <Calculator className="h-4 w-4" />
                      Informasi Mutasi
                    </div>

                    <div className="flex gap-3">
                      <div className={`p-2 rounded-lg ${
                        selected.jenis_mutasi === 'masuk' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {selected.jenis_mutasi === 'masuk' ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Jenis Mutasi</p>
                        <p className={`font-medium ${
                          selected.jenis_mutasi === 'masuk' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {selected.jenis_mutasi === 'masuk' ? 'Stok Masuk' : 'Stok Keluar'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <Package className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Stok Sebelum</p>
                          <p className="text-gray-700 font-medium">{selected.stok_sebelum}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg ${
                          selected.jenis_mutasi === 'masuk' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          <Calculator className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Jumlah</p>
                          <p className={`font-medium ${
                            selected.jenis_mutasi === 'masuk' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {selected.jenis_mutasi === 'masuk' ? '+' : '-'}{selected.jumlah}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                          <Package className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Stok Sesudah</p>
                          <p className="text-gray-700 font-medium">{selected.stok_sesudah}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selected.keterangan && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Keterangan</p>
                        <p className="text-gray-700">{selected.keterangan}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div>
                      <p className="text-sm text-gray-500">Tanggal Mutasi</p>
                      <p className="text-sm font-medium">
                        {selected.tanggal_mutasi ? new Date(selected.tanggal_mutasi).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Dibuat Oleh</p>
                      <p className="text-sm font-medium">{selected.dibuat_oleh || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setDrawerOpen(false)}
                    className="px-5 py-2 h-10 border-gray-300 hover:bg-gray-50"
                  >
                    Tutup
                  </Button>
                  <Button
                    onClick={() => onEdit(selected)}
                    className="px-5 py-2 h-10 bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Mutasi
                  </Button>
                </div>
              </div>
            ) : (
              // Show access placeholder for unauthorized users in create or edit mode
              (drawerMode === 'create' || drawerMode === 'edit') && user?.level !== 3 && user?.level !== 4 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <MutasiStokAccessPlaceholder />
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setDrawerOpen(false)}
                      className="px-6 py-2 h-10 border-gray-300 hover:bg-gray-50"
                    >
                      Tutup
                    </Button>
                  </div>
                </div>
              ) : (
                <MutasiStokForm
                  value={editing}
                  editingMutasiStok={selected}
                  onSave={onSave}
                  onCancel={() => {
                    setDrawerOpen(false)
                    setSelected(null)
                    setEditing(null)
                  }}
                  isLoading={saving}
                  isCreate={drawerMode === 'create'}
                />
              )
            )}
          </div>
        </MutasiStokDrawerContent>
      </MutasiStokDrawer>
    </div>
  )
}