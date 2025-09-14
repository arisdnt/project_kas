import { LedgerEntry } from '@/features/laporan/keuangan/types';
import { format } from 'date-fns';
import id from 'date-fns/locale/id';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

function formatCurrency(n: number) {
  return (n || 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
}

type Props = {
  data: LedgerEntry[];
  loading?: boolean;
};

export function LedgerTable({ data, loading }: Props) {
  if (loading) {
    return <div className="text-sm text-gray-500">Memuat data...</div>;
  }

  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Tanggal</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Nomor</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Deskripsi</th>
            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Masuk</th>
            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Keluar</th>
            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Saldo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm text-gray-800">
                {format(new Date(row.date), 'dd MMM yyyy HH:mm', { locale: id })}
              </td>
              <td className="px-4 py-2 text-sm font-medium text-gray-900">{row.nomor}</td>
              <td className="px-4 py-2 text-sm text-gray-700">{row.deskripsi || '-'}</td>
              <td className="px-4 py-2 text-sm text-right text-emerald-700">
                {row.masuk ? (
                  <span className="inline-flex items-center gap-1">
                    <ArrowDownRight className="h-4 w-4 text-emerald-600" />
                    {formatCurrency(row.masuk)}
                  </span>
                ) : (
                  '-'
                )}
              </td>
              <td className="px-4 py-2 text-sm text-right text-rose-700">
                {row.keluar ? (
                  <span className="inline-flex items-center gap-1">
                    <ArrowUpRight className="h-4 w-4 text-rose-600" />
                    {formatCurrency(row.keluar)}
                  </span>
                ) : (
                  '-'
                )}
              </td>
              <td className="px-4 py-2 text-sm text-right font-semibold text-gray-900">
                {formatCurrency(row.saldo || 0)}
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                Tidak ada transaksi pada rentang tanggal ini.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

