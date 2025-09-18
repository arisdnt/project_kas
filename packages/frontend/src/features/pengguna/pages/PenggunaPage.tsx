import { useEffect, useState } from 'react';
import { penggunaService, PenggunaDTO } from '../services/penggunaService';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Badge } from '@/core/components/ui/badge';
import { PenggunaForm } from '../components/PenggunaForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/core/components/ui/dialog';
import { Sidebar, SidebarContent, SidebarHeader, SidebarTitle } from '@/core/components/ui/sidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table';
import { Search, UserPlus, Edit2, Trash2, Loader2 } from 'lucide-react';

export function PenggunaPage() {
  const [items, setItems] = useState<PenggunaDTO[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<PenggunaDTO | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<PenggunaDTO | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { items: list } = await penggunaService.list({ search, limit: 100 });
      setItems(list);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // initial

  const openCreate = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit = (u: PenggunaDTO) => { setEditing(u); setDrawerOpen(true); };

  const statusBadge = (status: string) => {
    const map: Record<string,string> = {
      aktif: 'bg-green-100 text-green-700',
      nonaktif: 'bg-gray-200 text-gray-700',
      suspended: 'bg-red-100 text-red-700',
      cuti: 'bg-amber-100 text-amber-700'
    };
    return <Badge className={map[status] || 'bg-gray-100 text-gray-700'}>{status}</Badge>;
  };

  const roleName = (u: PenggunaDTO) => u.peran_nama ? `${u.peran_nama} (Level ${u.peran_level || '-'})` : '-';

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await penggunaService.remove(confirmDelete.id);
      setConfirmDelete(null);
      load();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Pengguna</h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Cari username..." value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key==='Enter') load(); }} className="pl-8" />
          </div>
          <Button onClick={() => load()} variant="outline">Cari</Button>
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700"><UserPlus className="h-4 w-4 mr-1"/>Tambah</Button>
        </div>
      </div>

      <div className="bg-white border rounded-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Toko</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="py-8 text-center text-sm text-gray-500"><Loader2 className="h-5 w-5 animate-spin inline mr-2"/>Memuat...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="py-8 text-center text-sm text-gray-500">Tidak ada data</TableCell></TableRow>
              ) : items.map(u => (
                <TableRow key={u.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{u.username}</TableCell>
                  <TableCell className="text-sm text-gray-600">{u.nama_lengkap || '-'}</TableCell>
                  <TableCell>{roleName(u)}</TableCell>
                  <TableCell className="text-sm text-gray-600">{u.tenant_nama || '-'}</TableCell>
                  <TableCell className="text-sm text-gray-600">{u.toko_nama || '-'}</TableCell>
                  <TableCell>{statusBadge(u.status)}</TableCell>
                  <TableCell className="text-sm text-gray-500">{u.dibuat_pada?.slice(0,10) || '-'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(u)}><Edit2 className="h-3 w-3"/></Button>
                    <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(u)}><Trash2 className="h-3 w-3"/></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Sidebar open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SidebarContent size="forty">
          <SidebarHeader>
            <SidebarTitle>{editing ? 'Edit Pengguna' : 'Tambah Pengguna'}</SidebarTitle>
          </SidebarHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <PenggunaForm mode={editing? 'edit':'create'} initial={editing} onSuccess={() => { setDrawerOpen(false); load(); }} onCancel={() => setDrawerOpen(false)} />
          </div>
        </SidebarContent>
      </Sidebar>

      <Dialog open={!!confirmDelete} onOpenChange={o => { if(!o) setConfirmDelete(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pengguna</DialogTitle>
          </DialogHeader>
          <p>Anda yakin ingin menghapus pengguna <strong>{confirmDelete?.username}</strong>?</p>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PenggunaPage;
