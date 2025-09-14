import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { DashboardService } from '../services/DashboardService';
import { logger } from '@/core/utils/logger';

/**
 * Controller untuk mengelola chart penjualan
 */
export class ChartController extends BaseController {
  /**
   * Mendapatkan data chart penjualan
   */
  static async getChartPenjualan(req: Request, res: Response) {
    try {
      // Validasi access scope
      const accessScope = ChartController.validateAccessScope(req, res);
      if (!accessScope) return;

      const { tenantId } = req.user!;
      const { storeId } = req.query;

      // Dapatkan store ID final
      const finalStoreId = await ChartController.getStoreId(
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
      const filter = ChartController.parseFilter(req.query, 'minggu_ini');

      logger.info('Getting chart penjualan with params:', {
        tenantId,
        storeId: finalStoreId,
        filter
      });

      // Ambil data chart penjualan dari service
      const chartData = await DashboardService.getChartPenjualan(
        tenantId,
        finalStoreId,
        filter
      );

      return ChartController.handleSuccess(
        res,
        chartData,
        'Data chart penjualan berhasil diambil'
      );
    } catch (error) {
      return ChartController.handleError(
        res,
        error,
        'Gagal mengambil data chart penjualan',
        'ChartController.getChartPenjualan'
      );
    }
  }
}