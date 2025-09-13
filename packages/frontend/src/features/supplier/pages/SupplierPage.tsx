import { useState } from 'react'
import { SupplierToolbar } from '@/features/supplier/components/SupplierToolbar'
import { SupplierTable } from '@/features/supplier/components/SupplierTable'
import { useSupplierStore, UISupplier } from '@/features/supplier/store/supplierStore'
import { SupplierDetailSidebar } from '@/features/supplier/components/SupplierDetailSidebar'
import { SupplierEditSidebar } from '@/features/supplier/components/SupplierEditSidebar'
import { useToast } from '@/core/hooks/use-toast'

export function SupplierPage() {
  const { createSupplier, updateSupplier } = useSupplierStore()
  const { toast } = useToast()

  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState<UISupplier | null>(null)
  const [editing, setEditing] = useState<{
    nama: string
    kontak_person?: string
    email?: string
    telepon?: string
    alamat?: string
  } | null>(null)
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditing({ nama: '', kontak_person: '', email: '', telepon: '', alamat: '' })
    setSelected(null)
    setEditOpen(true)
  }

  const onView = (s: UISupplier) => {
    setSelected(s)
    setDetailOpen(true)
  }

  const onEdit = (s: UISupplier) => {
    setSelected(s)
    setEditing({
      nama: s.nama,
      kontak_person: s.kontak_person,
      email: s.email,
      telepon: s.telepon,
      alamat: s.alamat,
    })
    setEditOpen(true)
  }

  const onSave = async (data: { nama: string; kontak_person?: string; email?: string; telepon?: string; alamat?: string }) => {
    setSaving(true)
    try {
      if (selected) {
        await updateSupplier(selected.id, data)
        toast({ title: 'Supplier diperbarui' })
      } else {
        await createSupplier(data)
        toast({ title: 'Supplier dibuat' })
      }
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

      <SupplierDetailSidebar
        supplier={selected}
        open={detailOpen}
        onOpenChange={(o) => setDetailOpen(o)}
      />

      <SupplierEditSidebar
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
      />
    </div>
  )
}

