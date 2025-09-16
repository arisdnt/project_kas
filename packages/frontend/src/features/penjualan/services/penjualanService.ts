import api from '@/core/lib/api';

/**
 * Interface untuk filter pencarian transaksi
 */
export interface SearchTransaksiQuery {
  page?: number;
  limit?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
  cashier?: string;
  payment_method?: string;
  status?: string;
}

/**
 * Interface untuk item transaksi
 */
export interface ItemTransaksi {
  id: string;
  product_id: string;
  product_name: string;
  sku?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

/**
 * Interface untuk transaksi penjualan
 */
export interface TransaksiPenjualan {
  id: string;
  transaction_code: string;
  transaction_date: string;
  customer_id?: string;
  customer_name?: string;
  cashier_id: string;
  cashier_name: string;
  total_amount: number;
  payment_method: string;
  status: string;
  notes?: string;
  items: ItemTransaksi[];
  created_at: string;
  updated_at: string;
}

/**
 * Interface untuk response pagination
 */
export interface PaginationResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

/**
 * Interface untuk laporan penjualan harian
 */
export interface DailySalesReport {
  date: string;
  total_sales: number;
  total_transactions: number;
  total_items_sold: number;
  average_transaction: number;
}

/**
 * Interface untuk produk terlaris
 */
export interface TopProduct {
  product_id: string;
  product_name: string;
  sku?: string;
  category_name?: string;
  total_quantity: number;
  total_revenue: number;
  transaction_count: number;
}

/**
 * Interface untuk data chart penjualan
 */
export interface SalesChartData {
  date: string;
  sales_amount: number;
  transaction_count: number;
}

/**
 * Interface untuk statistik metode pembayaran
 */
export interface PaymentMethodStats {
  payment_method: string;
  total_amount: number;
  transaction_count: number;
  percentage: number;
}

/**
 * Interface untuk performa kasir
 */
export interface CashierPerformance {
  cashier_id: string;
  cashier_name: string;
  total_sales: number;
  total_transactions: number;
  average_transaction: number;
}

/**
 * Service untuk mengelola data penjualan
 */
export class PenjualanService {
  private static readonly BASE_URL = '/penjualan';

  /**
   * Membuat query string dari parameter pencarian
   */
  private static buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    return searchParams.toString();
  }

  /**
   * Mencari transaksi penjualan
   */
  static async searchTransaksi(query: SearchTransaksiQuery = {}): Promise<PaginationResponse<TransaksiPenjualan>> {
    try {
      const queryString = this.buildQueryString(query);
      const response = await api.get<PaginationResponse<TransaksiPenjualan>>(
        `${this.BASE_URL}?${queryString}`
      );

      return response.data;
    } catch (error) {
      console.error('Error searching transactions:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan detail transaksi berdasarkan ID
   */
  static async getTransaksiById(id: string): Promise<TransaksiPenjualan> {
    try {
      const response = await api.get<{ success: boolean; data: TransaksiPenjualan }>(
        `${this.BASE_URL}/${id}`
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan laporan penjualan harian
   */
  static async getDailySales(date: string): Promise<DailySalesReport> {
    try {
      const response = await api.get<{ success: boolean; data: DailySalesReport }>(
        `${this.BASE_URL}/reports/daily-sales?date=${date}`
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching daily sales:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan produk terlaris
   */
  static async getTopProducts(startDate: string, endDate: string, limit?: number): Promise<TopProduct[]> {
    try {
      const params = this.buildQueryString({
        start_date: startDate,
        end_date: endDate,
        ...(limit && { limit })
      });

      const response = await api.get<{ success: boolean; data: TopProduct[] }>(
        `${this.BASE_URL}/reports/top-products?${params}`
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching top products:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan data chart penjualan
   */
  static async getSalesChart(startDate: string, endDate: string): Promise<SalesChartData[]> {
    try {
      const params = this.buildQueryString({
        start_date: startDate,
        end_date: endDate
      });

      const response = await api.get<{ success: boolean; data: SalesChartData[] }>(
        `${this.BASE_URL}/reports/sales-chart?${params}`
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching sales chart:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan statistik metode pembayaran
   */
  static async getPaymentMethodStats(startDate: string, endDate: string): Promise<PaymentMethodStats[]> {
    try {
      const params = this.buildQueryString({
        start_date: startDate,
        end_date: endDate
      });

      const response = await api.get<{ success: boolean; data: PaymentMethodStats[] }>(
        `${this.BASE_URL}/reports/payment-methods?${params}`
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching payment method stats:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan performa kasir
   */
  static async getCashierPerformance(startDate: string, endDate: string): Promise<CashierPerformance[]> {
    try {
      const params = this.buildQueryString({
        start_date: startDate,
        end_date: endDate
      });

      const response = await api.get<{ success: boolean; data: CashierPerformance[] }>(
        `${this.BASE_URL}/reports/cashier-performance?${params}`
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching cashier performance:', error);
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
   * Utility untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
   */
  static getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Utility untuk mendapatkan rentang tanggal
   */
  static getDateRange(days: number): { startDate: string; endDate: string } {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }

  /**
   * Utility untuk mendapatkan status badge class
   */
  static getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'selesai':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'menunggu':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'dibatalkan':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Utility untuk mendapatkan label metode pembayaran
   */
  static getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      'cash': 'Tunai',
      'debit': 'Kartu Debit',
      'credit': 'Kartu Kredit',
      'transfer': 'Transfer Bank',
      'e_wallet': 'E-Wallet',
      'qris': 'QRIS'
    };

    return labels[method] || method;
  }
}