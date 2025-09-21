import { useState, useEffect, useCallback } from 'react'
import { ProdukTable } from '@/features/produk/components/ProdukTable'
import { useProdukStore, UIProduk } from '@/features/produk/store/produkStore'
import { ProdukDrawer, ProdukDrawerContent, ProdukDrawerHeader, ProdukDrawerTitle } from '@/features/produk/components/ProdukDrawer'
import { ProdukForm, ProdukFormData } from '@/features/produk/components/ProdukForm'
import { useProdukRealtime } from '@/features/produk/hooks/useProdukRealtime'
import { useDataRefresh } from '@/core/hooks/useDataRefresh'
import { useToast } from '@/core/hooks/use-toast'
import { useAuthStore } from '@/core/store/authStore'
import { ProdukAccessPlaceholder } from '@/features/produk/components/ProdukAccessPlaceholder'
import { Plus, Edit2, Eye, Package2, Tag, DollarSign, Users, Hash } from 'lucide-react'
import { Button } from '@/core/components/ui/button'

export function ProdukPage() {
  const { createProduk, updateProduk, loadMasterData, brands, categories } = useProdukStore()
  const { toast } = useToast()
  const { user } = useAuthStore()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('create')
  const [selected, setSelected] = useState<UIProduk | null>(null)
  const [editing, setEditing] = useState<ProdukFormData | null>(null)
  const [saving, setSaving] = useState(false)

  // Realtime subscription (no-ops if server doesn't emit yet)
  useProdukRealtime()

  // Refresh handler untuk navbar refresh button
  const handleRefresh = useCallback(async () => {
    await loadMasterData()
  }, [loadMasterData])

  // Hook untuk menangani refresh data
  useDataRefresh(handleRefresh)

  // Load master data on component mount
  useEffect(() => {
    loadMasterData()
  }, [loadMasterData])

  const openCreate = () => {
    setSelected(null)
    setDrawerMode('create')
    setDrawerOpen(true)
    // Don't reset editing state - let ProdukForm handle persistence
  }

  const onView = (p: UIProduk) => {
    setSelected(p)
    setDrawerMode('view')
    setDrawerOpen(true)
  }

  const onEdit = (p: UIProduk) => {
    setSelected(p)
    setEditing({
      nama: p.nama,
      kode: p.sku || '',
      kategori: p.kategori?.nama || '',
      kategoriId: p.kategori?.id || '',
      brand: p.brand?.nama || '',
      brandId: p.brand?.id || '',
      hargaBeli: p.hargaBeli || 0,
      hargaJual: p.harga || 0,
      stok: p.stok || 0,
      satuan: p.satuan || 'pcs',
      deskripsi: p.deskripsi || '',
      status: 'aktif',
      gambar_url: p.gambar_url,
    })
    setDrawerMode('edit')
    setDrawerOpen(true)
  }

  const onSave = async (data: ProdukFormData, imageFile?: File) => {
    setSaving(true)
    try {
      if (selected) {
        await updateProduk(selected.id, data)
        toast({ title: 'Produk diperbarui' })
      } else {
        const result = await createProduk(data)
        toast({ title: 'Produk dibuat' })
      }
      setDrawerOpen(false)
      setSelected(null)
      // Only clear editing state for edit mode, preserve for create mode
      if (selected) {
        setEditing(null)
      }
    } catch (e: any) {
      toast({ title: 'Gagal menyimpan', description: e?.message || 'Terjadi kesalahan' })
      throw e
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-0 h-[calc(100vh-4rem-3rem)] pt-4 overflow-hidden">
      <div className="flex-1 min-h-0">
        <ProdukTable onView={onView} onEdit={onEdit} onCreate={openCreate} />
      </div>

      <ProdukDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <ProdukDrawerContent
          className="!w-[40vw] !max-w-none"
          onPointerDownOutside={(e) => {
            // Prevent closing drawer but allow interactions with main page
            e.preventDefault()
          }}
          onInteractOutside={(e) => {
            // Prevent closing drawer but allow interactions with main page
            e.preventDefault()
          }}
          onEscapeKeyDown={(e) => {
            // Allow ESC to close drawer
            setDrawerOpen(false)
          }}
        >
          <ProdukDrawerHeader className="border-b border-gray-200 pb-4 px-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  drawerMode === 'create' ? 'bg-blue-100 text-blue-600' :
                  drawerMode === 'edit' ? 'bg-amber-100 text-amber-600' :
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
                <ProdukDrawerTitle className="text-xl font-semibold">
                  {drawerMode === 'create' ? 'Tambah Produk' :
                   drawerMode === 'edit' ? 'Edit Produk' : 'Detail Produk'}
                </ProdukDrawerTitle>
              </div>
            </div>
          </ProdukDrawerHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {drawerMode === 'view' && selected ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  {selected.gambar_url ? (
                    <img
                      src={selected.gambar_url}
                      alt={selected.nama}
                      className="w-32 h-32 object-contain rounded-lg border p-2 bg-white"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                      <Package2 className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <Package2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nama Produk</p>
                      <p className="text-lg font-semibold">{selected.nama}</p>
                    </div>
                  </div>

                  {selected.sku && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                        <Hash className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Kode Produk</p>
                        <p className="text-gray-700">{selected.sku}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                        <Tag className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Kategori</p>
                        <p className="text-gray-700">{selected.kategori?.nama || '-'}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                        <Package2 className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Brand</p>
                        <p className="text-gray-700">{selected.brand?.nama || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-green-100 text-green-600">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Harga Beli</p>
                        <p className="text-gray-700">{formatCurrency(selected.hargaBeli || 0)}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-green-100 text-green-600">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Harga Jual</p>
                        <p className="text-gray-700">{formatCurrency(selected.harga || 0)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Stok</p>
                        <p className="text-gray-700">{selected.stok || 0} {selected.satuan || 'pcs'}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                        <Tag className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          selected.status === 'aktif'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selected.status || 'aktif'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selected.deskripsi && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        <Tag className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Deskripsi</p>
                        <p className="text-gray-700">{selected.deskripsi}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div>
                      <p className="text-sm text-gray-500">Dibuat</p>
                      <p className="text-sm font-medium">
                        {selected.dibuatPada ? new Date(selected.dibuatPada).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Diperbarui</p>
                      <p className="text-sm font-medium">
                        {selected.diperbaruiPada ? new Date(selected.diperbaruiPada).toLocaleDateString('id-ID', {
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
                    className="px-5 py-2 h-10 bg-amber-600 hover:bg-amber-700"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Produk
                  </Button>
                </div>
              </div>
            ) : (
              // Show access placeholder for unauthorized users in create or edit mode
              (drawerMode === 'create' || drawerMode === 'edit') && user?.level !== 3 && user?.level !== 4 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <ProdukAccessPlaceholder />
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
                <ProdukForm
                  value={editing}
                  editingProduk={selected}
                  onSave={onSave}
                  onCancel={() => {
                    setDrawerOpen(false)
                    setSelected(null)
                    // Don't reset editing state when canceling - preserve form data
                    if (drawerMode === 'edit') {
                      setEditing(null)
                    }
                  }}
                  isLoading={saving}
                  brands={brands.map(b => ({ id: b.id, nama: b.nama }))}
                  categories={categories.map(c => ({ id: c.id, nama: c.nama }))}
                />
              )
            )}
          </div>
        </ProdukDrawerContent>
      </ProdukDrawer>
    </div>
  )
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}
