import { forwardRef, type KeyboardEvent } from 'react'
import { TableCell, TableRow } from '@/core/components/ui/table'
import { Badge } from '@/core/components/ui/badge'
import { ActionButton } from '@/core/components/ui/action-button'
import { cn } from '@/core/lib/utils'
import type { UIBrand } from '@/features/brand/store/brandStore'
import {
  BRAND_COLUMN_CLASS,
  BRAND_ROW_HEIGHT_PX,
  formatBrandDate,
  resolveStatusLabel,
} from '@/features/brand/utils/tableUtils'
import { BrandLogo } from './BrandLogo'

export type BrandTableRowProps = {
  brand: UIBrand
  isActive: boolean
  onFocus: () => void
  onKeyDown: (event: KeyboardEvent<HTMLTableRowElement>) => void
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

export const BrandTableRow = forwardRef<HTMLTableRowElement, BrandTableRowProps>(({
  brand,
  isActive,
  onFocus,
  onKeyDown,
  onView,
  onEdit,
  onDelete,
}, ref) => {
  const updatedAt = (brand as any).diperbarui_pada || (brand as any).dibuat_pada || null
  const status = resolveStatusLabel(brand.status)
  const isActiveStatus = (brand.status ?? 'aktif') === 'aktif'

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
        'hover:bg-sky-100 hover:text-slate-900',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400/70',
        'data-[active=true]:bg-sky-100 data-[active=true]:text-slate-900',
      )}
      style={{ height: BRAND_ROW_HEIGHT_PX }}
      aria-selected={isActive}
    >
      <TableCell className={cn(BRAND_COLUMN_CLASS.brand, 'py-[6px] align-middle')}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <BrandLogo
              src={brand.logo_url}
              alt={brand.nama}
              className="h-full w-full rounded-lg"
              showHoverPreview
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className="truncate font-medium text-slate-800 group-hover/table-row:text-slate-900 group-data-[active=true]/table-row:text-slate-900"
                title={brand.nama}
              >
                {brand.nama}
              </span>
            </div>
            <p className="truncate text-[13px] text-slate-500 group-hover/table-row:text-slate-700 group-data-[active=true]/table-row:text-slate-700">
              {brand.website || '—'}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className={cn(BRAND_COLUMN_CLASS.deskripsi, 'py-[6px] align-middle')}>
        <p className="line-clamp-2 text-[13px] text-slate-600">
          {brand.deskripsi || '—'}
        </p>
      </TableCell>
      <TableCell className={cn(BRAND_COLUMN_CLASS.website, 'py-[6px] align-middle')}>
        {brand.website ? (
          <a
            href={brand.website}
            className="text-sm text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {brand.website}
          </a>
        ) : (
          <span className="text-sm text-slate-400">Tidak ada</span>
        )}
      </TableCell>
      <TableCell className={cn(BRAND_COLUMN_CLASS.status, 'py-[6px] align-middle')}>
        {isActiveStatus ? (
          <Badge className="rounded-full border border-emerald-200 bg-emerald-50 text-[12px] font-semibold text-emerald-600">
            {status}
          </Badge>
        ) : (
          <Badge className="rounded-full border border-rose-200 bg-rose-50 text-[12px] font-semibold text-rose-600">
            {status}
          </Badge>
        )}
      </TableCell>
      <TableCell className={cn(BRAND_COLUMN_CLASS.updated, 'py-[6px] align-middle')}>
        {formatBrandDate(updatedAt)}
      </TableCell>
      <TableCell className={cn(BRAND_COLUMN_CLASS.aksi, 'py-[6px] align-middle')}>
        <ActionButton
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          viewLabel="Lihat detail brand"
          editLabel="Edit brand"
          deleteLabel="Hapus brand"
        />
      </TableCell>
    </TableRow>
  )
})

BrandTableRow.displayName = 'BrandTableRow'
