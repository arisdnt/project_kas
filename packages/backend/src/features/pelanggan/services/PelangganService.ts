/**
 * Service Pelanggan
 */

import { RowDataPacket } from 'mysql2/promise'
import { pool } from '@/core/database/connection'
import { SearchPelangganQuery } from '../models/Pelanggan'

export class PelangganService {
  static async search(tenantId: string, q: SearchPelangganQuery): Promise<{ data: any[]; total: number; page: number; totalPages: number }> {
    const page = Number(q.page || 1)
    const limit = Number(q.limit || 10)
    const offset = (page - 1) * limit
    const params: any[] = [tenantId]
    let where = 'WHERE toko_id = ?'
    if (q.search) {
      where += ' AND (nama LIKE ? OR email LIKE ? OR telepon LIKE ?)'
      const like = `%${q.search}%`
      params.push(like, like, like)
    }

    const [countRows] = await pool.execute<RowDataPacket[]>(`SELECT COUNT(*) as total FROM pelanggan ${where}`, params)
    const total = Number(countRows[0]?.total || 0)

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, nama, email, telepon FROM pelanggan ${where} ORDER BY nama IS NULL, nama ASC LIMIT ${limit} OFFSET ${offset}`,
      params,
    )

    return { data: rows as any[], total, page, totalPages: Math.ceil(total / limit) }
  }
}
