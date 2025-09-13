import { useMemo, useState } from 'react'
import { TenanToolbar } from '@/features/tenan/components/TenanToolbar'
import { TenanTable } from '@/features/tenan/components/TenanTable'
import { TenanDetailSidebar } from '@/features/tenan/components/TenanDetailSidebar'
import { TenanEditSidebar, TenanFormData } from '@/features/tenan/components/TenanEditSidebar'
import { useTenanStore, Tenan } from '@/features/tenan/store/tenanStore'
import { useToast } from '@/core/hooks/use-toast'
import { useAuthStore } from '@/core/store/authStore'

export function TenanPage() {
  const { createTenan, updateTenan } = useTenanStore()
  const { toast } = useToast()
  const { user } = useAuthStore()

  const roleName = useMemo(() => (user?.peran || (user as any)?.role || '').toString().toLowerCase(), [user])
  const canCreate = roleName === 'admin' || roleName === 'manager'
  const canEdit = roleName === 'admin' || roleName === 'manager'
  const canDelete = roleName === 'admin'

  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState<Tenan | null>(null)
  const [editing, setEditing] = useState<TenanFormData | null>(null)
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditing({
      nama: '',
      email: '',
      telepon: '',
      alamat: '',
      status: 'aktif',
      paket: 'basic',
      max_toko: 1,
      max_pengguna: 5,
    })
    setSelected(null)
    setEditOpen(true)
  }

  const onView = (t: Tenan) => {
    setSelected(t)
    setDetailOpen(true)
  }

  const onEdit = (t: Tenan) => {
    setSelected(t)
    setEditing({
      nama: t.nama,
      email: t.email,
      telepon: t.telepon,
      alamat: t.alamat,
      status: t.status,
      paket: t.paket,
      max_toko: t.max_toko,
      max_pengguna: t.max_pengguna,
    })
    setEditOpen(true)
  }

  const onSave = async (data: TenanFormData) => {
    if (!canEdit) return
    setSaving(true)
    try {
      if (selected) {
        await updateTenan(selected.id, data)
        toast({ title: 'Tenan diperbarui' })
      } else {
        await createTenan(data)
        toast({ title: 'Tenan dibuat' })
      }
    } catch (e: any) {
      // Inform the user that API may be unavailable; local fallback applied in store
      toast({ title: 'Mode lokal', description: e?.message || 'Perubahan disimpan sementara di sesi' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-0 h-[calc(100vh-4rem-3rem)] py-4 overflow-hidden">
      <div className="mb-3">
        <TenanToolbar onCreate={openCreate} canCreate={canCreate} />
      </div>

      <div className="flex-1 min-h-0">
        <TenanTable onView={onView} onEdit={onEdit} canEdit={canEdit} canDelete={canDelete} />
      </div>

      <TenanDetailSidebar
        tenan={selected}
        open={detailOpen}
        onOpenChange={(o) => setDetailOpen(o)}
      />

      <TenanEditSidebar
        value={editing}
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
        canEdit={canEdit}
      />
    </div>
  )
}

export default TenanPage

