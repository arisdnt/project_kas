import React, { useEffect, useMemo, useState } from 'react';
import { peranService, PeranDTO } from '../services/peranService';
import { PeranForm } from '../components/PeranForm';
import { Sidebar, SidebarContent, SidebarHeader, SidebarTitle } from '@/core/components/ui/sidebar';
import { Filter, Loader2, Plus, Search, Shield, Trash2 } from 'lucide-react';


export const PeranPage: React.FC = () => {
  const [items, setItems] = useState<PeranDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [editItem, setEditItem] = useState<PeranDTO | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<PeranDTO | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all'|'aktif'|'nonaktif'>('all');

  const filtered = useMemo(()=>{
    return items.filter(i => {
      const q = query.trim().toLowerCase();
      const matchQ = !q || i.nama.toLowerCase().includes(q) || (i.deskripsi||'').toLowerCase().includes(q);
      const matchStatus = statusFilter==='all' || i.status === statusFilter;
      return matchQ && matchStatus;
    });
  },[items,query,statusFilter]);

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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2"><Shield className="h-5 w-5 text-blue-600" /> Manajemen Peran</h1>
          <p className="text-sm text-gray-500">Kelola role dan status akses pengguna dalam tenant ini.</p>
        </div>
        <div className="flex flex-col gap-3 w-full lg:w-auto lg:flex-row lg:items-center">
          <div className="flex items-center gap-2 w-full lg:w-72">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input placeholder="Cari nama / deskripsi..." value={query} onChange={e=>setQuery(e.target.value)}
                     className="w-full pl-9 pr-3 py-2 text-sm rounded border bg-white focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as any)}
                    className="text-sm border rounded px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200">
              <option value="all">Semua</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>load()} disabled={loading} className="px-3 py-2 text-sm rounded border bg-white hover:bg-gray-50 inline-flex items-center gap-1">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Filter className="h-4 w-4" />} Refresh
            </button>
            <button onClick={()=>setOpenCreate(true)} className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 shadow-sm inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Peran Baru</button>
          </div>
        </div>
      </div>
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded flex items-center justify-between"><span>{error}</span><button className="text-xs underline" onClick={()=>load()}>Coba lagi</button></div>}
      <div className="bg-white/70 backdrop-blur-sm border rounded-xl shadow-sm overflow-hidden ring-1 ring-black/5">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Peran</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600 w-28">Level</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600 w-32">Status</th>
                <th className="px-3 py-3 w-28" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-500 text-sm">Memuat data...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-500 text-sm">Tidak ada peran yang cocok</td></tr>
              )}
              {filtered.map(p => (
                <tr key={p.id} className="group hover:bg-blue-50/40 transition-colors">
                  <td className="px-5 py-3 align-top">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800 group-hover:text-blue-700 transition-colors">{p.nama}</span>
                        {p.level && p.level <= 2 && <span className="text-[10px] uppercase tracking-wide bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-1.5 py-0.5 rounded">Core</span>}
                      </div>
                      {p.deskripsi && <div className="text-gray-500 text-xs line-clamp-2 max-w-md">{p.deskripsi}</div>}
                      <div className="flex gap-3 mt-1 text-[11px] text-gray-400">
                        <span>ID: {p.id.slice(0,8)}...</span>
                        {p.dibuat_pada && <span>Dibuat: {new Date(p.dibuat_pada).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 align-top">{p.level ?? '-'}</td>
                  <td className="px-5 py-3 align-top">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${p.status==='aktif' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-100 text-gray-600 ring-gray-500/20'}`}> 
                      <span className={`h-1.5 w-1.5 rounded-full ${p.status==='aktif' ? 'bg-green-600' : 'bg-gray-500'}`} /> {p.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-top text-right">
                    <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={()=>setEditItem(p)} className="px-2 py-1 text-xs rounded border bg-white hover:bg-gray-50">Edit</button>
                      <button onClick={()=>setConfirmDelete(p)} className="px-2 py-1 text-xs rounded border border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-1"><Trash2 className="h-3 w-3" />Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-t flex items-center justify-between text-xs text-gray-500">
          <span>{filtered.length} peran</span>
          {query && <button onClick={()=>setQuery('')} className="underline hover:text-gray-700">Reset pencarian</button>}
        </div>
      </div>

      {/* Create Sidebar */}
      <Sidebar open={openCreate} onOpenChange={setOpenCreate}>
        <SidebarContent className="w-full max-w-lg">
          <SidebarHeader>
            <SidebarTitle className="flex items-center gap-2"><Shield className="h-4 w-4 text-blue-600" /> Peran Baru</SidebarTitle>
          </SidebarHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <PeranForm mode="create" onSuccess={handleCreated} onCancel={()=>setOpenCreate(false)} />
          </div>
        </SidebarContent>
      </Sidebar>

      {/* Edit Sidebar */}
      <Sidebar open={!!editItem} onOpenChange={(o)=>!o && setEditItem(null)}>
        <SidebarContent className="w-full max-w-lg">
          <SidebarHeader>
            <SidebarTitle className="flex items-center gap-2"><Shield className="h-4 w-4 text-blue-600" /> Edit Peran</SidebarTitle>
          </SidebarHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {editItem && <PeranForm mode="edit" initialData={editItem} onSuccess={handleUpdated} onCancel={()=>setEditItem(null)} />}
          </div>
        </SidebarContent>
      </Sidebar>

      {/* Delete Confirmation Sidebar */}
      <Sidebar open={!!confirmDelete} onOpenChange={(o)=>!o && setConfirmDelete(null)}>
        <SidebarContent className="w-full max-w-md">
          <SidebarHeader>
            <SidebarTitle className="flex items-center gap-2"><Shield className="h-4 w-4 text-blue-600" /> Konfirmasi Hapus</SidebarTitle>
          </SidebarHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Anda akan menghapus peran <span className="font-medium text-gray-800">{confirmDelete?.nama}</span>. Aksi ini permanen dan tidak bisa dibatalkan.</p>
              <div className="flex items-center gap-3 p-3 rounded border bg-red-50 text-red-700 text-xs">
                <Trash2 className="h-4 w-4" /> Pastikan peran ini tidak lagi digunakan oleh pengguna aktif.
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={()=>setConfirmDelete(null)} className="px-3 py-2 text-sm rounded border bg-white hover:bg-gray-50">Batal</button>
                <button onClick={doDelete} className="px-3 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700">Hapus Peran</button>
              </div>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    </div>
  );
};

export default PeranPage;
