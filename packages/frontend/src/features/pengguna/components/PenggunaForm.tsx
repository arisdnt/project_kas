import { useEffect, useState } from 'react';
import { penggunaService, CreatePenggunaInput, PenggunaDTO, UpdatePenggunaInput } from '../services/penggunaService';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';
import { cn } from '@/core/utils/cn';
import { useToast } from '@/core/hooks/use-toast';

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
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username *</Label>
        <Input 
          id="username" 
          value={form.username} 
          onChange={e => update({ username: e.target.value })} 
          className={getFieldError('username') ? 'border-red-500' : ''}
          required 
        />
        {getFieldError('username') && (
          <p className="text-sm text-red-600">{getFieldError('username')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{mode === 'edit' ? 'Password Baru (opsional)' : 'Password *'}</Label>
        <Input 
          id="password" 
          type="password" 
          value={form.password} 
          onChange={e => update({ password: e.target.value })} 
          placeholder={mode==='edit' ? 'Kosongkan jika tidak diubah' : ''} 
          className={getFieldError('password') ? 'border-red-500' : ''}
          required={mode==='create'} 
        />
        {getFieldError('password') && (
          <p className="text-sm text-red-600">{getFieldError('password')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nama_lengkap">Nama Lengkap (opsional)</Label>
        <Input id="nama_lengkap" value={form.nama_lengkap} onChange={e => update({ nama_lengkap: e.target.value })} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email (opsional)</Label>
        <Input 
          id="email" 
          type="email" 
          value={form.email} 
          onChange={e => update({ email: e.target.value })} 
          className={getFieldError('email') ? 'border-red-500' : ''}
        />
        {getFieldError('email') && (
          <p className="text-sm text-red-600">{getFieldError('email')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="telepon">Telepon (opsional)</Label>
        <Input id="telepon" value={form.telepon} onChange={e => update({ telepon: e.target.value })} />
      </div>

      <div className="space-y-2">
        <Label>Peran *</Label>
        <Select 
          value={form.peran_id || ''} 
          onValueChange={val => update({ peran_id: val || undefined })}
        >
          <SelectTrigger className={getFieldError('peran_id') ? 'border-red-500' : ''}>
            <SelectValue placeholder="Pilih peran" />
          </SelectTrigger>
          <SelectContent>
            {roles.map(p => (
              <SelectItem key={p.id} value={p.id}>
                {p.nama} (Level {p.level})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {getFieldError('peran_id') && (
          <p className="text-sm text-red-600">{getFieldError('peran_id')}</p>
        )}
      </div>

      {/* Tenant selection - show for level 2+ */}
      {selectedRoleLevel >= 2 && (
        <div className="space-y-2">
          <Label>Tenant {selectedRoleLevel >= 3 ? '(wajib)' : '(opsional)'}</Label>
          <Select 
            value={form.tenant_id || ''} 
            onValueChange={val => update({ tenant_id: val || undefined })}
          >
            <SelectTrigger className={getFieldError('tenant_id') ? 'border-red-500' : ''}>
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
          {getFieldError('tenant_id') && (
            <p className="text-sm text-red-600">{getFieldError('tenant_id')}</p>
          )}
        </div>
      )}

      {/* Store selection - show for level 3+ and only when tenant is selected */}
      {selectedRoleLevel >= 3 && form.tenant_id && (
        <div className="space-y-2">
          <Label>Toko (wajib)</Label>
          <Select 
            value={form.toko_id || ''} 
            onValueChange={val => update({ toko_id: val || undefined })}
          >
            <SelectTrigger className={getFieldError('toko_id') ? 'border-red-500' : ''}>
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
          {getFieldError('toko_id') && (
            <p className="text-sm text-red-600">{getFieldError('toko_id')}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={form.status} onValueChange={val => update({ status: val as any })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="aktif">Aktif</SelectItem>
            <SelectItem value="nonaktif">Nonaktif</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="cuti">Cuti</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-2 md:col-span-2">
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button 
          disabled={loading} 
          type="submit" 
          className={cn('bg-blue-600 hover:bg-blue-700')}
        >
          {loading ? 'Menyimpan...' : (mode === 'create' ? 'Simpan' : 'Update')}
        </Button>
      </div>
    </form>
  );
}
