import { useState, useEffect, useCallback } from 'react'
import { PembelianTableNew } from '@/features/pembelian/components/PembelianTableNew'
import { usePembelianStore, UIPembelian } from '@/features/pembelian/store/pembelianStore'
import { PembelianDrawer, PembelianDrawerContent, PembelianDrawerHeader, PembelianDrawerTitle } from '@/features/pembelian/components/PembelianDrawer'
import { useDataRefresh } from '@/core/hooks/useDataRefresh'
import { useToast } from '@/core/hooks/use-toast'
import { useAuthStore } from '@/core/store/authStore'
import { Plus, Edit2, Eye, ShoppingCart, User, Building, Calendar, DollarSign, Hash, FileText, Package } from 'lucide-react'
import { Button } from '@/core/components/ui/button'

export function PembelianPageNew() {
  const { loadPembelian } = usePembelianStore()
  const { toast } = useToast()
  const { user } = useAuthStore()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('create')
  const [selected, setSelected] = useState<UIPembelian | null>(null)

  // Refresh handler untuk navbar refresh button
  const handleRefresh = useCallback(async () => {
    await loadPembelian()
  }, [loadPembelian])

  // Hook untuk menangani refresh data
  useDataRefresh(handleRefresh)

  // Load data on component mount
  useEffect(() => {
    loadPembelian()
  }, [loadPembelian])

  const openCreate = () => {
    setSelected(null)
    setDrawerMode('create')
    setDrawerOpen(true)
  }

  const onView = (p: UIPembelian) => {
    setSelected(p)
    setDrawerMode('view')
    setDrawerOpen(true)
  }

  const onEdit = (p: UIPembelian) => {
    setSelected(p)
    setDrawerMode('edit')
    setDrawerOpen(true)
  }

  const onPrint = (p: UIPembelian) => {
    // Implement print functionality
    console.log('Print purchase:', p.nomorTransaksi)
    toast({ title: 'Print', description: `Mencetak dokumen pembelian ${p.nomorTransaksi}` })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'draft': { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
      'pending': { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-800' },
      'received': { label: 'Diterima', className: 'bg-green-100 text-green-800' },
      'cancelled': { label: 'Dibatalkan', className: 'bg-red-100 text-red-800' },
    }

    const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig] || {
      label: status,
      className: 'bg-gray-100 text-gray-800'
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const getStatusPembayaranBadge = (status: string) => {
    const statusConfig = {
      'belum_bayar': { label: 'Belum Bayar', className: 'bg-red-100 text-red-800' },
      'sebagian_bayar': { label: 'Sebagian', className: 'bg-yellow-100 text-yellow-800' },
      'lunas': { label: 'Lunas', className: 'bg-green-100 text-green-800' },
    }

    const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig] || {
      label: status,
      className: 'bg-gray-100 text-gray-800'
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="flex flex-col min-h-0 h-[calc(100vh-4rem-3rem)] pt-4 overflow-hidden">
      <div className="flex-1 min-h-0">
        <PembelianTableNew onView={onView} onEdit={onEdit} onCreate={openCreate} onPrint={onPrint} />
      </div>

      <PembelianDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <PembelianDrawerContent className="!w-[40vw] !max-w-none">
          <PembelianDrawerHeader className="border-b border-gray-200 pb-4 px-6 pt-6">
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
                <PembelianDrawerTitle className="text-xl font-semibold">
                  {drawerMode === 'create' ? 'Pembelian Baru' :
                   drawerMode === 'edit' ? 'Edit Pembelian' : 'Detail Pembelian'}
                </PembelianDrawerTitle>
              </div>
            </div>
          </PembelianDrawerHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {drawerMode === 'view' && selected ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                    <ShoppingCart className="h-12 w-12 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nomor Transaksi</p>
                      <p className="text-lg font-semibold font-mono">{selected.nomorTransaksi}</p>
                    </div>
                  </div>

                  {selected.nomorPO && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                        <Hash className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Nomor PO</p>
                        <p className="text-gray-700 font-mono">{selected.nomorPO}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Tanggal</p>
                        <p className="text-gray-700">{formatDate(selected.tanggal)}</p>
                      </div>
                    </div>
                    {selected.jatuhTempo && (
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-red-100 text-red-600">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Jatuh Tempo</p>
                          <p className="text-gray-700">{formatDate(selected.jatuhTempo)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-green-100 text-green-600">
                        <Building className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Supplier</p>
                        <p className="text-gray-700">{selected.supplierNama || '-'}</p>
                        {selected.supplierKontak && (
                          <p className="text-sm text-gray-500">{selected.supplierKontak}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Pembeli</p>
                        <p className="text-gray-700">{selected.pembeliNama || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Status</p>
                        {getStatusBadge(selected.status)}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Status Pembayaran</p>
                        {getStatusPembayaranBadge(selected.statusPembayaran)}
                      </div>
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800">Detail Keuangan</h4>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatCurrency(selected.subtotal)}</span>
                    </div>

                    {selected.diskonNominal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Diskon {selected.diskonPersen > 0 ? `(${selected.diskonPersen}%)` : ''}
                        </span>
                        <span className="font-medium text-red-600">-{formatCurrency(selected.diskonNominal)}</span>
                      </div>
                    )}

                    {selected.pajakNominal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Pajak {selected.pajakPersen > 0 ? `(${selected.pajakPersen}%)` : ''}
                        </span>
                        <span className="font-medium">{formatCurrency(selected.pajakNominal)}</span>
                      </div>
                    )}

                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-800">Total</span>
                      <span className="text-xl font-bold text-green-600">{formatCurrency(selected.total)}</span>
                    </div>
                  </div>

                  {selected.catatan && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Catatan</p>
                        <p className="text-gray-700">{selected.catatan}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div>
                      <p className="text-sm text-gray-500">Dibuat</p>
                      <p className="text-sm font-medium">
                        {selected.dibuatPada ? formatDateTime(selected.dibuatPada) : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Diperbarui</p>
                      <p className="text-sm font-medium">
                        {selected.diperbaruiPada ? formatDateTime(selected.diperbaruiPada) : '-'}
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
                    Edit Pembelian
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <div className="text-center">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {drawerMode === 'create' ? 'Buat Pembelian Baru' : 'Edit Pembelian'}
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-sm">
                    {drawerMode === 'create'
                      ? 'Fitur untuk membuat pembelian baru akan segera tersedia.'
                      : 'Fitur untuk mengedit pembelian akan segera tersedia.'
                    }
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
        </PembelianDrawerContent>
      </PembelianDrawer>
    </div>
  )
}