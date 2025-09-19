import { useEffect, useState } from 'react';
import { Input } from '@/core/components/ui/input';
import { Textarea } from '@/core/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/core/components/ui/select';
import { Button } from '@/core/components/ui/button';
import { Label } from '@/core/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Badge } from '@/core/components/ui/badge';
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
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validasi nama
    if (!form.nama.trim()) {
      newErrors.nama = 'Nama tenant wajib diisi';
    } else if (form.nama.trim().length < 3) {
      newErrors.nama = 'Nama tenant minimal 3 karakter';
    }
    
    // Validasi email
    if (!form.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    // Validasi telepon (jika diisi)
    if (form.telepon && !/^[\d\s\-\+\(\)]+$/.test(form.telepon)) {
      newErrors.telepon = 'Nomor telepon hanya boleh berisi angka, spasi, dan karakter +, -, (, )';
    }
    
    // Validasi max_toko
    const maxToko = parseInt(form.max_toko);
    if (isNaN(maxToko) || maxToko < 1) {
      newErrors.max_toko = 'Maksimum toko harus berupa angka minimal 1';
    } else if (maxToko > 100) {
      newErrors.max_toko = 'Maksimum toko tidak boleh lebih dari 100';
    }
    
    // Validasi max_pengguna
    const maxPengguna = parseInt(form.max_pengguna);
    if (isNaN(maxPengguna) || maxPengguna < 1) {
      newErrors.max_pengguna = 'Maksimum pengguna harus berupa angka minimal 1';
    } else if (maxPengguna > 1000) {
      newErrors.max_pengguna = 'Maksimum pengguna tidak boleh lebih dari 1000';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi form sebelum submit
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError(null);
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
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-xl font-semibold">
            {mode === 'create' ? 'Tambah Tenant Baru' : 'Edit Tenant'}
          </CardTitle>
          <CardDescription>
            {mode === 'create'
              ? 'Lengkapi informasi di bawah ini untuk menambah tenant baru.'
              : 'Perbarui informasi tenant di bawah ini.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nama" className="text-sm font-medium">
                    Nama Tenant <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nama"
                    value={form.nama}
                    onChange={e => {
                      setForm({ ...form, nama: e.target.value });
                      // Hapus error ketika user mulai mengetik
                      if (errors.nama) setErrors({ ...errors, nama: '' });
                    }}
                    required
                    className={`focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.nama ? 'border-red-500' : ''}`}
                    placeholder="Masukkan nama tenant"
                  />
                  {errors.nama && (
                    <p className="text-sm text-red-600 mt-1">{errors.nama}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={e => {
                      setForm({ ...form, email: e.target.value });
                      // Hapus error ketika user mulai mengetik
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    required
                    className={`focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="tenant@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telepon" className="text-sm font-medium">
                    Telepon
                  </Label>
                  <Input
                    id="telepon"
                    value={form.telepon}
                    onChange={e => {
                      setForm({ ...form, telepon: e.target.value });
                      // Hapus error ketika user mulai mengetik
                      if (errors.telepon) setErrors({ ...errors, telepon: '' });
                    }}
                    className={`focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.telepon ? 'border-red-500' : ''}`}
                    placeholder="+62 812-3456-7890"
                  />
                  {errors.telepon && (
                    <p className="text-sm text-red-600 mt-1">{errors.telepon}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status
                  </Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as any })}>
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
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paket" className="text-sm font-medium">
                    Paket
                  </Label>
                  <Select value={form.paket} onValueChange={v => setForm({ ...form, paket: v as any })}>
                    <SelectTrigger className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <SelectValue placeholder="Pilih paket" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAKET_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={o.value === 'basic' ? 'secondary' : o.value === 'standard' ? 'default' : o.value === 'premium' ? 'default' : 'default'}
                              className={
                                o.value === 'basic' ? 'bg-gray-100 text-gray-800' :
                                o.value === 'standard' ? 'bg-blue-100 text-blue-800' :
                                o.value === 'premium' ? 'bg-purple-100 text-purple-800' :
                                'bg-amber-100 text-amber-800'
                              }
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
                  <Label htmlFor="max_toko" className="text-sm font-medium">
                    Maksimum Toko
                  </Label>
                  <Input
                    id="max_toko"
                    type="number"
                    min={1}
                    value={form.max_toko}
                    onChange={e => {
                      setForm({ ...form, max_toko: e.target.value });
                      // Hapus error ketika user mulai mengetik
                      if (errors.max_toko) setErrors({ ...errors, max_toko: '' });
                    }}
                    className={`focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.max_toko ? 'border-red-500' : ''}`}
                  />
                  {errors.max_toko && (
                    <p className="text-sm text-red-600 mt-1">{errors.max_toko}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_pengguna" className="text-sm font-medium">
                    Maksimum Pengguna
                  </Label>
                  <Input
                    id="max_pengguna"
                    type="number"
                    min={1}
                    value={form.max_pengguna}
                    onChange={e => {
                      setForm({ ...form, max_pengguna: e.target.value });
                      // Hapus error ketika user mulai mengetik
                      if (errors.max_pengguna) setErrors({ ...errors, max_pengguna: '' });
                    }}
                    className={`focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.max_pengguna ? 'border-red-500' : ''}`}
                  />
                  {errors.max_pengguna && (
                    <p className="text-sm text-red-600 mt-1">{errors.max_pengguna}</p>
                  )}
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
                  placeholder="Masukkan alamat lengkap tenant"
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
                  'Simpan Tenant'
                ) : (
                  'Update Tenant'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default TenantForm;
