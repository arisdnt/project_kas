import { useState, useEffect } from 'react';
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
import { DashboardService, FilterPeriode, BackendCategoryPerformance } from '@/features/dashboard/services/dashboardService';
import { useAuthStore } from '@/core/store/authStore';

type RangeKey = '7h' | '30h';

interface ChartData {
  label: string;
  revenue: number;
  transactions: number;
  date?: string;
}

interface SalesOverviewChartProps {
  title?: string;
}

export function SalesOverviewChart({ title = 'Ringkasan Penjualan' }: SalesOverviewChartProps) {
  const [range, setRange] = useState<RangeKey>('7h');
  const [chartData, setChartData] = useState<Record<RangeKey, ChartData[]>>({
    '7h': [],
    '30h': []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const loadChartData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Load data for both ranges
        const [sevenDayData, thirtyDayData] = await Promise.all([
          DashboardService.getChartPenjualan({
            tipeFilter: 'minggu_ini'
          }),
          DashboardService.getChartPenjualan({
            tipeFilter: 'bulan_berjalan'
          })
        ]);

        setChartData({
          '7h': sevenDayData || [],
          '30h': thirtyDayData || []
        });
      } catch (error) {
        console.error('Error loading chart data:', error);
        // Fallback to empty data
        setChartData({ '7h': [], '30h': [] });
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [user]);

  const data = chartData[range];

  if (loading) {
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
          <div className="h-72 flex items-center justify-center">
            <div className="text-gray-500">Memuat data penjualan...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            <div className="mt-0.5">
              {data.length > 0 ?
                `Rp${data.reduce((acc, d) => acc + d.revenue, 0).toLocaleString('id-ID')}` :
                'Rp0'
              }
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <div className="font-semibold text-gray-900">Total Transaksi</div>
            <div className="mt-0.5">
              {data.length > 0 ?
                data.reduce((acc, d) => acc + d.transactions, 0) :
                0
              }
            </div>
          </div>
        </div>
        {data.length === 0 && !loading && (
          <div className="text-center text-gray-500 mt-4">
            Tidak ada data penjualan untuk periode ini
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CategorySalesChart() {
  const [categoryData, setCategoryData] = useState<{ category: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const loadCategoryData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const data = await DashboardService.getCategoryPerformance({
          tipeFilter: 'bulan_berjalan'
        });

        const formattedData = data.map(item => ({
          category: item.category_name,
          value: item.total_sold
        }));

        setCategoryData(formattedData);
      } catch (error) {
        console.error('Error loading category data:', error);
        // Fallback to empty data
        setCategoryData([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryData();
  }, [user]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-base sm:text-lg">Penjualan per Kategori</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-72 flex items-center justify-center">
            <div className="text-gray-500">Memuat data kategori...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base sm:text-lg">Penjualan per Kategori</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" name="Qty" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {categoryData.length === 0 && !loading && (
          <div className="text-center text-gray-500 mt-4">
            Tidak ada data kategori untuk periode ini
          </div>
        )}
      </CardContent>
    </Card>
  );
}
