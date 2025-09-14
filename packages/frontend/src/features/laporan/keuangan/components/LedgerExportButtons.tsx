import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import id from 'date-fns/locale/id';
import type { LedgerEntry } from '@/features/laporan/keuangan/types';

type Props = {
  data: LedgerEntry[];
  start: Date;
  end: Date;
};

function toFilename(prefix: string, start: Date, end: Date, ext: string) {
  const s = format(start, 'yyyyMMdd');
  const e = format(end, 'yyyyMMdd');
  return `${prefix}_${s}-${e}.${ext}`;
}

function downloadCSV(rows: any[], filename: string) {
  const header = Object.keys(rows[0] || {});
  const csv = [
    header.join(','),
    ...rows.map((r) => header.map((k) => String(r[k] ?? '')).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function LedgerExportButtons({ data, start, end }: Props) {
  const rows = data.map((r) => ({
    Tanggal: format(new Date(r.date), 'yyyy-MM-dd HH:mm', { locale: id }),
    Nomor: r.nomor,
    Deskripsi: r.deskripsi || '',
    Masuk: r.masuk || 0,
    Keluar: r.keluar || 0,
    Saldo: r.saldo || 0,
    Metode: r.metode || '',
  }));

  const onExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Ledger');
    XLSX.writeFile(wb, toFilename('keuangan-ledger', start, end, 'xlsx'));
  };

  const onCSV = () => {
    if (rows.length === 0) return;
    downloadCSV(rows, toFilename('keuangan-ledger', start, end, 'csv'));
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onExcel}
        className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
      >
        <Download className="h-4 w-4 text-gray-600" /> Excel
      </button>
      <button
        type="button"
        onClick={onCSV}
        className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
      >
        <Download className="h-4 w-4 text-gray-600" /> CSV
      </button>
    </div>
  );
}

