import { useState } from 'react'
import { InventarisToolbar } from '@/features/inventaris/components/InventarisToolbar'
import { InventarisTable } from '@/features/inventaris/components/InventarisTable'
import { UIInventaris } from '@/features/inventaris/store/inventarisStore'
import { useInventarisStore } from '@/features/inventaris/store/inventarisStore'
import { useToast } from '@/core/hooks/use-toast'
import { useAuthStore } from '@/core/store/authStore'
import { InventarisDrawer, InventarisDrawerContent, InventarisDrawerHeader, InventarisDrawerTitle } from '@/features/inventaris/components/InventarisDrawer'
import { InventarisForm, InventarisFormData } from '@/features/inventaris/components/InventarisForm'
import { InventarisAccessPlaceholder } from '@/features/inventaris/components/InventarisAccessPlaceholder'
import { Edit2, Eye, Package, Hash, DollarSign, Calculator, Building, TrendingUp, TrendingDown, AlertTriangle, Plus } from 'lucide-react'
import { Button } from '@/core/components/ui/button'

export function InventarisPage() {
  const { updateInventaris } = useInventarisStore()
  const { toast } = useToast()
  const { user } = useAuthStore()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view')
  const [selected, setSelected] = useState<UIInventaris | null>(null)
  const [editing, setEditing] = useState<InventarisFormData | null>(null)
  const [saving, setSaving] = useState(false)

  const onView = (i: UIInventaris) => {
    setSelected(i)
    setDrawerMode('view')
    setDrawerOpen(true)
  }

  const onEdit = (i: UIInventaris) => {
    setSelected(i)
    setEditing({
      jumlah: i.jumlah?.toString() || '0',
      harga: i.harga?.toString() || '0',
      harga_beli: i.harga_beli?.toString() || '0'
    })
    setDrawerMode('edit')
    setDrawerOpen(true)
  }

  const onCreate = () => {
    setEditing({
      jumlah: '0',
      harga: '0',
      harga_beli: '0'
    })
    setSelected(null)
    setDrawerMode('create')
    setDrawerOpen(true)
  }

  const onSave = async (data: InventarisFormData) => {
    setSaving(true)
    try {
      if (selected) {
        // Update existing inventaris
        await updateInventaris(selected.id, {
          jumlah: Number(data.jumlah),
          harga: Number(data.harga),
          harga_beli: Number(data.harga_beli)
        })
        toast({ title: 'Inventaris diperbarui' })
      } else {
        // Create new inventaris - this would need to be implemented in the store
        console.log('Creating new inventaris:', data)
        toast({ title: 'Inventaris baru dibuat' })
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { color: 'text-red-600', bg: 'bg-red-100', icon: AlertTriangle, label: 'Habis' }
    if (stock < 10) return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: TrendingDown, label: 'Rendah' }
    return { color: 'text-green-600', bg: 'bg-green-100', icon: TrendingUp, label: 'Normal' }
  }

  return (
    <div className="flex flex-col min-h-0 h-[calc(100vh-4rem-3rem)] py-4 overflow-hidden">
      <div className="mb-3">
        <InventarisToolbar onCreate={onCreate} />
      </div>

      <div className="flex-1 min-h-0">
        <InventarisTable onView={onView} onEdit={onEdit} />
      </div>

      <InventarisDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <InventarisDrawerContent className="!w-[40vw] !max-w-none">
          <InventarisDrawerHeader className="border-b border-gray-200 pb-4 px-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  drawerMode === 'create' ? 'bg-green-100 text-green-600' :
                  drawerMode === 'edit' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                }`}>
                  {drawerMode === 'create' ? (
                    <Plus className="h-5 w-5" />
                  ) : drawerMode === 'edit' ? (
                    <Edit2 className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </div>
                <InventarisDrawerTitle className="text-xl font-semibold">
                  {drawerMode === 'create' ? 'Tambah Inventaris' :
                   drawerMode === 'edit' ? 'Edit Inventaris' : 'Detail Inventaris'}
                </InventarisDrawerTitle>
              </div>
            </div>
          </InventarisDrawerHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {drawerMode === 'view' && selected ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Produk</p>
                      <p className="text-lg font-semibold">{selected.nama_produk}</p>
                    </div>
                  </div>

                  {selected.sku && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                        <Hash className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">SKU</p>
                        <p className="text-gray-700">{selected.sku}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {selected.kategori && (
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                          <Building className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Kategori</p>
                          <p className="text-gray-700">{selected.kategori.nama}</p>
                        </div>
                      </div>
                    )}
                    {selected.brand && (
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                          <Building className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Brand</p>
                          <p className="text-gray-700">{selected.brand.nama}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
                      <Calculator className="h-4 w-4" />
                      Informasi Inventaris
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg ${getStockStatus(selected.jumlah || 0).bg} ${getStockStatus(selected.jumlah || 0).color}`}>
                          {React.createElement(getStockStatus(selected.jumlah || 0).icon, { className: "h-5 w-5" })}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Jumlah Stok</p>
                          <div className="flex items-center gap-2">
                            <p className="text-gray-700 font-medium">{selected.jumlah || 0} unit</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStockStatus(selected.jumlah || 0).bg} ${getStockStatus(selected.jumlah || 0).color}`}>
                              {getStockStatus(selected.jumlah || 0).label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-red-100 text-red-600">
                          <DollarSign className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Harga Beli</p>
                          <p className="text-gray-700 font-medium">{formatCurrency(selected.harga_beli || 0)}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-green-100 text-green-600">
                          <DollarSign className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Harga Jual</p>
                          <p className="text-gray-700 font-medium">{formatCurrency(selected.harga || 0)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Financial Analysis */}
                    {selected.harga && selected.harga_beli && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-blue-900">Margin</p>
                            <p className="text-blue-700 font-medium">
                              {formatCurrency((selected.harga || 0) - (selected.harga_beli || 0))}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-blue-900">Margin %</p>
                            <p className="text-blue-700 font-medium">
                              {selected.harga_beli ? (((selected.harga - selected.harga_beli) / selected.harga_beli) * 100).toFixed(1) : 0}%
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-blue-900">Total Nilai Stok</p>
                            <p className="text-blue-700 font-medium">
                              {formatCurrency((selected.jumlah || 0) * (selected.harga || 0))}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
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
                      <p className="text-sm text-gray-500">Diperbarui</p>
                      <p className="text-sm font-medium">
                        {selected.diperbarui_pada ? new Date(selected.diperbarui_pada).toLocaleDateString('id-ID', {
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
                    Edit Inventaris
                  </Button>
                </div>
              </div>
            ) : (
              // Show access placeholder for unauthorized users in edit/create mode
              (drawerMode === 'edit' || drawerMode === 'create') && user?.level !== 3 && user?.level !== 4 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <InventarisAccessPlaceholder />
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
                <InventarisForm
                  value={editing}
                  editingInventaris={selected}
                  onSave={onSave}
                  onCancel={() => {
                    setDrawerOpen(false)
                    setSelected(null)
                    setEditing(null)
                  }}
                  isLoading={saving}
                  isCreate={drawerMode === 'create'}
                />
              )
            )}
          </div>
        </InventarisDrawerContent>
      </InventarisDrawer>
    </div>
  )
}