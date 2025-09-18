import { Request, Response } from 'express';
import { PeranService } from '../services/PeranService';
import { PeranCreateSchema, PeranUpdateSchema } from '../models/PeranModel';

export class PeranController {
  static async list(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const data = await PeranService.list(tenantId);
    return res.json({ success: true, data });
  }

  static async get(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;
    const peran = await PeranService.get(id, tenantId);
    if (!peran) return res.status(404).json({ success: false, message: 'Peran tidak ditemukan' });
    return res.json({ success: true, data: peran });
  }

  static async create(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const parsed = PeranCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success:false, errors: parsed.error.flatten() });
    }
    try {
      const peran = await PeranService.create(parsed.data, tenantId);
      return res.status(201).json({ success: true, data: peran });
    } catch (e:any) {
      return res.status(400).json({ success:false, message: e.message });
    }
  }

  static async update(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;
    const parsed = PeranUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success:false, errors: parsed.error.flatten() });
    }
    try {
      const peran = await PeranService.update(id, tenantId, parsed.data);
      return res.json({ success: true, data: peran });
    } catch (e:any) {
      return res.status(404).json({ success:false, message: e.message });
    }
  }

  static async delete(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;
    try {
      await PeranService.delete(id, tenantId);
      return res.json({ success: true });
    } catch (e:any) {
      return res.status(404).json({ success:false, message: e.message });
    }
  }
}
