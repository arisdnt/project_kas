import { DeleteConfirmationDialog } from '@/core/components/ui/delete-confirmation-dialog'
import { UIPembelian } from '../store/pembelianStore'
import { useToast } from '@/core/hooks/use-toast'
import { ScrollArea } from '@/core/components/ui/scroll-area'
import { Table, TableBody } from '@/core/components/ui/table'
import { PembelianTableHeader } from './PembelianTableHeader'
import { PembelianTableRow } from './PembelianTableRow'
import { TableSkeletonLoader } from './TableSkeletonLoader'
import { LoadingIndicator } from './LoadingIndicator'
import { EmptyTableState } from './EmptyTableState'
import { PembelianToolbar } from './PembelianToolbar'
import { usePembelianTableState } from '../hooks/usePembelianTableState'

type Props = {
  onView: (p: UIPembelian) => void
  onEdit: (p: UIPembelian) => void
  onCreate: () => void
  onPrint?: (p: UIPembelian) => void
}

export function PembelianTableNew({ onView, onEdit, onCreate, onPrint }: Props) {
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
  } = usePembelianTableState()

  const { toast } = useToast()

  const handleDelete = async () => {
    const result = await handleDeleteConfirm()
    if (result.success) {
      toast({
        title: 'Pembelian dihapus',
        description: `Transaksi "${result.pembelian.nomorTransaksi}" berhasil dihapus.`,
      })
      closeDeleteDialog()
    } else {
      toast({
        title: 'Gagal menghapus pembelian',
        description: result.error,
      })
    }
  }

  const handleRowKeyDown = (event: any, pembelian: UIPembelian) => {
    const result = handleKeyNavigation(event, pembelian)
    if (result?.action === 'view') {
      onView(result.pembelian)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="pb-3">
        <PembelianToolbar onCreate={onCreate} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-t border-l border-r border-slate-200 bg-white">
        {/* Fixed Header */}
        <div className="border-b border-slate-200 bg-white">
          <Table className="min-w-full text-[15px] leading-[1.4] text-slate-700">
            <PembelianTableHeader
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
              {sortedItems.map((pembelian) => {
                const isActive = activeRowId === pembelian.id
                const touch = recentlyTouched[pembelian.id]

                return (
                  <PembelianTableRow
                    key={pembelian.id}
                    ref={(el) => {
                      rowRefs.current[pembelian.id] = el
                    }}
                    pembelian={pembelian}
                    isActive={isActive}
                    recentlyTouched={touch}
                    onFocus={() => handleRowFocus(pembelian)}
                    onKeyDown={(event) => handleRowKeyDown(event, pembelian)}
                    onView={() => onView(pembelian)}
                    onEdit={() => onEdit(pembelian)}
                    onDelete={() => openDeleteDialog(pembelian)}
                    onPrint={onPrint ? () => onPrint(pembelian) : undefined}
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
        title="Hapus Pembelian"
        description="Apakah Anda yakin ingin menghapus transaksi pembelian ini? Semua data terkait transaksi akan ikut terhapus."
        itemName={deleteDialog.pembelian?.nomorTransaksi}
        onConfirm={handleDelete}
        isLoading={deleteDialog.loading}
        confirmText="Hapus Pembelian"
      />
    </div>
  )
}