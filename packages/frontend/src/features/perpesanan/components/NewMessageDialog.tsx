import { useEffect, useMemo, useState } from 'react';
import { Loader2, MessageSquarePlus, Search } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/core/components/ui/select';
import { ScrollArea } from '@/core/components/ui/scroll-area';
import { penggunaService, PenggunaDTO } from '@/features/pengguna/services/penggunaService';
import { useAuthStore } from '@/core/store/authStore';
import { PerpesananPrioritas } from '@/features/perpesanan/types/perpesanan';

const PRIORITY_OPTIONS: { label: string; value: PerpesananPrioritas }[] = [
  { label: 'Normal', value: 'normal' },
  { label: 'Rendah', value: 'rendah' },
  { label: 'Tinggi', value: 'tinggi' },
  { label: 'Urgent', value: 'urgent' }
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (partnerId: string, payload: { pesan: string; prioritas: PerpesananPrioritas }) => Promise<void>;
};

export function NewMessageDialog({ open, onOpenChange, onSend }: Props) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PenggunaDTO[]>([]);
  const [selected, setSelected] = useState<PenggunaDTO | null>(null);
  const [message, setMessage] = useState('');
  const [prioritas, setPrioritas] = useState<PerpesananPrioritas>('normal');
  const [sending, setSending] = useState(false);

  const normalizedCurrentUserId = currentUserId != null ? String(currentUserId) : undefined;

  useEffect(() => {
    if (!open) {
      setSearch('');
      setResults([]);
      setSelected(null);
      setMessage('');
      setPrioritas('normal');
      setSending(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let active = true;
    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const { items } = await penggunaService.list({ search, limit: 20 });
        if (!active) {
          return;
        }
        const filtered = items.filter((item) => String(item.id) !== normalizedCurrentUserId);
        setResults(filtered);
      } catch {
        setResults([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(handler);
    };
  }, [open, search, normalizedCurrentUserId]);

  const canSend = useMemo(() => {
    return Boolean(selected) && message.trim().length > 0 && !sending;
  }, [selected, message, sending]);

  const handleSend = async () => {
    if (!selected || !canSend) {
      return;
    }
    setSending(true);
    try {
      await onSend(selected.id, { pesan: message.trim(), prioritas });
      onOpenChange(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <MessageSquarePlus className="h-5 w-5 text-blue-600" />
            Buat Pesan Baru
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Kirim pesan langsung ke pengguna lain dalam tenant Anda. Pesan tersimpan secara aman di sistem.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Cari penerima</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama atau username (min. 2 karakter)"
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-48 rounded-md border border-gray-200">
              <div className="divide-y divide-gray-100">
                {loading && (
                  <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memuat daftar pengguna...
                  </div>
                )}

                {!loading && results.length === 0 && (
                  <div className="py-6 text-center text-sm text-gray-500">
                    {search.trim().length > 0 ? 'Tidak menemukan pengguna dengan kata kunci tersebut.' : 'Masukkan kata kunci untuk mencari pengguna.'}
                  </div>
                )}

                {!loading && results.map((item) => {
                  const isSelected = selected?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelected(item)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition-colors ${
                        isSelected ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold uppercase">
                        {(item.nama_lengkap || item.username || '?').slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{item.nama_lengkap || item.username}</p>
                        <p className="text-xs text-gray-500">@{item.username}</p>
                        {item.peran_nama && <p className="text-xs text-gray-400">{item.peran_nama}</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Isi pesan</label>
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={selected ? `Ketik pesan untuk ${selected.nama_lengkap || selected.username}` : 'Pilih penerima terlebih dahulu'}
              rows={4}
              disabled={!selected || sending}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Prioritas</label>
              <Select value={prioritas} onValueChange={(value) => setPrioritas(value as PerpesananPrioritas)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih prioritas" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selected && (
              <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-3 text-xs text-blue-700">
                <p className="font-semibold text-sm">Penerima dipilih</p>
                <p>{selected.nama_lengkap || selected.username}</p>
                {selected.peran_nama && <p className="mt-1 text-[11px]">Peran: {selected.peran_nama}</p>}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button type="button" onClick={handleSend} disabled={!canSend} className="gap-2">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquarePlus className="h-4 w-4" />}
            Kirim Pesan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
