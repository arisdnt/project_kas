import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CatatanFilters } from '@/features/catatan/components/CatatanFilters';
import { CatatanList } from '@/features/catatan/components/CatatanList';
import { CatatanDetailPanel } from '@/features/catatan/components/CatatanDetailPanel';
import { CatatanStatsOverview } from '@/features/catatan/components/CatatanStatsOverview';
import { CatatanComposer } from '@/features/catatan/components/CatatanComposer';
import { CatatanRecord, CreateCatatanPayload, UpdateCatatanPayload } from '@/features/catatan/types/catatan';
import { useCatatanStore } from '@/features/catatan/store/catatanStore';
import { useCatatanRealtime } from '@/features/catatan/hooks/useCatatanRealtime';
import { DeleteConfirmationDialog } from '@/core/components/ui/delete-confirmation-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Badge } from '@/core/components/ui/badge';
import { ScrollArea } from '@/core/components/ui/scroll-area';
import { useToast } from '@/core/hooks/use-toast';
import { BellRing } from 'lucide-react';

export function CatatanPage() {
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState<'create' | 'edit'>('create');
  const [editingRecord, setEditingRecord] = useState<CatatanRecord | undefined>();
  const [deletingRecord, setDeletingRecord] = useState<CatatanRecord | undefined>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const items = useCatatanStore((state) => state.items);
  const loading = useCatatanStore((state) => state.loading);
  const filters = useCatatanStore((state) => state.filters);
  const setFilters = useCatatanStore((state) => state.setFilters);
  const resetFilters = useCatatanStore((state) => state.resetFilters);
  const page = useCatatanStore((state) => state.pagination.page);
  const totalPages = useCatatanStore((state) => state.pagination.total_pages);
  const setPage = useCatatanStore((state) => state.setPage);
  const stats = useCatatanStore((state) => state.stats);
  const statsLoading = useCatatanStore((state) => state.statsLoading);
  const reminderItems = useCatatanStore((state) => state.reminderItems);
  const reminderLoading = useCatatanStore((state) => state.reminderLoading);
  const initialized = useCatatanStore((state) => state.initialized);
  const initialize = useCatatanStore((state) => state.initialize);
  const fetchList = useCatatanStore((state) => state.fetchList);
  const fetchReminders = useCatatanStore((state) => state.fetchReminders);
  const fetchStats = useCatatanStore((state) => state.fetchStats);
  const selectCatatan = useCatatanStore((state) => state.selectCatatan);
  const selected = useCatatanStore((state) => state.selected);
  const selectedLoading = useCatatanStore((state) => state.selectedLoading);
  const selectedId = useCatatanStore((state) => state.selectedId);
  const createCatatan = useCatatanStore((state) => state.createCatatan);
  const updateCatatan = useCatatanStore((state) => state.updateCatatan);
  const deleteCatatan = useCatatanStore((state) => state.deleteCatatan);

  useCatatanRealtime();

  useEffect(() => {
    if (!initialized) {
      initialize().catch((error: any) => {
        toast({
          title: 'Gagal memuat catatan',
          description: error?.message || 'Periksa koneksi Anda.',
          variant: 'destructive'
        });
      });
    }
  }, [initialized, initialize, toast]);

  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

  useEffect(() => {
    if (!initialized) {
      return;
    }
    fetchList().catch(() => {});
  }, [initialized, fetchList, filtersKey, page]);

  useEffect(() => {
    if (initialized) {
      fetchReminders().catch(() => {});
      fetchStats().catch(() => {});
    }
  }, [initialized, fetchReminders, fetchStats]);

  useEffect(() => {
    const highlight = searchParams.get('highlight');
    if (highlight) {
      selectCatatan(highlight).catch(() => {});
    }
  }, [searchParams, selectCatatan]);

  const handleOpenCreate = () => {
    setComposerMode('create');
    setEditingRecord(undefined);
    setComposerOpen(true);
  };

  const handleEdit = (record: CatatanRecord) => {
    setComposerMode('edit');
    setEditingRecord(record);
    setComposerOpen(true);
  };

  const handleComposerSubmit = async (payload: CreateCatatanPayload | UpdateCatatanPayload) => {
    setSubmitting(true);
    try {
      if (composerMode === 'create') {
        const created = await createCatatan(payload as CreateCatatanPayload);
        toast({ title: 'Catatan dibuat', description: `Catatan "${created.judul}" berhasil ditambahkan.` });
        selectCatatan(created.id).catch(() => {});
      } else if (editingRecord) {
        const updated = await updateCatatan(editingRecord.id, payload as UpdateCatatanPayload);
        toast({ title: 'Catatan diperbarui', description: `Perubahan pada "${updated.judul}" telah disimpan.` });
      }
    } catch (error: any) {
      toast({ title: 'Gagal menyimpan catatan', description: error?.message || 'Silakan coba lagi', variant: 'destructive' });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestDelete = (record: CatatanRecord) => {
    setDeletingRecord(record);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRecord) {
      return;
    }
    setSubmitting(true);
    try {
      await deleteCatatan(deletingRecord.id);
      toast({ title: 'Catatan dihapus', description: `Catatan "${deletingRecord.judul}" telah dihapus.` });
      setDeletingRecord(undefined);
    } catch (error: any) {
      toast({ title: 'Gagal menghapus', description: error?.message || 'Silakan coba kembali.', variant: 'destructive' });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelect = (id: string) => {
    void selectCatatan(id);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('highlight', id);
      return next;
    }, { replace: true });
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <CatatanStatsOverview stats={stats} loading={statsLoading} />

      <CatatanFilters
        filters={filters}
        onChange={(partial) => {
          setFilters(partial);
        }}
        onReset={resetFilters}
        onCreate={handleOpenCreate}
        loading={loading}
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-4">
          <CatatanList
            items={items}
            loading={loading}
            selectedId={selectedId}
            onSelect={handleSelect}
            onEdit={handleEdit}
            onDelete={handleRequestDelete}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />

          <Card className="border-blue-100 bg-blue-50/40">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                <BellRing className="h-4 w-4" /> Pengingat Terdekat
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-60">
                <div className="divide-y divide-blue-100">
                  {reminderLoading && (
                    <div className="px-4 py-6 text-center text-xs text-blue-500">Memuat pengingat...</div>
                  )}
                  {!reminderLoading && reminderItems.length === 0 && (
                    <div className="px-4 py-6 text-center text-xs text-blue-500">
                      Tidak ada pengingat aktif. Tambahkan pengingat untuk catatan kritikal.
                    </div>
                  )}
                  {!reminderLoading && reminderItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      className="flex w-full flex-col items-start gap-1 px-4 py-3 text-left transition-colors hover:bg-blue-100/60"
                    >
                      <div className="flex w-full items-center justify-between text-xs text-blue-800">
                        <span className="font-semibold line-clamp-1">{item.judul}</span>
                        <span>
                          {item.reminder_pada ? new Date(item.reminder_pada).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-700/80 line-clamp-2">{item.konten}</p>
                      <div className="flex items-center gap-2 text-[10px] text-blue-600/80">
                        <Badge variant="outline" className="border-blue-300 text-blue-700">
                          {item.visibilitas}
                        </Badge>
                        <span>•</span>
                        <span>{item.pembuat.nama || item.pembuat.username}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <CatatanDetailPanel
            record={selected}
            loading={selectedLoading}
            onEdit={handleEdit}
            onDelete={handleRequestDelete}
          />
        </div>
      </div>

      <CatatanComposer
        open={composerOpen}
        mode={composerMode}
        initialValue={composerMode === 'edit' ? editingRecord : undefined}
        onOpenChange={setComposerOpen}
        onSubmit={handleComposerSubmit}
        submitting={submitting}
      />

      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Catatan"
        description="Catatan yang dihapus tidak dapat dikembalikan. Pastikan informasi ini tidak lagi dibutuhkan."
        itemName={deletingRecord?.judul}
        onConfirm={handleConfirmDelete}
        isLoading={submitting}
      />
    </div>
  );
}
