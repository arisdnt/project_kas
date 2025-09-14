import { ProfitLoss } from '@/features/laporan/keuangan/types';
import { TrendingUp, CircleDollarSign } from 'lucide-react';

function formatCurrency(n: number) {
  return (n || 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
}

type Props = {
  data: ProfitLoss;
  loading?: boolean;
};

export function ProfitLossSummary({ data, loading }: Props) {
  const items = [
    { label: 'Pendapatan', value: data.pendapatan, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Harga Pokok (HPP)', value: data.hpp, color: 'text-rose-700', bg: 'bg-rose-50' },
    { label: 'Laba Kotor', value: data.labaKotor, color: 'text-indigo-700', bg: 'bg-indigo-50' },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {items.map((it) => (
        <div key={it.label} className={`rounded-lg border border-gray-200 ${it.bg} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">{it.label}</p>
              <p className={`mt-1 text-xl font-semibold ${it.color}`}>{loading ? '...' : formatCurrency(it.value)}</p>
            </div>
            {it.label === 'Laba Kotor' ? (
              <TrendingUp className="h-6 w-6 text-indigo-500" />
            ) : (
              <CircleDollarSign className="h-6 w-6 text-gray-500" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

