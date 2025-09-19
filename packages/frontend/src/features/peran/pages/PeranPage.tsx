import React, { useEffect, useMemo, useState } from 'react';
import { peranService, PeranDTO } from '../services/peranService';
import { PeranForm } from '../components/PeranForm';
import { PeranDrawer, PeranDrawerContent, PeranDrawerHeader, PeranDrawerTitle } from '../components/PeranDrawer';
import { Filter, Loader2, Plus, Search, Shield, Trash2, Users, UserPlus } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Badge } from '@/core/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { useDebounce } from '@/core/hooks/useDebounce';


export const PeranPage: React.FC = () => {
  const [items, setItems] = useState<PeranDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [editItem, setEditItem] = useState<PeranDTO | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<PeranDTO | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all'|'aktif'|'nonaktif'>('all');
  const debouncedQuery = useDebounce(query, 500);

  const filtered = useMemo(()=>{
    return items.filter(i => {
      const q = debouncedQuery.trim().toLowerCase();
      const matchQ = !q || i.nama.toLowerCase().includes(q) || (i.deskripsi||'').toLowerCase().includes(q);
      const matchStatus = statusFilter==='all' || i.status === statusFilter;
      return matchQ && matchStatus;
    });
  },[items,debouncedQuery,statusFilter]);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await peranService.list();
      setItems(data);
    } catch (e:any) {
      setError(e.message || 'Gagal memuat peran');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreated = (p: PeranDTO) => {
    setItems(prev => [...prev, p]);
    setOpenCreate(false);
  };

  const handleUpdated = (p: PeranDTO) => {
    setItems(prev => prev.map(i => i.id === p.id ? p : i));
    setEditItem(null);
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    try {
      await peranService.remove(confirmDelete.id);
      setItems(prev => prev.filter(i => i.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch (e:any) {
      alert(e.message || 'Gagal menghapus peran');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600"><Shield className="h-5 w-5"/></div>
          <h1 className="text-2xl font-semibold">Manajemen Peran</h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:w-64">
            {loading && query !== debouncedQuery ? (
              <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            )}
            <Input
              placeholder="Cari nama/deskripsi..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-9 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:border-indigo-500 border-gray-300 hover:border-gray-400"
            />
            {query !== debouncedQuery && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                Mencari...
              </div>
            )}
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as any)}
          >
            <SelectTrigger className="h-10 md:w-32 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:border-indigo-500 border-gray-300 hover:border-gray-400">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="nonaktif">Nonaktif</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => load()} disabled={loading} variant="outline">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Filter className="h-4 w-4" />} Refresh
          </Button>
          <Button onClick={() => setOpenCreate(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-1"/>Peran Baru
          </Button>
        </div>
      </div>

      {/* Filter Status Bar */}
      {(query || (statusFilter && statusFilter !== 'all')) && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-blue-700 font-medium">Filter aktif:</span>
            {query && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Pencarian: "{query}"
              </span>
            )}
            {statusFilter && statusFilter !== 'all' && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                Status: {statusFilter === 'aktif' ? 'Aktif' : 'Nonaktif'}
              </span>
            )}
            <button
              onClick={() => {
                setQuery('');
                setStatusFilter('all');
              }}
              className="bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 transition-colors"
            >
              Hapus Filter
            </button>
          </div>
        </div>
      )}

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded flex items-center justify-between"><span>{error}</span><button className="text-xs underline" onClick={() => load()}>Coba lagi</button></div>}
      
      <div className="bg-white border rounded-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Peran</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="py-8 text-center text-sm text-gray-500"><Loader2 className="h-5 w-5 animate-spin inline mr-2"/>Memuat data...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="py-8 text-center text-sm text-gray-500">Tidak ada peran yang cocok</TableCell></TableRow>
              ) : filtered.map(p => (
                <TableRow key={p.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{p.nama}</span>
                        {p.level && p.level <= 2 && (
                          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600">
                            Core
                          </Badge>
                        )}
                      </div>
                      {p.deskripsi && <div className="text-gray-500 text-xs line-clamp-2 max-w-md">{p.deskripsi}</div>}
                      <div className="flex gap-3 mt-1 text-[11px] text-gray-400">
                        <span>ID: {p.id.slice(0,8)}...</span>
                        {p.dibuat_pada && <span>Dibuat: {new Date(p.dibuat_pada).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                      Level {p.level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={p.status === 'aktif' ? 'default' : 'secondary'}
                      className={p.status === 'aktif' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setEditItem(p)}>
                      <Shield className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(p)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between border-t bg-gray-50 px-4 py-2 text-sm">
          <span>{filtered.length} peran</span>
          {query && <button onClick={() => setQuery('')} className="underline hover:text-gray-700">Reset pencarian</button>}
        </div>
      </div>

      {/* Create Drawer */}
      <PeranDrawer open={openCreate} onOpenChange={setOpenCreate}>
        <PeranDrawerContent className="!w-[40vw] !max-w-none">
          <PeranDrawerHeader className="border-b border-gray-200 pb-4 px-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                  <UserPlus className="h-5 w-5" />
                </div>
                <PeranDrawerTitle className="text-xl font-semibold">
                  Peran Baru
                </PeranDrawerTitle>
              </div>
            </div>
          </PeranDrawerHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <PeranForm mode="create" onSuccess={handleCreated} onCancel={()=>setOpenCreate(false)} />
          </div>
        </PeranDrawerContent>
      </PeranDrawer>

      {/* Edit Drawer */}
      <PeranDrawer open={!!editItem} onOpenChange={(o)=>!o && setEditItem(null)}>
        <PeranDrawerContent className="!w-[40vw] !max-w-none">
          <PeranDrawerHeader className="border-b border-gray-200 pb-4 px-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                  <Shield className="h-5 w-5" />
                </div>
                <PeranDrawerTitle className="text-xl font-semibold">
                  Edit Peran
                </PeranDrawerTitle>
              </div>
            </div>
          </PeranDrawerHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {editItem && <PeranForm mode="edit" initialData={editItem} onSuccess={handleUpdated} onCancel={()=>setEditItem(null)} />}
          </div>
        </PeranDrawerContent>
      </PeranDrawer>

      {/* Delete Confirmation Drawer */}
      <PeranDrawer open={!!confirmDelete} onOpenChange={(o)=>!o && setConfirmDelete(null)}>
        <PeranDrawerContent className="!w-[40vw] !max-w-none">
          <PeranDrawerHeader className="border-b border-gray-200 pb-4 px-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100 text-red-600">
                  <Trash2 className="h-5 w-5" />
                </div>
                <PeranDrawerTitle className="text-xl font-semibold">
                  Konfirmasi Hapus
                </PeranDrawerTitle>
              </div>
            </div>
          </PeranDrawerHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Anda akan menghapus peran <span className="font-medium text-gray-800">{confirmDelete?.nama}</span>. Aksi ini permanen dan tidak bisa dibatalkan.</p>
              <div className="flex items-center gap-3 p-3 rounded border bg-red-50 text-red-700 text-xs">
                <Trash2 className="h-4 w-4" /> Pastikan peran ini tidak lagi digunakan oleh pengguna aktif.
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={()=>setConfirmDelete(null)}
                  className="px-5 py-2 h-10 border-gray-300 hover:bg-gray-50"
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  onClick={doDelete}
                  className="px-5 py-2 h-10 bg-red-600 hover:bg-red-700"
                >
                  Hapus Peran
                </Button>
              </div>
            </div>
          </div>
        </PeranDrawerContent>
      </PeranDrawer>
    </div>
  );
};

export default PeranPage;
