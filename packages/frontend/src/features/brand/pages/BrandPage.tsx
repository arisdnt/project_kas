import { useState } from 'react'
import { BrandToolbar } from '@/features/brand/components/BrandToolbar'
import { BrandTable } from '@/features/brand/components/BrandTable'
import { useBrandStore, UIBrand } from '@/features/brand/store/brandStore'
import { BrandDrawer, BrandDrawerContent, BrandDrawerHeader, BrandDrawerTitle } from '@/features/brand/components/BrandDrawer'
import { BrandForm } from '@/features/brand/components/BrandForm'
import { useToast } from '@/core/hooks/use-toast'
import { useAuthStore } from '@/core/store/authStore'
import { BrandAccessPlaceholder } from '@/features/brand/components/BrandAccessPlaceholder'
import { Plus, Edit2, Eye, Package, FileText, Globe } from 'lucide-react'
import { Button } from '@/core/components/ui/button'

export function BrandPage() {
  const { createBrand, updateBrand, uploadBrandImage, removeBrandImage } = useBrandStore()
  const { toast } = useToast()
  const { user } = useAuthStore()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('create')
  const [selected, setSelected] = useState<UIBrand | null>(null)
  const [editing, setEditing] = useState<{ nama: string; deskripsi?: string; logo_url?: string; website?: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditing(null)
    setSelected(null)
    setDrawerMode('create')
    setDrawerOpen(true)
  }

  const onView = (b: UIBrand) => {
    setSelected(b)
    setDrawerMode('view')
    setDrawerOpen(true)
  }

  const onEdit = (b: UIBrand) => {
    setSelected(b)
    setEditing({
      nama: b.nama,
      deskripsi: b.deskripsi,
      logo_url: b.logo_url,
      website: b.website
    })
    setDrawerMode('edit')
    setDrawerOpen(true)
  }

  const onSave = async (data: {
    nama: string;
    deskripsi?: string;
    logo_url?: string;
    website?: string;
  }, imageFile?: File) => {
    setSaving(true)
    try {
      if (selected) {
        await updateBrand(selected.id, {
          nama: data.nama,
          deskripsi: data.deskripsi,
          logo_url: data.logo_url,
          website: data.website
        })
        toast({ title: 'Brand diperbarui' })
      } else {
        const createdBrand = await createBrand(data)

        // If there's an image file, upload it to the newly created brand
        if (imageFile && createdBrand) {
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

      <BrandDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <BrandDrawerContent className="!w-[40vw] !max-w-none">
          <BrandDrawerHeader className="border-b border-gray-200 pb-4 px-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  drawerMode === 'create' ? 'bg-purple-100 text-purple-600' :
                  drawerMode === 'edit' ? 'bg-blue-100 text-blue-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {drawerMode === 'create' ? (
                    <Plus className="h-5 w-5" />
                  ) : drawerMode === 'edit' ? (
                    <Edit2 className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </div>
                <BrandDrawerTitle className="text-xl font-semibold">
                  {drawerMode === 'create' ? 'Tambah Brand' :
                   drawerMode === 'edit' ? 'Edit Brand' : 'Detail Brand'}
                </BrandDrawerTitle>
              </div>
            </div>
          </BrandDrawerHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {drawerMode === 'view' && selected ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  {selected.logo_url ? (
                    <img
                      src={selected.logo_url}
                      alt={selected.nama}
                      className="w-32 h-32 object-contain rounded-lg border p-2 bg-white"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nama Brand</p>
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
                  
                  {selected.website && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-green-100 text-green-600">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Website</p>
                        <a href={selected.website} target="_blank" rel="noopener noreferrer"
                           className="text-blue-600 hover:underline flex items-center gap-1">
                          {selected.website}
                          <Globe className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}
                  
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
                    Edit Brand
                  </Button>
                </div>
              </div>
            ) : (
              // Show access placeholder for unauthorized users in create or edit mode
              (drawerMode === 'create' || drawerMode === 'edit') && user?.level !== 3 && user?.level !== 4 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <BrandAccessPlaceholder />
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
                <BrandForm
                  value={editing}
                  editingBrand={selected}
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
              )
            )}
          </div>
        </BrandDrawerContent>
      </BrandDrawer>
    </div>
  )
}

