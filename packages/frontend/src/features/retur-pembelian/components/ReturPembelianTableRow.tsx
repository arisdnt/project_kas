import React from 'react'
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { ReturPembelianItem } from '../types/returPembelian'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface ReturPembelianTableRowProps {
  item: ReturPembelianItem
  isSelected: boolean
  onSelect: (id: number, checked: boolean) => void
  onView: (item: ReturPembelianItem) => void
  onEdit: (item: ReturPembelianItem) => void
  onDelete: (id: number) => void
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
      return 'Menunggu'
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

export function ReturPembelianTableRow({
  item,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete
}: ReturPembelianTableRowProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: id })
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(item.id, e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            {formatDate(item.created_at)}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {item.produk?.url_gambar && (
            <img
              src={item.produk.url_gambar}
              alt={item.produk.nama}
              className="h-8 w-8 rounded object-cover"
            />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">
              {item.produk?.nama || 'Produk tidak ditemukan'}
            </div>
            <div className="text-xs text-gray-500">
              {item.produk?.sku}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            {item.pembelian?.supplier?.nama || '-'}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-gray-900">
          {item.jumlah} pcs
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm font-medium text-gray-900">
          {formatCurrency(item.total)}
        </span>
      </td>
      <td className="px-4 py-3">
        <Badge 
          variant="outline" 
          className={getStatusColor(item.status)}
        >
          {getStatusText(item.status)}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(item)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(item)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item.id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}