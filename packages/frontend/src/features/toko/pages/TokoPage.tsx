import { useEffect, useState } from 'react';
import { Search, Store as StoreIcon, Edit2, Trash2, Factory, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Badge } from '@/core/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/core/components/ui/dialog';
import { TokoDrawer, TokoDrawerContent, TokoDrawerHeader, TokoDrawerTitle } from '../components/TokoDrawer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table';
import { Toko } from '../types/toko';
import { TokoService } from '../services/tokoService';
import TokoForm from '../components/TokoForm';
import { useToast } from '@/core/hooks/use-toast';
import { useAuthStore } from '@/core/store/authStore';

export function TokoPage() {
  const [items, setItems] = useState<Toko[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Toko | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Toko | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const { user } = useAuthStore();

  // Check if user has CRUD permissions (only god user level 1 and admin level 2)
  const canManageStores = user?.isGodUser || user?.level === 1 || user?.level === 2;

  // TODO: derive tenant id from auth/user context; placeholder for now
  const tenantId = (typeof window !== 'undefined' && localStorage.getItem('tenant_id')) || '';

  const load = async () => {
    setLoading(true);
    try {
      const res = await TokoService.searchStores({ search: search || undefined, status: statusFilter || undefined, page, limit });
      setItems(res.data);
      setTotalPages(res.pagination.totalPages || 1);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page]);

  const openCreate = () => {
    if (!canManageStores) {
      toast({ title: 'Akses ditolak', description: 'Anda tidak memiliki izin untuk menambah toko.', variant: 'destructive' });
      return;
    }
    setEditing(null);
    setDrawerOpen(true);
  };
  const openEdit = (t: Toko) => {
    if (!canManageStores) {
      toast({ title: 'Akses ditolak', description: 'Anda tidak memiliki izin untuk mengedit toko.', variant: 'destructive' });
      return;
    }
    setEditing(t);
    setDrawerOpen(true);
  };

  const statusBadge = (status: Toko['status']) => {
    const map: Record<string,string> = {
      aktif: 'bg-green-100 text-green-700',
      nonaktif: 'bg-gray-200 text-gray-700',
      tutup_sementara: 'bg-amber-100 text-amber-700'
    };
    return <Badge className={map[status] || 'bg-gray-100 text-gray-700'}>{status}</Badge>;
  };

  const handleDelete = async () => {
    if (!canManageStores) {
      toast({ title: 'Akses ditolak', description: 'Anda tidak memiliki izin untuk menghapus toko.', variant: 'destructive' });
      return;
    }
    if (!confirmDelete) return;
    try {
      await TokoService.deleteStore(confirmDelete.id);
      toast({ title: 'Toko dihapus', description: `Toko ${confirmDelete.nama} berhasil dihapus.` });
      setConfirmDelete(null);
      load();
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.message || 'Gagal menghapus toko';
      toast({ title: 'Gagal menghapus', description: message, variant: 'destructive' });
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-600"><Factory className="h-5 w-5"/></div>
          <h1 className="text-2xl font-semibold">Manajemen Toko</h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Cari nama / kode..." value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key==='Enter') { setPage(1); load(); } }} className="pl-8" />
          </div>
          <div className="relative flex-1 md:w-44">
            <Input placeholder="Filter status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              onKeyDown={e => { if (e.key==='Enter') { setPage(1); load(); } }} />
          </div>
          <Button onClick={() => { setPage(1); load(); }} variant="outline">Cari</Button>
          {canManageStores && (
            <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4 mr-1"/>Tambah</Button>
          )}
        </div>
      </div>

      <div className="bg-white border rounded-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="py-8 text-center text-sm text-gray-500"><Loader2 className="h-5 w-5 animate-spin inline mr-2"/>Memuat...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="py-8 text-center text-sm text-gray-500">Tidak ada data</TableCell></TableRow>
              ) : items.map(t => (
                <TableRow key={t.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium flex items-center gap-2"><StoreIcon className="h-3 w-3 text-gray-400"/>{t.nama}</TableCell>
                  <TableCell className="text-xs font-mono">{t.kode}</TableCell>
                  <TableCell>{statusBadge(t.status)}</TableCell>
                  <TableCell className="text-sm text-gray-600">{t.telepon || '-'}</TableCell>
                  <TableCell className="text-sm text-gray-600">{t.email || '-'}</TableCell>
                  <TableCell className="text-sm text-gray-500">{t.dibuat_pada?.slice(0,10) || '-'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {canManageStores ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => openEdit(t)}><Edit2 className="h-3 w-3"/></Button>
                        <Button size="sm" variant="destructive" onClick={() => {
                          if (!canManageStores) {
                            toast({ title: 'Akses ditolak', description: 'Anda tidak memiliki izin untuk menghapus toko.', variant: 'destructive' });
                            return;
                          }
                          setConfirmDelete(t);
                        }}><Trash2 className="h-3 w-3"/></Button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500">Hanya bisa melihat</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between border-t bg-gray-50 px-4 py-2 text-sm">
          <div>Halaman {page} / {totalPages}</div>
          <div className="space-x-2">
            <Button size="sm" variant="outline" disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))}>Prev</Button>
            <Button size="sm" variant="outline" disabled={page>=totalPages} onClick={() => setPage(p => p+1)}>Next</Button>
          </div>
        </div>
      </div>

      <TokoDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <TokoDrawerContent className="!w-[40vw] !max-w-none">
          <TokoDrawerHeader className="border-b border-gray-200 pb-4 px-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Factory className="h-5 w-5" />
                </div>
                <TokoDrawerTitle className="text-xl font-semibold">
                  {editing ? 'Edit Toko' : 'Tambah Toko'}
                </TokoDrawerTitle>
              </div>
            </div>
          </TokoDrawerHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <TokoForm
              mode={editing ? 'edit' : 'create'}
              initial={editing}
              tenantId={tenantId}
              onSuccess={() => {
                setDrawerOpen(false);
                toast({
                  title: editing ? 'Toko Diperbarui' : 'Toko Ditambahkan',
                  description: editing ? 'Perubahan toko berhasil disimpan.' : 'Toko baru berhasil ditambahkan ke sistem.'
                });
                load();
              }}
              onCancel={() => setDrawerOpen(false)}
            />
          </div>
        </TokoDrawerContent>
      </TokoDrawer>

      <Dialog open={!!confirmDelete} onOpenChange={o => { if(!o) setConfirmDelete(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Toko</DialogTitle>
          </DialogHeader>
          <p>Anda yakin ingin menghapus toko <strong>{confirmDelete?.nama}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TokoPage;

