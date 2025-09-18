import { useEffect, useState } from 'react';
import { Input } from '@/core/components/ui/input';
import { Textarea } from '@/core/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/core/components/ui/select';
import { Button } from '@/core/components/ui/button';
import { tenantService, TenantDTO, TenantCreatePayload, TenantUpdatePayload } from '../services/tenantService';
import { useToast } from '@/core/hooks/use-toast';

const STATUS_OPTIONS: Array<{ value: TenantDTO['status']; label: string }> = [
  { value: 'aktif', label: 'Aktif' },
  { value: 'nonaktif', label: 'Nonaktif' },
  { value: 'suspended', label: 'Suspended' }
];
const PAKET_OPTIONS: Array<{ value: TenantDTO['paket']; label: string }> = [
  { value: 'basic', label: 'Basic' },
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'enterprise', label: 'Enterprise' }
];

export interface TenantFormProps {
  mode: 'create' | 'edit';
  initial?: TenantDTO | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TenantForm({ mode, initial, onSuccess, onCancel }: TenantFormProps) {
  const [form, setForm] = useState({
    nama: initial?.nama || '',
    email: initial?.email || '',
    telepon: initial?.telepon || '',
    alamat: initial?.alamat || '',
    status: initial?.status || 'aktif',
    paket: initial?.paket || 'basic',
    max_toko: initial?.max_toko?.toString() || '1',
    max_pengguna: initial?.max_pengguna?.toString() || '5'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (mode==='edit' && initial) {
      setForm({
        nama: initial.nama,
        email: initial.email,
        telepon: initial.telepon || '',
        alamat: initial.alamat || '',
        status: initial.status,
        paket: initial.paket,
        max_toko: initial.max_toko.toString(),
        max_pengguna: initial.max_pengguna.toString()
      });
    }
  }, [mode, initial]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      if (mode==='create') {
        const payload: TenantCreatePayload = {
          nama: form.nama.trim(),
          email: form.email.trim(),
          telepon: form.telepon || undefined,
            alamat: form.alamat || undefined,
          status: form.status as any,
          paket: form.paket as any,
          max_toko: parseInt(form.max_toko) || 1,
          max_pengguna: parseInt(form.max_pengguna) || 5
        };
        await tenantService.create(payload);
        toast({ title: 'Tenant dibuat', description: 'Tenant baru berhasil ditambahkan.' });
      } else if (initial) {
        const diff: TenantUpdatePayload = {};
        (['nama','email','telepon','alamat','status','paket','max_toko','max_pengguna'] as const).forEach(key => {
          const newVal = (form as any)[key];
          const oldVal = (initial as any)[key];
          const parsedNew = (key==='max_toko'||key==='max_pengguna') ? parseInt(newVal) : newVal;
          if (parsedNew !== oldVal) {
            (diff as any)[key] = parsedNew;
          }
        });
        if (Object.keys(diff).length>0) {
          await tenantService.update(initial.id, diff);
          toast({ title: 'Perubahan disimpan', description: 'Data tenant berhasil diperbarui.' });
        } else {
          toast({ title: 'Tidak ada perubahan', description: 'Tidak ada field yang diubah.', variant: 'default' });
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
      <div className="grid grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nama *</label>
            <Input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email *</label>
            <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Telepon</label>
            <Input value={form.telepon} onChange={e => setForm({ ...form, telepon: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Paket</label>
            <Select value={form.paket} onValueChange={v => setForm({ ...form, paket: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAKET_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Max Toko</label>
            <Input type="number" min={1} value={form.max_toko} onChange={e => setForm({ ...form, max_toko: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Max Pengguna</label>
            <Input type="number" min={1} value={form.max_pengguna} onChange={e => setForm({ ...form, max_pengguna: e.target.value })} />
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

export default TenantForm;
