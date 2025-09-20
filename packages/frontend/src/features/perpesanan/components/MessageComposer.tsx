import { FormEvent, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Textarea } from '@/core/components/ui/textarea';
import { Button } from '@/core/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/core/components/ui/select';
import { Label } from '@/core/components/ui/label';
import { PerpesananPrioritas } from '@/features/perpesanan/types/perpesanan';

const PRIORITY_OPTIONS: { label: string; value: PerpesananPrioritas; description: string }[] = [
  { label: 'Normal', value: 'normal', description: 'Digunakan untuk pesan umum.' },
  { label: 'Rendah', value: 'rendah', description: 'Informasi ringan yang tidak mendesak.' },
  { label: 'Tinggi', value: 'tinggi', description: 'Perlu perhatian lebih cepat.' },
  { label: 'Urgent', value: 'urgent', description: 'Kondisi kritis yang perlu tindakan segera.' }
];

type Props = {
  onSend: (payload: { pesan: string; prioritas: PerpesananPrioritas }) => Promise<void>;
  disabled?: boolean;
  isPartnerSelected: boolean;
};

export function MessageComposer({ onSend, disabled = false, isPartnerSelected }: Props) {
  const [message, setMessage] = useState('');
  const [prioritas, setPrioritas] = useState<PerpesananPrioritas>('normal');
  const [sending, setSending] = useState(false);

  const canSend = !sending && !disabled && isPartnerSelected && message.trim().length > 0;

  const send = async () => {
    if (!canSend) {
      return;
    }
    setSending(true);
    try {
      await onSend({ pesan: message.trim(), prioritas });
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await send();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border-t border-gray-200 bg-white px-4 py-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr,160px] md:items-start">
        <div className="space-y-1">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={isPartnerSelected ? 'Tulis pesan untuk dikirim...' : 'Pilih penerima terlebih dahulu'}
            disabled={disabled || sending || !isPartnerSelected}
            rows={3}
            className="resize-none"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && event.ctrlKey && canSend) {
                event.preventDefault();
                void send();
              }
            }}
          />
          <p className="text-xs text-gray-500">Tekan Ctrl + Enter untuk mengirim lebih cepat.</p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Prioritas pesan</Label>
          <Select value={prioritas} onValueChange={(value) => setPrioritas(value as PerpesananPrioritas)}>
            <SelectTrigger className="h-10 text-sm">
              <SelectValue placeholder="Pilih prioritas" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-[11px] text-gray-500">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={!canSend} className="w-full gap-2">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span>Kirim Pesan</span>
          </Button>
        </div>
      </div>
    </form>
  );
}
