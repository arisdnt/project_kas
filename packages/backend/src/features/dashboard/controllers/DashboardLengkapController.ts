import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { DashboardService } from '../services/DashboardService';
import { logger } from '@/core/utils/logger';

/**
 * Controller untuk mengelola dashboard lengkap
 */
export class DashboardLengkapController extends BaseController {
  /**
   * Mendapatkan data dashboard lengkap (KPI + transaksi + produk)
   */
  static async getDashboardLengkap(req: Request, res: Response) {
    try {
      // Validasi access scope
      const accessScope = DashboardLengkapController.validateAccessScope(req, res);
      if (!accessScope) return;

      const { tenantId } = req.user!;
      const { storeId } = req.query;

      // Dapatkan store ID final
      const finalStoreId = await DashboardLengkapController.getStoreId(
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
      const filter = DashboardLengkapController.parseFilter(req.query, 'hari_ini');

      logger.info('Getting dashboard lengkap with params:', {
        tenantId,
        storeId: finalStoreId,
        filter
      });

      // Ambil data dashboard lengkap dari service
      const dashboardData = await DashboardService.getDashboardLengkap(
        tenantId,
        finalStoreId,
        filter
      );

      return DashboardLengkapController.handleSuccess(
        res,
        dashboardData,
        'Data dashboard lengkap berhasil diambil'
      );
    } catch (error) {
      return DashboardLengkapController.handleError(
        res,
        error,
        'Gagal mengambil data dashboard lengkap',
        'DashboardLengkapController.getDashboardLengkap'
      );
    }
  }
}