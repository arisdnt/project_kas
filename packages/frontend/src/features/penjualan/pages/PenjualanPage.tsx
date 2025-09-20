import { useState, useEffect, useCallback } from 'react'
import { PenjualanTable } from '@/features/penjualan/components/PenjualanTable'
import { usePenjualanStore, UIPenjualan } from '@/features/penjualan/store/penjualanStore'
import { PenjualanDrawer, PenjualanDrawerContent, PenjualanDrawerHeader, PenjualanDrawerTitle } from '@/features/penjualan/components/PenjualanDrawer'
import { useDataRefresh } from '@/core/hooks/useDataRefresh'
import { useToast } from '@/core/hooks/use-toast'
import { useAuthStore } from '@/core/store/authStore'
import { Edit2, Eye, Receipt, User, CreditCard, Calendar, DollarSign, Hash, FileText } from 'lucide-react'
import { Button } from '@/core/components/ui/button'

export function PenjualanPage() {
  const { loadPenjualan } = usePenjualanStore()
  const { toast } = useToast()
  const { user } = useAuthStore()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit'>('view')
  const [selected, setSelected] = useState<UIPenjualan | null>(null)

  // Refresh handler untuk navbar refresh button
  const handleRefresh = useCallback(async () => {
    await loadPenjualan()
  }, [loadPenjualan])

  // Hook untuk menangani refresh data
  useDataRefresh(handleRefresh)

  // Load data on component mount
  useEffect(() => {
    loadPenjualan()
  }, [loadPenjualan])


  const onView = (p: UIPenjualan) => {
    setSelected(p)
    setDrawerMode('view')
    setDrawerOpen(true)
  }

  const onEdit = (p: UIPenjualan) => {
    setSelected(p)
    setDrawerMode('edit')
    setDrawerOpen(true)
  }

  const onPrint = (p: UIPenjualan) => {
    // Implement print functionality
    console.log('Print transaction:', p.kode)
    toast({ title: 'Print', description: `Mencetak struk transaksi ${p.kode}` })
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
      'completed': { label: 'Selesai', className: 'bg-green-100 text-green-800' },
      'selesai': { label: 'Selesai', className: 'bg-green-100 text-green-800' },
      'pending': { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-800' },
      'menunggu': { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-800' },
      'cancelled': { label: 'Dibatalkan', className: 'bg-red-100 text-red-800' },
      'dibatalkan': { label: 'Dibatalkan', className: 'bg-red-100 text-red-800' },
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
        <PenjualanTable onView={onView} onEdit={onEdit} onPrint={onPrint} />
      </div>

      <PenjualanDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <PenjualanDrawerContent className="!w-[40vw] !max-w-none">
          <PenjualanDrawerHeader className="border-b border-gray-200 pb-4 px-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  drawerMode === 'edit' ? 'bg-amber-100 text-amber-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {drawerMode === 'edit' ? (
                    <Edit2 className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </div>
                <PenjualanDrawerTitle className="text-xl font-semibold">
                  {drawerMode === 'edit' ? 'Edit Transaksi' : 'Detail Transaksi'}
                </PenjualanDrawerTitle>
              </div>
            </div>
          </PenjualanDrawerHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {drawerMode === 'view' && selected ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                    <Receipt className="h-12 w-12 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Kode Transaksi</p>
                      <p className="text-lg font-semibold font-mono">{selected.kode}</p>
                    </div>
                  </div>

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
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                        <Hash className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Waktu</p>
                        <p className="text-gray-700">{selected.waktu || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-green-100 text-green-600">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Kasir</p>
                        <p className="text-gray-700">{selected.kasir}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Pelanggan</p>
                        <p className="text-gray-700">{selected.pelanggan || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Metode Bayar</p>
                        <p className="text-gray-700">{selected.metodeBayar}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Status</p>
                        {getStatusBadge(selected.status)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="p-2 rounded-lg bg-green-100 text-green-600">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Total Transaksi</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(selected.total)}</p>
                    </div>
                  </div>

                  {/* Items */}
                  {selected.items && selected.items.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800">Detail Produk</h4>
                      <div className="space-y-2">
                        {selected.items.map((item, index) => (
                          <div key={index} className="border rounded-lg p-3 bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium">{item.produkNama}</p>
                                {item.sku && (
                                  <p className="text-sm text-gray-500 font-mono">{item.sku}</p>
                                )}
                                <p className="text-sm text-gray-600">
                                  {item.kuantitas} × {formatCurrency(item.hargaSatuan)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{formatCurrency(item.totalHarga)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
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
                    Edit Transaksi
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <div className="text-center">
                  <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Edit Transaksi
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-sm">
                    Fitur untuk mengedit transaksi akan segera tersedia.
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
        </PenjualanDrawerContent>
      </PenjualanDrawer>
    </div>
  )
}