import { forwardRef } from 'react'
import { TableCell, TableRow } from '@/core/components/ui/table'
import { Button } from '@/core/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/core/components/ui/dropdown-menu'
import { Badge } from '@/core/components/ui/badge'
import { MoreHorizontal, Eye, Edit2, Trash2, ArrowUp, ArrowDown, Hash, Building } from 'lucide-react'
import { UIMutasiStok } from '../store/mutasiStokStoreNew'
import { cn } from '@/core/lib/utils'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

interface Props {
  mutasiStok: UIMutasiStok
  isActive: boolean
  recentlyTouched?: number
  onFocus: () => void
  onKeyDown: (event: React.KeyboardEvent) => void
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

export const MutasiStokTableRow = forwardRef<HTMLTableRowElement, Props>(
  ({ mutasiStok, isActive, recentlyTouched, onFocus, onKeyDown, onView, onEdit, onDelete }, ref) => {
    const formatDate = (dateStr: string) => {
      try {
        return format(parseISO(dateStr), 'dd MMM yyyy', { locale: id })
      } catch {
        return dateStr
      }
    }

    const getJenisMutasiBadge = (jenis: 'masuk' | 'keluar') => {
      return jenis === 'masuk' ? (
        <Badge className="bg-green-100 text-green-800 border-green-200 gap-1">
          <ArrowUp className="h-3 w-3" />
          Masuk
        </Badge>
      ) : (
        <Badge className="bg-red-100 text-red-800 border-red-200 gap-1">
          <ArrowDown className="h-3 w-3" />
          Keluar
        </Badge>
      )
    }

    const getJumlahDisplay = (jumlah: number, jenis: 'masuk' | 'keluar') => {
      const prefix = jenis === 'masuk' ? '+' : '-'
      const className = jenis === 'masuk' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'

      return (
        <span className={className}>
          {prefix}{jumlah}
        </span>
      )
    }

    const isRecentlyTouched = recentlyTouched && (Date.now() - recentlyTouched < 3000)

    return (
      <TableRow
        ref={ref}
        tabIndex={0}
        className={cn(
          "cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset",
          isActive && "bg-blue-50",
          isRecentlyTouched && "bg-green-50 animate-pulse",
          "hover:bg-gray-50"
        )}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onClick={onView}
      >
        {/* Product Info */}
        <TableCell className="px-3 py-4">
          <div className="flex flex-col">
            <div className="font-medium text-gray-900 line-clamp-1">
              {mutasiStok.namaProduk}
            </div>
            {mutasiStok.sku && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Hash className="h-3 w-3" />
                {mutasiStok.sku}
              </div>
            )}
            {(mutasiStok.kategori || mutasiStok.brand) && (
              <div className="flex items-center gap-2 mt-1">
                {mutasiStok.kategori && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Building className="h-3 w-3" />
                    {mutasiStok.kategori.nama}
                  </div>
                )}
                {mutasiStok.brand && (
                  <div className="text-xs text-gray-500">
                    • {mutasiStok.brand.nama}
                  </div>
                )}
              </div>
            )}
          </div>
        </TableCell>

        {/* Jenis Mutasi */}
        <TableCell className="px-3 py-4">
          {getJenisMutasiBadge(mutasiStok.jenisMutasi)}
        </TableCell>

        {/* Jumlah */}
        <TableCell className="px-3 py-4 text-center">
          {getJumlahDisplay(mutasiStok.jumlah, mutasiStok.jenisMutasi)}
        </TableCell>

        {/* Stok Sebelum */}
        <TableCell className="px-3 py-4 text-center">
          <span className="font-medium text-gray-700">
            {mutasiStok.stokSebelum}
          </span>
        </TableCell>

        {/* Stok Sesudah */}
        <TableCell className="px-3 py-4 text-center">
          <span className="font-medium text-gray-700">
            {mutasiStok.stokSesudah}
          </span>
        </TableCell>

        {/* Tanggal Mutasi */}
        <TableCell className="px-3 py-4">
          <span className="text-sm text-gray-600">
            {formatDate(mutasiStok.tanggalMutasi)}
          </span>
        </TableCell>

        {/* Keterangan */}
        <TableCell className="px-3 py-4">
          <span className="text-sm text-gray-600 line-clamp-2">
            {mutasiStok.keterangan || '-'}
          </span>
        </TableCell>

        {/* Actions */}
        <TableCell className="px-3 py-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-gray-100"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }} className="gap-2">
                <Eye className="h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }} className="gap-2">
                <Edit2 className="h-4 w-4" />
                Edit Mutasi
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="gap-2 text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Hapus Mutasi
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    )
  }
)

MutasiStokTableRow.displayName = 'MutasiStokTableRow'