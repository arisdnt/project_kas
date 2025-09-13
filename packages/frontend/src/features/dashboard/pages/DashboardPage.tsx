import { KPIStatCard } from '@/features/dashboard/components/KPIStatCard';
import { SalesOverviewChart, CategorySalesChart } from '@/features/dashboard/components/SalesOverviewChart';
import { RecentTransactionsTable } from '@/features/dashboard/components/RecentTransactionsTable';
import { TopProductsTable } from '@/features/dashboard/components/TopProductsTable';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

export function DashboardPage() {
  // Sample KPIs – hook these to real API later
  const kpis = [
    { title: 'Pendapatan Hari Ini', value: 'Rp5.120.000', helper: 's.d. 10:30', delta: { value: '+12.3%', trend: 'up' as const }, icon: <DollarSign className="h-5 w-5" /> },
    { title: 'Transaksi', value: '182', helper: '24 jam terakhir', delta: { value: '+4.7%', trend: 'up' as const }, icon: <ShoppingCart className="h-5 w-5" /> },
    { title: 'Produk Terjual', value: '536', helper: '24 jam terakhir', delta: { value: '-2.1%', trend: 'down' as const }, icon: <Package className="h-5 w-5" /> },
    { title: 'Pelanggan Aktif', value: '1.248', helper: 'bulan ini', delta: { value: '+0.9%', trend: 'up' as const }, icon: <Users className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500">Ringkasan performa toko secara real-time</p>
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
        <RecentTransactionsTable />
        <TopProductsTable />
      </div>
    </div>
  );
}

export default DashboardPage;
