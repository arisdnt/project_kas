import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

type RangeKey = '7h' | '30h';

const sampleData: Record<RangeKey, { label: string; revenue: number; transactions: number }[]> = {
  '7h': [
    { label: 'Sen', revenue: 3500000, transactions: 48 },
    { label: 'Sel', revenue: 4200000, transactions: 54 },
    { label: 'Rab', revenue: 3900000, transactions: 51 },
    { label: 'Kam', revenue: 4700000, transactions: 62 },
    { label: 'Jum', revenue: 5200000, transactions: 71 },
    { label: 'Sab', revenue: 6100000, transactions: 80 },
    { label: 'Min', revenue: 4400000, transactions: 57 },
  ],
  '30h': Array.from({ length: 30 }).map((_, i) => ({
    label: `${i + 1}`,
    revenue: Math.round(3000000 + Math.random() * 4000000),
    transactions: Math.round(40 + Math.random() * 50),
  })),
};

interface SalesOverviewChartProps {
  title?: string;
}

export function SalesOverviewChart({ title = 'Ringkasan Penjualan' }: SalesOverviewChartProps) {
  const [range, setRange] = useState<RangeKey>('7h');
  const data = sampleData[range];

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
          <Tabs.Root value={range} onValueChange={(v) => setRange(v as RangeKey)}>
            <Tabs.List className="inline-flex gap-1 rounded-md bg-gray-100 p-1">
              <Tabs.Trigger value="7h" className={`px-2.5 py-1.5 text-xs font-medium rounded ${range === '7h' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}>
                7 Hari
              </Tabs.Trigger>
              <Tabs.Trigger value="30h" className={`px-2.5 py-1.5 text-xs font-medium rounded ${range === '30h' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}>
                30 Hari
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `Rp${(v / 1000000).toFixed(1)}jt`} />
              <Tooltip formatter={(value: any, name: string) => name === 'revenue' ? [`Rp${Number(value).toLocaleString('id-ID')}`, 'Pendapatan'] : [value, 'Transaksi']} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="revenue" name="Pendapatan" stroke="#2563eb" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="transactions" name="Transaksi" stroke="#16a34a" strokeWidth={2} dot={false} yAxisId={0} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="text-sm text-gray-600">
            <div className="font-semibold text-gray-900">Total Pendapatan</div>
            <div className="mt-0.5">Rp{data.reduce((acc, d) => acc + d.revenue, 0).toLocaleString('id-ID')}</div>
          </div>
          <div className="text-sm text-gray-600">
            <div className="font-semibold text-gray-900">Total Transaksi</div>
            <div className="mt-0.5">{data.reduce((acc, d) => acc + d.transactions, 0)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CategorySalesChart() {
  const data = [
    { category: 'Makanan', value: 420 },
    { category: 'Minuman', value: 310 },
    { category: 'Kebutuhan Rumah', value: 190 },
    { category: 'Perawatan', value: 140 },
    { category: 'Lainnya', value: 75 },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base sm:text-lg">Penjualan per Kategori</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" name="Qty" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
