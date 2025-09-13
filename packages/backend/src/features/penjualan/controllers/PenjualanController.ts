/**
 * Controller Penjualan
 */

import { Request, Response } from 'express'
import { CreateTransaksiSchema } from '../models/Penjualan'
import { PenjualanService } from '../services/PenjualanService'
import { logger } from '@/core/utils/logger'

export class PenjualanController {
  static async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' })
      }
      const payload = CreateTransaksiSchema.parse(req.body)
      const result = await PenjualanService.createTransaksi(req.user.id, req.user.tenantId, payload)
      return res.status(201).json({ success: true, data: result, message: 'Transaksi dibuat' })
    } catch (error: any) {
      logger.error({ error }, 'Gagal membuat transaksi')
      const status = error?.name === 'ZodError' ? 400 : 500
      return res.status(status).json({ success: false, message: error?.message || 'Gagal membuat transaksi' })
    }
  }

  static async detail(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' })
      }
      const id = Number(req.params.id)
      const detail = await PenjualanService.getDetailTransaksi(id, req.user.tenantId)
      if (!detail) return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' })
      return res.json({ success: true, data: detail })
    } catch (error: any) {
      logger.error({ error }, 'Gagal mengambil detail transaksi')
      return res.status(500).json({ success: false, message: error?.message || 'Gagal mengambil detail' })
    }
  }

  static async cetakStruk(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' })
      }
      const id = Number(req.params.id)
      const detail = await PenjualanService.getDetailTransaksi(id, req.user.tenantId)
      if (!detail) return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' })
      // Format sebagai teks struk (untuk stub). Integrasi printer server bisa ditambahkan di sini.
      const text = PenjualanService.formatStrukText(detail, { nama: 'KasirPro', alamat: '' })
      // Kembalikan plain text untuk debugging/preview
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      return res.send(text)
    } catch (error: any) {
      logger.error({ error }, 'Gagal mencetak struk')
      return res.status(500).json({ success: false, message: error?.message || 'Gagal mencetak struk' })
    }
  }
}

