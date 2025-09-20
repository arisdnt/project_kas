import { forwardRef, type KeyboardEvent } from 'react'
import { TableCell, TableRow } from '@/core/components/ui/table'
import { Badge } from '@/core/components/ui/badge'
import { ActionButton } from '@/core/components/ui/action-button'
import { UIProduk } from '@/features/produk/store/produkStore'
import { ProductImage } from './ProductImage'
import { cn } from '@/core/lib/utils'
import { COLUMN_CLASS, ROW_HEIGHT_PX, formatCurrency, formatDate } from '@/features/produk/utils/tableUtils'

type ProductTableRowProps = {
  product: UIProduk
  isActive: boolean
  recentlyTouched?: 'new' | 'updated'
  onFocus: () => void
  onKeyDown: (event: KeyboardEvent<HTMLTableRowElement>) => void
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

export const ProductTableRow = forwardRef<HTMLTableRowElement, ProductTableRowProps>(({
  product,
  isActive,
  recentlyTouched,
  onFocus,
  onKeyDown,
  onView,
  onEdit,
  onDelete,
}, ref) => {
  const hargaBeli = product.hargaBeli ?? 0
  const hargaJual = product.harga ?? 0
  const stok = product.stok ?? 0

  return (
    <TableRow
      ref={ref}
      tabIndex={isActive ? 0 : -1}
      data-active={isActive}
      onFocus={onFocus}
      onClick={onFocus}
      onKeyDown={onKeyDown}
      className={cn(
        'group/table-row border-0 transition-colors',
        'odd:bg-slate-50/60',
        'hover:bg-blue-50/40',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400/70',
        'data-[active=true]:ring-2 data-[active=true]:ring-blue-400/60 data-[active=true]:ring-offset-0',
      )}
      style={{ height: ROW_HEIGHT_PX }}
      aria-selected={isActive}
    >
      <TableCell className={cn(COLUMN_CLASS.produk, 'py-[5px] align-middle', 'border-r border-slate-100 last:border-r-0')}>
        <div className="flex items-center gap-3">
          <ProductImage src={product.gambar_url} alt={product.nama} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium text-slate-800" title={product.nama}>
                {product.nama}
              </span>
              {recentlyTouched && (
                <span
                  className={cn(
                    'inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold',
                    recentlyTouched === 'new'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-amber-50 text-amber-600',
                  )}
                >
                  {recentlyTouched === 'new' ? 'Baru' : 'Update'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">SKU: {product.sku || '—'}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className={cn(COLUMN_CLASS.kategori, 'py-[5px] align-middle', 'border-r border-slate-100 last:border-r-0')}>
        {product.kategori?.nama ?? '—'}
      </TableCell>
      <TableCell className={cn(COLUMN_CLASS.brand, 'py-[5px] align-middle', 'border-r border-slate-100 last:border-r-0')}>
        {product.brand?.nama ?? '—'}
      </TableCell>
      <TableCell className={cn(COLUMN_CLASS.supplier, 'py-[5px] align-middle', 'border-r border-slate-100 last:border-r-0')}>
        {product.supplier?.nama ?? '—'}
      </TableCell>
      <TableCell className={cn(COLUMN_CLASS.satuan, 'py-[5px] align-middle', 'border-r border-slate-100 last:border-r-0')}>
        <span className="inline-flex items-center rounded bg-slate-100 px-2 text-[11px] text-slate-600">
          {product.satuan ?? 'pcs'}
        </span>
      </TableCell>
      <TableCell className={cn(COLUMN_CLASS.stok, 'py-[5px] align-middle', 'border-r border-slate-100 last:border-r-0')}>
        <span className="font-semibold text-slate-800">{stok}</span>
      </TableCell>
      <TableCell className={cn(COLUMN_CLASS.hargaBeli, 'py-[5px] align-middle', 'border-r border-slate-100 last:border-r-0')}>
        {hargaBeli ? formatCurrency(hargaBeli) : '—'}
      </TableCell>
      <TableCell className={cn(COLUMN_CLASS.hargaJual, 'py-[5px] align-middle', 'border-r border-slate-100 last:border-r-0')}>
        {hargaJual ? formatCurrency(hargaJual) : '—'}
      </TableCell>
      <TableCell className={cn(COLUMN_CLASS.status, 'py-[5px] align-middle', 'border-r border-slate-100 last:border-r-0')}>
        {product.status === 'aktif' ? (
          <Badge className="rounded-full border border-emerald-200 bg-emerald-50 text-[10px] font-semibold text-emerald-600">
            Aktif
          </Badge>
        ) : (
          <Badge className="rounded-full border border-rose-200 bg-rose-50 text-[10px] font-semibold text-rose-600">
            Tidak aktif
          </Badge>
        )}
      </TableCell>
      <TableCell className={cn(COLUMN_CLASS.updated, 'py-[5px] align-middle', 'border-r border-slate-100 last:border-r-0')}>
        {formatDate(product.diperbaruiPada || product.dibuatPada)}
      </TableCell>
      <TableCell className={cn(COLUMN_CLASS.aksi, 'py-[5px] align-middle')}>
        <ActionButton
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          viewLabel="Lihat detail produk"
          editLabel="Edit produk"
          deleteLabel="Hapus produk"
        />
      </TableCell>
    </TableRow>
  )
})

ProductTableRow.displayName = 'ProductTableRow'