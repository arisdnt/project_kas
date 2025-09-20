import { DeleteConfirmationDialog } from '@/core/components/ui/delete-confirmation-dialog'
import { UIStokOpname } from '../store/stokOpnameStoreNew'
import { useToast } from '@/core/hooks/use-toast'
import { ScrollArea } from '@/core/components/ui/scroll-area'
import { Table, TableBody } from '@/core/components/ui/table'
import { StokOpnameTableHeaderNew } from './StokOpnameTableHeaderNew'
import { StokOpnameTableRowNew } from './StokOpnameTableRowNew'
import { TableSkeletonLoader } from './TableSkeletonLoader'
import { LoadingIndicator } from './LoadingIndicator'
import { EmptyTableState } from './EmptyTableState'
import { StokOpnameToolbarNew } from './StokOpnameToolbarNew'
import { useStokOpnameTableState } from '../hooks/useStokOpnameTableState'

type Props = {
  onView: (s: UIStokOpname) => void
  onEdit: (s: UIStokOpname) => void
  onCreate: () => void
  onComplete?: (s: UIStokOpname) => void
  onCancel?: (s: UIStokOpname) => void
}

export function StokOpnameTableNew({ onView, onEdit, onCreate, onComplete, onCancel }: Props) {
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
  } = useStokOpnameTableState()

  const { toast } = useToast()

  const handleDelete = async () => {
    const result = await handleDeleteConfirm()
    if (result.success) {
      toast({
        title: 'Stok opname dihapus',
        description: `Stok opname "${result.stokOpname.namaProduk}" berhasil dihapus.`,
      })
      closeDeleteDialog()
    } else {
      toast({
        title: 'Gagal menghapus stok opname',
        description: result.error,
      })
    }
  }

  const handleRowKeyDown = (event: any, stokOpname: UIStokOpname) => {
    const result = handleKeyNavigation(event, stokOpname)
    if (result?.action === 'view') {
      onView(result.stokOpname)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="pb-3">
        <StokOpnameToolbarNew onCreate={onCreate} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-t border-l border-r border-slate-200 bg-white">
        {/* Fixed Header */}
        <div className="border-b border-slate-200 bg-white">
          <Table className="min-w-full text-[15px] leading-[1.4] text-slate-700">
            <StokOpnameTableHeaderNew
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
              {sortedItems.map((stokOpname) => {
                const isActive = activeRowId === stokOpname.id
                const touch = recentlyTouched[stokOpname.id]

                return (
                  <StokOpnameTableRowNew
                    key={stokOpname.id}
                    ref={(el) => {
                      rowRefs.current[stokOpname.id] = el
                    }}
                    stokOpname={stokOpname}
                    isActive={isActive}
                    recentlyTouched={touch}
                    onFocus={() => handleRowFocus(stokOpname)}
                    onKeyDown={(event) => handleRowKeyDown(event, stokOpname)}
                    onView={() => onView(stokOpname)}
                    onEdit={() => onEdit(stokOpname)}
                    onDelete={() => openDeleteDialog(stokOpname)}
                    onComplete={onComplete ? () => onComplete(stokOpname) : undefined}
                    onCancel={onCancel ? () => onCancel(stokOpname) : undefined}
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
        title="Hapus Stok Opname"
        description="Apakah Anda yakin ingin menghapus data stok opname ini? Semua data terkait akan ikut terhapus."
        itemName={deleteDialog.stokOpname?.namaProduk}
        onConfirm={handleDelete}
        isLoading={deleteDialog.loading}
        confirmText="Hapus Stok Opname"
      />
    </div>
  )
}