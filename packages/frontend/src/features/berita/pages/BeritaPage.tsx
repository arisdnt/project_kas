import { useEffect, useMemo, useState } from 'react';
import { PlusCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { useAuthStore } from '@/core/store/authStore';
import { useBeritaStore } from '@/features/berita/store/beritaStore';
import { BeritaFormDialog } from '@/features/berita/components/BeritaFormDialog';
import { BeritaStatsCards } from '@/features/berita/components/BeritaStatsCards';
import { BeritaFilterBar } from '@/features/berita/components/BeritaFilterBar';
import { BeritaTable } from '@/features/berita/components/BeritaTable';
import { BeritaDetailDialog } from '@/features/berita/components/BeritaDetailDialog';
import { DeleteConfirmationDialog } from '@/core/components/ui/delete-confirmation-dialog';
import { useToast } from '@/core/hooks/use-toast';
import { CreateBeritaPayload, UpdateBeritaPayload, BeritaItem } from '@/features/berita/types/berita';
import { cn } from '@/core/utils/cn';

export function BeritaPage() {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const canManage = useMemo(() => Boolean(user?.isGodUser || (user?.level ?? 5) <= 3), [user?.isGodUser, user?.level]);
  const {
    items,
    loading,
    page,
    limit,
    total,
    totalPages,
    filters,
    stats,
    statsLoading,
    setPage,
    setFilter,
    resetFilters,
    fetchBerita,
    fetchStats,
    fetchActiveNews,
    createBerita,
    updateBerita,
    deleteBerita
  } = useBeritaStore((state) => ({
    items: state.items,
    loading: state.loading,
    page: state.page,
    limit: state.limit,
    total: state.total,
    totalPages: state.totalPages,
    filters: state.filters,
    stats: state.stats,
    statsLoading: state.statsLoading,
    setPage: state.setPage,
    setFilter: state.setFilter,
    resetFilters: state.resetFilters,
    fetchBerita: state.fetchBerita,
    fetchStats: state.fetchStats,
    fetchActiveNews: state.fetchActiveNews,
    createBerita: state.createBerita,
    updateBerita: state.updateBerita,
    deleteBerita: state.deleteBerita
  }));

  const [isFormOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BeritaItem | null>(null);
  const [detail, setDetail] = useState<BeritaItem | null>(null);
  const [deleting, setDeleting] = useState<BeritaItem | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);


  useEffect(() => {
    fetchBerita({ page: 1 });
    fetchStats();
    fetchActiveNews();
  }, [fetchBerita, fetchStats, fetchActiveNews]);

  useEffect(() => {
    const handler = () => {
      fetchBerita();
      fetchStats();
      fetchActiveNews();
    };
    window.addEventListener('app:refresh', handler);
    return () => window.removeEventListener('app:refresh', handler);
  }, [fetchBerita, fetchStats, fetchActiveNews]);

  const handleCreateClick = () => {
    if (!canManage) {
      toast({
        title: 'Akses ditolak',
        description: 'Hanya user level 1-3 yang dapat membuat berita baru.',
        variant: 'destructive'
      });
      return;
    }
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (item: BeritaItem) => {
    if (!canManage) {
      toast({
        title: 'Akses ditolak',
        description: 'Anda tidak memiliki izin untuk mengubah berita.',
        variant: 'destructive'
      });
      return;
    }
    setEditing(item);
    setFormOpen(true);
  };

  const handleDelete = (item: BeritaItem) => {
    if (!canManage) {
      toast({
        title: 'Akses ditolak',
        description: 'Anda tidak memiliki izin untuk menghapus berita.',
        variant: 'destructive'
      });
      return;
    }
    setDeleting(item);
  };

  const handleDeleteConfirm = async () => {
    if (!deleting) {
      return;
    }
    setDeletingLoading(true);
    try {
      await deleteBerita(deleting.id);
      toast({
        title: 'Berita dihapus',
        description: `Berita "${deleting.judul}" telah dihapus.`
      });
      setDeleting(null);
    } catch (error: any) {
      toast({
        title: 'Gagal menghapus',
        description: error?.message || 'Terjadi kesalahan saat menghapus berita.',
        variant: 'destructive'
      });
    } finally {
      setDeletingLoading(false);
    }
  };

  const handleSubmit = async (payload: CreateBeritaPayload | UpdateBeritaPayload) => {
    if (editing) {
      await updateBerita(editing.id, payload);
    } else {
      await createBerita(payload as CreateBeritaPayload);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">News Tracker</h1>
          <p className="text-sm text-slate-500">Kelola pengumuman internal dan ticker realtime untuk seluruh tenant/toko.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { fetchBerita(); fetchStats(); fetchActiveNews(); }}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleCreateClick} disabled={!canManage} className={cn(!canManage && 'cursor-not-allowed opacity-70')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Berita Baru
          </Button>
        </div>
      </div>

      <BeritaStatsCards stats={stats} loading={statsLoading} onRefresh={() => { fetchStats(); fetchActiveNews(); }} />

      <BeritaFilterBar
        filters={filters}
        onFilterChange={setFilter}
        onReset={resetFilters}
      />

      <BeritaTable
        items={items}
        loading={loading}
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={setPage}
        onView={(item) => setDetail(item)}
        onEdit={handleEdit}
        onToggleStatus={(item, status) => {
          if (!canManage) {
            toast({
              title: 'Akses ditolak',
              description: 'Anda tidak memiliki izin untuk mengubah status berita.',
              variant: 'destructive'
            });
            return;
          }
          updateBerita(item.id, { status }).catch((error: any) => {
            toast({
              title: 'Gagal memperbarui status',
              description: error?.message || 'Terjadi kesalahan saat memperbarui status berita.',
              variant: 'destructive'
            });
          });
        }}
        onDelete={handleDelete}
        canManage={canManage}
      />

      <BeritaFormDialog
        open={isFormOpen}
        mode={editing ? 'edit' : 'create'}
        initial={editing ?? undefined}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <BeritaDetailDialog open={Boolean(detail)} data={detail} onClose={() => setDetail(null)} />

      <DeleteConfirmationDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleting(null);
          }
        }}
        title="Hapus berita?"
        description="Berita yang dihapus tidak dapat dikembalikan dan akan hilang dari news tracker."
        itemName={deleting?.judul}
        onConfirm={handleDeleteConfirm}
        isLoading={deletingLoading}
        confirmText="Hapus Berita"
      />
    </div>
  );
}
