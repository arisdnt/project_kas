import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { DashboardService } from '../services/DashboardService';
import { logger } from '@/core/utils/logger';

/**
 * Controller untuk mengelola KPI (Key Performance Indicators)
 */
export class KpiController extends BaseController {
  /**
   * Mendapatkan data KPI dashboard
   */
  static async getKPI(req: Request, res: Response) {
    try {
      // Validasi access scope
      const accessScope = KpiController.validateAccessScope(req, res);
      if (!accessScope) return;

      const { tenantId } = req.user!;
      const { storeId } = req.query;

      // Dapatkan store ID final
      const finalStoreId = await KpiController.getStoreId(
        tenantId,
        storeId as string
      );

      if (!finalStoreId) {
        return res.status(400).json({
          success: false,
          message: 'Store ID tidak ditemukan'
        });
      }

      // Parse filter dari query parameters
      const filter = KpiController.parseFilter(req.query, 'hari_ini');

      logger.info('Getting KPI with params:', {
        tenantId,
        storeId: finalStoreId,
        filter
      });

      // Ambil data KPI dari service
      const kpiData = await DashboardService.getKPIDashboard(
        tenantId,
        finalStoreId,
        filter
      );

      return KpiController.handleSuccess(
        res,
        kpiData,
        'Data KPI berhasil diambil'
      );
    } catch (error) {
      return KpiController.handleError(
        res,
        error,
        'Gagal mengambil data KPI',
        'KpiController.getKPI'
      );
    }
  }
}