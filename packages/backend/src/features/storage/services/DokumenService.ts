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
      // Map kategori upload to valid tipe_dokumen enum
      const getTipeDokumen = (kategori: string): string => {
        switch (kategori) {
          case 'dokumen': return 'nota'
          case 'produk': return 'foto'
          case 'umum': return 'foto'
          default: return 'foto'
        }
      }

      // Generate UUID for the document
      const documentId = require('crypto').randomUUID()
      
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO dokumen_transaksi 
         (id, transaksi_id, nama_file, ukuran_file, mime_type, 
          tipe_dokumen, path_minio, url_akses, is_public) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          documentId,
          data.id_transaksi || null,
          data.nama_file_asli,
          data.ukuran_file,
          data.tipe_mime,
          getTipeDokumen(data.kategori),
          data.kunci_objek,
          null, // url_akses will be generated when needed
          0 // is_public = false by default
        ]
      )

      return await this.getDokumenById(documentId, tenantId)
    } catch (error: any) {
      logger.error({ 
        error: error?.message || error, 
        stack: error?.stack,
        data 
      }, 'Gagal membuat dokumen')
      throw new Error(`Gagal menyimpan metadata dokumen: ${error?.message || 'Unknown error'}`)
    } finally {
      connection.release()
    }
  }

  /**
   * Mengambil dokumen berdasarkan ID
   */
  static async getDokumenById(
    id: string,
    tenantId: string
  ): Promise<DokumenTransaksi> {
    const connection = await pool.getConnection()
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT id, transaksi_id as id_transaksi, nama_file as nama_file_asli,
                tipe_dokumen as kategori, mime_type as tipe_mime, ukuran_file,
                path_minio as kunci_objek, url_akses, is_public,
                dibuat_pada, dibuat_pada as diperbarui_pada,
                'aktif' as status, '' as id_pengguna, '' as id_toko, '' as deskripsi
         FROM dokumen_transaksi 
         WHERE id = ?`,
        [id]
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
         WHERE path_minio = ?`,
        [kunciObjek]
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
      // Build WHERE clause - using actual table structure
      const conditions: string[] = ['1=1'] // Base condition since no tenant filtering in current table
      const params: any[] = []

      if (query.kategori && query.kategori !== 'umum') {
        // Map kategori to tipe_dokumen
        const tipeMap: Record<string, string> = {
          'dokumen': 'nota',
          'produk': 'foto'
        }
        if (tipeMap[query.kategori]) {
          conditions.push('d.tipe_dokumen = ?')
          params.push(tipeMap[query.kategori])
        }
      }

      if (query.id_transaksi) {
        conditions.push('d.transaksi_id = ?')
        params.push(query.id_transaksi)
      }

      if (query.search) {
        conditions.push('(d.nama_file LIKE ? OR d.path_minio LIKE ?)')
        const searchTerm = `%${query.search}%`
        params.push(searchTerm, searchTerm)
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
        `SELECT d.id, d.transaksi_id, d.nama_file as nama_file_asli, d.tipe_dokumen as kategori,
                d.mime_type as tipe_mime, d.ukuran_file, d.path_minio as kunci_objek,
                d.url_akses, d.is_public, d.dibuat_pada as tanggal_upload,
                d.dibuat_pada as tanggal_diperbarui, 'aktif' as status,
                p.nama as nama_pengguna, t.nomor_transaksi as kode_transaksi
         FROM dokumen_transaksi d
         LEFT JOIN pengguna p ON d.transaksi_id = p.id
         LEFT JOIN transaksi t ON d.transaksi_id = t.id
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
           tipe_dokumen,
           COUNT(*) as count
         FROM dokumen_transaksi 
         WHERE 1=1
         GROUP BY tipe_dokumen`,
        []
      )

      const categoryCounts: Record<KategoriFile, number> = {
        umum: 0,
        produk: 0,
        dokumen: 0
      }

      let totalFiles = 0
      let totalSize = 0

      statsRows.forEach((row: any) => {
        // Map tipe_dokumen to kategori
        const kategoriMap: Record<string, KategoriFile> = {
          'foto': 'produk',
          'nota': 'dokumen',
          'struk': 'dokumen',
          'invoice': 'dokumen',
          'kwitansi': 'dokumen'
        }
        const kategori = kategoriMap[row.tipe_dokumen] || 'umum'
        categoryCounts[kategori] += row.count
        totalFiles += row.count
        totalSize += parseInt(row.totalSize) || 0
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
    id: string,
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
    id: string,
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
