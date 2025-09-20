import { type KeyboardEvent } from 'react';
import { useToast } from '@/core/hooks/use-toast';
import { ScrollArea } from '@/core/components/ui/scroll-area';
import { Table, TableBody } from '@/core/components/ui/table';
import { DeleteConfirmationDialog } from '@/core/components/ui/delete-confirmation-dialog';
import { KategoriToolbar } from '@/features/kategori/components/KategoriToolbar';
import { CategoryTableHeader } from '@/features/kategori/components/CategoryTableHeader';
import { CategoryTableRow } from '@/features/kategori/components/CategoryTableRow';
import { CategoryTableSkeletonLoader } from '@/features/kategori/components/CategoryTableSkeletonLoader';
import { CategoryEmptyState } from '@/features/kategori/components/CategoryEmptyState';
import { CategoryLoadingIndicator } from '@/features/kategori/components/CategoryLoadingIndicator';
import { useKategoriTableState } from '@/features/kategori/hooks/useKategoriTableState';
import { type UIKategori } from '@/features/kategori/types/kategori';

export type KategoriTableProps = {
  onView: (kategori: UIKategori) => void;
  onEdit: (kategori: UIKategori) => void;
  onCreate: () => void;
};

export function KategoriTable({ onView, onEdit, onCreate }: KategoriTableProps) {
  const {
    items,
    loading,
    sortedItems,
    sortState,
    activeRowId,
    deleteDialog,
    headerElevated,
    scrollAreaRef,
    rowRefs,
    toggleSort,
    openDeleteDialog,
    closeDeleteDialog,
    handleDeleteConfirm,
    handleRowFocus,
    handleKeyNavigation,
  } = useKategoriTableState();

  const { toast } = useToast();

  const handleDelete = async () => {
    const result = await handleDeleteConfirm();
    if (result.success) {
      toast({
        title: 'Kategori dihapus',
        description: `Kategori "${result.kategori.nama}" berhasil dihapus.`,
      });
      closeDeleteDialog();
    } else {
      toast({
        title: 'Gagal menghapus kategori',
        description: result.error,
      });
    }
  };

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, kategori: UIKategori) => {
    const result = handleKeyNavigation(event, kategori);
    if (result?.action === 'view') {
      onView(result.kategori);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="pb-3">
        <KategoriToolbar onCreate={onCreate} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-l border-r border-t border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-white">
          <Table className="min-w-full text-[15px] leading-[1.4] text-slate-700">
            <CategoryTableHeader
              sortState={sortState}
              onToggleSort={toggleSort}
              headerElevated={headerElevated}
            />
          </Table>
        </div>

        <ScrollArea ref={scrollAreaRef} className="h-full flex-1">
          <Table className="min-w-full text-[15px] leading-[1.4] text-slate-700">
            <TableBody className="divide-y divide-slate-100">
              {sortedItems.map((kategori) => {
                const isActive = activeRowId === kategori.id;
                return (
                  <CategoryTableRow
                    key={kategori.id}
                    ref={(el) => {
                      rowRefs.current[kategori.id] = el;
                    }}
                    kategori={kategori}
                    isActive={isActive}
                    onFocus={() => handleRowFocus(kategori)}
                    onKeyDown={(event) => handleRowKeyDown(event, kategori)}
                    onView={() => onView(kategori)}
                    onEdit={() => onEdit(kategori)}
                    onDelete={() => openDeleteDialog(kategori)}
                  />
                );
              })}

              {loading && items.length === 0 ? <CategoryTableSkeletonLoader /> : null}
              {!loading && sortedItems.length === 0 ? <CategoryEmptyState /> : null}
            </TableBody>
          </Table>

          {loading && items.length > 0 ? <CategoryLoadingIndicator /> : null}
        </ScrollArea>
      </div>

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={closeDeleteDialog}
        title="Hapus Kategori"
        description="Apakah Anda yakin ingin menghapus kategori ini? Aksi ini tidak dapat dibatalkan."
        itemName={deleteDialog.kategori?.nama}
        onConfirm={handleDelete}
        isLoading={deleteDialog.loading}
        confirmText="Hapus Kategori"
      />
    </div>
  );
}
