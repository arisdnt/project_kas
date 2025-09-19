import { useState } from 'react'
import { StokOpnameToolbar } from '@/features/stok-opname/components/StokOpnameToolbar'
import { StokOpnameTable } from '@/features/stok-opname/components/StokOpnameTable'
import { UIStokOpname } from '@/features/stok-opname/store/stokOpnameStore'
import { useStokOpnameStore } from '@/features/stok-opname/store/stokOpnameStore'
import { useToast } from '@/core/hooks/use-toast'
import { useAuthStore } from '@/core/store/authStore'
import { StokOpnameDrawer, StokOpnameDrawerContent, StokOpnameDrawerHeader, StokOpnameDrawerTitle } from '@/features/stok-opname/components/StokOpnameDrawer'
import { StokOpnameForm, StokOpnameFormData } from '@/features/stok-opname/components/StokOpnameForm'
import { StokOpnameAccessPlaceholder } from '@/features/stok-opname/components/StokOpnameAccessPlaceholder'
import { Plus, Edit2, Eye, Package, Hash, Calculator, Calendar, Building, Clock, AlertTriangle, CheckCircle, XCircle, FileText } from 'lucide-react'
import { Button } from '@/core/components/ui/button'

export function StokOpnamePage() {
  const { createStokOpname, updateStokOpname, completeStokOpname, cancelStokOpname } = useStokOpnameStore()
  const { toast } = useToast()
  const { user } = useAuthStore()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('create')
  const [selected, setSelected] = useState<UIStokOpname | null>(null)
  const [editing, setEditing] = useState<StokOpnameFormData | null>(null)
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditing({
      id_produk: '',
      stok_fisik: '',
      catatan: ''
    })
    setSelected(null)
    setDrawerMode('create')
    setDrawerOpen(true)
  }

  const onView = (s: UIStokOpname) => {
    setSelected(s)
    setDrawerMode('view')
    setDrawerOpen(true)
  }

  const onEdit = (s: UIStokOpname) => {
    setSelected(s)
    setEditing({
      id_produk: s.id_produk.toString(),
      stok_fisik: s.stok_fisik?.toString() || '',
      catatan: s.catatan || ''
    })
    setDrawerMode('edit')
    setDrawerOpen(true)
  }

  const onComplete = async (s: UIStokOpname) => {
    try {
      await completeStokOpname(s.id)
      toast({ title: 'Stok opname diselesaikan' })
    } catch (e: any) {
      toast({ title: 'Gagal menyelesaikan', description: e?.message || 'Terjadi kesalahan' })
    }
  }

  const onCancel = async (s: UIStokOpname) => {
    try {
      await cancelStokOpname(s.id)
      toast({ title: 'Stok opname dibatalkan' })
    } catch (e: any) {
      toast({ title: 'Gagal membatalkan', description: e?.message || 'Terjadi kesalahan' })
    }
  }

  const onSave = async (data: StokOpnameFormData) => {
    setSaving(true)
    try {
      if (selected) {
        await updateStokOpname(selected.id, {
          stok_fisik: parseInt(data.stok_fisik),
          catatan: data.catatan || undefined
        })
        toast({ title: 'Stok opname diperbarui' })
      } else {
        await createStokOpname({
          id_produk: parseInt(data.id_produk),
          stok_fisik: parseInt(data.stok_fisik),
          catatan: data.catatan || undefined,
          tanggal_opname: new Date().toISOString().split('T')[0]
        })
        toast({ title: 'Stok opname dibuat' })
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

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      case 'pending':
      default:
        return <Clock className="h-4 w-4" />
    }
  }

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

      <StokOpnameDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <StokOpnameDrawerContent className="!w-[40vw] !max-w-none">
          <StokOpnameDrawerHeader className="border-b border-gray-200 pb-4 px-6 pt-6">
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
                <StokOpnameDrawerTitle className="text-xl font-semibold">
                  {drawerMode === 'create' ? 'Tambah Stok Opname' :
                   drawerMode === 'edit' ? 'Edit Stok Opname' : 'Detail Stok Opname'}
                </StokOpnameDrawerTitle>
              </div>
            </div>
          </StokOpnameDrawerHeader>
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
                      Informasi Stok
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <Package className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Stok Sistem</p>
                          <p className="text-gray-700 font-medium">{selected.stok_sistem || 0}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-green-100 text-green-600">
                          <Package className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Stok Fisik</p>
                          <p className="text-gray-700 font-medium">{selected.stok_fisik || 0}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg ${
                          (selected.selisih || 0) > 0 ? 'bg-green-100 text-green-600' :
                          (selected.selisih || 0) < 0 ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {(selected.selisih || 0) !== 0 ? <AlertTriangle className="h-5 w-5" /> : <Calculator className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Selisih</p>
                          <p className={`font-medium ${
                            (selected.selisih || 0) > 0 ? 'text-green-600' :
                            (selected.selisih || 0) < 0 ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {(selected.selisih || 0) > 0 ? '+' : ''}{selected.selisih || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selected.catatan && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Catatan</p>
                        <p className="text-gray-700">{selected.catatan}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div>
                      <p className="text-sm text-gray-500">Tanggal Opname</p>
                      <p className="text-sm font-medium">
                        {selected.tanggal_opname ? new Date(selected.tanggal_opname).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selected.status)}`}>
                        {getStatusIcon(selected.status)}
                        <span className="ml-1">
                          {selected.status === 'completed' ? 'Selesai' :
                           selected.status === 'cancelled' ? 'Dibatalkan' : 'Pending'}
                        </span>
                      </span>
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
                  {selected.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => onEdit(selected)}
                        className="px-5 py-2 h-10 bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => onComplete(selected)}
                        className="px-5 py-2 h-10 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Selesaikan
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              // Show access placeholder for unauthorized users in create or edit mode
              (drawerMode === 'create' || drawerMode === 'edit') && user?.level !== 3 && user?.level !== 4 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <StokOpnameAccessPlaceholder />
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
                <StokOpnameForm
                  value={editing}
                  editingStokOpname={selected}
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
        </StokOpnameDrawerContent>
      </StokOpnameDrawer>
    </div>
  )
}