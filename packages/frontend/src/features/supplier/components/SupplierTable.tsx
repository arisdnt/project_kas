import { Table, TableBody } from '@/core/components/ui/table'
import { ScrollArea } from '@/core/components/ui/scroll-area'
import { DeleteConfirmationDialog } from '@/core/components/ui/delete-confirmation-dialog'
import { useToast } from '@/core/hooks/use-toast'
import { useSupplierTableState } from '@/features/supplier/hooks/useSupplierTableState'
import { SupplierToolbar } from './SupplierToolbar'
import { SupplierTableHeader } from './SupplierTableHeader'
import { SupplierTableRow } from './SupplierTableRow'
import { SupplierTableSkeletonLoader } from './SupplierTableSkeletonLoader'
import { SupplierEmptyState } from './SupplierEmptyState'
import { SupplierLoadingIndicator } from './SupplierLoadingIndicator'
import type { UISupplier } from '@/features/supplier/store/supplierStore'
import { SupplierFilters } from '@/features/supplier/utils/tableUtils'

import type { KeyboardEvent } from 'react'

type Props = {
  onView: (supplier: UISupplier) => void
  onEdit: (supplier: UISupplier) => void
  onCreate: () => void
}

export function SupplierTable({ onView, onEdit, onCreate }: Props) {
  const {
    items,
    loading,
    sortState,
    filters,
    sortedItems,
    activeRowId,
    deleteDialog,
    headerElevated,
    page,
    totalCount,
    filteredCount,
    contactStats,
    emailStats,
    bankStats,
    scrollAreaRef,
    rowRefs,
    setFilters,
    toggleSort,
    resetFilters,
    openDeleteDialog,
    closeDeleteDialog,
    handleDeleteConfirm,
    handleRowFocus,
    handleKeyNavigation,
  } = useSupplierTableState()

  const { toast } = useToast()

  const handleFiltersChange = (partial: Partial<SupplierFilters>) => {
    setFilters((prev) => {
      const next: SupplierFilters = { ...prev, ...partial }
      // Ensure status default to 'all' when cleared
      if (!next.status) next.status = 'all'
      const keys = Object.keys(next) as Array<keyof SupplierFilters>
      keys.forEach((key) => {
        const value = next[key]
        if (Array.isArray(value) && value.length === 0) {
          delete next[key]
        }
      })
      return next
    })
  }

  const handleDelete = async () => {
    const result = await handleDeleteConfirm()
    if (result.success) {
      toast({
        title: 'Supplier dihapus',
        description: `Supplier "${result.supplier.nama}" berhasil dihapus.`,
      })
      closeDeleteDialog()
    } else if (result.error) {
      toast({
        title: 'Gagal menghapus supplier',
        description: result.error,
      })
    }
  }

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, supplier: UISupplier) => {
    const result = handleKeyNavigation(event, supplier)
    if (result?.action === 'view') {
      onView(result.supplier)
    }
  }

  const handleResetFilters = () => {
    resetFilters()
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="pb-3">
        <SupplierToolbar
          onCreate={onCreate}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onResetFilters={handleResetFilters}
          totalCount={totalCount}
          filteredCount={filteredCount}
          contactStats={contactStats}
          emailStats={emailStats}
          bankStats={bankStats}
          page={page}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-l border-r border-t border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-white">
          <Table className="min-w-full text-[15px] leading-[1.4] text-slate-700">
            <SupplierTableHeader
              sortState={sortState}
              onToggleSort={toggleSort}
              headerElevated={headerElevated}
            />
          </Table>
        </div>

        <ScrollArea ref={scrollAreaRef} className="h-full flex-1">
          <Table className="min-w-full text-[15px] leading-[1.4] text-slate-700">
            <TableBody className="divide-y divide-slate-100">
              {sortedItems.map((supplier) => (
                <SupplierTableRow
                  key={supplier.id}
                  ref={(el) => {
                    rowRefs.current[supplier.id] = el
                  }}
                  supplier={supplier}
                  isActive={activeRowId === supplier.id}
                  onFocus={() => handleRowFocus(supplier)}
                  onKeyDown={(event) => handleRowKeyDown(event, supplier)}
                  onView={() => onView(supplier)}
                  onEdit={() => onEdit(supplier)}
                  onDelete={() => openDeleteDialog(supplier)}
                />
              ))}

              {loading && items.length === 0 ? <SupplierTableSkeletonLoader /> : null}
              {!loading && sortedItems.length === 0 ? <SupplierEmptyState /> : null}
            </TableBody>
          </Table>

          {loading && items.length > 0 ? <SupplierLoadingIndicator /> : null}
        </ScrollArea>
      </div>

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={closeDeleteDialog}
        title="Hapus Supplier"
        description="Apakah Anda yakin ingin menghapus supplier ini?"
        itemName={deleteDialog.supplier?.nama}
        onConfirm={handleDelete}
        isLoading={deleteDialog.loading}
        confirmText="Hapus Supplier"
      />
    </div>
  )
}
