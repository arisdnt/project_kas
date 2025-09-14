/**
 * Service Pelanggan
 */

import { RowDataPacket } from 'mysql2/promise'
import { pool } from '@/core/database/connection'
import { AccessScope, applyScopeToSql } from '@/core/middleware/accessScope'
import { SearchPelangganQuery } from '../models/Pelanggan'

export class PelangganService {
  static async search(scope: AccessScope, q: SearchPelangganQuery): Promise<{ data: any[]; total: number; page: number; totalPages: number }> {
    const page = Number(q.page || 1)
    const limit = Number(q.limit || 10)
    const offset = (page - 1) * limit

    // Base query
    let baseWhere = ''
    const baseParams: any[] = []
    if (q.search) {
      baseWhere += (baseWhere ? ' AND ' : ' WHERE ') + '(nama LIKE ? OR email LIKE ? OR telepon LIKE ?)'
      const like = `%${q.search}%`
      baseParams.push(like, like, like)
    }

    // Count
    const countBase = `SELECT COUNT(*) as total FROM pelanggan${baseWhere ? ' ' + baseWhere : ''}`
    const scopedCount = applyScopeToSql(countBase, baseParams, scope, { tenantColumn: 'tenant_id', storeColumn: 'toko_id' })
    const [countRows] = await pool.execute<RowDataPacket[]>(scopedCount.sql, scopedCount.params)
    const total = Number(countRows[0]?.total || 0)

    // Data
    const dataBase = `SELECT id, nama, email, telepon FROM pelanggan${baseWhere ? ' ' + baseWhere : ''}`
    const scopedData = applyScopeToSql(dataBase, baseParams, scope, { tenantColumn: 'tenant_id', storeColumn: 'toko_id' })
    const finalSql = `${scopedData.sql} ORDER BY nama IS NULL, nama ASC LIMIT ${limit} OFFSET ${offset}`
    const [rows] = await pool.execute<RowDataPacket[]>(finalSql, scopedData.params)

    return { data: rows as any[], total, page, totalPages: Math.ceil(total / limit) }
  }
}
