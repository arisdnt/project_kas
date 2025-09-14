import { Request, Response } from 'express';
import { FilterPeriode } from '../services/DashboardService';
import { pool } from '@/core/database/connection';
import { logger } from '@/core/utils/logger';

/**
 * Base controller untuk fungsi-fungsi umum dashboard
 */
export abstract class BaseController {
  /**
   * Validasi dan mendapatkan access scope dari request
   */
  protected static validateAccessScope(req: Request, res: Response) {
    const accessScope = req.accessScope;
    if (!accessScope) {
      res.status(401).json({
        success: false,
        message: 'Access scope tidak tersedia'
      });
      return null;
    }
    return accessScope;
  }

  /**
   * Mendapatkan store ID, jika tidak ada gunakan toko pertama dari tenant
   */
  protected static async getStoreId(tenantId: string, storeId?: string): Promise<string> {
    let finalStoreId = storeId || '';
    if (!finalStoreId) {
      const [storeResult] = await pool.execute(
        'SELECT id FROM toko WHERE tenant_id = ? LIMIT 1',
        [tenantId]
      ) as [any[], any];
      finalStoreId = storeResult[0]?.id || '';
    }
    return finalStoreId;
  }

  /**
   * Parse filter dari query parameters
   */
  protected static parseFilter(query: any, defaultTipeFilter: string = 'semua'): FilterPeriode {
    const {
      tipeFilter = defaultTipeFilter,
      tanggalMulai,
      tanggalSelesai
    } = query;

    return {
      tipeFilter: String(tipeFilter) as FilterPeriode['tipeFilter'],
      tanggalMulai: tanggalMulai ? new Date(String(tanggalMulai)) : undefined,
      tanggalSelesai: tanggalSelesai ? new Date(String(tanggalSelesai)) : undefined
    };
  }

  /**
   * Parse limit dari query parameters
   */
  protected static parseLimit(query: any, defaultLimit: string = '10'): number {
    const { limit = defaultLimit } = query;
    return parseInt(String(limit), 10);
  }

  /**
   * Handle error response
   */
  protected static handleError(
    res: Response,
    error: unknown,
    message: string,
    logContext: string
  ) {
    logger.error(`${logContext}:`, error);
    return res.status(500).json({
      success: false,
      message,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  /**
   * Handle success response
   */
  protected static handleSuccess(
    res: Response,
    data: any,
    message: string
  ) {
    return res.json({
      success: true,
      message,
      data
    });
  }
}