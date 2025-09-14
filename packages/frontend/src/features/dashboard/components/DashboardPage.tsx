import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Users, ShoppingCart, Package } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { DashboardService, FilterPeriode, DashboardResponse, KPIData, TransaksiTerbaru, ProdukTerlaris } from '../services/dashboardService';

/**
 * Interface untuk state filter dashboard
 */
interface FilterState {
  periode: 'bulan_berjalan' | 'tahun_berjalan' | '6_bulan' | '3_bulan' | 'semua';
}

/**
 * Komponen utama halaman dashboard
 */
export const DashboardPage: React.FC = () => {
  const [filter, setFilter] = useState<FilterState>({
    periode: 'bulan_berjalan'
  });
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [transaksiTerbaru, setTransaksiTerbaru] = useState<TransaksiTerbaru[]>([]);
  const [produkTerlaris, setProdukTerlaris] = useState<ProdukTerlaris[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Mengkonversi filter state ke format API
   */
  const convertFilterToAPI = (filterState: FilterState): FilterPeriode => {
    return {
      tipeFilter: filterState.periode
    };
  };

  /**
   * Memuat data dashboard dari API
   */
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiFilter = convertFilterToAPI(filter);
      
      // Ambil data KPI
      const kpiData = await DashboardService.getKPI(apiFilter);
      setKpiData(kpiData);

      // Ambil data transaksi terbaru
      const transaksiData = await DashboardService.getTransaksiTerbaru(apiFilter);
      setTransaksiTerbaru(transaksiData);

      // Ambil data produk terlaris
      const produkData = await DashboardService.getProdukTerlaris(apiFilter);
      setProdukTerlaris(produkData);

    } catch (err) {
      setError('Gagal memuat data dashboard');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect untuk memuat data saat komponen mount atau filter berubah
   */
  useEffect(() => {
    loadDashboardData();
  }, [filter]);

  /**
   * Handler untuk perubahan periode filter
   */
  const handlePeriodeChange = (periode: FilterState['periode']) => {
    setFilter({ periode });
  };

  /**
   * Format currency untuk tampilan
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

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
    <div className="p-6 space-y-6">
      {/* Header dan Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        <div className="flex gap-2">
          <Select value={filter.periode} onValueChange={handlePeriodeChange}>
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

      {/* KPI Cards */}
      {kpiData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendapatan Hari Ini</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(kpiData.pendapatanHariIni.value)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transaksi Hari Ini</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiData.transaksiHariIni.value}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produk Terjual</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiData.produkTerjualHariIni.value}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pelanggan Aktif</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiData.pelangganAktifBulanIni.value}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transaksi Terbaru dan Produk Terlaris */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaksi Terbaru */}
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transaksiTerbaru.length > 0 ? (
                transaksiTerbaru.map((transaksi) => (
                  <div key={transaksi.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{transaksi.namaPelanggan || 'Pelanggan Umum'}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaksi.tanggal), 'dd/MM/yyyy HH:mm', { locale: id })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(transaksi.total)}</p>
                      <p className="text-sm text-muted-foreground">{transaksi.metodeBayar}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">Tidak ada transaksi</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Produk Terlaris */}
        <Card>
          <CardHeader>
            <CardTitle>Produk Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {produkTerlaris.length > 0 ? (
                produkTerlaris.map((produk, index) => (
                  <div key={produk.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{produk.nama}</p>
                        <p className="text-sm text-muted-foreground">{produk.kategori}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{produk.totalTerjual} terjual</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(produk.pendapatan)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">Tidak ada data produk</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;