import React, { forwardRef } from 'react'
import { TableCell, TableRow } from '@/core/components/ui/table'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/core/components/ui/dropdown-menu'
import { UIPembelian } from '../store/pembelianStore'
import { MoreHorizontal, Eye, Edit2, Trash2, Printer } from 'lucide-react'
import { cn } from '@/core/lib/utils'

interface Props {
  pembelian: UIPembelian
  isActive: boolean
  recentlyTouched?: { type: 'created' | 'updated' | 'deleted'; at: Date }
  onFocus: () => void
  onKeyDown: (event: React.KeyboardEvent) => void
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  onPrint?: () => void
}

export const PembelianTableRow = forwardRef<HTMLTableRowElement, Props>(
  ({ pembelian, isActive, recentlyTouched, onFocus, onKeyDown, onView, onEdit, onDelete, onPrint }, ref) => {
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
        <Badge className={cn('text-xs font-medium', config.className)}>
          {config.label}
        </Badge>
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
        <Badge className={cn('text-xs font-medium', config.className)}>
          {config.label}
        </Badge>
      )
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
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    }

    return (
      <TableRow
        ref={ref}
        tabIndex={0}
        className={cn(
          'cursor-pointer transition-all duration-200 hover:bg-slate-50 focus:bg-blue-50 focus:ring-2 focus:ring-blue-200 focus:ring-inset focus:outline-none',
          isActive && 'bg-blue-50 ring-2 ring-blue-200 ring-inset',
          recentlyTouched && recentlyTouched.type === 'created' && 'bg-green-50 animate-pulse',
          recentlyTouched && recentlyTouched.type === 'updated' && 'bg-blue-50 animate-pulse'
        )}
        onClick={onFocus}
        onKeyDown={onKeyDown}
      >
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{pembelian.nomorTransaksi}</span>
          </div>
        </TableCell>

        <TableCell>
          <span className="text-sm font-mono">{pembelian.nomorPO || '-'}</span>
        </TableCell>

        <TableCell>
          <span className="text-sm">{formatDate(pembelian.tanggal)}</span>
        </TableCell>

        <TableCell>
          <span className="text-sm font-medium">{pembelian.supplierNama || '-'}</span>
        </TableCell>

        <TableCell>
          {getStatusBadge(pembelian.status)}
        </TableCell>

        <TableCell>
          {getStatusPembayaranBadge(pembelian.statusPembayaran)}
        </TableCell>

        <TableCell className="text-right">
          <span className="font-medium">{formatCurrency(pembelian.subtotal)}</span>
        </TableCell>

        <TableCell className="text-right">
          <span className="font-semibold">{formatCurrency(pembelian.total)}</span>
        </TableCell>

        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 data-[state=open]:bg-slate-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={onView}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {onPrint && (
                <DropdownMenuItem onClick={onPrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    )
  }
)

PembelianTableRow.displayName = 'PembelianTableRow'