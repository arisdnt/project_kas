import { useState } from 'react'
import { BrandToolbar } from '@/features/brand/components/BrandToolbar'
import { BrandTable } from '@/features/brand/components/BrandTable'
import { useBrandStore, UIBrand } from '@/features/brand/store/brandStore'
import { BrandDetailSidebar } from '@/features/brand/components/BrandDetailSidebar'
import { BrandEditSidebar } from '@/features/brand/components/BrandEditSidebar'
import { useToast } from '@/core/hooks/use-toast'

export function BrandPage() {
  const { createBrand, updateBrand, uploadBrandImage, removeBrandImage } = useBrandStore()
  const { toast } = useToast()

  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState<UIBrand | null>(null)
  const [editing, setEditing] = useState<{ nama: string; deskripsi?: string; logo_url?: string; website?: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    // Mode create: value harus null agar BrandEditSidebar menampilkan ScopeSelector
    setEditing(null)
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

  const onSave = async (data: {
    nama: string;
    deskripsi?: string;
    logo_url?: string;
    website?: string;
    targetTenantId?: string;
    targetStoreId?: string;
    applyToAllTenants?: boolean;
    applyToAllStores?: boolean;
  }, imageFile?: File) => {
    setSaving(true)
    try {
      if (selected) {
        // For update operations, we only pass the brand data (scope is not updated)
        await updateBrand(selected.id, {
          nama: data.nama,
          deskripsi: data.deskripsi,
          logo_url: data.logo_url,
          website: data.website
        })
        toast({ title: 'Brand diperbarui' })
      } else {
        // For create operations, pass all data including scope
        const createdBrand = await createBrand(data)

        // If there's an image file, upload it to the newly created brand
        if (imageFile && createdBrand && createdBrand.id !== 'scope-operation') {
          try {
            await uploadBrandImage(createdBrand.id, imageFile)
            toast({ title: 'Brand dan gambar berhasil dibuat' })
          } catch (uploadError) {
            console.error('Failed to upload image:', uploadError)
            toast({
              title: 'Brand dibuat, tetapi gagal upload gambar',
              description: 'Anda dapat upload gambar nanti melalui edit brand'
            })
          }
        } else {
          toast({ title: 'Brand dibuat' })
        }
      }
    } catch (e: any) {
      toast({ title: 'Gagal menyimpan', description: e?.message || 'Terjadi kesalahan' })
      throw e
    } finally {
      setSaving(false)
    }
  }

  const onUploadImage = async (brandId: string, file: File): Promise<string> => {
    try {
      const logoUrl = await uploadBrandImage(brandId, file)
      toast({ title: 'Gambar brand berhasil diupload' })
      return logoUrl
    } catch (e: any) {
      toast({ title: 'Gagal upload gambar', description: e?.message || 'Terjadi kesalahan' })
      throw e
    }
  }

  const onRemoveImage = async (brandId: string): Promise<void> => {
    try {
      await removeBrandImage(brandId)
      toast({ title: 'Gambar brand berhasil dihapus' })
    } catch (e: any) {
      toast({ title: 'Gagal hapus gambar', description: e?.message || 'Terjadi kesalahan' })
      throw e
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

