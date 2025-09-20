import { ProdukToolbar } from '@/features/produk/components/ProdukToolbar'
import { DeleteConfirmationDialog } from '@/core/components/ui/delete-confirmation-dialog'
import { UIProduk } from '@/features/produk/store/produkStore'
import { useToast } from '@/core/hooks/use-toast'
import { ScrollArea } from '@/core/components/ui/scroll-area'
import { Table, TableBody } from '@/core/components/ui/table'
import { ProductTableHeader } from './ProductTableHeader'
import { ProductTableRow } from './ProductTableRow'
import { TableSkeletonLoader } from './TableSkeletonLoader'
import { LoadingIndicator } from './LoadingIndicator'
import { EmptyTableState } from './EmptyTableState'
import { useProductTableState } from '@/features/produk/hooks/useProductTableState'

type Props = {
  onView: (p: UIProduk) => void
  onEdit: (p: UIProduk) => void
  onCreate: () => void
}

export function ProdukTable({ onView, onEdit, onCreate }: Props) {
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
    filters,
    page,
    categoryOptions,
    brandOptions,
    supplierOptions,
    scrollAreaRef,
    rowRefs,
    toggleSort,
    resetFilters,
    setFilters,
    openDeleteDialog,
    closeDeleteDialog,
    handleDeleteConfirm,
    handleRowFocus,
    handleKeyNavigation,
  } = useProductTableState()

  const { toast } = useToast()

  const handleDelete = async () => {
    const result = await handleDeleteConfirm()
    if (result.success) {
      toast({
        title: 'Produk dihapus',
        description: `Produk "${result.product.nama}" berhasil dihapus.`,
      })
      closeDeleteDialog()
    } else {
      toast({
        title: 'Gagal menghapus produk',
        description: result.error,
      })
    }
  }

  const handleRowKeyDown = (event: any, product: UIProduk) => {
    const result = handleKeyNavigation(event, product)
    if (result?.action === 'view') {
      onView(result.product)
    }
  }


  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="pb-3">
        <ProdukToolbar onCreate={onCreate} />
      </div>


      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-t border-l border-r border-slate-200 bg-white">
        {/* Fixed Header */}
        <div className="border-b border-slate-200 bg-white">
          <Table className="min-w-full text-[15px] leading-[1.4] text-slate-700">
            <ProductTableHeader
              sortState={sortState}
              onToggleSort={toggleSort}
              filters={filters}
              onFiltersChange={setFilters}
              categoryOptions={categoryOptions}
              brandOptions={brandOptions}
              supplierOptions={supplierOptions}
              headerElevated={headerElevated}
            />
          </Table>
        </div>

        {/* Scrollable Body */}
        <ScrollArea ref={scrollAreaRef} className="h-full flex-1">
          <Table className="min-w-full text-[15px] leading-[1.4] text-slate-700">
            <TableBody className="divide-y divide-slate-100">
              {sortedItems.map((product) => {
                const isActive = activeRowId === product.id
                const touch = recentlyTouched[product.id]

                return (
                  <ProductTableRow
                    key={product.id}
                    ref={(el) => {
                      rowRefs.current[product.id] = el
                    }}
                    product={product}
                    isActive={isActive}
                    recentlyTouched={touch}
                    onFocus={() => handleRowFocus(product)}
                    onKeyDown={(event) => handleRowKeyDown(event, product)}
                    onView={() => onView(product)}
                    onEdit={() => onEdit(product)}
                    onDelete={() => openDeleteDialog(product)}
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
        title="Hapus Produk"
        description="Apakah Anda yakin ingin menghapus produk ini? Semua data terkait produk akan ikut terhapus."
        itemName={deleteDialog.product?.nama}
        onConfirm={handleDelete}
        isLoading={deleteDialog.loading}
        confirmText="Hapus Produk"
      />
    </div>
  )
}
