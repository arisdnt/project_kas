import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import id from 'date-fns/locale/id';

type Props = {
  preset: 'hari-ini' | 'minggu-ini' | 'bulan-ini' | 'tahun-ini' | 'kustom';
  start: Date;
  end: Date;
  onPresetChange: (p: Props['preset']) => void;
  onCustomApply: (start: Date, end: Date) => void;
};

export function DateRangeFilter({ preset, start, end, onPresetChange, onCustomApply }: Props) {
  const label = preset === 'kustom'
    ? `${format(start, 'dd MMM yyyy', { locale: id })} – ${format(end, 'dd MMM yyyy', { locale: id })}`
    : preset.replace('-', ' ');

  return (
    <div className="flex items-center gap-3">
      <Select value={preset} onValueChange={(v) => onPresetChange(v as any)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Pilih rentang" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="hari-ini">Hari ini</SelectItem>
          <SelectItem value="minggu-ini">Minggu ini</SelectItem>
          <SelectItem value="bulan-ini">Bulan ini</SelectItem>
          <SelectItem value="tahun-ini">Tahun ini</SelectItem>
          <SelectItem value="kustom">Kustom</SelectItem>
        </SelectContent>
      </Select>

      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
        onClick={() => {
          // Simple prompt-based kustom range to keep this modular & small
          if (preset !== 'kustom') return;
          const s = prompt('Tanggal mulai (YYYY-MM-DD):', format(start, 'yyyy-MM-dd'));
          if (!s) return;
          const e = prompt('Tanggal akhir (YYYY-MM-DD):', format(end, 'yyyy-MM-dd'));
          if (!e) return;
          const sDate = new Date(`${s}T00:00:00`);
          const eDate = new Date(`${e}T23:59:59`);
          if (!isNaN(sDate.getTime()) && !isNaN(eDate.getTime())) onCustomApply(sDate, eDate);
        }}
      >
        <Calendar className="h-4 w-4 text-gray-600" />
        <span className="text-gray-700">{label}</span>
      </button>
    </div>
  );
}

