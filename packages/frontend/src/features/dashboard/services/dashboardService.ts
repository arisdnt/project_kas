import api from '@/core/lib/api';
/**
 * Interface untuk filter periode dashboard
 */
export interface FilterPeriode {
  tipeFilter: 'hari_ini' | 'minggu_ini' | 'bulan_ini' | 'tahun_ini' | 'custom' | 'semua' | 'bulan_berjalan' | 'tahun_berjalan' | '6_bulan' | '3_bulan';
  tanggalMulai?: string; // format: YYYY-MM-DD
  tanggalSelesai?: string; // format: YYYY-MM-DD
  limit?: number;
  storeId?: string; // ID toko yang dipilih
}

/**
 * Interface untuk data KPI dashboard
 */
export interface KPIData {
  pendapatanHariIni: number;
  transaksiHariIni: number;
  produkTerjualHariIni: number;
  pelangganAktifBulanIni: number;
  pertumbuhanPendapatan: number;
  pertumbuhanTransaksi: number;
  pertumbuhanProduk: number;
  pertumbuhanPelanggan: number;
}

/**
 * Interface untuk transaksi terbaru
 */
export interface TransaksiTerbaru {
  id: string;
  nomorTransaksi: string;
  tanggal: string;
  total: number;
  status: string;
  metodeBayar: string;
  namaPelanggan?: string;
}

/**
 * Interface untuk produk terlaris
 */
export interface ProdukTerlaris {
  id: string;
  nama: string;
  kategori: string;
  totalTerjual: number;
  pendapatan: number;
  stokTersisa: number;
}

/**
 * Interface untuk response API dashboard
 */
export interface DashboardResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Interface untuk data dashboard lengkap
 */
export interface DashboardLengkap {
  kpi: KPIData;
  transaksiTerbaru: TransaksiTerbaru[];
  produkTerlaris: ProdukTerlaris[];
}

/**
 * Service untuk mengelola data dashboard
 */
export class DashboardService {
  private static readonly BASE_URL = '/dashboard';

  /**
   * Membuat query string dari filter periode
   */
  private static buildQueryString(filter: FilterPeriode): string {
    const params = new URLSearchParams();
    
    params.append('tipeFilter', filter.tipeFilter);
    
    if (filter.storeId) {
      params.append('storeId', filter.storeId);
    }
    
    if (filter.tanggalMulai) {
      params.append('tanggalMulai', filter.tanggalMulai);
    }
    
    if (filter.tanggalSelesai) {
      params.append('tanggalSelesai', filter.tanggalSelesai);
    }
    
    if (filter.limit) {
      params.append('limit', filter.limit.toString());
    }
    
    return params.toString();
  }

  /**
   * Mendapatkan data KPI dashboard
   */
  static async getKPI(filter: FilterPeriode = { tipeFilter: 'semua' }): Promise<KPIData> {
    try {
      const queryString = this.buildQueryString(filter);
      const response = await api.get<DashboardResponse<KPIData>>(
        `${this.BASE_URL}/kpi?${queryString}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching KPI data:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan transaksi terbaru
   */
  static async getTransaksiTerbaru(
    filter: FilterPeriode = { tipeFilter: 'semua', limit: 10 }
  ): Promise<TransaksiTerbaru[]> {
    try {
      const queryString = this.buildQueryString(filter);
      const response = await api.get<DashboardResponse<TransaksiTerbaru[]>>(
        `${this.BASE_URL}/transaksi-terbaru?${queryString}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan produk terlaris
   */
  static async getProdukTerlaris(
    filter: FilterPeriode = { tipeFilter: 'semua', limit: 10 }
  ): Promise<ProdukTerlaris[]> {
    try {
      const queryString = this.buildQueryString(filter);
      const response = await api.get<DashboardResponse<ProdukTerlaris[]>>(
        `${this.BASE_URL}/produk-terlaris?${queryString}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching top products:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan data dashboard lengkap
   */
  static async getDashboardLengkap(
    filter: FilterPeriode = { tipeFilter: 'semua', limit: 10 }
  ): Promise<DashboardLengkap> {
    try {
      const queryString = this.buildQueryString(filter);
      const response = await api.get<DashboardResponse<DashboardLengkap>>(
        `${this.BASE_URL}/lengkap?${queryString}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching complete dashboard data:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan data chart penjualan
   */
  static async getChartPenjualan(
    filter: FilterPeriode = { tipeFilter: 'semua' }
  ): Promise<any> {
    try {
      const queryString = this.buildQueryString(filter);
      const response = await api.get<DashboardResponse<any>>(
        `${this.BASE_URL}/chart-penjualan?${queryString}`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Gagal mengambil data chart penjualan');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching sales chart data:', error);
      throw error;
    }
  }

  /**
   * Utility untuk format mata uang
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Utility untuk format tanggal
   */
  static formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  }

  /**
   * Utility untuk mendapatkan warna berdasarkan pertumbuhan
   */
  static getGrowthColor(growth: number): string {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  }

  /**
   * Utility untuk format persentase pertumbuhan
   */
  static formatGrowthPercentage(growth: number): string {
    const sign = growth > 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}%`;
  }

  /**
   * Mendapatkan label untuk tipe filter
   */
  static getFilterLabel(tipeFilter: FilterPeriode['tipeFilter']): string {
    const labels = {
      'hari_ini': 'Hari Ini',
      'minggu_ini': 'Minggu Ini',
      'bulan_ini': 'Bulan Ini',
      'tahun_ini': 'Tahun Ini',
      'custom': 'Custom',
      'semua': 'Semua Data',
      'bulan_berjalan': 'Bulan Berjalan',
      'tahun_berjalan': 'Tahun Berjalan',
      '6_bulan': '6 Bulan Terakhir',
      '3_bulan': '3 Bulan Terakhir'
    };
    
    return labels[tipeFilter] || 'Tidak Diketahui';
  }

  /**
   * Validasi rentang tanggal custom
   */
  static validateCustomDateRange(tanggalMulai: string, tanggalSelesai: string): boolean {
    const startDate = new Date(tanggalMulai);
    const endDate = new Date(tanggalSelesai);
    
    return startDate <= endDate && startDate <= new Date();
  }
}