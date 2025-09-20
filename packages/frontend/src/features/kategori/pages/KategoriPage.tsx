import { useState } from 'react'
import { useAuthStore } from '@/core/store/authStore'
import { KategoriTable } from '@/features/kategori/components/KategoriTable'
import { useKategoriStore } from '@/features/kategori/store/kategoriStore'
import { UIKategori, CreateKategoriRequest } from '@/features/kategori/types/kategori'
import {
  KategoriDrawer,
  KategoriDrawerContent,
  KategoriDrawerHeader,
  KategoriDrawerTitle,
  KategoriDrawerDescription,
  KategoriDrawerFooter,
  KategoriDrawerClose
} from '@/features/kategori/components/KategoriDrawer'
import { KategoriForm } from '@/features/kategori/components/KategoriForm'
import { KategoriAccessPlaceholder } from '@/features/kategori/components/KategoriAccessPlaceholder'
import { useToast } from '@/core/hooks/use-toast'
import { Plus, Edit2, Eye, Tag, FileText, Hash } from 'lucide-react'
import { Button } from '@/core/components/ui/button'

export function KategoriPage() {
  const { createKategori, updateKategori, uploadCategoryImage, removeCategoryImage } = useKategoriStore()
  const { toast } = useToast()
  const { user } = useAuthStore()

  const canManageKategori = user?.level === 3 || user?.level === 4

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('create')
  const [selected, setSelected] = useState<UIKategori | null>(null)
  const [editing, setEditing] = useState<CreateKategoriRequest | null>(null)
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditing(null)
    setSelected(null)
    setDrawerMode('create')
    setDrawerOpen(true)
  }

  const onView = (k: UIKategori) => {
    setSelected(k)
    setDrawerMode('view')
    setDrawerOpen(true)
  }

  const onEdit = (k: UIKategori) => {
    setSelected(k)
    setEditing({
      nama: k.nama,
      deskripsi: k.deskripsi,
      icon_url: k.icon_url,
      urutan: k.urutan
    })
    setDrawerMode('edit')
    setDrawerOpen(true)
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
    <div className="flex flex-col min-h-0 h-[calc(100vh-4rem-3rem)] pt-4 overflow-hidden">
      <div className="flex-1 min-h-0">
        <KategoriTable onView={onView} onEdit={onEdit} onCreate={openCreate} />
      </div>

      <KategoriDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <KategoriDrawerContent className="!w-[40vw] !max-w-none">
          <KategoriDrawerHeader>
            <KategoriDrawerTitle>
              {drawerMode === 'create' ? 'Tambah Kategori' :
               drawerMode === 'edit' ? 'Edit Kategori' : 'Detail Kategori'}
            </KategoriDrawerTitle>
            <KategoriDrawerDescription>
              {drawerMode === 'create' ? 'Tambah kategori baru ke sistem' :
               drawerMode === 'edit' ? `Ubah informasi kategori ${selected?.nama}` :
               `Informasi lengkap kategori ${selected?.nama}`}
            </KategoriDrawerDescription>
          </KategoriDrawerHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {drawerMode === 'view' && selected ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  {selected.icon_url ? (
                    <img
                      src={selected.icon_url}
                      alt={selected.nama}
                      className="w-32 h-32 object-contain rounded-lg border p-2 bg-white"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                      <Tag className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                      <Tag className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nama Kategori</p>
                      <p className="text-lg font-semibold">{selected.nama}</p>
                    </div>
                  </div>

                  {selected.deskripsi && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Deskripsi</p>
                        <p className="text-gray-700">{selected.deskripsi}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                      <Hash className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Urutan</p>
                      <p className="text-gray-700">{selected.urutan}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div>
                      <p className="text-sm text-gray-500">Dibuat</p>
                      <p className="text-sm font-medium">
                        {(selected as any).dibuat_pada ? new Date((selected as any).dibuat_pada).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Diperbarui</p>
                      <p className="text-sm font-medium">
                        {(selected as any).diperbarui_pada ? new Date((selected as any).diperbarui_pada).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <KategoriDrawerFooter>
                  <KategoriDrawerClose asChild>
                    <Button
                      variant="outline"
                      className="px-5 py-2 h-10 border-gray-300 hover:bg-gray-50"
                    >
                      Tutup
                    </Button>
                  </KategoriDrawerClose>
                  <Button
                    onClick={() => onEdit(selected)}
                    className="px-5 py-2 h-10 bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Kategori
                  </Button>
                </KategoriDrawerFooter>
              </div>
            ) : canManageKategori ? (
              <KategoriForm
                value={editing}
                editingCategory={selected}
                onSave={onSave}
                onUploadImage={onUploadImage}
                onRemoveImage={onRemoveImage}
                onCancel={() => {
                  setDrawerOpen(false)
                  setSelected(null)
                  setEditing(null)
                }}
                isLoading={saving}
              />
            ) : (
              <div className="py-10">
                <KategoriAccessPlaceholder />
              </div>
            )}
          </div>
        </KategoriDrawerContent>
      </KategoriDrawer>
    </div>
  )
}
