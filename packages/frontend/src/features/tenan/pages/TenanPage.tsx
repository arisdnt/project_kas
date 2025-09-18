import { useState, useEffect } from 'react';
import { Search, Factory, Edit2, Trash2, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Badge } from '@/core/components/ui/badge';
import { Sidebar, SidebarContent, SidebarHeader, SidebarTitle } from '@/core/components/ui/sidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/core/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table';
import { tenantService, TenantDTO } from '../services/tenantService';
import TenantForm from '../components/TenantForm';
import { useToast } from '@/core/hooks/use-toast';
import { useAuthStore } from '@/core/store/authStore';
import { AccessDenied } from '@/core/components/ui/access-denied';
import { useDebounce } from '@/core/hooks/useDebounce';

export function TenanPage() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<TenantDTO[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paketFilter, setPaketFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<TenantDTO | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<TenantDTO | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  // Debounced search untuk menghindari terlalu banyak API calls
  const debouncedSearch = useDebounce(search, 500); // 500ms delay

  // Check if user is god user (level 1)
  const isGodUser = user?.isGodUser || user?.level === 1;

  // If not god user, show access denied
  if (!isGodUser) {
    return (
      <div className="p-6">
        <AccessDenied
          title="Akses Manajemen Tenant Ditolak"
          message="Hanya God User (Level 1) yang dapat mengakses fitur manajemen tenant. Fitur ini memungkinkan pengelolaan semua tenant dalam sistem."
          icon="shield"
        />
      </div>
    );
  }

  const load = async () => {
    console.log(`🔄 [TENANT PAGE] Loading tenant list - Page: ${page}, Search: "${debouncedSearch}", StatusFilter: "${statusFilter}", PaketFilter: "${paketFilter}"`);

    setLoading(true);
    try {
      const res = await tenantService.list({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        paket: paketFilter || undefined
      });

      console.log(`📡 [TENANT PAGE] Raw list response:`, res);

      const list = Array.isArray((res as any).data) ? (res as any).data : Array.isArray(res) ? (res as any) : [];
      const tp = (res as any)?.pagination?.totalPages;
      const totalPages = typeof tp === 'number' && tp > 0 ? tp : 1;

      console.log(`📊 [TENANT PAGE] Parsed data - Items count: ${list.length}, Total pages: ${totalPages}`);

      setItems(list);
      setTotalPages(totalPages);

      console.log(`✅ [TENANT PAGE] Tenant list loaded successfully`);

    } catch (e) {
      console.error(`❌ [TENANT PAGE] Error loading tenant list:`, e);
    } finally {
      setLoading(false);
      console.log(`🔚 [TENANT PAGE] Loading state cleared`);
    }
  };

  // Effect untuk realtime search dan filtering
  useEffect(() => {
    console.log(`🔄 [TENANT PAGE] Triggering search due to parameter change`);
    console.log(`📋 [TENANT PAGE] Search params: search="${debouncedSearch}", status="${statusFilter}", paket="${paketFilter}", page=${page}`);

    // Reset ke page 1 jika search/filter berubah (kecuali perubahan page itu sendiri)
    if (page === 1) {
      load();
    } else {
      setPage(1); // Ini akan trigger useEffect lagi dengan page = 1
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter, paketFilter]);

  // Effect untuk load data ketika page berubah
  useEffect(() => {
    console.log(`📄 [TENANT PAGE] Page changed to: ${page}`);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const openCreate = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit = (t: TenantDTO) => { setEditing(t); setDrawerOpen(true); };

  const statusBadge = (status: TenantDTO['status']) => {
    const map: Record<string,string> = {
      aktif: 'bg-green-100 text-green-700',
      nonaktif: 'bg-gray-200 text-gray-700',
      suspended: 'bg-red-100 text-red-700'
    };
    return <Badge className={map[status] || 'bg-gray-100 text-gray-700'}>{status}</Badge>;
  };

  const paketBadge = (paket: TenantDTO['paket']) => {
    const map: Record<string,string> = {
      basic: 'bg-gray-100 text-gray-700',
      standard: 'bg-blue-100 text-blue-700',
      premium: 'bg-purple-100 text-purple-700',
      enterprise: 'bg-amber-100 text-amber-700'
    };
    return <Badge className={map[paket] || 'bg-gray-100 text-gray-700'}>{paket}</Badge>;
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      console.log(`⚠️ [TENANT PAGE] Delete called but no confirmDelete set`);
      return;
    }

    console.log(`🔴 [TENANT PAGE] Starting delete process for tenant: ${confirmDelete.nama} (ID: ${confirmDelete.id})`);

    try {
      console.log(`📞 [TENANT PAGE] Calling tenantService.remove for tenant: ${confirmDelete.id}`);

      const result = await tenantService.remove(confirmDelete.id);

      console.log(`✅ [TENANT PAGE] Delete service call successful:`, result);

      // Show success message with detailed info
      const successMsg = result.message || `Tenant ${confirmDelete.nama} berhasil dihapus (dinonaktifkan)`;
      toast({
        title: 'Tenant Dihapus',
        description: `${successMsg}. Tenant akan disembunyikan dari daftar karena statusnya sekarang nonaktif.`
      });

      console.log(`🎉 [TENANT PAGE] Success toast shown for tenant: ${confirmDelete.nama}`);

      // Clear confirm dialog and reload data
      setConfirmDelete(null);
      console.log(`🔄 [TENANT PAGE] Reloading tenant list after successful delete`);
      await load();

    } catch (e: any) {
      const errorMessage = e?.message || 'Gagal menghapus tenant';
      console.log(`❌ [TENANT PAGE] Delete failed for tenant ${confirmDelete.id}: ${errorMessage}`);
      console.error(`🔥 [TENANT PAGE] Full error details:`, e);

      toast({
        title: 'Gagal Menghapus Tenant',
        description: errorMessage,
        variant: 'destructive'
      });

      console.log(`💥 [TENANT PAGE] Error toast shown for tenant: ${confirmDelete.nama}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600"><Factory className="h-5 w-5"/></div>
          <h1 className="text-2xl font-semibold">Manajemen Tenant</h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:w-64">
            {loading && search !== debouncedSearch ? (
              <Loader2 className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
            ) : (
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            )}
            <Input
              placeholder="Cari nama/email/telepon..."
              value={search}
              onChange={e => {
                console.log(`🔍 [TENANT PAGE] Search input changed: "${e.target.value}"`);
                setSearch(e.target.value);
              }}
              className="pl-8"
            />
            {search !== debouncedSearch && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                Mencari...
              </div>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={e => {
              console.log(`📊 [TENANT PAGE] Status filter changed: "${e.target.value}"`);
              setStatusFilter(e.target.value);
            }}
            className="h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 md:w-32"
          >
            <option value="">Aktif</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={paketFilter}
            onChange={e => {
              console.log(`📦 [TENANT PAGE] Paket filter changed: "${e.target.value}"`);
              setPaketFilter(e.target.value);
            }}
            className="h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 md:w-32"
          >
            <option value="">Semua Paket</option>
            <option value="basic">Basic</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
          </select>

          <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-1"/>Tambah
          </Button>
        </div>
      </div>

      {/* Filter Status Bar */}
      {(debouncedSearch || statusFilter || paketFilter) && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-blue-700 font-medium">Filter aktif:</span>
            {debouncedSearch && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Pencarian: "{debouncedSearch}"
              </span>
            )}
            {statusFilter && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                Status: {statusFilter === 'aktif' ? 'Aktif' : statusFilter === 'nonaktif' ? 'Nonaktif' : 'Suspended'}
              </span>
            )}
            {paketFilter && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                Paket: {paketFilter.charAt(0).toUpperCase() + paketFilter.slice(1)}
              </span>
            )}
            <button
              onClick={() => {
                console.log(`🧹 [TENANT PAGE] Clearing all filters`);
                setSearch('');
                setStatusFilter('');
                setPaketFilter('');
              }}
              className="bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 transition-colors"
            >
              Hapus Filter
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paket</TableHead>
                <TableHead>Batas</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-gray-500"><Loader2 className="h-5 w-5 animate-spin inline mr-2"/>Memuat...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-gray-500">Tidak ada data</TableCell></TableRow>
              ) : items.map(t => (
                <TableRow key={t.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{t.nama}</TableCell>
                  <TableCell className="text-sm text-gray-600">{t.email}</TableCell>
                  <TableCell>{statusBadge(t.status)}</TableCell>
                  <TableCell>{paketBadge(t.paket)}</TableCell>
                  <TableCell className="text-sm text-gray-600">{t.max_toko} toko • {t.max_pengguna} pengguna</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(t)}><Edit2 className="h-3 w-3"/></Button>
                    <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(t)}><Trash2 className="h-3 w-3"/></Button>
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

      <Sidebar open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SidebarContent className="!w-[40vw] !max-w-none">
          <SidebarHeader>
            <SidebarTitle>{editing ? 'Edit Tenant' : 'Tambah Tenant'}</SidebarTitle>
          </SidebarHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <TenantForm mode={editing ? 'edit' : 'create'} initial={editing} onSuccess={() => { setDrawerOpen(false); toast({ title: editing ? 'Tenant diperbarui' : 'Tenant dibuat', description: editing ? 'Perubahan berhasil disimpan.' : 'Tenant baru berhasil dibuat.' }); load(); }} onCancel={() => setDrawerOpen(false)} />
          </div>
        </SidebarContent>
      </Sidebar>

      <Dialog open={!!confirmDelete} onOpenChange={o => { if(!o) setConfirmDelete(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Tenant</DialogTitle>
          </DialogHeader>
          <p>Anda yakin ingin menghapus tenant <strong>{confirmDelete?.nama}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TenanPage;

