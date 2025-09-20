import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/core/components/ui/dialog';
import { Input } from '@/core/components/ui/input';
import { Textarea } from '@/core/components/ui/textarea';
import { Button } from '@/core/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';
import { Switch } from '@/core/components/ui/switch';
import { Label } from '@/core/components/ui/label';
import { Badge } from '@/core/components/ui/badge';
import { CatatanRecord, CatatanVisibilitas, CreateCatatanPayload, UpdateCatatanPayload } from '@/features/catatan/types/catatan';
import { X, Plus, Clock } from 'lucide-react';
import { cn } from '@/core/lib/utils';

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  initialValue?: CatatanRecord;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateCatatanPayload | UpdateCatatanPayload) => Promise<void> | void;
  submitting?: boolean;
};

const defaultVisibilitas: CatatanVisibilitas = 'pribadi';
const defaultPrioritas = 'normal';
const defaultStatus = 'aktif';

function toInputDateTime(value?: string | null): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function normalizeReminderInput(value: string): string | null {
  if (!value) {
    return null;
  }
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString();
  } catch {
    return null;
  }
}

export function CatatanComposer({ open, mode, initialValue, onOpenChange, onSubmit, submitting }: Props) {
  const [judul, setJudul] = useState('');
  const [konten, setKonten] = useState('');
  const [visibilitas, setVisibilitas] = useState<CatatanVisibilitas>(defaultVisibilitas);
  const [prioritas, setPrioritas] = useState<'rendah' | 'normal' | 'tinggi'>(defaultPrioritas);
  const [status, setStatus] = useState<'draft' | 'aktif' | 'arsip'>(defaultStatus);
  const [kategori, setKategori] = useState('');
  const [tokoId, setTokoId] = useState('');
  const [lampiranUrl, setLampiranUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderValue, setReminderValue] = useState('');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (open) {
      setError(undefined);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (mode === 'edit' && initialValue) {
      setJudul(initialValue.judul);
      setKonten(initialValue.konten);
      setVisibilitas(initialValue.visibilitas);
      setPrioritas(initialValue.prioritas);
      setStatus(initialValue.status === 'dihapus' ? 'aktif' : initialValue.status);
      setKategori(initialValue.kategori ?? '');
      setTokoId(initialValue.toko?.id ?? '');
      setLampiranUrl(initialValue.lampiran_url ?? '');
      setTags(initialValue.tags ?? []);
      setReminderEnabled(Boolean(initialValue.reminder_pada));
      setReminderValue(toInputDateTime(initialValue.reminder_pada));
    } else {
      setJudul('');
      setKonten('');
      setVisibilitas(defaultVisibilitas);
      setPrioritas(defaultPrioritas);
      setStatus(defaultStatus);
      setKategori('');
      setTokoId('');
      setLampiranUrl('');
      setTags([]);
      setReminderEnabled(false);
      setReminderValue('');
    }
    setTagInput('');
  }, [open, mode, initialValue]);

  const visibilityHints = useMemo(() => ({
    pribadi: 'Hanya Anda yang dapat melihat catatan ini',
    toko: 'Semua pengguna toko pada tenant ini dapat melihat',
    tenant: 'Seluruh pengguna dalam tenant dapat melihat',
    publik: 'Catatan tersedia untuk semua tenant'
  }), []);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) {
      return;
    }
    if (!tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (value: string) => {
    setTags((prev) => prev.filter((tag) => tag !== value));
  };

  const handleSubmit = async () => {
    if (!judul.trim() || !konten.trim()) {
      setError('Judul dan konten wajib diisi.');
      return;
    }

    const reminderIso = reminderEnabled ? normalizeReminderInput(reminderValue) : null;
    if (reminderEnabled && !reminderIso) {
      setError('Format pengingat tidak valid.');
      return;
    }

    const baseData = {
      judul: judul.trim(),
      konten: konten.trim(),
      visibilitas,
      kategori: kategori.trim() || undefined,
      tags: tags.length ? tags : undefined,
      prioritas,
      status,
      lampiran_url: lampiranUrl.trim() || undefined,
      toko_id: tokoId.trim() || undefined
    };

    try {
      if (mode === 'create') {
        const payload: CreateCatatanPayload = { ...baseData };
        if (reminderIso) {
          payload.reminder_pada = reminderIso;
        }
        await onSubmit(payload);
      } else {
        const payload: UpdateCatatanPayload = {
          ...baseData,
          reminder_pada: reminderEnabled ? reminderIso : null
        };
        await onSubmit(payload);
      }
      onOpenChange(false);
    } catch (submitError: any) {
      const message = submitError?.message ?? 'Gagal menyimpan catatan';
      setError(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Catatan' : 'Catatan Baru'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? 'Perbarui detail catatan agar tetap relevan.' : 'Buat catatan baru untuk membagikan informasi penting.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="catatan-judul">Judul</Label>
              <Input
                id="catatan-judul"
                value={judul}
                onChange={(event) => setJudul(event.target.value)}
                placeholder="Contoh: SOP penutupan toko"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catatan-kategori">Kategori</Label>
              <Input
                id="catatan-kategori"
                value={kategori}
                onChange={(event) => setKategori(event.target.value)}
                placeholder="Contoh: Operasional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="catatan-konten">Konten</Label>
            <Textarea
              id="catatan-konten"
              value={konten}
              onChange={(event) => setKonten(event.target.value)}
              rows={6}
              placeholder="Tuliskan memo, prosedur, atau informasi penting di sini."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Visibilitas</Label>
              <Select value={visibilitas} onValueChange={(value) => setVisibilitas(value as CatatanVisibilitas)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['pribadi', 'toko', 'tenant', 'publik'] as const).map((option) => (
                    <SelectItem key={option} value={option}>
                      <div className="flex flex-col text-xs">
                        <span className="text-sm font-medium capitalize">{option}</span>
                        <span className="text-[11px] text-gray-500">{visibilityHints[option]}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioritas</Label>
              <Select value={prioritas} onValueChange={(value) => setPrioritas(value as 'rendah' | 'normal' | 'tinggi')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tinggi">Tinggi</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="rendah">Rendah</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as 'draft' | 'aktif' | 'arsip')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="arsip">Arsip</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="catatan-toko">ID Toko (Opsional)</Label>
              <Input
                id="catatan-toko"
                value={tokoId}
                onChange={(event) => setTokoId(event.target.value)}
                placeholder="Masukkan ID toko tertentu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catatan-lampiran">URL Lampiran</Label>
              <Input
                id="catatan-lampiran"
                value={lampiranUrl}
                onChange={(event) => setLampiranUrl(event.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex items-center gap-2">
              <Input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Tekan enter untuk menambah tag"
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    #{tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="text-gray-500 hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Clock className="h-4 w-4 text-blue-500" />
                Aktifkan pengingat
              </div>
              <Switch checked={reminderEnabled} onCheckedChange={(checked) => setReminderEnabled(checked)} />
            </div>
            {reminderEnabled && (
              <Input
                type="datetime-local"
                value={reminderValue}
                onChange={(event) => setReminderValue(event.target.value)}
              />
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Batal
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={submitting} className={cn('bg-blue-600 hover:bg-blue-700 text-white')}>
            {submitting ? 'Menyimpan...' : mode === 'edit' ? 'Simpan Perubahan' : 'Simpan Catatan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
