import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { DashboardService } from '../services/DashboardService';
import { logger } from '@/core/utils/logger';

/**
 * Controller untuk mengelola produk terlaris
 */
export class ProdukController extends BaseController {
  /**
   * Mendapatkan data produk terlaris
   */
  static async getProdukTerlaris(req: Request, res: Response) {
    try {
      // Validasi access scope
      const accessScope = ProdukController.validateAccessScope(req, res);
      if (!accessScope) return;

      const { tenantId } = req.user!;
      const { storeId } = req.query;

      // Dapatkan store ID final
      const finalStoreId = await ProdukController.getStoreId(
        tenantId,
        storeId as string
      );

      if (!finalStoreId) {
        return res.status(400).json({
          success: false,
          message: 'Store ID tidak ditemukan'
        });
      }

      // Parse filter dan limit dari query parameters
      const filter = ProdukController.parseFilter(req.query);
      const limitNum = ProdukController.parseLimit(req.query, '10');

      logger.info('Getting produk terlaris with params:', {
        tenantId,
        storeId: finalStoreId,
        filter,
        limit: limitNum
      });

      // Ambil data produk terlaris dari service
      const produkData = await DashboardService.getProdukTerlaris(
        tenantId,
        finalStoreId,
        filter,
        limitNum
      );

      return ProdukController.handleSuccess(
        res,
        produkData,
        'Data produk terlaris berhasil diambil'
      );
    } catch (error) {
      return ProdukController.handleError(
        res,
        error,
        'Gagal mengambil data produk terlaris',
        'ProdukController.getProdukTerlaris'
      );
    }
  }
}