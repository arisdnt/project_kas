import React, { useEffect, useState } from 'react'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/core/components/ui/dialog'
import { Separator } from '@/core/components/ui/separator'
import { useReturPembelianStore } from '../store/returPembelianStore'
import { ReturPembelianItem } from '../types/returPembelian'
import { 
  Package, 
  Calendar, 
  User, 
  DollarSign, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface ReturPembelianDetailProps {
  isOpen: boolean
  onClose: () => void
  id: number
}

export function ReturPembelianDetail({ isOpen, onClose, id }: ReturPembelianDetailProps) {
  const {
    items,
    loading,
    error,
    updateItem,
    removeItem
  } = useReturPembelianStore()

  const [item, setItem] = useState<ReturPembelianItem | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const foundItem = items.find(i => i.id === id)
    setItem(foundItem || null)
  }, [id, items])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'disetujui':
        return <CheckCircle className="h-4 w-4" />
      case 'ditolak':
        return <XCircle className="h-4 w-4" />
      case 'selesai':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'disetujui':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'ditolak':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'selesai':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Persetujuan'
      case 'disetujui':
        return 'Disetujui'
      case 'ditolak':
        return 'Ditolak'
      case 'selesai':
        return 'Selesai'
      default:
        return status
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!item) return

    setProcessing(true)
    try {
      await updateItem(item.id, { status: newStatus as any })
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!item) return

    if (confirm('Apakah Anda yakin ingin menghapus retur ini?')) {
      setProcessing(true)
      try {
        await removeItem(item.id)
        onClose()
      } catch (err) {
        console.error('Failed to delete:', err)
      } finally {
        setProcessing(false)
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: id })
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Memuat data...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!item) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Data retur tidak ditemukan</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Detail Retur Pembelian #{item.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Section */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(item.status)} flex items-center gap-1`}
                  >
                    {getStatusIcon(item.status)}
                    {getStatusText(item.status)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  {item.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange('disetujui')}
                        disabled={processing}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Setujui
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange('ditolak')}
                        disabled={processing}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Tolak
                      </Button>
                    </>
                  )}
                  
                  {item.status === 'disetujui' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange('selesai')}
                      disabled={processing}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Selesai
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Produk Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Informasi Produk
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {item.produk?.url_gambar && (
                  <div className="flex justify-center">
                    <img
                      src={item.produk.url_gambar}
                      alt={item.produk.nama}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-500">Nama Produk</label>
                  <p className="font-medium">{item.produk?.nama || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">SKU</label>
                  <p className="font-medium">{item.produk?.sku || '-'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Pembelian Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Informasi Pembelian
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Nomor Faktur</label>
                  <p className="font-medium">{item.pembelian?.nomor_faktur || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Tanggal Pembelian</label>
                  <p className="font-medium">
                    {item.pembelian?.tanggal ? 
                      formatDate(item.pembelian.tanggal) : '-'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Supplier</label>
                  <p className="font-medium">{item.pembelian?.supplier?.nama || '-'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Retur Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Detail Retur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Jumlah Retur</label>
                  <p className="text-lg font-semibold">{item.jumlah} pcs</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Harga Beli</label>
                  <p className="text-lg font-semibold">{formatCurrency(item.harga_beli)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Total</label>
                  <p className="text-lg font-semibold text-blue-600">{formatCurrency(item.total)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Dibuat Pada</label>
                  <p className="font-medium">{formatDate(item.created_at)}</p>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm text-gray-500">Alasan Retur</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">{item.alasan}</p>
                </div>
              </div>

              {item.updated_at !== item.created_at && (
                <div>
                  <label className="text-sm text-gray-500">Terakhir Diperbarui</label>
                  <p className="font-medium">{formatDate(item.updated_at)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline/Log */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div>
                    <p className="font-medium">Retur Dibuat</p>
                    <p className="text-sm text-gray-500">{formatDate(item.created_at)}</p>
                  </div>
                </div>
                
                {item.status !== 'pending' && (
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === 'ditolak' ? 'bg-red-600' : 'bg-green-600'
                    }`}></div>
                    <div>
                      <p className="font-medium">
                        {item.status === 'ditolak' ? 'Retur Ditolak' : 'Retur Disetujui'}
                      </p>
                      <p className="text-sm text-gray-500">{formatDate(item.updated_at)}</p>
                    </div>
                  </div>
                )}
                
                {item.status === 'selesai' && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div>
                      <p className="font-medium">Retur Selesai</p>
                      <p className="text-sm text-gray-500">{formatDate(item.updated_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              ID Retur: #{item.id}
            </div>
            <div className="flex items-center gap-2">
              {item.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      useReturPembelianStore.getState().setEditingItem(item)
                      useReturPembelianStore.getState().setFormOpen(true)
                      onClose()
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    disabled={processing}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Hapus
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={onClose}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}