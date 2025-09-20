import { forwardRef, type KeyboardEvent } from 'react'
import { TableCell, TableRow } from '@/core/components/ui/table'
import { ActionButton } from '@/core/components/ui/action-button'
import { cn } from '@/core/lib/utils'
import type { UIPelanggan } from '@/features/pelanggan/store/pelangganStore'
import {
  PELANGGAN_COLUMN_CLASS,
  PELANGGAN_ROW_HEIGHT_PX,
  formatPelangganDate,
  formatPoints,
  formatDiscount,
  resolvePelangganStatusLabel,
  resolvePelangganStatusTone,
  resolvePelangganTypeTone,
} from '@/features/pelanggan/utils/tableUtils'

export type PelangganTableRowProps = {
  pelanggan: UIPelanggan
  isActive: boolean
  onFocus: () => void
  onKeyDown: (event: KeyboardEvent<HTMLTableRowElement>) => void
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

export const PelangganTableRow = forwardRef<HTMLTableRowElement, PelangganTableRowProps>(({
  pelanggan,
  isActive,
  onFocus,
  onKeyDown,
  onView,
  onEdit,
  onDelete,
}, ref) => {
  const pointsLabel = formatPoints(pelanggan.saldo_poin || 0)
  const discountLabel = formatDiscount(pelanggan.diskon_persen)
  const statusLabel = resolvePelangganStatusLabel(pelanggan.status)
  const statusTone = resolvePelangganStatusTone(pelanggan.status)
  const typeTone = resolvePelangganTypeTone(pelanggan.tipe)
  const updatedAt = pelanggan.diperbarui_pada || pelanggan.dibuat_pada

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
      style={{ height: PELANGGAN_ROW_HEIGHT_PX }}
      aria-selected={isActive}
    >
      <TableCell className={cn(PELANGGAN_COLUMN_CLASS.kode, 'py-[6px] align-middle')}>
        <span className="font-mono text-sm text-slate-600">{pelanggan.kode}</span>
      </TableCell>
      <TableCell className={cn(PELANGGAN_COLUMN_CLASS.nama, 'py-[6px] align-middle')}>
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-800 group-hover/table-row:text-slate-900 group-data-[active=true]/table-row:text-slate-900" title={pelanggan.nama}>
            {pelanggan.nama}
          </p>
          {pelanggan.alamat && (
            <p className="text-[13px] text-slate-500 group-hover/table-row:text-slate-700 group-data-[active=true]/table-row:text-slate-700 line-clamp-1" title={pelanggan.alamat}>
              {pelanggan.alamat}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell className={cn(PELANGGAN_COLUMN_CLASS.email, 'py-[6px] align-middle')}>
        {pelanggan.email ? (
          <a href={`mailto:${pelanggan.email}`} className="text-sm text-blue-600 hover:underline">
            {pelanggan.email}
          </a>
        ) : (
          <span className="text-sm text-slate-400">Tidak ada</span>
        )}
      </TableCell>
      <TableCell className={cn(PELANGGAN_COLUMN_CLASS.telepon, 'py-[6px] align-middle')}>
        <span className="text-sm text-slate-700 group-hover/table-row:text-slate-900 group-data-[active=true]/table-row:text-slate-900">
          {pelanggan.telepon || '—'}
        </span>
      </TableCell>
      <TableCell className={cn(PELANGGAN_COLUMN_CLASS.tipe, 'py-[6px] align-middle')}>
        <span className={typeTone}>{pelanggan.tipe.toUpperCase()}</span>
      </TableCell>
      <TableCell className={cn(PELANGGAN_COLUMN_CLASS.poin, 'py-[6px] align-middle')}>
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800 group-hover/table-row:text-slate-900 group-data-[active=true]/table-row:text-slate-900">
            {pointsLabel}
          </span>
          {discountLabel && (
            <span className="text-[12px] text-emerald-600">{discountLabel}</span>
          )}
        </div>
      </TableCell>
      <TableCell className={cn(PELANGGAN_COLUMN_CLASS.status, 'py-[6px] align-middle')}>
        <span className={statusTone}>{statusLabel}</span>
      </TableCell>
      <TableCell className={cn(PELANGGAN_COLUMN_CLASS.updated, 'py-[6px] align-middle')}>
        {formatPelangganDate(updatedAt)}
      </TableCell>
      <TableCell className={cn(PELANGGAN_COLUMN_CLASS.aksi, 'py-[6px] align-middle text-right')}>
        <ActionButton
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          viewLabel="Lihat detail pelanggan"
          editLabel="Edit pelanggan"
          deleteLabel="Hapus pelanggan"
        />
      </TableCell>
    </TableRow>
  )
})

PelangganTableRow.displayName = 'PelangganTableRow'
