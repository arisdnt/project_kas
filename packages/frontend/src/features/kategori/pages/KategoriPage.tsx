import { useState } from 'react'
import { KategoriToolbar } from '@/features/kategori/components/KategoriToolbar'
import { KategoriTable } from '@/features/kategori/components/KategoriTable'
import { useKategoriStore } from '@/features/kategori/store/kategoriStore'
import { UIKategori, CreateKategoriRequest } from '@/features/kategori/types/kategori'
import { KategoriDetailSidebar } from '@/features/kategori/components/KategoriDetailSidebar'
import { KategoriEditSidebar } from '@/features/kategori/components/KategoriEditSidebar'
import { ProductsByCategoryModal } from '@/features/kategori/components/ProductsByCategoryModal'
import { useToast } from '@/core/hooks/use-toast'

export function KategoriPage() {
  const { createKategori, updateKategori, uploadCategoryImage, removeCategoryImage } = useKategoriStore()
  const { toast } = useToast()

  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [productsModalOpen, setProductsModalOpen] = useState(false)
  const [selected, setSelected] = useState<UIKategori | null>(null)
  const [productsCategory, setProductsCategory] = useState<UIKategori | null>(null)
  const [editing, setEditing] = useState<CreateKategoriRequest | null>(null)
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    // Mode create: pass null supaya KategoriEditSidebar tahu menampilkan ScopeSelector
    setEditing(null)
    setSelected(null)
    setEditOpen(true)
  }

  const onView = (k: UIKategori) => {
    setSelected(k)
    setDetailOpen(true)
  }

  const onEdit = (k: UIKategori) => {
    setSelected(k)
    setEditing({
      nama: k.nama,
      deskripsi: k.deskripsi,
      icon_url: k.icon_url,
      urutan: k.urutan
    })
    setEditOpen(true)
  }

  const onViewProducts = (k: UIKategori) => {
    setProductsCategory(k)
    setProductsModalOpen(true)
  }

  const onSave = async (data: CreateKategoriRequest, imageFile?: File) => {
    setSaving(true)
    try {
      if (selected) {
        await updateKategori(selected.id, data)
        toast({ title: 'Kategori diperbarui' })
      } else {
        // Create kategori first
        const createdCategory = await createKategori(data)

        // If there's an image file, upload it to the newly created category
        if (imageFile && createdCategory) {
          try {
            await uploadCategoryImage(createdCategory.id, imageFile)
            toast({ title: 'Kategori dan gambar berhasil dibuat' })
          } catch (uploadError) {
            console.error('Failed to upload image:', uploadError)
            toast({
              title: 'Kategori dibuat, tetapi gagal upload gambar',
              description: 'Anda dapat upload gambar nanti melalui edit kategori'
            })
          }
        } else {
          toast({ title: 'Kategori dibuat' })
        }
      }
    } catch (e: any) {
      toast({ title: 'Gagal menyimpan', description: e?.message || 'Terjadi kesalahan' })
      throw e
    } finally {
      setSaving(false)
    }
  }

  const onUploadImage = async (categoryId: string, file: File): Promise<string> => {
    try {
      const iconUrl = await uploadCategoryImage(categoryId, file)
      toast({ title: 'Gambar kategori berhasil diupload' })
      return iconUrl
    } catch (e: any) {
      toast({ title: 'Gagal upload gambar', description: e?.message || 'Terjadi kesalahan' })
      throw e
    }
  }

  const onRemoveImage = async (categoryId: string): Promise<void> => {
    try {
      await removeCategoryImage(categoryId)
      toast({ title: 'Gambar kategori berhasil dihapus' })
    } catch (e: any) {
      toast({ title: 'Gagal hapus gambar', description: e?.message || 'Terjadi kesalahan' })
      throw e
    }
  }

  return (
    <div className="flex flex-col min-h-0 h-[calc(100vh-4rem-3rem)] py-4 overflow-hidden">
      <div className="mb-3">
        <KategoriToolbar onCreate={openCreate} />
      </div>

      <div className="flex-1 min-h-0">
        <KategoriTable onView={onView} onEdit={onEdit} onViewProducts={onViewProducts} />
      </div>

      <KategoriDetailSidebar
        kategori={selected}
        open={detailOpen}
        onOpenChange={(o) => setDetailOpen(o)}
      />

      <KategoriEditSidebar
        value={editing}
        editingCategory={selected}
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o)
          if (!o) {
            setSelected(null)
            setEditing(null)
          }
        }}
        onSave={onSave}
        onUploadImage={onUploadImage}
        onRemoveImage={onRemoveImage}
        isLoading={saving}
      />

      <ProductsByCategoryModal
        kategori={productsCategory}
        open={productsModalOpen}
        onOpenChange={(o) => {
          setProductsModalOpen(o)
          if (!o) {
            setProductsCategory(null)
          }
        }}
      />
    </div>
  )
}
