import { Request, Response } from 'express';
import { KeuanganService } from '@/features/keuangan/services/KeuanganService';
import { logger } from '@/core/utils/logger';

export class KeuanganController {
  static async ledger(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const scope = req.accessScope;
      const { start, end } = req.query as { start?: string; end?: string };
      if (!start || !end) return res.status(400).json({ error: 'Bad Request', message: 'start & end required' });
      const data = await KeuanganService.getLedger(scope?.tenantId || user.tenantId || null, start, end);
      return res.json({ data });
    } catch (e: any) {
      logger.error({ err: e?.message }, 'Ledger error');
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async profitLoss(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const scope = req.accessScope;
      const { start, end } = req.query as { start?: string; end?: string };
      if (!start || !end) return res.status(400).json({ error: 'Bad Request', message: 'start & end required' });
      const data = await KeuanganService.getProfitLoss(scope?.tenantId || user.tenantId || null, start, end);
      return res.json({ data });
    } catch (e: any) {
      logger.error({ err: e?.message }, 'ProfitLoss error');
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
