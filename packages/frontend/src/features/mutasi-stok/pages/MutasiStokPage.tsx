import { useState, useEffect, useCallback } from 'react'
import { MutasiStokTable } from '@/features/mutasi-stok/components/MutasiStokTable'
import { useMutasiStokStore, UIMutasiStok } from '@/features/mutasi-stok/store/mutasiStokStore'
import { MutasiStokDrawer, MutasiStokDrawerContent, MutasiStokDrawerHeader, MutasiStokDrawerTitle } from '@/features/mutasi-stok/components/MutasiStokDrawer'
import { useDataRefresh } from '@/core/hooks/useDataRefresh'
import { useToast } from '@/core/hooks/use-toast'
import { useAuthStore } from '@/core/store/authStore'
import { Plus, Edit2, Eye, Package, Hash, Calculator, Calendar, Building, ArrowUp, ArrowDown, FileText } from 'lucide-react'
import { Button } from '@/core/components/ui/button'

export function MutasiStokPage() {
  const { loadMutasiStok, createMutasiStok, updateMutasiStok } = useMutasiStokStore()
  const { toast } = useToast()
  const { user } = useAuthStore()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('create')
  const [selected, setSelected] = useState<UIMutasiStok | null>(null)

  // Refresh handler untuk navbar refresh button
  const handleRefresh = useCallback(async () => {
    await loadMutasiStok()
  }, [loadMutasiStok])

  // Hook untuk menangani refresh data
  useDataRefresh(handleRefresh)

  // Load data on component mount
  useEffect(() => {
    loadMutasiStok()
  }, [loadMutasiStok])

  const openCreate = () => {
    setSelected(null)
    setDrawerMode('create')
    setDrawerOpen(true)
  }

  const onView = (m: UIMutasiStok) => {
    setSelected(m)
    setDrawerMode('view')
    setDrawerOpen(true)
  }

  const onEdit = (m: UIMutasiStok) => {
    setSelected(m)
    setDrawerMode('edit')
    setDrawerOpen(true)
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getJenisMutasiIcon = (jenis: 'masuk' | 'keluar') => {
    return jenis === 'masuk' ? (
      <ArrowUp className="h-5 w-5" />
    ) : (
      <ArrowDown className="h-5 w-5" />
    )
  }

  const getJenisMutasiColor = (jenis: 'masuk' | 'keluar') => {
    return jenis === 'masuk' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
  }

  const getJenisMutasiText = (jenis: 'masuk' | 'keluar') => {
    return jenis === 'masuk' ? 'Stok Masuk' : 'Stok Keluar'
  }

  const getJumlahDisplay = (jumlah: number, jenis: 'masuk' | 'keluar') => {
    const prefix = jenis === 'masuk' ? '+' : '-'
    const className = jenis === 'masuk' ? 'text-green-600' : 'text-red-600'

    return (
      <span className={`font-semibold ${className}`}>
        {prefix}{jumlah}
      </span>
    )
  }

  return (
    <div className="flex flex-col min-h-0 h-[calc(100vh-4rem-3rem)] pt-4 overflow-hidden">
      <div className="flex-1 min-h-0">
        <MutasiStokTable
          onView={onView}
          onEdit={onEdit}
          onCreate={openCreate}
        />
      </div>

      <MutasiStokDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <MutasiStokDrawerContent className="!w-[40vw] !max-w-none">
          <MutasiStokDrawerHeader className="border-b border-gray-200 pb-4 px-6 pt-6">
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
                <MutasiStokDrawerTitle className="text-xl font-semibold">
                  {drawerMode === 'create' ? 'Mutasi Stok Baru' :
                   drawerMode === 'edit' ? 'Edit Mutasi Stok' : 'Detail Mutasi Stok'}
                </MutasiStokDrawerTitle>
              </div>
            </div>
          </MutasiStokDrawerHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {drawerMode === 'view' && selected ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Produk</p>
                      <p className="text-lg font-semibold">{selected.namaProduk}</p>
                    </div>
                  </div>

                  {selected.sku && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                        <Hash className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">SKU</p>
                        <p className="text-gray-700 font-mono">{selected.sku}</p>
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

                  {/* Mutation Information */}
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
                      <Calculator className="h-4 w-4" />
                      Informasi Mutasi
                    </div>

                    <div className="flex gap-3">
                      <div className={`p-2 rounded-lg ${getJenisMutasiColor(selected.jenisMutasi)}`}>
                        {getJenisMutasiIcon(selected.jenisMutasi)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Jenis Mutasi</p>
                        <p className={`font-medium ${
                          selected.jenisMutasi === 'masuk' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {getJenisMutasiText(selected.jenisMutasi)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <Package className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Stok Sebelum</p>
                          <p className="text-gray-700 font-semibold text-lg">{selected.stokSebelum}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg ${getJenisMutasiColor(selected.jenisMutasi)}`}>
                          <Calculator className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Jumlah</p>
                          <p className="font-semibold text-lg">
                            {getJumlahDisplay(selected.jumlah, selected.jenisMutasi)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                          <Package className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Stok Sesudah</p>
                          <p className="text-gray-700 font-semibold text-lg">{selected.stokSesudah}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selected.keterangan && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Keterangan</p>
                        <p className="text-gray-700">{selected.keterangan}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Tanggal Mutasi</p>
                        <p className="text-sm font-medium">{formatDate(selected.tanggalMutasi)}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Dibuat Oleh</p>
                        <p className="text-sm font-medium">{selected.dibuatOleh || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div>
                      <p className="text-sm text-gray-500">Dibuat</p>
                      <p className="text-sm font-medium">
                        {formatDateTime(selected.dibuatPada)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Diperbarui</p>
                      <p className="text-sm font-medium">
                        {formatDateTime(selected.diperbaruiPada)}
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
                    Edit Mutasi
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <div className="text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {drawerMode === 'create' ? 'Buat Mutasi Stok Baru' : 'Edit Mutasi Stok'}
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-sm">
                    {drawerMode === 'create'
                      ? 'Fitur untuk membuat mutasi stok baru akan segera tersedia.'
                      : 'Fitur untuk mengedit mutasi stok akan segera tersedia.'}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setDrawerOpen(false)}
                    className="px-6 py-2 h-10 border-gray-300 hover:bg-gray-50"
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            )}
          </div>
        </MutasiStokDrawerContent>
      </MutasiStokDrawer>
    </div>
  )
}