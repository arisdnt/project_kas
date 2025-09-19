import { useState } from 'react'
import { SupplierToolbar } from '@/features/supplier/components/SupplierToolbar'
import { SupplierTable } from '@/features/supplier/components/SupplierTable'
import { UISupplier } from '@/features/supplier/types/supplier'
import { useSupplierStore } from '@/features/supplier/store/supplierStore'
import { useToast } from '@/core/hooks/use-toast'
import { useAuthStore } from '@/core/store/authStore'
import { SupplierDrawer, SupplierDrawerContent, SupplierDrawerHeader, SupplierDrawerTitle } from '@/features/supplier/components/SupplierDrawer'
import { SupplierForm, SupplierFormData } from '@/features/supplier/components/SupplierForm'
import { SupplierAccessPlaceholder } from '@/features/supplier/components/SupplierAccessPlaceholder'
import { Plus, Edit2, Eye, Truck, Phone, Mail, MapPin, Calendar, Building, CreditCard, DollarSign, Shield, Hash } from 'lucide-react'
import { Button } from '@/core/components/ui/button'

export function SupplierPage() {
  const { createSupplier, updateSupplier } = useSupplierStore()
  const { toast } = useToast()
  const { user } = useAuthStore()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('create')
  const [selected, setSelected] = useState<UISupplier | null>(null)
  const [editing, setEditing] = useState<SupplierFormData | null>(null)
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditing({
      nama: '',
      kontak_person: '',
      email: '',
      telepon: '',
      alamat: '',
      npwp: '',
      bank_nama: '',
      bank_rekening: '',
      bank_atas_nama: '',
      status: 'aktif'
    })
    setSelected(null)
    setDrawerMode('create')
    setDrawerOpen(true)
  }

  const onView = (s: UISupplier) => {
    setSelected(s)
    setDrawerMode('view')
    setDrawerOpen(true)
  }

  const onEdit = (s: UISupplier) => {
    setSelected(s)
    setEditing({
      nama: s.nama,
      kontak_person: s.kontak_person,
      email: s.email,
      telepon: s.telepon,
      alamat: s.alamat,
      npwp: s.npwp,
      bank_nama: s.bank_nama,
      bank_rekening: s.bank_rekening,
      bank_atas_nama: s.bank_atas_nama,
      status: s.status
    })
    setDrawerMode('edit')
    setDrawerOpen(true)
  }

  const onSave = async (data: SupplierFormData) => {
    setSaving(true)
    try {
      if (selected) {
        await updateSupplier(selected.id, data)
        toast({ title: 'Supplier diperbarui' })
      } else {
        await createSupplier(data)
        toast({ title: 'Supplier dibuat' })
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
        <SupplierToolbar onCreate={openCreate} />
      </div>

      <div className="flex-1 min-h-0">
        <SupplierTable onView={onView} onEdit={onEdit} />
      </div>

      <SupplierDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SupplierDrawerContent className="!w-[40vw] !max-w-none">
          <SupplierDrawerHeader className="border-b border-gray-200 pb-4 px-6 pt-6">
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
                <SupplierDrawerTitle className="text-xl font-semibold">
                  {drawerMode === 'create' ? 'Tambah Supplier' :
                   drawerMode === 'edit' ? 'Edit Supplier' : 'Detail Supplier'}
                </SupplierDrawerTitle>
              </div>
            </div>
          </SupplierDrawerHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {drawerMode === 'view' && selected ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="p-2 rounded-lg bg-green-100 text-green-600">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nama Supplier</p>
                      <p className="text-lg font-semibold">{selected.nama}</p>
                    </div>
                  </div>

                  {selected.kontak_person && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Kontak Person</p>
                        <p className="text-gray-700">{selected.kontak_person}</p>
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

                  {selected.npwp && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                        <Building className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">NPWP</p>
                        <p className="text-gray-700">{selected.npwp}</p>
                      </div>
                    </div>
                  )}

                  {(selected.bank_nama || selected.bank_rekening || selected.bank_atas_nama) && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
                        <CreditCard className="h-4 w-4" />
                        Informasi Bank
                      </div>

                      {selected.bank_nama && (
                        <div className="flex gap-3">
                          <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                            <Building className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-500">Nama Bank</p>
                            <p className="text-gray-700">{selected.bank_nama}</p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        {selected.bank_rekening && (
                          <div className="flex gap-3">
                            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                              <Hash className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-500">No. Rekening</p>
                              <p className="text-gray-700">{selected.bank_rekening}</p>
                            </div>
                          </div>
                        )}
                        {selected.bank_atas_nama && (
                          <div className="flex gap-3">
                            <div className="p-2 rounded-lg bg-teal-100 text-teal-600">
                              <Shield className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-500">Atas Nama</p>
                              <p className="text-gray-700">{selected.bank_atas_nama}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

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
                    Edit Supplier
                  </Button>
                </div>
              </div>
            ) : (
              // Show access placeholder for unauthorized users in create or edit mode
              (drawerMode === 'create' || drawerMode === 'edit') && user?.level !== 3 && user?.level !== 4 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <SupplierAccessPlaceholder />
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
                <SupplierForm
                  value={editing}
                  editingSupplier={selected}
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
        </SupplierDrawerContent>
      </SupplierDrawer>
    </div>
  )
}

