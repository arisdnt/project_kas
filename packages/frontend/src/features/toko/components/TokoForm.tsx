import { useEffect, useState } from 'react';
import { Input } from '@/core/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';
import { Textarea } from '@/core/components/ui/textarea';
import { Button } from '@/core/components/ui/button';
import { Label } from '@/core/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Badge } from '@/core/components/ui/badge';
import { Toko, CreateTokoDto, UpdateTokoDto } from '../types/toko';
import { tenantService, TenantDTO } from '@/features/tenan/services/tenantService';
import { TokoService } from '../services/tokoService';
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
        await TokoService.createStore(payload);
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
          await TokoService.updateStore(initial.id, diff);
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
    <div className="space-y-6">
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-xl font-semibold">
            {mode === 'create' ? 'Tambah Toko Baru' : 'Edit Toko'}
          </CardTitle>
          <CardDescription>
            {mode === 'create'
              ? 'Lengkapi informasi di bawah ini untuk menambah toko baru.'
              : 'Perbarui informasi toko di bawah ini.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Full width fields first */}
            {mode==='create' && (
              <div className="space-y-2">
                <Label htmlFor="tenant" className="text-sm font-medium">
                  Tenant <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedTenant} onValueChange={v => setSelectedTenant(v)}>
                  <SelectTrigger className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <SelectValue placeholder={tenants.length? 'Pilih tenant' : 'Memuat...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map(t => <SelectItem key={t.id} value={t.id}>{t.nama}</SelectItem>)}
                  </SelectContent>
                </Select>
                {!selectedTenant && <p className="text-xs text-gray-500">Wajib pilih tenant untuk membuat toko baru.</p>}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nama" className="text-sm font-medium">
                    Nama Toko <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nama"
                    value={form.nama}
                    onChange={e => setForm({ ...form, nama: e.target.value })}
                    required
                    className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Masukkan nama toko"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kode" className="text-sm font-medium">
                    Kode Toko <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="kode"
                    value={form.kode}
                    onChange={e => setForm({ ...form, kode: e.target.value.toUpperCase() })}
                    required
                    className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="MAIN01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="toko@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telepon" className="text-sm font-medium">
                    Telepon
                  </Label>
                  <Input
                    id="telepon"
                    value={form.telepon}
                    onChange={e => setForm({ ...form, telepon: e.target.value })}
                    className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="+62 812-3456-7890"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status
                  </Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                    <SelectTrigger className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={o.value === 'aktif' ? 'default' : o.value === 'nonaktif' ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {o.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-sm font-medium">
                    Zona Waktu
                  </Label>
                  <Select value={form.timezone} onValueChange={(v) => setForm({ ...form, timezone: v })}>
                    <SelectTrigger className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <SelectValue placeholder="Pilih zona waktu" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map(tz => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mata_uang" className="text-sm font-medium">
                    Mata Uang
                  </Label>
                  <Select value={form.mata_uang} onValueChange={(v) => setForm({ ...form, mata_uang: v })}>
                    <SelectTrigger className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <SelectValue placeholder="Pilih mata uang" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(c => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.code} - {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo_url" className="text-sm font-medium">
                    Logo URL
                  </Label>
                  <Input
                    id="logo_url"
                    value={form.logo_url}
                    onChange={e => setForm({ ...form, logo_url: e.target.value })}
                    className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
            </div>

            {/* Full width fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="alamat" className="text-sm font-medium">
                  Alamat
                </Label>
                <Textarea
                  id="alamat"
                  rows={3}
                  value={form.alamat}
                  onChange={e => setForm({ ...form, alamat: e.target.value })}
                  className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Masukkan alamat lengkap toko"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200 flex items-start gap-2">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                  <span className="text-red-600 text-xs font-bold">!</span>
                </div>
                <div>{error}</div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="px-5 py-2 h-10 border-gray-300 hover:bg-gray-50"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="px-5 py-2 h-10 bg-indigo-600 hover:bg-indigo-700"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
                    Menyimpan...
                  </div>
                ) : mode === 'create' ? (
                  'Simpan Toko'
                ) : (
                  'Update Toko'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default TokoForm;
