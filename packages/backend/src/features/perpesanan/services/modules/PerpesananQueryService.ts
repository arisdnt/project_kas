/**
 * Perpesanan Query Service
 * Menangani operasi query untuk sistem perpesanan
 */

import { RowDataPacket } from 'mysql2';
import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';
import { SearchPerpesananQuery, Perpesanan, PerpesananWithUsers, PerpesananStats } from '../../models/PerpesananCore';
import { logger } from '@/core/utils/logger';

export class PerpesananQueryService {
  /**
   * Mencari pesan berdasarkan kriteria dengan pagination
   */
  static async searchPerpesanan(
    query: SearchPerpesananQuery,
    accessScope: AccessScope
  ): Promise<{ data: PerpesananWithUsers[]; total: number }> {
    const connection = await pool.getConnection();
    
    try {
      const {
        page = '1',
        limit = '20',
        search,
        status,
        prioritas,
        pengirim_id,
        penerima_id,
        tanggal_mulai,
        tanggal_selesai,
        sort_by = 'dibuat_pada',
        sort_order = 'desc'
      } = query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      // Base query dengan join untuk mendapatkan data pengirim dan penerima
      let baseQuery = `
        FROM perpesanan p
        INNER JOIN users pengirim ON p.pengirim_id = pengirim.id
        INNER JOIN users penerima ON p.penerima_id = penerima.id
        WHERE p.tenant_id = ?
        AND (p.pengirim_id = ? OR p.penerima_id = ?)
      `;

      const params: any[] = [accessScope.tenantId, accessScope.userId, accessScope.userId];

      // Filter berdasarkan pencarian teks
      if (search) {
        baseQuery += ` AND (p.pesan LIKE ? OR pengirim.nama LIKE ? OR penerima.nama LIKE ?)`;
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
      }

      // Filter berdasarkan status
      if (status) {
        baseQuery += ` AND p.status = ?`;
        params.push(status);
      }

      // Filter berdasarkan prioritas
      if (prioritas) {
        baseQuery += ` AND p.prioritas = ?`;
        params.push(prioritas);
      }

      // Filter berdasarkan pengirim
      if (pengirim_id) {
        baseQuery += ` AND p.pengirim_id = ?`;
        params.push(pengirim_id);
      }

      // Filter berdasarkan penerima
      if (penerima_id) {
        baseQuery += ` AND p.penerima_id = ?`;
        params.push(penerima_id);
      }

      // Filter berdasarkan rentang tanggal
      if (tanggal_mulai) {
        baseQuery += ` AND DATE(p.dibuat_pada) >= ?`;
        params.push(tanggal_mulai);
      }

      if (tanggal_selesai) {
        baseQuery += ` AND DATE(p.dibuat_pada) <= ?`;
        params.push(tanggal_selesai);
      }

      // Query untuk menghitung total
      const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
      const [countResult] = await connection.execute<RowDataPacket[]>(countQuery, params);
      const total = countResult[0].total;

      // Query untuk mendapatkan data dengan pagination
      const dataQuery = `
        SELECT 
          p.*,
          pengirim.nama as pengirim_nama,
          pengirim.username as pengirim_username,
          penerima.nama as penerima_nama,
          penerima.username as penerima_username
        ${baseQuery}
        ORDER BY p.${sort_by} ${sort_order.toUpperCase()}
        LIMIT ${limitNum} OFFSET ${offset}
      `;

      const [rows] = await connection.execute<RowDataPacket[]>(dataQuery, params);

      // Transform hasil query menjadi format yang diinginkan
      const data: PerpesananWithUsers[] = rows.map((row: any) => ({
        id: row.id,
        tenant_id: row.tenant_id,
        pengirim_id: row.pengirim_id,
        penerima_id: row.penerima_id,
        pesan: row.pesan,
        status: row.status,
        prioritas: row.prioritas,
        dibaca_pada: row.dibaca_pada,
        dibalas_pada: row.dibalas_pada,
        dibuat_pada: row.dibuat_pada,
        diperbarui_pada: row.diperbarui_pada,
        pengirim: {
          id: row.pengirim_id,
          nama: row.pengirim_nama,
          username: row.pengirim_username
        },
        penerima: {
          id: row.penerima_id,
          nama: row.penerima_nama,
          username: row.penerima_username
        }
      }));

      return { data, total };

    } catch (error) {
      logger.error('Error searching perpesanan:', error);
      throw new Error('Gagal mencari pesan');
    } finally {
      connection.release();
    }
  }

  /**
   * Mendapatkan pesan berdasarkan ID
   */
  static async findById(id: string, accessScope: AccessScope): Promise<PerpesananWithUsers | null> {
    const connection = await pool.getConnection();
    
    try {
      const query = `
        SELECT 
          p.*,
          pengirim.nama as pengirim_nama,
          pengirim.username as pengirim_username,
          penerima.nama as penerima_nama,
          penerima.username as penerima_username
        FROM perpesanan p
        INNER JOIN users pengirim ON p.pengirim_id = pengirim.id
        INNER JOIN users penerima ON p.penerima_id = penerima.id
        WHERE p.id = ? 
        AND p.tenant_id = ?
        AND (p.pengirim_id = ? OR p.penerima_id = ?)
      `;

      const [rows] = await connection.execute<RowDataPacket[]>(
        query, 
        [id, accessScope.tenantId, accessScope.userId, accessScope.userId]
      );

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        id: row.id,
        tenant_id: row.tenant_id,
        pengirim_id: row.pengirim_id,
        penerima_id: row.penerima_id,
        pesan: row.pesan,
        status: row.status,
        prioritas: row.prioritas,
        dibaca_pada: row.dibaca_pada,
        dibalas_pada: row.dibalas_pada,
        dibuat_pada: row.dibuat_pada,
        diperbarui_pada: row.diperbarui_pada,
        pengirim: {
          id: row.pengirim_id,
          nama: row.pengirim_nama,
          username: row.pengirim_username
        },
        penerima: {
          id: row.penerima_id,
          nama: row.penerima_nama,
          username: row.penerima_username
        }
      };

    } catch (error) {
      logger.error('Error finding perpesanan by ID:', error);
      throw new Error('Gagal mendapatkan pesan');
    } finally {
      connection.release();
    }
  }

  /**
   * Mendapatkan statistik pesan untuk user
   */
  static async getStats(accessScope: AccessScope): Promise<PerpesananStats> {
    const connection = await pool.getConnection();
    
    try {
      // Query untuk statistik umum
      const statsQuery = `
        SELECT 
          COUNT(*) as total_pesan,
          SUM(CASE WHEN status = 'terkirim' AND penerima_id = ? THEN 1 ELSE 0 END) as pesan_belum_dibaca,
          SUM(CASE WHEN DATE(dibuat_pada) = CURDATE() THEN 1 ELSE 0 END) as pesan_hari_ini,
          SUM(CASE WHEN YEARWEEK(dibuat_pada) = YEARWEEK(NOW()) THEN 1 ELSE 0 END) as pesan_minggu_ini,
          SUM(CASE WHEN YEAR(dibuat_pada) = YEAR(NOW()) AND MONTH(dibuat_pada) = MONTH(NOW()) THEN 1 ELSE 0 END) as pesan_bulan_ini
        FROM perpesanan 
        WHERE tenant_id = ? 
        AND (pengirim_id = ? OR penerima_id = ?)
      `;

      const [statsRows] = await connection.execute<RowDataPacket[]>(
        statsQuery, 
        [accessScope.userId, accessScope.tenantId, accessScope.userId, accessScope.userId]
      );

      // Query untuk statistik per prioritas
      const prioritasQuery = `
        SELECT 
          prioritas,
          COUNT(*) as jumlah
        FROM perpesanan 
        WHERE tenant_id = ? 
        AND (pengirim_id = ? OR penerima_id = ?)
        GROUP BY prioritas
      `;

      const [prioritasRows] = await connection.execute<RowDataPacket[]>(
        prioritasQuery, 
        [accessScope.tenantId, accessScope.userId, accessScope.userId]
      );

      const stats = statsRows[0];
      const prioritasStats = {
        rendah: 0,
        normal: 0,
        tinggi: 0,
        urgent: 0
      };

      // Mapping hasil prioritas
      prioritasRows.forEach((row: any) => {
        prioritasStats[row.prioritas as keyof typeof prioritasStats] = row.jumlah;
      });

      return {
        total_pesan: stats.total_pesan || 0,
        pesan_belum_dibaca: stats.pesan_belum_dibaca || 0,
        pesan_hari_ini: stats.pesan_hari_ini || 0,
        pesan_minggu_ini: stats.pesan_minggu_ini || 0,
        pesan_bulan_ini: stats.pesan_bulan_ini || 0,
        pesan_per_prioritas: prioritasStats
      };

    } catch (error) {
      logger.error('Error getting perpesanan stats:', error);
      throw new Error('Gagal mendapatkan statistik pesan');
    } finally {
      connection.release();
    }
  }
}