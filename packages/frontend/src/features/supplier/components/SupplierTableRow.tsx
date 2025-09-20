import { forwardRef, type KeyboardEvent } from 'react'
import { TableCell, TableRow } from '@/core/components/ui/table'
import { ActionButton } from '@/core/components/ui/action-button'
import { cn } from '@/core/lib/utils'
import type { UISupplier } from '@/features/supplier/store/supplierStore'
import {
  SUPPLIER_COLUMN_CLASS,
  SUPPLIER_ROW_HEIGHT_PX,
  formatSupplierDate,
  resolveSupplierStatusLabel,
  resolveSupplierStatusTone,
  getPrimaryContactName,
  getPrimaryEmail,
  getPrimaryPhone,
} from '@/features/supplier/utils/tableUtils'

export type SupplierTableRowProps = {
  supplier: UISupplier
  isActive: boolean
  onFocus: () => void
  onKeyDown: (event: KeyboardEvent<HTMLTableRowElement>) => void
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

export const SupplierTableRow = forwardRef<HTMLTableRowElement, SupplierTableRowProps>(({
  supplier,
  isActive,
  onFocus,
  onKeyDown,
  onView,
  onEdit,
  onDelete,
}, ref) => {
  const contactName = getPrimaryContactName(supplier)
  const email = getPrimaryEmail(supplier)
  const phone = getPrimaryPhone(supplier)
  const updatedAt = supplier.diperbarui_pada || supplier.dibuat_pada
  const statusLabel = resolveSupplierStatusLabel(supplier.status)
  const statusTone = resolveSupplierStatusTone(supplier.status)

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
      style={{ height: SUPPLIER_ROW_HEIGHT_PX }}
      aria-selected={isActive}
    >
      <TableCell className={cn(SUPPLIER_COLUMN_CLASS.supplier, 'py-[6px] align-middle')}>
        <div className="min-w-0">
          <div className="truncate font-medium text-slate-800 group-hover/table-row:text-slate-900 group-data-[active=true]/table-row:text-slate-900" title={supplier.nama}>
            {supplier.nama}
          </div>
          {supplier.alamat && (
            <p className="text-[13px] text-slate-500 group-hover/table-row:text-slate-700 group-data-[active=true]/table-row:text-slate-700 line-clamp-1" title={supplier.alamat}>
              {supplier.alamat}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell className={cn(SUPPLIER_COLUMN_CLASS.contact, 'py-[6px] align-middle')}>
        <span className="text-sm text-slate-700 group-hover/table-row:text-slate-900 group-data-[active=true]/table-row:text-slate-900">
          {contactName}
        </span>
      </TableCell>
      <TableCell className={cn(SUPPLIER_COLUMN_CLASS.email, 'py-[6px] align-middle')}>
        {supplier.email ? (
          <a
            href={`mailto:${supplier.email}`}
            className="text-sm text-blue-600 hover:underline"
          >
            {email}
          </a>
        ) : (
          <span className="text-sm text-slate-400">Tidak ada</span>
        )}
      </TableCell>
      <TableCell className={cn(SUPPLIER_COLUMN_CLASS.phone, 'py-[6px] align-middle')}>
        <span className="text-sm text-slate-700 group-hover/table-row:text-slate-900 group-data-[active=true]/table-row:text-slate-900">
          {phone}
        </span>
      </TableCell>
      <TableCell className={cn(SUPPLIER_COLUMN_CLASS.status, 'py-[6px] align-middle')}>
        <span className={statusTone}>{statusLabel}</span>
      </TableCell>
      <TableCell className={cn(SUPPLIER_COLUMN_CLASS.updated, 'py-[6px] align-middle')}>
        {formatSupplierDate(updatedAt)}
      </TableCell>
      <TableCell className={cn(SUPPLIER_COLUMN_CLASS.aksi, 'py-[6px] align-middle')}>
        <ActionButton
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          viewLabel="Lihat detail supplier"
          editLabel="Edit supplier"
          deleteLabel="Hapus supplier"
        />
      </TableCell>
    </TableRow>
  )
})

SupplierTableRow.displayName = 'SupplierTableRow'
