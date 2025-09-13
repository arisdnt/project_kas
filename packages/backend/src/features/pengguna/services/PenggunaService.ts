/**
 * Service untuk Manajemen Pengguna
 * Mengelola CRUD operations dengan database tracking
 */

import { RowDataPacket, ResultSetHeader } from 'mysql2'
import bcrypt from 'bcryptjs'
import { pool } from '@/core/database/connection'
import { logger } from '@/core/utils/logger'
import {
  Pengguna,
  Peran,
  CreatePenggunaRequest,
  UpdatePenggunaRequest,
  PenggunaQuery,
  PenggunaStats
} from '../models/Pengguna'

export class PenggunaService {
  /**
   * Ambil semua pengguna dengan filter dan pagination
   */
  static async getAllPengguna(query: PenggunaQuery, tenantId: string): Promise<{
    pengguna: Pengguna[]
    pagination: { page: number; limit: number; total: number; totalPages: number }
  }> {
    const connection = await pool.getConnection()
    
    try {

      const { page = 1, limit = 10, search, peran_id, status } = query
      const offset = (page - 1) * limit
      
      // Build WHERE clause - filter berdasarkan tenant_id dari users
      let whereClause = 'WHERE u.tenant_id = ?'
      const params: any[] = [tenantId]
      
      if (search) {
        whereClause += ' AND (u.username LIKE ? OR p.nama LIKE ?)'
        params.push(`%${search}%`, `%${search}%`)
      }
      
      if (peran_id) {
        whereClause += ' AND p.peran_id = ?'
        params.push(peran_id)
      }
      
      if (status !== undefined) {
        whereClause += ' AND p.status = ?'
        params.push(status)
      }
      
      // Query untuk total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM pengguna p
        LEFT JOIN peran r ON p.peran_id = r.id
        LEFT JOIN toko t ON p.toko_id = t.id
        LEFT JOIN users u ON p.user_id = u.id
        ${whereClause}
      `
      

      
      const [countResult] = await connection.execute<RowDataPacket[]>(countQuery, params)
      const total = countResult[0].total
      
      // Query untuk data pengguna
      const dataQuery = `
        SELECT 
          p.id,
          p.toko_id,
          p.peran_id,
          u.username,
          p.nama,
          p.status,
          p.dibuat_pada,
          p.diperbarui_pada,
          r.nama as nama_peran,
          t.nama as nama_toko
        FROM pengguna p
        LEFT JOIN peran r ON p.peran_id = r.id
        LEFT JOIN toko t ON p.toko_id = t.id
        LEFT JOIN users u ON p.user_id = u.id
        ${whereClause}
        ORDER BY p.dibuat_pada DESC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `
      
      const dataParams = [...params]

      
      const [rows] = await connection.execute<RowDataPacket[]>(
        dataQuery, 
        dataParams
      )
      

      
      const pengguna: Pengguna[] = rows.map((row: any) => {
        console.log('DEBUG: Mapping row:', row)
        return {
          id: row.id,
          toko_id: row.toko_id,
          peran_id: row.peran_id,
          username: row.username,
          nama: row.nama,
          status: row.status,
          dibuat_pada: row.dibuat_pada,
          diperbarui_pada: row.diperbarui_pada,
          nama_peran: row.nama_peran,
          nama_toko: row.nama_toko
        }
      })
      
      return {
        pengguna,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
      
    } catch (error) {
      console.error('DEBUG: Error in getAllPengguna:', error)
      logger.error('Error getting all pengguna:', error)
      throw error
    } finally {
      connection.release()
    }
  }
  
  /**
   * Ambil pengguna berdasarkan ID
   */
  static async getPenggunaById(id: number, tenantId: string): Promise<Pengguna | null> {
    const connection = await pool.getConnection()
    
    try {
      const query = `
        SELECT 
          p.id,
          p.id_toko,
          p.id_peran,
          p.username,
          p.password_hash,
          p.nama_lengkap,
          p.aktif,
          p.dibuat_pada,
          p.diperbarui_pada,
          r.nama as nama_peran,
          t.nama as nama_toko
        FROM pengguna p
        LEFT JOIN peran r ON p.id_peran = r.id
        LEFT JOIN toko t ON p.id_toko = t.id
        WHERE p.id = ? AND p.id_toko IN (SELECT id FROM toko WHERE tenant_id = ?)
      `
      
      const [rows] = await connection.execute<RowDataPacket[]>(query, [id, tenantId])
      
      if (rows.length === 0) {
        return null
      }
      
      const row = rows[0]
      return {
        id: row.id,
        toko_id: row.toko_id,
        peran_id: row.peran_id,
        username: row.username,
        nama: row.nama,
        status: row.status,
        dibuat_pada: row.dibuat_pada,
        diperbarui_pada: row.diperbarui_pada,
        nama_peran: row.nama_peran,
        nama_toko: row.nama_toko
      } as Pengguna
      
    } finally {
      connection.release()
    }
  }
  
  /**
   * Buat pengguna baru
   */
  static async createPengguna(data: CreatePenggunaRequest, tenantId: string): Promise<Pengguna> {
    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()
      
      // Cek apakah username sudah ada
      const [existingUser] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM pengguna WHERE username = ?',
        [data.username]
      )
      
      if (existingUser.length > 0) {
        throw new Error('Username sudah digunakan')
      }
      
      // Ambil toko pertama dari tenant
      const [tokoResult] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM toko WHERE tenant_id = ? LIMIT 1',
        [tenantId]
      )
      
      if (tokoResult.length === 0) {
        throw new Error('Toko tidak ditemukan untuk tenant ini')
      }
      
      const idToko = tokoResult[0].id
      
      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12)
      
      // Insert pengguna baru
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO pengguna (toko_id, peran_id, username, password_hash, nama, status, dibuat_pada, diperbarui_pada)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [idToko, data.peran_id, data.username, hashedPassword, data.nama, data.status]
      )
      
      await connection.commit()
      
      // Ambil data pengguna yang baru dibuat
      const newPengguna = await this.getPenggunaById(result.insertId, tenantId)
      
      if (!newPengguna) {
        throw new Error('Gagal mengambil data pengguna yang baru dibuat')
      }
      
      logger.info({
        penggunaId: result.insertId,
        username: data.username,
        tenantId
      }, 'Pengguna baru berhasil dibuat')
      
      return newPengguna
      
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }
  
  /**
   * Update pengguna
   */
  static async updatePengguna(id: number, data: UpdatePenggunaRequest, tenantId: string): Promise<Pengguna> {
    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()
      
      // Cek apakah pengguna ada
      const existingPengguna = await this.getPenggunaById(id, tenantId)
      if (!existingPengguna) {
        throw new Error('Pengguna tidak ditemukan')
      }
      
      // Cek username jika diubah
      if (data.username && data.username !== existingPengguna.username) {
        const [existingUser] = await connection.execute<RowDataPacket[]>(
          'SELECT id FROM pengguna WHERE username = ? AND id != ?',
          [data.username, id]
        )
        
        if (existingUser.length > 0) {
          throw new Error('Username sudah digunakan')
        }
      }
      
      // Build update query
      const updateFields: string[] = []
      const updateValues: any[] = []
      
      if (data.username) {
        updateFields.push('username = ?')
        updateValues.push(data.username)
      }
      
      if (data.nama) {
        updateFields.push('nama = ?')
        updateValues.push(data.nama)
      }
      
      if (data.peran_id) {
        updateFields.push('peran_id = ?')
        updateValues.push(data.peran_id)
      }
      
      if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 12)
        updateFields.push('password_hash = ?')
        updateValues.push(hashedPassword)
      }
      
      if (data.status !== undefined) {
        updateFields.push('status = ?')
        updateValues.push(data.status)
      }
      
      updateFields.push('diperbarui_pada = NOW()')
      updateValues.push(id)
      
      // Execute update
      await connection.execute(
        `UPDATE pengguna SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      )
      
      await connection.commit()
      
      // Ambil data pengguna yang sudah diupdate
      const updatedPengguna = await this.getPenggunaById(id, tenantId)
      
      if (!updatedPengguna) {
        throw new Error('Gagal mengambil data pengguna yang sudah diupdate')
      }
      
      logger.info({
        penggunaId: id,
        tenantId
      }, 'Pengguna berhasil diupdate')
      
      return updatedPengguna
      
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }
  
  /**
   * Hapus pengguna
   */
  static async deletePengguna(id: number, tenantId: string): Promise<void> {
    const connection = await pool.getConnection()
    
    try {
      // Cek apakah pengguna ada
      const existingPengguna = await this.getPenggunaById(id, tenantId)
      if (!existingPengguna) {
        throw new Error('Pengguna tidak ditemukan')
      }
      
      // Hapus pengguna
      await connection.execute(
        'DELETE FROM pengguna WHERE id = ?',
        [id]
      )
      
      logger.info({
        penggunaId: id,
        tenantId
      }, 'Pengguna berhasil dihapus')
      
    } finally {
      connection.release()
    }
  }
  
  /**
   * Ambil semua peran
   */
  static async getAllPeran(): Promise<Peran[]> {
    const connection = await pool.getConnection()
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT id, nama, deskripsi FROM peran ORDER BY nama'
      )
      
      return rows.map(row => ({
        id: row.id,
        nama: row.nama,
        deskripsi: row.deskripsi
      })) as Peran[]
      
    } finally {
      connection.release()
    }
  }
}