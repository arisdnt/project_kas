import { useState } from 'react'
import { BrandToolbar } from '@/features/brand/components/BrandToolbar'
import { BrandTable } from '@/features/brand/components/BrandTable'
import { useBrandStore, UIBrand } from '@/features/brand/store/brandStore'
import { BrandDetailSidebar } from '@/features/brand/components/BrandDetailSidebar'
import { BrandEditSidebar } from '@/features/brand/components/BrandEditSidebar'
import { useToast } from '@/core/hooks/use-toast'

export function BrandPage() {
  const { createBrand, updateBrand } = useBrandStore()
  const { toast } = useToast()

  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState<UIBrand | null>(null)
  const [editing, setEditing] = useState<{ nama: string; deskripsi?: string; logo_url?: string; website?: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditing({ nama: '' })
    setSelected(null)
    setEditOpen(true)
  }

  const onView = (b: UIBrand) => {
    setSelected(b)
    setDetailOpen(true)
  }

  const onEdit = (b: UIBrand) => {
    setSelected(b)
    setEditing({
      nama: b.nama,
      deskripsi: b.deskripsi,
      logo_url: b.logo_url,
      website: b.website
    })
    setEditOpen(true)
  }

  const onSave = async (data: { nama: string; deskripsi?: string; logo_url?: string; website?: string }) => {
    setSaving(true)
    try {
      if (selected) {
        await updateBrand(selected.id, data)
        toast({ title: 'Brand diperbarui' })
      } else {
        await createBrand(data)
        toast({ title: 'Brand dibuat' })
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
        <BrandToolbar onCreate={openCreate} />
      </div>

      <div className="flex-1 min-h-0">
        <BrandTable onView={onView} onEdit={onEdit} />
      </div>

      <BrandDetailSidebar
        brand={selected}
        open={detailOpen}
        onOpenChange={(o) => setDetailOpen(o)}
      />

      <BrandEditSidebar
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

