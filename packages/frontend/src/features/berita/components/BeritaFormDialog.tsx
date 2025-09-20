import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/core/components/ui/dialog';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Textarea } from '@/core/components/ui/textarea';
import { Label } from '@/core/components/ui/label';
import { Checkbox } from '@/core/components/ui/checkbox';
import { ScrollArea } from '@/core/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';
import { useToast } from '@/core/hooks/use-toast';
import { useAuthStore } from '@/core/store/authStore';
import { TokoService } from '@/features/toko/services/tokoService';
import { tenantService } from '@/features/tenan/services/tenantService';
import {
  BeritaFormValues,
  BeritaItem,
  BeritaTargetTampil,
  CreateBeritaPayload,
  UpdateBeritaPayload
} from '@/features/berita/types/berita';

interface OptionItem {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: BeritaItem | null;
  onClose: () => void;
  onSubmit: (payload: CreateBeritaPayload | UpdateBeritaPayload) => Promise<void>;
}

type FormErrors = Partial<Record<keyof BeritaFormValues, string>>;

const tipeOptions = [
  { value: 'informasi', label: 'Informasi' },
  { value: 'pengumuman', label: 'Pengumuman' },
  { value: 'peringatan', label: 'Peringatan' },
  { value: 'urgent', label: 'Urgent' }
] as const;

const prioritasOptions = [
  { value: 'rendah', label: 'Rendah' },
  { value: 'normal', label: 'Normal' },
  { value: 'tinggi', label: 'Tinggi' },
  { value: 'urgent', label: 'Urgent' }
] as const;

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'aktif', label: 'Aktif' },
  { value: 'nonaktif', label: 'Nonaktif' },
  { value: 'kedaluwarsa', label: 'Kedaluwarsa' }
] as const;

const targetOptions: { value: BeritaTargetTampil; label: string }[] = [
  { value: 'toko_tertentu', label: 'Toko Tertentu' },
  { value: 'semua_toko_tenant', label: 'Semua Toko Tenant' },
  { value: 'semua_tenant', label: 'Tenant Tertentu' }
];

function toDateTimeLocal(value: string | undefined | null): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const pad = (n: number) => `${n}`.padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIsoString(value: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString();
}

const defaultForm: BeritaFormValues = {
  judul: '',
  konten: '',
  tipeBerita: 'informasi',
  targetTampil: 'toko_tertentu',
  targetTokoIds: [],
  targetTenantIds: [],
  jadwalMulai: toDateTimeLocal(new Date().toISOString()),
  jadwalSelesai: '',
  intervalTampilMenit: 60,
  maksimalTampil: '',
  prioritas: 'normal',
  status: 'draft',
  gambarUrl: '',
  lampiranUrl: ''
};

export function BeritaFormDialog({ open, mode, initial, onClose, onSubmit }: Props) {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const [form, setForm] = useState<BeritaFormValues>(defaultForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [storeOptions, setStoreOptions] = useState<OptionItem[]>([]);
  const [tenantOptions, setTenantOptions] = useState<OptionItem[]>([]);
  const canTargetTenant = Boolean(user?.isGodUser || (user?.level ?? 5) <= 2);

  useEffect(() => {
    if (!open) {
      return;
    }

    setErrors({});

    if (mode === 'edit' && initial) {
      setForm({
        judul: initial.judul,
        konten: initial.konten,
        tipeBerita: initial.tipeBerita,
        targetTampil: initial.targetTampil,
        targetTokoIds: initial.targetTokoIds ?? [],
        targetTenantIds: initial.targetTenantIds ?? [],
        jadwalMulai: toDateTimeLocal(initial.jadwalMulai),
        jadwalSelesai: toDateTimeLocal(initial.jadwalSelesai ?? ''),
        intervalTampilMenit: initial.intervalTampilMenit,
        maksimalTampil: initial.maksimalTampil ?? '',
        prioritas: initial.prioritas,
        status: initial.status,
        gambarUrl: initial.gambarUrl ?? '',
        lampiranUrl: initial.lampiranUrl ?? ''
      });
    } else {
      setForm(defaultForm);
    }
  }, [open, mode, initial]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let mounted = true;

    const loadStores = async () => {
      try {
        const stores = await TokoService.getActiveStores();
        if (!mounted) {
          return;
        }
        setStoreOptions(
          (stores || []).map((store) => ({
            id: store.id,
            name: store.nama
          }))
        );
      } catch (error) {
        toast({
          title: 'Gagal memuat toko',
          description: 'Tidak dapat memuat daftar toko untuk targeting berita.',
          variant: 'destructive'
        });
      }
    };

    const loadTenants = async () => {
      if (!canTargetTenant) {
        setTenantOptions([]);
        return;
      }
      try {
        const tenants = await tenantService.list({ page: 1, limit: 100 });
        if (!mounted) {
          return;
        }
        setTenantOptions(
          (tenants.data || []).map((tenant) => ({
            id: tenant.id,
            name: tenant.nama
          }))
        );
      } catch (error) {
        toast({
          title: 'Gagal memuat tenant',
          description: 'Tidak dapat memuat daftar tenant untuk targeting berita.',
          variant: 'destructive'
        });
      }
    };

    loadStores();
    loadTenants();

    return () => {
      mounted = false;
    };
  }, [open, canTargetTenant, toast]);

  const validationErrors = useMemo(() => errors, [errors]);

  const updateField = <K extends keyof BeritaFormValues>(key: K, value: BeritaFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!form.judul.trim()) {
      nextErrors.judul = 'Judul wajib diisi';
    }
    if (!form.konten.trim()) {
      nextErrors.konten = 'Konten wajib diisi';
    }
    if (form.intervalTampilMenit < 1) {
      nextErrors.intervalTampilMenit = 'Interval minimal 1 menit';
    }
    if (form.targetTampil === 'toko_tertentu' && form.targetTokoIds.length === 0) {
      nextErrors.targetTokoIds = 'Pilih minimal satu toko tujuan';
    }
    if (form.targetTampil === 'semua_tenant' && form.targetTenantIds.length === 0) {
      nextErrors.targetTenantIds = 'Pilih tenant tujuan';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast({
        title: 'Validasi gagal',
        description: 'Periksa kembali data berita yang diisi.',
        variant: 'destructive'
      });
      return;
    }

    const payload: CreateBeritaPayload = {
      judul: form.judul.trim(),
      konten: form.konten.trim(),
      tipeBerita: form.tipeBerita,
      targetTampil: form.targetTampil,
      targetTokoIds: form.targetTampil === 'toko_tertentu' ? form.targetTokoIds : undefined,
      targetTenantIds: form.targetTampil === 'semua_tenant' ? form.targetTenantIds : undefined,
      jadwalMulai: toIsoString(form.jadwalMulai) ?? new Date().toISOString(),
      jadwalSelesai: toIsoString(form.jadwalSelesai || ''),
      intervalTampilMenit: form.intervalTampilMenit,
      maksimalTampil: form.maksimalTampil === '' ? undefined : Number(form.maksimalTampil),
      prioritas: form.prioritas,
      status: form.status,
      gambarUrl: form.gambarUrl?.trim() || undefined,
      lampiranUrl: form.lampiranUrl?.trim() || undefined
    };

    setSubmitting(true);
    try {
      await onSubmit(mode === 'edit' ? (payload as UpdateBeritaPayload) : payload);
      toast({
        title: mode === 'create' ? 'Berita dibuat' : 'Berita diperbarui',
        description: mode === 'create'
          ? 'Berita baru berhasil disimpan dan siap dijadwalkan.'
          : 'Perubahan berita berhasil disimpan.'
      });
      onClose();
    } catch (error: any) {
      toast({
        title: 'Gagal menyimpan',
        description: error?.message || 'Terjadi kesalahan saat menyimpan berita.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => (!value ? onClose() : undefined)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-800">
            {mode === 'create' ? 'Buat Berita Baru' : 'Ubah Berita'}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            {mode === 'create'
              ? 'Gunakan form ini untuk menambahkan pesan internal, pengumuman, atau alert operasional.'
              : 'Perbarui detail berita dan tentukan jadwal penayangan.'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Judul
              </Label>
              <Input
                value={form.judul}
                onChange={(event) => updateField('judul', event.target.value)}
                placeholder="Contoh: Maintenance sistem kasir"
              />
              {validationErrors.judul ? (
                <p className="mt-1 text-xs text-red-500">{validationErrors.judul}</p>
              ) : null}
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Tipe Berita
              </Label>
              <Select
                value={form.tipeBerita}
                onValueChange={(value) => updateField('tipeBerita', value as BeritaFormValues['tipeBerita'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  {tipeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="capitalize">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Konten
            </Label>
            <Textarea
              value={form.konten}
              onChange={(event) => updateField('konten', event.target.value)}
              rows={4}
              placeholder="Tulis detail pengumuman atau instruksi di sini..."
              className="resize-none"
            />
            {validationErrors.konten ? (
              <p className="mt-1 text-xs text-red-500">{validationErrors.konten}</p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Target Penayangan
              </Label>
              <Select
                value={form.targetTampil}
                onValueChange={(value) => updateField('targetTampil', value as BeritaTargetTampil)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Pilih target" />
                </SelectTrigger>
                <SelectContent>
                  {targetOptions
                    .filter((option) => option.value !== 'semua_tenant' || canTargetTenant)
                    .map((option) => (
                      <SelectItem key={option.value} value={option.value} className="capitalize">
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {form.targetTampil === 'toko_tertentu' ? (
                <div className="mt-3">
                  <p className="text-xs font-medium text-slate-600">Pilih toko tujuan</p>
                  <ScrollArea className="mt-2 h-32 rounded border border-slate-200">
                    <div className="space-y-2 p-3">
                      {storeOptions.map((store) => (
                        <label key={store.id} className="flex items-center gap-3 text-sm text-slate-600">
                          <Checkbox
                            checked={form.targetTokoIds.includes(store.id)}
                            onCheckedChange={(checked) => {
                              updateField(
                                'targetTokoIds',
                                checked
                                  ? [...form.targetTokoIds, store.id]
                                  : form.targetTokoIds.filter((id) => id !== store.id)
                              );
                            }}
                          />
                          <span>{store.name}</span>
                        </label>
                      ))}
                      {storeOptions.length === 0 ? (
                        <p className="text-xs text-slate-400">Tidak ada data toko yang tersedia.</p>
                      ) : null}
                    </div>
                  </ScrollArea>
                  {validationErrors.targetTokoIds ? (
                    <p className="mt-2 text-xs text-red-500">{validationErrors.targetTokoIds}</p>
                  ) : null}
                </div>
              ) : null}

              {form.targetTampil === 'semua_tenant' && canTargetTenant ? (
                <div className="mt-3">
                  <p className="text-xs font-medium text-slate-600">Pilih tenant tujuan</p>
                  <ScrollArea className="mt-2 h-32 rounded border border-slate-200">
                    <div className="space-y-2 p-3">
                      {tenantOptions.map((tenant) => (
                        <label key={tenant.id} className="flex items-center gap-3 text-sm text-slate-600">
                          <Checkbox
                            checked={form.targetTenantIds.includes(tenant.id)}
                            onCheckedChange={(checked) => {
                              updateField(
                                'targetTenantIds',
                                checked
                                  ? [...form.targetTenantIds, tenant.id]
                                  : form.targetTenantIds.filter((id) => id !== tenant.id)
                              );
                            }}
                          />
                          <span>{tenant.name}</span>
                        </label>
                      ))}
                      {tenantOptions.length === 0 ? (
                        <p className="text-xs text-slate-400">Tidak ada data tenant atau akses terbatas.</p>
                      ) : null}
                    </div>
                  </ScrollArea>
                  {validationErrors.targetTenantIds ? (
                    <p className="mt-2 text-xs text-red-500">{validationErrors.targetTenantIds}</p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="grid gap-3">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Jadwal Mulai</Label>
                  <Input
                    type="datetime-local"
                    value={form.jadwalMulai}
                    onChange={(event) => updateField('jadwalMulai', event.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Jadwal Selesai</Label>
                  <Input
                    type="datetime-local"
                    value={form.jadwalSelesai}
                    onChange={(event) => updateField('jadwalSelesai', event.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Interval Tampil (menit)
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={1440}
                      value={form.intervalTampilMenit}
                      onChange={(event) => updateField('intervalTampilMenit', Number(event.target.value))}
                    />
                    {validationErrors.intervalTampilMenit ? (
                      <p className="mt-1 text-xs text-red-500">{validationErrors.intervalTampilMenit}</p>
                    ) : null}
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Maksimal Tampil (opsional)
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={form.maksimalTampil}
                      onChange={(event) => updateField('maksimalTampil', event.target.value === '' ? '' : Number(event.target.value))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Prioritas
                    </Label>
                    <Select
                      value={form.prioritas}
                      onValueChange={(value) => updateField('prioritas', value as BeritaFormValues['prioritas'])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Prioritas" />
                      </SelectTrigger>
                      <SelectContent>
                        {prioritasOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="capitalize">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </Label>
                    <Select value={form.status} onValueChange={(value) => updateField('status', value as BeritaFormValues['status'])}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="capitalize">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      URL Gambar (opsional)
                    </Label>
                    <Input
                      type="url"
                      placeholder="https://cdn.sistempos.id/news/banner.png"
                      value={form.gambarUrl}
                      onChange={(event) => updateField('gambarUrl', event.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      URL Lampiran (opsional)
                    </Label>
                    <Input
                      type="url"
                      placeholder="https://docs.sistempos.id/manual.pdf"
                      value={form.lampiranUrl}
                      onChange={(event) => updateField('lampiranUrl', event.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-500">
            Berita hanya dapat dibuat oleh user level 1-3. News tracker akan mengikuti jadwal dan interval yang ditentukan.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Menyimpan...' : mode === 'create' ? 'Simpan Berita' : 'Perbarui'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
