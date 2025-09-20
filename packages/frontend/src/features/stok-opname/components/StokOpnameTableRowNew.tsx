import React, { forwardRef } from 'react'
import { TableCell, TableRow } from '@/core/components/ui/table'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/core/components/ui/dropdown-menu'
import { UIStokOpname } from '../store/stokOpnameStoreNew'
import { MoreHorizontal, Eye, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/core/lib/utils'

interface Props {
  stokOpname: UIStokOpname
  isActive: boolean
  recentlyTouched?: { type: 'created' | 'updated' | 'deleted'; at: Date }
  onFocus: () => void
  onKeyDown: (event: React.KeyboardEvent) => void
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  onComplete?: () => void
  onCancel?: () => void
}

export const StokOpnameTableRowNew = forwardRef<HTMLTableRowElement, Props>(
  ({ stokOpname, isActive, recentlyTouched, onFocus, onKeyDown, onView, onEdit, onDelete, onComplete, onCancel }, ref) => {
    const getStatusBadge = (status: string) => {
      const statusConfig = {
        'pending': { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
        'completed': { label: 'Selesai', className: 'bg-green-100 text-green-800' },
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

    const getSelisihDisplay = (selisih?: number) => {
      if (selisih === undefined || selisih === null) return '-'

      const className = selisih > 0 ? 'text-green-600' : selisih < 0 ? 'text-red-600' : 'text-gray-600'
      const prefix = selisih > 0 ? '+' : ''

      return (
        <span className={className}>
          {prefix}{selisih}
        </span>
      )
    }

    const formatDate = (dateStr?: string) => {
      if (!dateStr) return '-'
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
          <div className="flex flex-col">
            <span className="font-medium">{stokOpname.namaProduk}</span>
          </div>
        </TableCell>

        <TableCell>
          <span className="text-sm font-mono">{stokOpname.sku || '-'}</span>
        </TableCell>

        <TableCell>
          <span className="text-sm">{stokOpname.kategori?.nama || '-'}</span>
        </TableCell>

        <TableCell>
          <span className="text-sm">{stokOpname.brand?.nama || '-'}</span>
        </TableCell>

        <TableCell className="text-right">
          <span className="font-medium">{stokOpname.stokSistem}</span>
        </TableCell>

        <TableCell className="text-right">
          <span className="font-medium">{stokOpname.stokFisik ?? '-'}</span>
        </TableCell>

        <TableCell className="text-right">
          <span className="font-medium">{getSelisihDisplay(stokOpname.selisih)}</span>
        </TableCell>

        <TableCell>
          {getStatusBadge(stokOpname.status)}
        </TableCell>

        <TableCell>
          <span className="text-sm">{formatDate(stokOpname.tanggalOpname)}</span>
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
              {stokOpname.status === 'pending' && (
                <>
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  {onComplete && (
                    <DropdownMenuItem onClick={onComplete}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Selesaikan
                    </DropdownMenuItem>
                  )}
                  {onCancel && (
                    <DropdownMenuItem onClick={onCancel}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Batalkan
                    </DropdownMenuItem>
                  )}
                </>
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

StokOpnameTableRowNew.displayName = 'StokOpnameTableRowNew'