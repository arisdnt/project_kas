import { useState } from 'react'
import { PelangganTable } from '@/features/pelanggan/components/PelangganTable'
import { UIPelanggan } from '@/features/pelanggan/types/pelanggan'
import { usePelangganStore } from '@/features/pelanggan/store/pelangganStore'
import { useToast } from '@/core/hooks/use-toast'
import { useAuthStore } from '@/core/store/authStore'
import { PelangganDrawer, PelangganDrawerContent, PelangganDrawerHeader, PelangganDrawerTitle } from '@/features/pelanggan/components/PelangganDrawer'
import { PelangganForm, PelangganFormData } from '@/features/pelanggan/components/PelangganForm'
import { PelangganAccessPlaceholder } from '@/features/pelanggan/components/PelangganAccessPlaceholder'
import { Plus, Edit2, Eye, User, Phone, Mail, MapPin, Calendar, Briefcase, CreditCard, DollarSign, Users, Hash } from 'lucide-react'
import { Button } from '@/core/components/ui/button'

export function PelangganPage() {
  const { createPelanggan, updatePelanggan } = usePelangganStore()
  const { toast } = useToast()
  const { user } = useAuthStore()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('create')
  const [selected, setSelected] = useState<UIPelanggan | null>(null)
  const [editing, setEditing] = useState<PelangganFormData | null>(null)
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditing({
      nama: '',
      email: '',
      telepon: '',
      alamat: '',
      tanggal_lahir: '',
      jenis_kelamin: undefined,
      pekerjaan: '',
      tipe: 'reguler',
      diskon_persen: 0,
      limit_kredit: 0
    })
    setSelected(null)
    setDrawerMode('create')
    setDrawerOpen(true)
  }

  const onView = (p: UIPelanggan) => {
    setSelected(p)
    setDrawerMode('view')
    setDrawerOpen(true)
  }

  const onEdit = (p: UIPelanggan) => {
    setSelected(p)
    setEditing({
      nama: p.nama,
      email: p.email,
      telepon: p.telepon,
      alamat: p.alamat,
      tanggal_lahir: p.tanggal_lahir,
      jenis_kelamin: p.jenis_kelamin,
      pekerjaan: p.pekerjaan,
      tipe: p.tipe,
      diskon_persen: p.diskon_persen,
      limit_kredit: p.limit_kredit
    })
    setDrawerMode('edit')
    setDrawerOpen(true)
  }

  const onSave = async (data: PelangganFormData) => {
    setSaving(true)
    try {
      if (selected) {
        await updatePelanggan(selected.id, data)
        toast({ title: 'Pelanggan diperbarui' })
      } else {
        await createPelanggan(data)
        toast({ title: 'Pelanggan dibuat' })
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
      <div className="flex-1 min-h-0">
        <PelangganTable onView={onView} onEdit={onEdit} onCreate={openCreate} />
      </div>

      <PelangganDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <PelangganDrawerContent className="!w-[40vw] !max-w-none">
          <PelangganDrawerHeader className="border-b border-gray-200 pb-4 px-6 pt-6">
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
                <PelangganDrawerTitle className="text-xl font-semibold">
                  {drawerMode === 'create' ? 'Tambah Pelanggan' :
                   drawerMode === 'edit' ? 'Edit Pelanggan' : 'Detail Pelanggan'}
                </PelangganDrawerTitle>
              </div>
            </div>
          </PelangganDrawerHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {drawerMode === 'view' && selected ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="p-2 rounded-lg bg-green-100 text-green-600">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nama Pelanggan</p>
                      <p className="text-lg font-semibold">{selected.nama}</p>
                    </div>
                  </div>

                  {selected.kode && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                        <Hash className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Kode Pelanggan</p>
                        <p className="text-gray-700">{selected.kode}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {selected.email && (
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-gray-700">{selected.email}</p>
                        </div>
                      </div>
                    )}
                    {selected.telepon && (
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-green-100 text-green-600">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Telepon</p>
                          <p className="text-gray-700">{selected.telepon}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Tipe</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          selected.tipe === 'vip' ? 'bg-yellow-100 text-yellow-800' :
                          selected.tipe === 'member' ? 'bg-blue-100 text-blue-800' :
                          selected.tipe === 'wholesale' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selected.tipe.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Saldo Poin</p>
                        <p className="text-gray-700 font-medium">{selected.saldo_poin.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {selected.alamat && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-red-100 text-red-600">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Alamat</p>
                        <p className="text-gray-700">{selected.alamat}</p>
                      </div>
                    </div>
                  )}

                  {(selected.tanggal_lahir || selected.jenis_kelamin || selected.pekerjaan) && (
                    <div className="grid grid-cols-1 gap-4">
                      {selected.tanggal_lahir && (
                        <div className="flex gap-3">
                          <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-500">Tanggal Lahir</p>
                            <p className="text-gray-700">{new Date(selected.tanggal_lahir).toLocaleDateString('id-ID')}</p>
                          </div>
                        </div>
                      )}
                      {selected.pekerjaan && (
                        <div className="flex gap-3">
                          <div className="p-2 rounded-lg bg-teal-100 text-teal-600">
                            <Briefcase className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-500">Pekerjaan</p>
                            <p className="text-gray-700">{selected.pekerjaan}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Diskon</p>
                        <p className="text-gray-700">{selected.diskon_persen}%</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-green-100 text-green-600">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Limit Kredit</p>
                        <p className="text-gray-700">{formatCurrency(selected.limit_kredit)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div>
                      <p className="text-sm text-gray-500">Dibuat</p>
                      <p className="text-sm font-medium">
                        {selected.dibuat_pada ? new Date(selected.dibuat_pada).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selected.status === 'aktif' ? 'bg-green-100 text-green-800' :
                        selected.status === 'nonaktif' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selected.status}
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
                  <Button
                    onClick={() => onEdit(selected)}
                    className="px-5 py-2 h-10 bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Pelanggan
                  </Button>
                </div>
              </div>
            ) : (
              // Show access placeholder for unauthorized users in create or edit mode
              (drawerMode === 'create' || drawerMode === 'edit') && user?.level !== 3 && user?.level !== 4 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <PelangganAccessPlaceholder />
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
                <PelangganForm
                  value={editing}
                  editingPelanggan={selected}
                  onSave={onSave}
                  onCancel={() => {
                    setDrawerOpen(false)
                    setSelected(null)
                    setEditing(null)
                  }}
                  isLoading={saving}
                />
              )
            )}
          </div>
        </PelangganDrawerContent>
      </PelangganDrawer>
    </div>
  )
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}
