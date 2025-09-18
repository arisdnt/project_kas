import { useEffect, useState } from 'react';
import { Input } from '@/core/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';
import { Textarea } from '@/core/components/ui/textarea';
import { Button } from '@/core/components/ui/button';
import { Toko, CreateTokoDto, UpdateTokoDto } from '../types/toko';
import { tenantService, TenantDTO } from '@/features/tenan/services/tenantService';
import { TokoApiService } from '../services/tokoApiService';
import { useToast } from '@/core/hooks/use-toast';

const TIMEZONES = [
  'Asia/Jakarta',
  'Asia/Makassar',
  'Asia/Jayapura'
];

const CURRENCIES = [
  { code: 'IDR', name: 'Rupiah' },
  { code: 'USD', name: 'US Dollar' }
];

const STATUS_OPTIONS: { value: Toko['status']; label: string }[] = [
  { value: 'aktif', label: 'Aktif' },
  { value: 'nonaktif', label: 'Nonaktif' },
  { value: 'tutup_sementara', label: 'Tutup Sementara' }
];

export interface TokoFormProps {
  mode: 'create' | 'edit';
  initial?: Toko | null;
  tenantId?: string; // deprecated: will be superseded by internal selector
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TokoForm({ mode, initial, tenantId, onSuccess, onCancel }: TokoFormProps) {
  const [form, setForm] = useState({
    nama: initial?.nama || '',
    kode: initial?.kode || '',
    alamat: initial?.alamat || '',
    telepon: initial?.telepon || '',
    email: initial?.email || '',
    status: initial?.status || 'aktif',
    timezone: initial?.timezone || 'Asia/Jakarta',
    mata_uang: initial?.mata_uang || 'IDR',
    logo_url: initial?.logo_url || ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenants, setTenants] = useState<TenantDTO[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>(initial?.tenant_id || '');
  const { toast } = useToast();

  useEffect(() => {
    // Load tenants for selector (best effort; ignore errors for non-god users)
    (async () => {
      try {
        const resp = await tenantService.list({ limit: 100 });
        const list: TenantDTO[] = Array.isArray((resp as any).data) ? (resp as any).data : (resp as any);
        setTenants(list);
        if (!selectedTenant && list.length === 1) setSelectedTenant(list[0].id);
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    if (mode === 'edit' && initial) {
      setForm({
        nama: initial.nama || '',
        kode: initial.kode || '',
        alamat: initial.alamat || '',
        telepon: initial.telepon || '',
        email: initial.email || '',
        status: initial.status || 'aktif',
        timezone: initial.timezone || 'Asia/Jakarta',
        mata_uang: initial.mata_uang || 'IDR',
        logo_url: initial.logo_url || ''
      });
    }
  }, [mode, initial]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      if (mode === 'create') {
        const effectiveTenant = selectedTenant || tenantId;
        if (!effectiveTenant) throw new Error('Tenant ID tidak tersedia');
        const payload: CreateTokoDto = {
          tenant_id: effectiveTenant,
          nama: form.nama.trim(),
          kode: form.kode.trim(),
          alamat: form.alamat || undefined,
          telepon: form.telepon || undefined,
          email: form.email || undefined,
          status: form.status,
          timezone: form.timezone,
          mata_uang: form.mata_uang,
          logo_url: form.logo_url || undefined
        };
        await TokoApiService.createStore(payload);
        toast({ title: 'Toko dibuat', description: 'Toko baru berhasil ditambahkan.' });
      } else if (mode === 'edit' && initial) {
        // Build diff
        const diff: UpdateTokoDto = {};
        (['nama','kode','alamat','telepon','email','status','timezone','mata_uang','logo_url'] as const).forEach(key => {
          if ((initial as any)[key] !== (form as any)[key]) {
            (diff as any)[key] = (form as any)[key] || undefined;
          }
        });
        if (Object.keys(diff).length > 0) {
          await TokoApiService.updateStore(initial.id, diff);
          toast({ title: 'Perubahan disimpan', description: 'Data toko berhasil diperbarui.' });
        } else {
          toast({ title: 'Tidak ada perubahan', description: 'Tidak ada field yang diubah.' });
        }
      }
      onSuccess?.();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Gagal menyimpan';
      setError(message);
      toast({ title: 'Gagal menyimpan', description: message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Full width fields first */}
      {mode==='create' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Tenant *</label>
          <Select value={selectedTenant} onValueChange={v => setSelectedTenant(v)}>
            <SelectTrigger><SelectValue placeholder={tenants.length? 'Pilih tenant' : 'Memuat...'} /></SelectTrigger>
            <SelectContent>
              {tenants.map(t => <SelectItem key={t.id} value={t.id}>{t.nama}</SelectItem>)}
            </SelectContent>
          </Select>
          {!selectedTenant && <p className="text-xs text-gray-500">Wajib pilih tenant untuk membuat toko baru.</p>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nama Toko *</label>
            <Input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Kode Toko *</label>
            <Input value={form.kode} onChange={e => setForm({ ...form, kode: e.target.value.toUpperCase() })} required placeholder="MAIN01" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Telepon</label>
            <Input value={form.telepon} onChange={e => setForm({ ...form, telepon: e.target.value })} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(o => <SelectItem value={o.value} key={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Zona Waktu</label>
            <Select value={form.timezone} onValueChange={(v) => setForm({ ...form, timezone: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIMEZONES.map(tz => <SelectItem value={tz} key={tz}>{tz}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Mata Uang</label>
            <Select value={form.mata_uang} onValueChange={(v) => setForm({ ...form, mata_uang: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map(c => <SelectItem value={c.code} key={c.code}>{c.code} - {c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Logo URL</label>
            <Input value={form.logo_url} onChange={e => setForm({ ...form, logo_url: e.target.value })} placeholder="https://example.com/logo.png" />
          </div>
        </div>
      </div>

      {/* Full width fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Alamat</label>
          <Textarea rows={3} value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} />
        </div>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</div>}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">{saving ? 'Menyimpan...' : (mode==='create' ? 'Simpan' : 'Update')}</Button>
      </div>
    </form>
  );
}

export default TokoForm;
