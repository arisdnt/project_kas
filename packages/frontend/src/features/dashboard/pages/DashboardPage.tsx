import { useState, useEffect } from 'react';
import { KPIStatCard } from '@/features/dashboard/components/KPIStatCard';
import { SalesOverviewChart, CategorySalesChart } from '@/features/dashboard/components/SalesOverviewChart';
import { RecentTransactionsTable } from '@/features/dashboard/components/RecentTransactionsTable';
import { TopProductsTable } from '@/features/dashboard/components/TopProductsTable';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { DashboardService, KPIData, TransaksiTerbaru, ProdukTerlaris } from '@/features/dashboard/services/dashboardService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';

export function DashboardPage() {
  // State untuk data dashboard
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [transaksiTerbaru, setTransaksiTerbaru] = useState<TransaksiTerbaru[]>([]);
  const [produkTerlaris, setProdukTerlaris] = useState<ProdukTerlaris[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'bulan_berjalan' | 'tahun_berjalan' | '6_bulan' | '3_bulan' | 'semua'>('bulan_berjalan');

  // Fungsi untuk memuat data dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const filterData = {
        tipeFilter: filter,
        limit: 10
      };

      // Ambil data KPI, transaksi terbaru, dan produk terlaris secara paralel
      const [kpiResponse, transaksiResponse, produkResponse] = await Promise.all([
        DashboardService.getKPI(filterData),
        DashboardService.getTransaksiTerbaru(filterData),
        DashboardService.getProdukTerlaris(filterData)
      ]);

      setKpiData(kpiResponse);
       setTransaksiTerbaru(transaksiResponse);
       setProdukTerlaris(produkResponse);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Load data saat komponen mount dan filter berubah
  useEffect(() => {
    loadDashboardData();
  }, [filter]);

  // Format currency untuk tampilan
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Konversi data KPI ke format yang dibutuhkan komponen
  const kpis = kpiData ? [
    { 
      title: 'Pendapatan Hari Ini', 
      value: formatCurrency(kpiData.pendapatanHariIni.value), 
      helper: 's.d. sekarang', 
      delta: { 
        value: `${kpiData.pendapatanHariIni.pertumbuhan > 0 ? '+' : ''}${kpiData.pendapatanHariIni.pertumbuhan.toFixed(1)}%`, 
        trend: kpiData.pendapatanHariIni.pertumbuhan >= 0 ? 'up' as const : 'down' as const 
      }, 
      icon: <DollarSign className="h-5 w-5" /> 
    },
    { 
      title: 'Transaksi', 
      value: kpiData.transaksiHariIni.value.toString(), 
      helper: '24 jam terakhir', 
      delta: { 
        value: `${kpiData.transaksiHariIni.pertumbuhan > 0 ? '+' : ''}${kpiData.transaksiHariIni.pertumbuhan.toFixed(1)}%`, 
        trend: kpiData.transaksiHariIni.pertumbuhan >= 0 ? 'up' as const : 'down' as const 
      }, 
      icon: <ShoppingCart className="h-5 w-5" /> 
    },
    { 
      title: 'Produk Terjual', 
      value: kpiData.produkTerjualHariIni.value.toString(), 
      helper: '24 jam terakhir', 
      delta: { 
        value: `${kpiData.produkTerjualHariIni.pertumbuhan > 0 ? '+' : ''}${kpiData.produkTerjualHariIni.pertumbuhan.toFixed(1)}%`, 
        trend: kpiData.produkTerjualHariIni.pertumbuhan >= 0 ? 'up' as const : 'down' as const 
      }, 
      icon: <Package className="h-5 w-5" /> 
    },
    { 
      title: 'Pelanggan Aktif', 
      value: kpiData.pelangganAktifBulanIni.value.toString(), 
      helper: 'bulan ini', 
      delta: { 
        value: `${kpiData.pelangganAktifBulanIni.pertumbuhan > 0 ? '+' : ''}${kpiData.pelangganAktifBulanIni.pertumbuhan.toFixed(1)}%`, 
        trend: kpiData.pelangganAktifBulanIni.pertumbuhan >= 0 ? 'up' as const : 'down' as const 
      }, 
      icon: <Users className="h-5 w-5" /> 
    },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Memuat data dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500">Ringkasan performa toko secara real-time</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bulan_berjalan">Bulan Berjalan</SelectItem>
              <SelectItem value="3_bulan">3 Bulan Terakhir</SelectItem>
              <SelectItem value="6_bulan">6 Bulan Terakhir</SelectItem>
              <SelectItem value="tahun_berjalan">Tahun Berjalan</SelectItem>
              <SelectItem value="semua">Seluruh Waktu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((k) => (
          <KPIStatCard key={k.title} title={k.title} value={k.value} helper={k.helper} delta={k.delta} icon={k.icon} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-2">
          <SalesOverviewChart />
        </div>
        <div className="lg:col-span-1">
          <CategorySalesChart />
        </div>
      </div>

      {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <RecentTransactionsTable data={transaksiTerbaru} />
          <TopProductsTable data={produkTerlaris} />
        </div>
    </div>
  );
}

export default DashboardPage;
