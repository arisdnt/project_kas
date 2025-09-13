/**
 * Controller Pelanggan
 */

import { Request, Response } from 'express'
import { SearchPelangganQuerySchema } from '../models/Pelanggan'
import { PelangganService } from '../services/PelangganService'

export class PelangganController {
  static async search(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const q = SearchPelangganQuerySchema.parse(req.query)
    const { data, total, totalPages, page } = await PelangganService.search(req.user.tenantId, q)
    return res.json({ success: true, data, pagination: { total, totalPages, page, limit: Number(q.limit) } })
  }
}

