import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { DashboardService } from '../services/DashboardService';
import { logger } from '@/core/utils/logger';

/**
 * Controller untuk mengelola transaksi terbaru
 */
export class TransaksiController extends BaseController {
  /**
   * Mendapatkan data transaksi terbaru
   */
  static async getTransaksiTerbaru(req: Request, res: Response) {
    try {
      console.log('=== START getTransaksiTerbaru ===');
      console.log('req.user:', req.user);
      console.log('req.query:', req.query);

      // Validasi access scope
      const accessScope = TransaksiController.validateAccessScope(req, res);
      if (!accessScope) return;

      const { tenantId } = req.user!;
      const { storeId } = req.query;

      console.log('tenantId:', tenantId);

      // Dapatkan store ID final
      const finalStoreId = await TransaksiController.getStoreId(
        tenantId,
        storeId as string
      );

      console.log('finalStoreId:', finalStoreId);

      if (!finalStoreId) {
        return res.status(400).json({
          success: false,
          message: 'Store ID tidak ditemukan'
        });
      }

      // Parse filter dan limit dari query parameters
      const filter = TransaksiController.parseFilter(req.query);
      const limitNum = TransaksiController.parseLimit(req.query, '5');

      const controllerParams = {
        tenantId,
        storeId: finalStoreId,
        filter,
        limit: limitNum,
        limitType: typeof limitNum
      };

      console.log('Controller filter params:', controllerParams);

      // Ambil data transaksi terbaru dari service
      const transaksiData = await DashboardService.getTransaksiTerbaru(
        tenantId,
        finalStoreId,
        filter,
        limitNum
      );

      return TransaksiController.handleSuccess(
        res,
        transaksiData,
        'Data transaksi terbaru berhasil diambil'
      );
    } catch (error) {
      console.log('Error getting recent transactions:', error);
      return TransaksiController.handleError(
        res,
        error,
        'Gagal mengambil data transaksi terbaru',
        'TransaksiController.getTransaksiTerbaru'
      );
    }
  }
}