import { RowDataPacket } from 'mysql2';
import { pool } from '@/core/database/connection';
import { logger } from '@/core/utils/logger';

/**
 * Interface untuk data KPI dashboard
 */
export interface DashboardKPI {
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
  tanggal: Date;
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
 * Interface untuk filter periode
 */
export interface FilterPeriode {
  tipeFilter: 'hari_ini' | 'minggu_ini' | 'bulan_ini' | 'tahun_ini' | 'custom' | 'semua';
  tanggalMulai?: Date;
  tanggalSelesai?: Date;
}

/**
 * Service untuk mengelola data dashboard
 */
export class DashboardService {
  /**
   * Mendapatkan data KPI dashboard dengan filter periode
   */
  static async getKPIDashboard(
    tenantId: string,
    tokoId: string,
    filter: FilterPeriode
  ): Promise<DashboardKPI> {
    try {
      const { whereClause, params } = this.buildWhereClause(tenantId, tokoId, filter);
      
      // Query untuk pendapatan hari ini
      const pendapatanQuery = `
        SELECT COALESCE(SUM(total), 0) as pendapatan
        FROM transaksi 
        WHERE tenant_id = ? AND toko_id = ? AND status = 'selesai' 
        AND DATE(tanggal) = CURDATE() AND tipe = 'penjualan'
      `;
      
      // Query untuk transaksi hari ini
      const transaksiQuery = `
        SELECT COUNT(*) as jumlah
        FROM transaksi 
        WHERE tenant_id = ? AND toko_id = ? AND status = 'selesai'
        AND DATE(tanggal) = CURDATE() AND tipe = 'penjualan'
      `;
      
      // Query untuk produk terjual hari ini
      const produkQuery = `
        SELECT COALESCE(SUM(it.kuantitas), 0) as jumlah
        FROM item_transaksi it
        JOIN transaksi t ON it.transaksi_id = t.id
        WHERE t.tenant_id = ? AND t.toko_id = ? AND t.status = 'selesai'
        AND DATE(t.tanggal) = CURDATE() AND t.tipe = 'penjualan'
      `;
      
      // Query untuk pelanggan aktif bulan ini
      const pelangganQuery = `
        SELECT COUNT(DISTINCT pelanggan_id) as jumlah
        FROM transaksi 
        WHERE tenant_id = ? AND toko_id = ? AND status = 'selesai'
        AND MONTH(tanggal) = MONTH(CURDATE()) 
        AND YEAR(tanggal) = YEAR(CURDATE())
        AND pelanggan_id IS NOT NULL AND tipe = 'penjualan'
      `;

      const [pendapatanResult] = await pool.execute(pendapatanQuery, [tenantId, tokoId]) as [RowDataPacket[], any];
      const [transaksiResult] = await pool.execute(transaksiQuery, [tenantId, tokoId]) as [RowDataPacket[], any];
      const [produkResult] = await pool.execute(produkQuery, [tenantId, tokoId]) as [RowDataPacket[], any];
      const [pelangganResult] = await pool.execute(pelangganQuery, [tenantId, tokoId]) as [RowDataPacket[], any];

      // Hitung pertumbuhan (perbandingan dengan periode sebelumnya)
      const pertumbuhan = await this.hitungPertumbuhan(tenantId, tokoId);

      return {
        pendapatanHariIni: pendapatanResult[0]?.pendapatan || 0,
        transaksiHariIni: transaksiResult[0]?.jumlah || 0,
        produkTerjualHariIni: produkResult[0]?.jumlah || 0,
        pelangganAktifBulanIni: pelangganResult[0]?.jumlah || 0,
        pertumbuhanPendapatan: pertumbuhan.pendapatan,
        pertumbuhanTransaksi: pertumbuhan.transaksi,
        pertumbuhanProduk: pertumbuhan.produk,
        pertumbuhanPelanggan: pertumbuhan.pelanggan
      };
    } catch (error) {
      logger.error('Error getting dashboard KPI:', error);
      throw new Error('Gagal mengambil data KPI dashboard');
    }
  }

  /**
   * Mendapatkan transaksi terbaru dengan filter
   */
  static async getTransaksiTerbaru(
    tenantId: string,
    tokoId: string,
    filter: FilterPeriode,
    limit: number = 10
  ): Promise<TransaksiTerbaru[]> {
    try {
      console.log('Getting recent transactions with params:', {
        tenantId,
        tokoId,
        filter,
        limit,
        limitType: typeof limit
      });
      const { whereClause, params } = this.buildWhereClause(tenantId, tokoId, filter);
      
      const query = `
        SELECT 
          t.id,
          t.nomor_transaksi as nomorTransaksi,
          t.tanggal,
          t.total,
          t.status,
          t.metode_bayar as metodeBayar,
          p.nama as namaPelanggan
        FROM transaksi t
        LEFT JOIN pelanggan p ON t.pelanggan_id = p.id
        WHERE ${whereClause} AND t.tipe = 'penjualan'
        ORDER BY t.tanggal DESC
        LIMIT ?
      `;
      
      const finalParams = [...params, limit];
      console.log('Query:', query);
      console.log('Params:', finalParams);
      console.log('Params types:', finalParams.map(p => typeof p));
      console.log('SQL Debug - Query:', query);
      console.log('SQL Debug - Params:', finalParams);
      console.log('SQL Debug - Types:', finalParams.map(p => typeof p));

      const [rows] = await pool.query(query, finalParams) as [RowDataPacket[], any];
      
      return rows.map(row => ({
        id: row.id,
        nomorTransaksi: row.nomorTransaksi,
        tanggal: new Date(row.tanggal),
        total: parseFloat(row.total),
        status: row.status,
        metodeBayar: row.metodeBayar,
        namaPelanggan: row.namaPelanggan
      }));
    } catch (error) {
      const errorDetails = {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        parameters: { tenantId, tokoId, filter, limit },
        errorType: typeof error,
        errorName: error instanceof Error ? error.name : 'Unknown'
      };
      logger.error('Error getting recent transactions:', JSON.stringify(errorDetails, null, 2));
      console.error('Full error object:', error);
      throw new Error('Gagal mengambil data transaksi terbaru');
    }
  }

  /**
   * Mendapatkan produk terlaris dengan filter
   */
  static async getProdukTerlaris(
    tenantId: string,
    tokoId: string,
    filter: FilterPeriode,
    limit: number = 10
  ): Promise<ProdukTerlaris[]> {
    try {
      const { whereClause, params } = this.buildWhereClause(tenantId, tokoId, filter);
      
      const query = `
        SELECT 
          p.id,
          p.nama,
          k.nama as kategori,
          SUM(it.kuantitas) as totalTerjual,
          SUM(it.subtotal) as pendapatan,
          COALESCE(inv.stok_tersedia, 0) as stokTersisa
        FROM item_transaksi it
        JOIN transaksi t ON it.transaksi_id = t.id
        JOIN produk p ON it.produk_id = p.id
        JOIN kategori k ON p.kategori_id = k.id
        LEFT JOIN inventaris inv ON p.id = inv.produk_id
        WHERE ${whereClause} AND t.tipe = 'penjualan'
        GROUP BY p.id, p.nama, k.nama, inv.stok_tersedia
        ORDER BY totalTerjual DESC
        LIMIT ?
      `;

      const [rows] = await pool.query(query, [...params, limit]) as [RowDataPacket[], any];
      
      return rows.map(row => ({
        id: row.id,
        nama: row.nama,
        kategori: row.kategori,
        totalTerjual: parseInt(row.totalTerjual),
        pendapatan: parseFloat(row.pendapatan),
        stokTersisa: parseInt(row.stokTersisa)
      }));
    } catch (error) {
      logger.error('Error getting top products:', error);
      throw new Error('Gagal mengambil data produk terlaris');
    }
  }

  /**
   * Membangun WHERE clause berdasarkan filter periode
   */
  private static buildWhereClause(tenantId: string, tokoId: string, filter: FilterPeriode) {
    let whereClause = 't.tenant_id = ? AND t.toko_id = ? AND t.status = \'selesai\'';
    const params: any[] = [tenantId, tokoId];

    switch (filter.tipeFilter) {
      case 'hari_ini':
        whereClause += ' AND DATE(t.tanggal) = CURDATE()';
        break;
      case 'minggu_ini':
        whereClause += ' AND YEARWEEK(t.tanggal) = YEARWEEK(CURDATE())';
        break;
      case 'bulan_ini':
        whereClause += ' AND MONTH(t.tanggal) = MONTH(CURDATE()) AND YEAR(t.tanggal) = YEAR(CURDATE())';
        break;
      case 'tahun_ini':
        whereClause += ' AND YEAR(t.tanggal) = YEAR(CURDATE())';
        break;
      case 'custom':
        if (filter.tanggalMulai && filter.tanggalSelesai) {
          whereClause += ' AND DATE(t.tanggal) BETWEEN ? AND ?';
          params.push(filter.tanggalMulai, filter.tanggalSelesai);
        }
        break;
      case 'semua':
      default:
        // Tidak ada filter tambahan
        break;
    }

    return { whereClause, params };
  }

  /**
   * Mendapatkan data dashboard lengkap
   */
  static async getDashboardLengkap(
    tenantId: string,
    tokoId: string,
    filter: FilterPeriode
  ) {
    try {
      // Ambil semua data secara paralel
      const [kpiData, transaksiTerbaru, produkTerlaris] = await Promise.all([
        this.getKPIDashboard(tenantId, tokoId, filter),
        this.getTransaksiTerbaru(tenantId, tokoId, filter, 10),
        this.getProdukTerlaris(tenantId, tokoId, filter, 10)
      ]);

      return {
        kpi: kpiData,
        transaksiTerbaru,
        produkTerlaris
      };
    } catch (error) {
      logger.error('Error getting complete dashboard data:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan data chart penjualan
   */
  static async getChartPenjualan(
    tenantId: string,
    tokoId: string,
    filter: FilterPeriode
  ) {
    try {
      const { whereClause, params } = this.buildWhereClause(tenantId, tokoId, filter);
      
      // Query untuk data chart berdasarkan periode
      let groupBy = 'DATE(t.tanggal)';
      let dateFormat = '%Y-%m-%d';
      
      if (filter.tipeFilter === 'tahun_ini') {
        groupBy = 'YEAR(t.tanggal), MONTH(t.tanggal)';
        dateFormat = '%Y-%m';
      } else if (filter.tipeFilter === 'bulan_ini') {
        groupBy = 'YEARWEEK(t.tanggal)';
        dateFormat = '%Y-W%u';
      }

      const query = `
         SELECT 
           ${groupBy} as periode,
           SUM(t.total) as total_penjualan,
           COUNT(t.id) as jumlah_transaksi
         FROM transaksi t
         WHERE ${whereClause}
         GROUP BY ${groupBy}
         ORDER BY ${groupBy} ASC
         LIMIT 30
       `;

      const [rows] = await pool.query(query, params) as [RowDataPacket[], any];
      
      const labels = rows.map(row => row.periode);
      const data = rows.map(row => parseFloat(row.total_penjualan) || 0);

      return {
        labels,
        datasets: [{
          label: 'Penjualan',
          data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)'
        }]
      };
    } catch (error) {
      logger.error('Error getting sales chart data:', error);
      throw error;
    }
  }

  /**
   * Menghitung pertumbuhan persentase dibanding periode sebelumnya
   */
  private static async hitungPertumbuhan(tenantId: string, tokoId: string) {
    try {
      // Query untuk data kemarin vs hari ini
      const kemarin = `
        SELECT 
          COALESCE(SUM(CASE WHEN t.tipe = 'penjualan' THEN t.total ELSE 0 END), 0) as pendapatan,
          COUNT(CASE WHEN t.tipe = 'penjualan' THEN 1 END) as transaksi,
          COALESCE(SUM(CASE WHEN t.tipe = 'penjualan' THEN it.kuantitas ELSE 0 END), 0) as produk
        FROM transaksi t
        LEFT JOIN item_transaksi it ON t.id = it.transaksi_id
        WHERE t.tenant_id = ? AND t.toko_id = ? AND t.status = 'selesai'
        AND DATE(t.tanggal) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
      `;

      const [kemarinResult] = await pool.execute(kemarin, [tenantId, tokoId]) as [RowDataPacket[], any];
      const dataKemarin = kemarinResult[0] || { pendapatan: 0, transaksi: 0, produk: 0 };

      // Hitung persentase pertumbuhan
      const hitungPersentase = (sekarang: number, sebelum: number) => {
        if (sebelum === 0) return sekarang > 0 ? 100 : 0;
        return ((sekarang - sebelum) / sebelum) * 100;
      };

      return {
        pendapatan: hitungPersentase(0, dataKemarin.pendapatan), // Akan diisi dari KPI
        transaksi: hitungPersentase(0, dataKemarin.transaksi),
        produk: hitungPersentase(0, dataKemarin.produk),
        pelanggan: 0.9 // Placeholder untuk pelanggan
      };
    } catch (error) {
      logger.error('Error calculating growth:', error);
      return { pendapatan: 0, transaksi: 0, produk: 0, pelanggan: 0 };
    }
  }
}