/**
 * Controller Pelanggan
 */

import { Request, Response } from 'express'
import { SearchPelangganQuerySchema } from '../models/Pelanggan'
import { PelangganService } from '../services/PelangganService'
import { pool } from '@/core/database/connection'
import { RowDataPacket } from 'mysql2/promise'

export class PelangganController {
  static async search(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' })
      
      // Get toko_id from tenant_id
      const [tokoRows] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM toko WHERE tenant_id = ? LIMIT 1',
        [req.user.tenantId]
      )
      
      if (tokoRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Toko not found' })
      }
      
      const toko_id = tokoRows[0].id
      const q = SearchPelangganQuerySchema.parse(req.query)
      const { data, total, totalPages, page } = await PelangganService.search(toko_id, q)
      return res.json({ success: true, data, pagination: { total, totalPages, page, limit: Number(q.limit) } })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

