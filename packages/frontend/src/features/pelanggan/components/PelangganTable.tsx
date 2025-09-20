import { Table, TableBody } from '@/core/components/ui/table'
import { ScrollArea } from '@/core/components/ui/scroll-area'
import { DeleteConfirmationDialog } from '@/core/components/ui/delete-confirmation-dialog'
import { useToast } from '@/core/hooks/use-toast'
import { usePelangganTableState } from '@/features/pelanggan/hooks/usePelangganTableState'
import { PelangganToolbar } from './PelangganToolbar'
import { PelangganTableHeader } from './PelangganTableHeader'
import { PelangganTableRow } from './PelangganTableRow'
import { PelangganTableSkeletonLoader } from './PelangganTableSkeletonLoader'
import { PelangganEmptyState } from './PelangganEmptyState'
import { PelangganLoadingIndicator } from './PelangganLoadingIndicator'
import type { UIPelanggan } from '@/features/pelanggan/store/pelangganStore'
import { PelangganFilters } from '@/features/pelanggan/utils/tableUtils'

import type { KeyboardEvent } from 'react'

type Props = {
  onView: (pelanggan: UIPelanggan) => void
  onEdit: (pelanggan: UIPelanggan) => void
  onCreate: () => void
}

export function PelangganTable({ onView, onEdit, onCreate }: Props) {
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
    pointStats,
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
  } = usePelangganTableState()

  const { toast } = useToast()

  const handleFiltersChange = (partial: Partial<PelangganFilters>) => {
    setFilters((prev) => {
      const next: PelangganFilters = { ...prev, ...partial }
      if (!next.status) next.status = 'all'
      if (!next.tipe) next.tipe = 'all'
      const keys = Object.keys(next) as Array<keyof PelangganFilters>
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
        title: 'Pelanggan dihapus',
        description: `Pelanggan "${result.pelanggan.nama}" berhasil dihapus.`,
      })
      closeDeleteDialog()
    } else if (result.error) {
      toast({
        title: 'Gagal menghapus pelanggan',
        description: result.error,
      })
    }
  }

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, pelanggan: UIPelanggan) => {
    const result = handleKeyNavigation(event, pelanggan)
    if (result?.action === 'view') {
      onView(result.pelanggan)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="pb-3">
        <PelangganToolbar
          onCreate={onCreate}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onResetFilters={resetFilters}
          totalCount={totalCount}
          filteredCount={filteredCount}
          contactStats={contactStats}
          emailStats={emailStats}
          pointStats={pointStats}
          page={page}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-l border-r border-t border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-white">
          <Table className="min-w-full text-[15px] leading-[1.4] text-slate-700">
            <PelangganTableHeader
              sortState={sortState}
              onToggleSort={toggleSort}
              headerElevated={headerElevated}
            />
          </Table>
        </div>

        <ScrollArea ref={scrollAreaRef} className="h-full flex-1">
          <Table className="min-w-full text-[15px] leading-[1.4] text-slate-700">
            <TableBody className="divide-y divide-slate-100">
              {sortedItems.map((pelanggan) => (
                <PelangganTableRow
                  key={pelanggan.id}
                  ref={(el) => {
                    rowRefs.current[pelanggan.id] = el
                  }}
                  pelanggan={pelanggan}
                  isActive={activeRowId === pelanggan.id}
                  onFocus={() => handleRowFocus(pelanggan)}
                  onKeyDown={(event) => handleRowKeyDown(event, pelanggan)}
                  onView={() => onView(pelanggan)}
                  onEdit={() => onEdit(pelanggan)}
                  onDelete={() => openDeleteDialog(pelanggan)}
                />
              ))}

              {loading && items.length === 0 ? <PelangganTableSkeletonLoader /> : null}
              {!loading && sortedItems.length === 0 ? <PelangganEmptyState /> : null}
            </TableBody>
          </Table>

          {loading && items.length > 0 ? <PelangganLoadingIndicator /> : null}
        </ScrollArea>
      </div>

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={closeDeleteDialog}
        title="Hapus Pelanggan"
        description="Apakah Anda yakin ingin menghapus pelanggan ini?"
        itemName={deleteDialog.pelanggan?.nama}
        onConfirm={handleDelete}
        isLoading={deleteDialog.loading}
        confirmText="Hapus Pelanggan"
      />
    </div>
  )
}
