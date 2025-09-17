import api from '@/core/lib/api';

// NOTE: Tipe generik sederhana untuk tangkap pola response backend
// Backend relatif konsisten mengembalikan { success, data, message }
// Komentar dalam Bahasa Indonesia sesuai pedoman repo.
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  // Beberapa endpoint penjualan kadang mengemas ulang di data.data
  [key: string]: any; // fallback fleksibel
}

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
 * Interface untuk backend API filter
 */
export interface BackendFilter {
  start_date: string;
  end_date: string;
  limit?: number;
  group_by?: 'day' | 'week' | 'month' | 'year';
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
 * Interface untuk backend KPI response
 */
export interface BackendKPIResponse {
  sales: {
    total_transactions: number;
    total_sales: number;
    average_order_value: number;
    unique_customers: number;
  };
  products: {
    total_products: number;
    active_products: number;
    total_categories: number;
  };
  inventory: {
    total_stock: number;
    low_stock_items: number;
  };
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
 * Interface untuk backend top products response
 */
export interface BackendTopProduct {
  product_id: string;
  product_name: string;
  product_code: string;
  quantity_sold: number;
  revenue: number;
  order_count: number;
}

/**
 * Interface untuk backend sales chart data
 */
export interface BackendSalesChartData {
  date: string;
  label: string;
  transaction_count: number;
  total_sales: number;
}

/**
 * Interface untuk backend category performance
 */
export interface BackendCategoryPerformance {
  category_id: string;
  category_name: string;
  product_count: number;
  quantity_sold: number;
  revenue: number;
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
  // IMPORTANT: baseUrl ApiClient sudah mengandung '/api'
  // Jadi di sini JANGAN ulangi '/api' agar tidak terjadi double prefix '/api/api'
  private static readonly BASE_URL = '/dashboard';

  /**
   * Konversi filter frontend ke format backend
   */
  private static convertFilterToBackend(filter: FilterPeriode): BackendFilter {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    switch (filter.tipeFilter) {
      case 'hari_ini':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'minggu_ini':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getTime() - (dayOfWeek * 24 * 60 * 60 * 1000));
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'bulan_ini':
      case 'bulan_berjalan':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'tahun_ini':
      case 'tahun_berjalan':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case '3_bulan':
        startDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
        break;
      case '6_bulan':
        startDate = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000));
        break;
      case 'custom':
        startDate = filter.tanggalMulai ? new Date(filter.tanggalMulai) : new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        endDate = filter.tanggalSelesai ? new Date(filter.tanggalSelesai) : now;
        break;
      default: // 'semua'
        startDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000)); // 1 year ago
        break;
    }

    return {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      limit: filter.limit
    };
  }

  /**
   * Membuat query string dari filter periode untuk backend API
   */
  private static buildBackendQueryString(filter: BackendFilter): string {
    const params = new URLSearchParams();

    params.append('start_date', filter.start_date);
    params.append('end_date', filter.end_date);

    if (filter.limit) {
      params.append('limit', filter.limit.toString());
    }

    if (filter.group_by) {
      params.append('group_by', filter.group_by);
    }

    return params.toString();
  }

  /**
   * Mengkonversi backend KPI response ke format frontend
   */
  private static convertBackendKPIToFrontend(backendData: BackendKPIResponse): KPIData {
    return {
      pendapatanHariIni: backendData.sales.total_sales,
      transaksiHariIni: backendData.sales.total_transactions,
      produkTerjualHariIni: backendData.products.active_products,
      pelangganAktifBulanIni: backendData.sales.unique_customers,
      pertumbuhanPendapatan: 0, // Backend tidak menyediakan data perbandingan, set 0
      pertumbuhanTransaksi: 0,
      pertumbuhanProduk: 0,
      pertumbuhanPelanggan: 0
    };
  }

  /**
   * Mendapatkan data KPI dashboard
   */
  static async getKPI(filter: FilterPeriode = { tipeFilter: 'semua' }): Promise<KPIData> {
    try {
      const backendFilter = this.convertFilterToBackend(filter);
      const queryString = this.buildBackendQueryString(backendFilter);
      const response = await api.get<ApiResponse<BackendKPIResponse>>(
        `${this.BASE_URL}/kpis/overview?${queryString}`
      );

      // Handle API response format
      if (response.success && response.data) {
        return this.convertBackendKPIToFrontend(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch KPI data');
      }
    } catch (error) {
      console.error('Error fetching KPI data:', error);
      // Return default values instead of throwing
      return {
        pendapatanHariIni: 0,
        transaksiHariIni: 0,
        produkTerjualHariIni: 0,
        pelangganAktifBulanIni: 0,
        pertumbuhanPendapatan: 0,
        pertumbuhanTransaksi: 0,
        pertumbuhanProduk: 0,
        pertumbuhanPelanggan: 0
      };
    }
  }

  /**
   * Mendapatkan transaksi terbaru dari API dashboard
   */
  static async getTransaksiTerbaru(
    filter: FilterPeriode = { tipeFilter: 'semua', limit: 10 }
  ): Promise<TransaksiTerbaru[]> {
    try {
      const backendFilter = this.convertFilterToBackend(filter);
      const params = new URLSearchParams({
        start_date: backendFilter.start_date,
        end_date: backendFilter.end_date,
        limit: (filter.limit || 10).toString()
      });

      const response = await api.get<ApiResponse<any>>(`/dashboard/analytics/recent-transactions?${params.toString()}`);

      if (response.success && response.data) {
        const raw = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        return this.convertBackendTransactionsToFrontend(raw);
      } else {
        // Kembalikan array kosong jika tidak ada data, bukan mock data
        console.warn('No recent transactions data available');
        return [];
      }
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      // Kembalikan array kosong jika terjadi error, bukan mock data
      return [];
    }
  }



  /**
   * Convert backend transaction format to frontend format
   */
  private static convertBackendTransactionsToFrontend(backendTransactions: any[]): TransaksiTerbaru[] {
    return backendTransactions.map(txn => ({
      id: txn.id,
      nomorTransaksi: txn.nomor_transaksi || txn.id,
      tanggal: txn.tanggal || txn.created_at,
      total: txn.total || 0,
      status: this.convertTransactionStatus(txn.status),
      metodeBayar: this.convertPaymentMethod(txn.metode_bayar),
      namaPelanggan: txn.nama_pelanggan || txn.pelanggan?.nama
    }));
  }

  /**
   * Convert backend transaction status to frontend format
   */
  private static convertTransactionStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'completed': 'selesai',
      'cancelled': 'batal',
      'refunded': 'refund',
      'pending': 'pending'
    };
    return statusMap[status] || status;
  }

  /**
   * Convert backend payment method to frontend format
   */
  private static convertPaymentMethod(method: string): string {
    const methodMap: Record<string, string> = {
      'cash': 'tunai',
      'card': 'kartu',
      'qris': 'qris',
      'transfer': 'transfer'
    };
    return methodMap[method] || method;
  }

  /**
   * Mengkonversi backend top products ke format frontend
   */
  private static convertBackendTopProductsToFrontend(backendProducts: BackendTopProduct[]): ProdukTerlaris[] {
    return backendProducts.map(product => ({
      id: product.product_id,
      nama: product.product_name,
      kategori: 'Belum dikategorikan', // Backend tidak mengirim kategori di top products
      totalTerjual: product.quantity_sold,
      pendapatan: product.revenue,
      stokTersisa: 0 // Backend tidak mengirim stok tersisa di top products
    }));
  }

  /**
   * Mendapatkan produk terlaris dari API dashboard
   */
  static async getProdukTerlaris(
    filter: FilterPeriode = { tipeFilter: 'semua', limit: 5 }
  ): Promise<ProdukTerlaris[]> {
    try {
      const backendFilter = this.convertFilterToBackend(filter);

      const params = new URLSearchParams({
        start_date: backendFilter.start_date,
        end_date: backendFilter.end_date,
        limit: (filter.limit || 5).toString()
      });

      const response = await api.get<ApiResponse<any>>(`/dashboard/analytics/top-products?${params.toString()}`);

      if (response.success && response.data) {
        const raw = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        
        // Kembalikan array kosong jika tidak ada data, bukan mock data
        if (raw.length === 0) {
          console.warn('No top products data available');
          return [];
        }
        
        return this.convertBackendTopProductsToFrontend(raw);
      } else {
        console.warn('No top products data available');
        return [];
      }
    } catch (error) {
      console.error('Error fetching top products:', error);
      return [];
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
   * Mendapatkan data chart penjualan dari backend API baru
   */
  static async getSalesChartData(
    filter: FilterPeriode = { tipeFilter: 'semua' }
  ): Promise<BackendSalesChartData[]> {
    try {
      const backendFilter = {
        ...this.convertFilterToBackend(filter),
        group_by: this.getGroupByFromFilter(filter) as 'day' | 'week' | 'month' | 'year'
      };
      const queryString = this.buildBackendQueryString(backendFilter);
      const response = await api.get<ApiResponse<BackendSalesChartData[]>>(
        `${this.BASE_URL}/analytics/sales-chart?${queryString}`
      );

      if (response.success && (response as ApiResponse<BackendSalesChartData[]>).data) {
        return (response as ApiResponse<BackendSalesChartData[]>).data;
      } else {
        throw new Error(response.message || 'Failed to fetch sales chart data');
      }
    } catch (error) {
      console.error('Error fetching sales chart data:', error);
      return [];
    }
  }

  /**
   * Mendapatkan data performa kategori
   */
  static async getCategoryPerformance(
    filter: FilterPeriode = { tipeFilter: 'semua' }
  ): Promise<BackendCategoryPerformance[]> {
    try {
      const backendFilter = this.convertFilterToBackend(filter);
      const queryString = this.buildBackendQueryString(backendFilter);
      const response = await api.get<ApiResponse<BackendCategoryPerformance[]>>(
        `${this.BASE_URL}/analytics/category-performance?${queryString}`
      );

      if (response.success && (response as ApiResponse<BackendCategoryPerformance[]>).data) {
        return (response as ApiResponse<BackendCategoryPerformance[]>).data;
      } else {
        throw new Error(response.message || 'Failed to fetch category performance data');
      }
    } catch (error) {
      console.error('Error fetching category performance data:', error);
      return [];
    }
  }

  /**
   * Mendapatkan group_by berdasarkan tipe filter
   */
  private static getGroupByFromFilter(filter: FilterPeriode): string {
    switch (filter.tipeFilter) {
      case 'hari_ini':
      case 'minggu_ini':
        return 'day';
      case 'bulan_ini':
      case 'bulan_berjalan':
      case '3_bulan':
        return 'week';
      case '6_bulan':
      case 'tahun_ini':
      case 'tahun_berjalan':
        return 'month';
      default:
        return 'month';
    }
  }

  /**
   * Mendapatkan data chart penjualan (compatibility method)
   */
  static async getChartPenjualan(
    filter: FilterPeriode = { tipeFilter: 'semua' }
  ): Promise<any> {
    try {
      const chartData = await this.getSalesChartData(filter);

      // Convert to format expected by frontend components
      return chartData.map(item => ({
        label: item.label,
        revenue: item.total_sales,
        transactions: item.transaction_count,
        date: item.date
      }));
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

  /**
   * Membangun query string sederhana dari FilterPeriode (fallback lama untuk endpoint lengkap)
   */
  private static buildQueryString(filter: FilterPeriode): string {
    const backendFilter = this.convertFilterToBackend(filter);
    return this.buildBackendQueryString(backendFilter);
  }
}