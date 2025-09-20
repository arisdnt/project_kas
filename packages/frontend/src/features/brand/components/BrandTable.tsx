import { Table, TableBody } from '@/core/components/ui/table'
import { ScrollArea } from '@/core/components/ui/scroll-area'
import { DeleteConfirmationDialog } from '@/core/components/ui/delete-confirmation-dialog'
import { useToast } from '@/core/hooks/use-toast'
import { useBrandTableState } from '@/features/brand/hooks/useBrandTableState'
import { BrandToolbar } from './BrandToolbar'
import { BrandTableHeader } from './BrandTableHeader'
import { BrandTableRow } from './BrandTableRow'
import { BrandTableSkeletonLoader } from './BrandTableSkeletonLoader'
import { BrandLoadingIndicator } from './BrandLoadingIndicator'
import { BrandEmptyState } from './BrandEmptyState'
import type { UIBrand } from '@/features/brand/store/brandStore'
import { BrandFilters } from '@/features/brand/utils/tableUtils'

import type { KeyboardEvent } from 'react'

type Props = {
  onView: (brand: UIBrand) => void
  onEdit: (brand: UIBrand) => void
  onCreate: () => void
}

export function BrandTable({ onView, onEdit, onCreate }: Props) {
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
    brandCount,
    filteredCount,
    logoStats,
    websiteStats,
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
  } = useBrandTableState()

  const { toast } = useToast()

  const handleFiltersChange = (partial: Partial<BrandFilters>) => {
    setFilters((prev) => {
      const next: BrandFilters = { ...prev, ...partial }
      for (const key of Object.keys(next) as Array<keyof BrandFilters>) {
        const value = next[key]
        if (!value || (Array.isArray(value) && value.length === 0)) {
          delete next[key]
        }
      }
      return next
    })
  }

  const handleDelete = async () => {
    const result = await handleDeleteConfirm()
    if (result.success) {
      toast({
        title: 'Brand dihapus',
        description: `Brand "${result.brand.nama}" berhasil dihapus.`,
      })
      closeDeleteDialog()
    } else if (result.error) {
      toast({
        title: 'Gagal menghapus brand',
        description: result.error,
      })
    }
  }

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, brand: UIBrand) => {
    const result = handleKeyNavigation(event, brand)
    if (result?.action === 'view') {
      onView(result.brand)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="pb-3">
        <BrandToolbar
          onCreate={onCreate}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onResetFilters={resetFilters}
          brandCount={brandCount}
          filteredCount={filteredCount}
          logoStats={logoStats}
          websiteStats={websiteStats}
          page={page}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-l border-r border-t border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-white">
          <Table className="min-w-full text-[15px] leading-[1.4] text-slate-700">
            <BrandTableHeader
              sortState={sortState}
              onToggleSort={toggleSort}
              headerElevated={headerElevated}
            />
          </Table>
        </div>

        <ScrollArea ref={scrollAreaRef} className="h-full flex-1">
          <Table className="min-w-full text-[15px] leading-[1.4] text-slate-700">
            <TableBody className="divide-y divide-slate-100">
              {sortedItems.map((brand) => (
                <BrandTableRow
                  key={brand.id}
                  ref={(el) => {
                    rowRefs.current[brand.id] = el
                  }}
                  brand={brand}
                  isActive={activeRowId === brand.id}
                  onFocus={() => handleRowFocus(brand)}
                  onKeyDown={(event) => handleRowKeyDown(event, brand)}
                  onView={() => onView(brand)}
                  onEdit={() => onEdit(brand)}
                  onDelete={() => openDeleteDialog(brand)}
                />
              ))}

              {loading && items.length === 0 ? <BrandTableSkeletonLoader /> : null}
              {!loading && sortedItems.length === 0 ? <BrandEmptyState /> : null}
            </TableBody>
          </Table>

          {loading && items.length > 0 ? <BrandLoadingIndicator /> : null}
        </ScrollArea>
      </div>

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={closeDeleteDialog}
        title="Hapus Brand"
        description="Apakah Anda yakin ingin menghapus brand ini? Semua produk yang menggunakan brand ini akan terpengaruh."
        itemName={deleteDialog.brand?.nama}
        onConfirm={handleDelete}
        isLoading={deleteDialog.loading}
        confirmText="Hapus Brand"
      />
    </div>
  )
}
