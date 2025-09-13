/**
 * Service Layer untuk Manajemen Dokumen Transaksi
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { RowDataPacket, ResultSetHeader } from 'mysql2'
import pool from '@/core/database/connection'
import { logger } from '@/core/utils/logger'
import {
  DokumenTransaksi,
  DokumenWithDetails,
  DokumenListResponse,
  CreateDokumen,
  UpdateDokumen,
  DokumenQuery,
  KategoriFile
} from '../models/DokumenTransaksi'

export class DokumenService {
  /**
   * Membuat record dokumen baru di database
   */
  static async createDokumen(
    userId: string,
    tenantId: string,
    data: CreateDokumen
  ): Promise<DokumenTransaksi> {
    const connection = await pool.getConnection()
    try {
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO dokumen_transaksi 
         (id_transaksi, kunci_objek, nama_file_asli, ukuran_file, tipe_mime, 
          kategori, id_pengguna, id_toko, deskripsi, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.id_transaksi || null,
          data.kunci_objek,
          data.nama_file_asli,
          data.ukuran_file,
          data.tipe_mime,
          data.kategori,
          userId,
          tenantId,
          data.deskripsi || null,
          data.status
        ]
      )

      return await this.getDokumenById(result.insertId, tenantId)
    } catch (error) {
      logger.error({ error, data }, 'Gagal membuat dokumen')
      throw new Error('Gagal menyimpan metadata dokumen')
    } finally {
      connection.release()
    }
  }

  /**
   * Mengambil dokumen berdasarkan ID
   */
  static async getDokumenById(
    id: number,
    tenantId: string
  ): Promise<DokumenTransaksi> {
    const connection = await pool.getConnection()
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT * FROM dokumen_transaksi 
         WHERE id = ? AND id_toko = ? AND status != 'dihapus'`,
        [id, tenantId]
      )

      if (rows.length === 0) {
        throw new Error('Dokumen tidak ditemukan')
      }

      return rows[0] as DokumenTransaksi
    } finally {
      connection.release()
    }
  }

  /**
   * Mengambil dokumen berdasarkan kunci objek
   */
  static async getDokumenByKey(
    kunciObjek: string,
    tenantId: string
  ): Promise<DokumenTransaksi | null> {
    const connection = await pool.getConnection()
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT * FROM dokumen_transaksi 
         WHERE kunci_objek = ? AND id_toko = ? AND status != 'dihapus'`,
        [kunciObjek, tenantId]
      )

      return rows.length > 0 ? (rows[0] as DokumenTransaksi) : null
    } finally {
      connection.release()
    }
  }

  /**
   * Mengambil daftar dokumen dengan filter dan pagination
   */
  static async getDokumenList(
    tenantId: string,
    query: DokumenQuery
  ): Promise<DokumenListResponse> {
    const connection = await pool.getConnection()
    try {
      // Build WHERE clause
      const conditions: string[] = ['d.id_toko = ?', 'd.status != ?']
      const params: any[] = [tenantId, 'dihapus']

      if (query.kategori) {
        conditions.push('d.kategori = ?')
        params.push(query.kategori)
      }

      if (query.status) {
        conditions.push('d.status = ?')
        params.push(query.status)
      }

      if (query.id_transaksi) {
        conditions.push('d.id_transaksi = ?')
        params.push(query.id_transaksi)
      }

      if (query.search) {
        conditions.push('(d.nama_file_asli LIKE ? OR d.kunci_objek LIKE ? OR d.deskripsi LIKE ?)')
        const searchTerm = `%${query.search}%`
        params.push(searchTerm, searchTerm, searchTerm)
      }

      const whereClause = conditions.join(' AND ')
      const offset = (query.page - 1) * query.limit

      // Get total count
      const [countRows] = await connection.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM dokumen_transaksi d WHERE ${whereClause}`,
        params
      )
      const total = countRows[0].total

      // Get data with details
      const queryParams = [...params, query.limit, offset]
      logger.info({ whereClause, params, queryParams }, 'Executing dokumen query')
      
      const [dataRows] = await connection.query<RowDataPacket[]>(
        `SELECT d.*, u.nama_lengkap as nama_pengguna, t.kode_transaksi
         FROM dokumen_transaksi d
         LEFT JOIN pengguna u ON d.id_pengguna = u.uuid
         LEFT JOIN transaksi t ON d.id_transaksi = t.uuid
         WHERE ${whereClause}
         ORDER BY d.dibuat_pada DESC
         LIMIT ${query.limit} OFFSET ${offset}`,
        params
      )

      // Get stats
      const [statsRows] = await connection.execute<RowDataPacket[]>(
        `SELECT 
           COUNT(*) as totalFiles,
           COALESCE(SUM(ukuran_file), 0) as totalSize,
           kategori,
           COUNT(*) as count
         FROM dokumen_transaksi 
         WHERE id_toko = ? AND status != ?
         GROUP BY kategori`,
        [tenantId, 'dihapus']
      )

      const categoryCounts: Record<KategoriFile, number> = {
        umum: 0,
        produk: 0,
        dokumen: 0
      }

      let totalFiles = 0
      let totalSize = 0

      statsRows.forEach((row: any) => {
        categoryCounts[row.kategori as KategoriFile] = row.count
        totalFiles += row.count
        totalSize += row.totalSize
      })

      return {
        data: dataRows as DokumenWithDetails[],
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit)
        },
        stats: {
          totalFiles,
          totalSize,
          categoryCounts
        }
      }
    } finally {
      connection.release()
    }
  }

  /**
   * Update dokumen
   */
  static async updateDokumen(
    id: number,
    tenantId: string,
    data: UpdateDokumen
  ): Promise<DokumenTransaksi> {
    const connection = await pool.getConnection()
    try {
      const fields: string[] = []
      const params: any[] = []

      if (data.nama_file_asli !== undefined) {
        fields.push('nama_file_asli = ?')
        params.push(data.nama_file_asli)
      }

      if (data.deskripsi !== undefined) {
        fields.push('deskripsi = ?')
        params.push(data.deskripsi)
      }

      if (data.status !== undefined) {
        fields.push('status = ?')
        params.push(data.status)
      }

      if (data.kategori !== undefined) {
        fields.push('kategori = ?')
        params.push(data.kategori)
      }

      if (fields.length === 0) {
        throw new Error('Tidak ada data untuk diupdate')
      }

      params.push(id, tenantId)

      const [result] = await connection.execute<ResultSetHeader>(
        `UPDATE dokumen_transaksi SET ${fields.join(', ')} 
         WHERE id = ? AND id_toko = ?`,
        params
      )

      if (result.affectedRows === 0) {
        throw new Error('Dokumen tidak ditemukan')
      }

      return await this.getDokumenById(id, tenantId)
    } catch (error) {
      logger.error({ error, id, data }, 'Gagal update dokumen')
      throw error
    } finally {
      connection.release()
    }
  }

  /**
   * Soft delete dokumen
   */
  static async deleteDokumen(
    id: number,
    tenantId: string
  ): Promise<void> {
    const connection = await pool.getConnection()
    try {
      const [result] = await connection.execute<ResultSetHeader>(
        `UPDATE dokumen_transaksi SET status = 'dihapus' 
         WHERE id = ? AND id_toko = ?`,
        [id, tenantId]
      )

      if (result.affectedRows === 0) {
        throw new Error('Dokumen tidak ditemukan')
      }
    } catch (error) {
      logger.error({ error, id }, 'Gagal menghapus dokumen')
      throw error
    } finally {
      connection.release()
    }
  }
}
