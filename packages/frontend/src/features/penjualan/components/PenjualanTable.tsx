import { DeleteConfirmationDialog } from '@/core/components/ui/delete-confirmation-dialog'
import { UIPenjualan } from '../store/penjualanStore'
import { useToast } from '@/core/hooks/use-toast'
import { ScrollArea } from '@/core/components/ui/scroll-area'
import { Table, TableBody } from '@/core/components/ui/table'
import { PenjualanTableHeader } from './PenjualanTableHeader'
import { PenjualanTableRow } from './PenjualanTableRow'
import { TableSkeletonLoader } from './TableSkeletonLoader'
import { LoadingIndicator } from './LoadingIndicator'
import { EmptyTableState } from './EmptyTableState'
import { PenjualanToolbar } from './PenjualanToolbar'
import { usePenjualanTableState } from '../hooks/usePenjualanTableState'

type Props = {
  onView: (p: UIPenjualan) => void
  onEdit: (p: UIPenjualan) => void
  onCreate: () => void
  onPrint?: (p: UIPenjualan) => void
}

export function PenjualanTable({ onView, onEdit, onCreate, onPrint }: Props) {
  const {
    items,
    loading,
    sortedItems,
    sortState,
    activeRowId,
    deleteDialog,
    headerElevated,
    lastUpdatedAt,
    recentlyTouched,
    scrollAreaRef,
    rowRefs,
    toggleSort,
    openDeleteDialog,
    closeDeleteDialog,
    handleDeleteConfirm,
    handleRowFocus,
    handleKeyNavigation,
  } = usePenjualanTableState()

  const { toast } = useToast()

  const handleDelete = async () => {
    const result = await handleDeleteConfirm()
    if (result.success) {
      toast({
        title: 'Transaksi dihapus',
        description: `Transaksi "${result.penjualan.kode}" berhasil dihapus.`,
      })
      closeDeleteDialog()
    } else {
      toast({
        title: 'Gagal menghapus transaksi',
        description: result.error,
      })
    }
  }

  const handleRowKeyDown = (event: any, penjualan: UIPenjualan) => {
    const result = handleKeyNavigation(event, penjualan)
    if (result?.action === 'view') {
      onView(result.penjualan)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="pb-3">
        <PenjualanToolbar onCreate={onCreate} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-t border-l border-r border-slate-200 bg-white">
        {/* Fixed Header */}
        <div className="border-b border-slate-200 bg-white">
          <Table className="min-w-full text-[15px] leading-[1.4] text-slate-700">
            <PenjualanTableHeader
              sortState={sortState}
              onToggleSort={toggleSort}
              headerElevated={headerElevated}
            />
          </Table>
        </div>

        {/* Scrollable Body */}
        <ScrollArea ref={scrollAreaRef} className="h-full flex-1">
          <Table className="min-w-full text-[15px] leading-[1.4] text-slate-700">
            <TableBody className="divide-y divide-slate-100">
              {sortedItems.map((penjualan) => {
                const isActive = activeRowId === penjualan.id
                const touch = recentlyTouched[penjualan.id]

                return (
                  <PenjualanTableRow
                    key={penjualan.id}
                    ref={(el) => {
                      rowRefs.current[penjualan.id] = el
                    }}
                    penjualan={penjualan}
                    isActive={isActive}
                    recentlyTouched={touch}
                    onFocus={() => handleRowFocus(penjualan)}
                    onKeyDown={(event) => handleRowKeyDown(event, penjualan)}
                    onView={() => onView(penjualan)}
                    onEdit={() => onEdit(penjualan)}
                    onDelete={() => openDeleteDialog(penjualan)}
                    onPrint={onPrint ? () => onPrint(penjualan) : undefined}
                  />
                )
              })}

              {loading && items.length === 0 ? <TableSkeletonLoader /> : null}
              {!loading && sortedItems.length === 0 ? <EmptyTableState /> : null}
            </TableBody>
          </Table>

          {loading && items.length > 0 && <LoadingIndicator />}
        </ScrollArea>
      </div>

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={closeDeleteDialog}
        title="Hapus Transaksi"
        description="Apakah Anda yakin ingin menghapus transaksi ini? Semua data terkait transaksi akan ikut terhapus."
        itemName={deleteDialog.penjualan?.kode}
        onConfirm={handleDelete}
        isLoading={deleteDialog.loading}
        confirmText="Hapus Transaksi"
      />
    </div>
  )
}