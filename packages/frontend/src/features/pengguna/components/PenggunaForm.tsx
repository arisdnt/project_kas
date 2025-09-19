import { useEffect, useState } from 'react';
import { penggunaService, CreatePenggunaInput, PenggunaDTO, UpdatePenggunaInput } from '../services/penggunaService';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Badge } from '@/core/components/ui/badge';
import { cn } from '@/core/utils/cn';
import { useToast } from '@/core/hooks/use-toast';
import { Users, UserPlus, Shield, Building, Store } from 'lucide-react';

interface PenggunaFormProps {
  mode: 'create'|'edit';
  initial?: PenggunaDTO | null;
  onSuccess: (user: PenggunaDTO) => void;
  onCancel: () => void;
}

interface ValidationError {
  field: string;
  message: string;
}

export function PenggunaForm({ mode, initial, onSuccess, onCancel }: PenggunaFormProps) {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<{ id: string; nama: string; level: number; deskripsi?: string }[]>([]);
  const [tenants, setTenants] = useState<{ id: string; nama: string; status: string }[]>([]);
  const [stores, setStores] = useState<{ id: string; nama: string; kode: string }[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const { toast } = useToast();
  
  const [form, setForm] = useState<Partial<CreatePenggunaInput>>({
    username: initial?.username || '',
    password: '',
    peran_id: initial?.peran_id || undefined,
    tenant_id: initial?.tenant_id || undefined,
    toko_id: initial?.toko_id || undefined,
    status: (initial?.status as any) || 'aktif',
    nama_lengkap: initial?.nama_lengkap || '',
    email: initial?.email || '',
    telepon: initial?.telepon || ''
  });

  const selectedRole = roles.find(r => r.id === form.peran_id);
  const selectedRoleLevel = selectedRole?.level || 5;

  // Fungsi untuk mendapatkan error berdasarkan field
  const getFieldError = (field: string): string | undefined => {
    return errors.find(error => error.field === field)?.message;
  };

  // Fungsi untuk menghapus error field tertentu
  const clearFieldError = (field: string) => {
    setErrors(prev => prev.filter(error => error.field !== field));
  };

  // Validasi form berdasarkan level role
  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = [];

    // Validasi field wajib
    if (!form.username?.trim()) {
      newErrors.push({ field: 'username', message: 'Username wajib diisi' });
    }

    if (mode === 'create' && !form.password?.trim()) {
      newErrors.push({ field: 'password', message: 'Password wajib diisi' });
    }

    if (!form.peran_id) {
      newErrors.push({ field: 'peran_id', message: 'Peran wajib dipilih' });
    }

    // Validasi email jika diisi
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.push({ field: 'email', message: 'Format email tidak valid' });
    }

    // Validasi berdasarkan level role
    if (selectedRoleLevel >= 3) {
      // Level 3-5: Wajib tenant dan toko
      if (!form.tenant_id) {
        newErrors.push({ field: 'tenant_id', message: 'Tenant wajib dipilih untuk level role ini' });
      }
      if (!form.toko_id) {
        newErrors.push({ field: 'toko_id', message: 'Toko wajib dipilih untuk level role ini' });
      }
    } else if (selectedRoleLevel === 2) {
      // Level 2: Wajib tenant, toko opsional
      if (!form.tenant_id) {
        newErrors.push({ field: 'tenant_id', message: 'Tenant wajib dipilih untuk level role ini' });
      }
    }
    // Level 1: Tidak perlu tenant dan toko

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Fungsi untuk membersihkan payload berdasarkan level role
  const cleanPayloadByRole = (payload: Partial<CreatePenggunaInput>): Partial<CreatePenggunaInput> => {
    const cleaned = { ...payload };

    // Bersihkan string kosong menjadi undefined
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key as keyof CreatePenggunaInput] === '') {
        cleaned[key as keyof CreatePenggunaInput] = undefined;
      }
    });

    // Bersihkan berdasarkan level role
    if (selectedRoleLevel === 1) {
      // God level: hapus tenant dan toko
      cleaned.tenant_id = undefined;
      cleaned.toko_id = undefined;
    } else if (selectedRoleLevel === 2) {
      // Admin level: hapus toko jika tidak dipilih
      if (!cleaned.tenant_id) {
        cleaned.toko_id = undefined;
      }
    }

    return cleaned;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rolesData, tenantsData] = await Promise.all([
          penggunaService.getRoles(),
          penggunaService.getTenants()
        ]);
        setRoles(rolesData);
        setTenants(tenantsData);
      } catch (error) {
        console.error('Failed to load form data:', error);
        toast({
          title: "Error",
          description: "Gagal memuat data form. Silakan refresh halaman.",
          variant: "destructive"
        });
      }
    };
    loadData();
  }, [toast]);

  // Load stores when tenant changes
  useEffect(() => {
    if (form.tenant_id) {
      penggunaService.getStoresByTenant(form.tenant_id)
        .then(setStores)
        .catch(() => {
          setStores([]);
          toast({
            title: "Warning",
            description: "Gagal memuat data toko untuk tenant ini.",
            variant: "destructive"
          });
        });
    } else {
      setStores([]);
    }
  }, [form.tenant_id, toast]);

  // Reset tenant/store when role level changes
  useEffect(() => {
    if (selectedRoleLevel === 1) {
      // God level: clear tenant and store
      setForm(f => ({ ...f, tenant_id: undefined, toko_id: undefined }));
    } else if (selectedRoleLevel === 2) {
      // Admin level: clear store but keep tenant
      setForm(f => ({ ...f, toko_id: undefined }));
    }
  }, [selectedRoleLevel]);

  const update = (patch: Partial<CreatePenggunaInput>) => {
    setForm(f => ({ ...f, ...patch }));
    
    // Clear errors untuk field yang diubah
    Object.keys(patch).forEach(field => {
      clearFieldError(field);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validasi Error",
        description: "Mohon perbaiki kesalahan pada form sebelum melanjutkan.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (mode === 'create') {
        const cleanedPayload = cleanPayloadByRole(form as CreatePenggunaInput);
        const created = await penggunaService.create(cleanedPayload as CreatePenggunaInput);
        toast({
          title: "Berhasil",
          description: "Pengguna berhasil ditambahkan.",
        });
        onSuccess(created);
      } else if (initial) {
        const diff: UpdatePenggunaInput = {};
        if (form.username && form.username !== initial.username) diff.username = form.username;
        if (form.peran_id !== undefined && form.peran_id !== initial.peran_id) diff.peran_id = form.peran_id;
        if (form.tenant_id !== undefined && form.tenant_id !== initial.tenant_id) diff.tenant_id = form.tenant_id;
        if (form.toko_id !== undefined && form.toko_id !== initial.toko_id) diff.toko_id = form.toko_id;
        if (form.status && form.status !== initial.status) diff.status = form.status;
        if (form.nama_lengkap !== undefined && form.nama_lengkap !== initial.nama_lengkap) diff.nama_lengkap = form.nama_lengkap;
        if (form.email !== undefined && form.email !== initial.email) diff.email = form.email;
        if (form.telepon !== undefined && form.telepon !== initial.telepon) diff.telepon = form.telepon;
        if (form.password) diff.password = form.password;
        
        const cleanedDiff = cleanPayloadByRole(diff);
        const updated = await penggunaService.update(initial.id, cleanedDiff);
        toast({
          title: "Berhasil",
          description: "Pengguna berhasil diperbarui.",
        });
        onSuccess(updated);
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Terjadi kesalahan saat menyimpan data';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
              {mode === 'create' ? <UserPlus className="h-5 w-5" /> : <Users className="h-5 w-5" />}
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">
                {mode === 'create' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}
              </CardTitle>
              <CardDescription>
                {mode === 'create'
                  ? 'Lengkapi informasi di bawah ini untuk menambah pengguna baru.'
                  : 'Perbarui informasi pengguna di bawah ini.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    value={form.username}
                    onChange={e => update({ username: e.target.value })}
                    className={cn(
                      getFieldError('username') ? 'border-red-500' : '',
                      'pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                    )}
                    required
                    placeholder="Masukkan username"
                  />
                </div>
                {getFieldError('username') && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-red-600 text-xs font-bold">!</span>
                    </span>
                    {getFieldError('username')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  {mode === 'edit' ? 'Password Baru (opsional)' : 'Password'}
                  {mode === 'create' && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={e => update({ password: e.target.value })}
                  placeholder={mode==='edit' ? 'Kosongkan jika tidak diubah' : 'Masukkan password'}
                  className={cn(
                    getFieldError('password') ? 'border-red-500' : '',
                    'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                  )}
                  required={mode==='create'}
                />
                {getFieldError('password') && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-red-600 text-xs font-bold">!</span>
                    </span>
                    {getFieldError('password')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nama_lengkap" className="text-sm font-medium">
                  Nama Lengkap
                </Label>
                <Input
                  id="nama_lengkap"
                  value={form.nama_lengkap}
                  onChange={e => update({ nama_lengkap: e.target.value })}
                  className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Masukkan nama lengkap"
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
                  onChange={e => update({ email: e.target.value })}
                  className={cn(
                    getFieldError('email') ? 'border-red-500' : '',
                    'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                  )}
                  placeholder="user@example.com"
                />
                {getFieldError('email') && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-red-600 text-xs font-bold">!</span>
                    </span>
                    {getFieldError('email')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telepon" className="text-sm font-medium">
                  Telepon
                </Label>
                <Input
                  id="telepon"
                  value={form.telepon}
                  onChange={e => update({ telepon: e.target.value })}
                  className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="+62 812-3456-7890"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Peran <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Select
                    value={form.peran_id || ''}
                    onValueChange={val => update({ peran_id: val || undefined })}
                  >
                    <SelectTrigger className={cn(
                      getFieldError('peran_id') ? 'border-red-500' : '',
                      'pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                    )}>
                      <SelectValue placeholder="Pilih peran" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          <div className="flex items-center gap-2">
                            <span>{p.nama}</span>
                            <Badge variant="outline" className="text-xs">
                              Level {p.level}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {getFieldError('peran_id') && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-red-600 text-xs font-bold">!</span>
                    </span>
                    {getFieldError('peran_id')}
                  </p>
                )}
              </div>
            </div>

            {/* Tenant selection - show for level 2+ */}
            {selectedRoleLevel >= 2 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Tenant {selectedRoleLevel >= 3 ? <span className="text-red-500">*</span> : <span className="text-gray-500">(opsional)</span>}
                </Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Select
                    value={form.tenant_id || ''}
                    onValueChange={val => update({ tenant_id: val || undefined })}
                  >
                    <SelectTrigger className={cn(
                      getFieldError('tenant_id') ? 'border-red-500' : '',
                      'pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                    )}>
                      <SelectValue placeholder="Pilih tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map(t => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {getFieldError('tenant_id') && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-red-600 text-xs font-bold">!</span>
                    </span>
                    {getFieldError('tenant_id')}
                  </p>
                )}
              </div>
            )}

            {/* Store selection - show for level 3+ and only when tenant is selected */}
            {selectedRoleLevel >= 3 && form.tenant_id && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Toko <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Select
                    value={form.toko_id || ''}
                    onValueChange={val => update({ toko_id: val || undefined })}
                  >
                    <SelectTrigger className={cn(
                      getFieldError('toko_id') ? 'border-red-500' : '',
                      'pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                    )}>
                      <SelectValue placeholder="Pilih toko" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.nama} ({s.kode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {getFieldError('toko_id') && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-red-600 text-xs font-bold">!</span>
                    </span>
                    {getFieldError('toko_id')}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Status
              </Label>
              <Select value={form.status} onValueChange={val => update({ status: val as any })}>
                <SelectTrigger className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                        Aktif
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="nonaktif">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                        Nonaktif
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="suspended">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">
                        Suspended
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="cuti">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                        Cuti
                      </Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                disabled={loading}
                type="submit"
                className="px-5 py-2 h-10 bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
                    Menyimpan...
                  </div>
                ) : mode === 'create' ? (
                  'Simpan Pengguna'
                ) : (
                  'Update Pengguna'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
