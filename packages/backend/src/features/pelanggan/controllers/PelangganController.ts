/**
 * Controller Pelanggan
 */

import { Request, Response } from 'express'
import { SearchPelangganQuerySchema } from '../models/Pelanggan'
import { PelangganService } from '../services/PelangganService'
import { requireStoreWhenNeeded } from '@/core/middleware/accessScope'

export class PelangganController {
  static async search(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' })

      // Validasi kebutuhan store untuk level >=3
      // Catatan: middleware requireStoreWhenNeeded bisa dipasang di route-level juga jika diperlukan
      await new Promise<void>((resolve, reject) => requireStoreWhenNeeded(req, res, (err?: any) => err ? reject(err) : resolve()))
      const q = SearchPelangganQuerySchema.parse(req.query)
      const { data, total, totalPages, page } = await PelangganService.search(req.accessScope!, q)
      return res.json({ success: true, data, pagination: { total, totalPages, page, limit: Number(q.limit) } })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}
