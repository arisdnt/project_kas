import { Request, Response } from 'express';
import { PenggunaService } from '../services/PenggunaService';
import { PenggunaCreateSchema, PenggunaUpdateSchema } from '../models/PenggunaModel';
import { pool } from '@/core/database/connection';

export class PenggunaController {
  static async list(req: Request, res: Response) {
    const user = req.user!;
    const { search, page = '1', limit = '50' } = req.query as Record<string,string>;
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 50, 1), 100);

    const { data, total } = await PenggunaService.listScoped({
      search,
      page: pageNum,
      limit: limitNum,
      tenantId: user.tenantId,
      tokoId: user.tokoId,
      level: user.level || (user.isGodUser ? 1 : 5),
      isGod: user.isGodUser
    });

    return res.json({
      success: true,
      data: {
        pengguna: data,
        pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total/limitNum) },
        scope: {
          mode: user.isGodUser || user.level === 1 ? 'global' : (user.level === 2 ? 'tenant' : 'store'),
          tenantId: user.tenantId,
          tokoId: user.tokoId || null
        }
      }
    });
  }

  static async get(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;
    const pengguna = await PenggunaService.get(id, tenantId);
    if (!pengguna) return res.status(404).json({ success:false, message: 'Pengguna tidak ditemukan' });
    return res.json({ success:true, data: pengguna });
  }

  static async create(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const parsed = PenggunaCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success:false, errors: parsed.error.flatten() });
    }
    try {
      const pengguna = await PenggunaService.create(parsed.data, tenantId);
      return res.status(201).json({ success:true, data: pengguna });
    } catch (e:any) {
      return res.status(400).json({ success:false, message: e.message });
    }
  }

  static async update(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;
    const parsed = PenggunaUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success:false, errors: parsed.error.flatten() });
    }
    try {
      const pengguna = await PenggunaService.update(id, tenantId, parsed.data);
      return res.json({ success:true, data: pengguna });
    } catch (e:any) {
      const code = e.message.includes('tidak ditemukan') ? 404 : 400;
      return res.status(code).json({ success:false, message: e.message });
    }
  }

  static async delete(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;
    try {
      await PenggunaService.delete(id, tenantId);
      return res.json({ success:true });
    } catch (e:any) {
      const code = e.message.includes('tidak ditemukan') ? 404 : 400;
      return res.status(code).json({ success:false, message: e.message });
    }
  }

  static async getTenants(req: Request, res: Response) {
    try {
      const [rows] = await pool.query(
        'SELECT id, nama, status FROM tenants WHERE status = "aktif" ORDER BY nama ASC'
      );
      return res.json({ success: true, data: rows });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  static async getStoresByTenant(req: Request, res: Response) {
    try {
      const { tenantId } = req.params;
      const [rows] = await pool.query(
        'SELECT id, nama, kode FROM toko WHERE tenant_id = ? AND status = "aktif" ORDER BY nama ASC',
        [tenantId]
      );
      return res.json({ success: true, data: rows });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  static async getRoles(req: Request, res: Response) {
    try {
      const tenantId = req.user!.tenantId;
      const [rows] = await pool.query(
        'SELECT id, nama, level, deskripsi FROM peran WHERE tenant_id = ? AND status = "aktif" ORDER BY level ASC, nama ASC',
        [tenantId]
      );
      return res.json({ success: true, data: rows });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }
}
