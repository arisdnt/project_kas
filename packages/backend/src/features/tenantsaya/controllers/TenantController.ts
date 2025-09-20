/**
 * Tenant Controller
 * Handles tenant operations untuk user yang sedang login
 */

import { Request, Response } from 'express';
import { TenantService } from '../services/TenantService';
import { logger } from '@/core/utils/logger';

export class TenantController {
  /**
   * Mendapatkan data tenant user yang sedang login
   * GET /api/tenantsaya
   */
  static async getTenantSaya(req: Request, res: Response) {
    try {
      // Validasi autentikasi
      if (!req.user || !req.accessScope) {
        logger.warn('Unauthorized access attempt to tenant data');
        return res.status(401).json({
          success: false,
          message: 'User tidak terautentikasi'
        });
      }

      const { user, accessScope } = req;

      // Validasi tenant ID dari access scope
      if (!accessScope.tenantId) {
        logger.warn(`User ${user.id} tidak memiliki tenant ID yang valid`);
        return res.status(401).json({
          success: false,
          message: 'Tenant ID tidak valid'
        });
      }

      // Ambil data tenant dari service
      const tenant = await TenantService.getTenantByUserId(accessScope);

      if (!tenant) {
        logger.warn(`Tenant tidak ditemukan untuk user ${user.id} dengan tenant ID ${accessScope.tenantId}`);
        return res.status(404).json({
          success: false,
          message: 'Data tenant tidak ditemukan'
        });
      }

      // Validasi tambahan: pastikan user memiliki akses ke tenant
      const hasAccess = await TenantService.validateUserTenantAccess(user.id, accessScope.tenantId);
      if (!hasAccess) {
        logger.warn(`User ${user.id} tidak memiliki akses ke tenant ${accessScope.tenantId}`);
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak ke data tenant'
        });
      }

      // Format response sukses
      const response = TenantService.formatSuccessResponse(tenant);

      logger.info(`User ${user.id} berhasil mengakses data tenant ${tenant.id}`);
      return res.status(200).json(response);

    } catch (error: any) {
      logger.error('Error dalam getTenantSaya:', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        tenantId: req.accessScope?.tenantId
      });

      // Format response error
      const errorResponse = TenantService.formatErrorResponse(
        'Terjadi kesalahan saat mengambil data tenant',
        error.message
      );

      return res.status(500).json(errorResponse);
    }
  }

  /**
   * Mendapatkan statistik tenant (opsional untuk informasi tambahan)
   * GET /api/tenantsaya/stats
   */
  static async getTenantStats(req: Request, res: Response) {
    try {
      // Validasi autentikasi
      if (!req.user || !req.accessScope) {
        return res.status(401).json({
          success: false,
          message: 'User tidak terautentikasi'
        });
      }

      const { accessScope } = req;

      // Ambil statistik tenant
      const stats = await TenantService.getTenantStats(accessScope.tenantId);

      return res.status(200).json({
        success: true,
        message: 'Statistik tenant berhasil diambil',
        data: stats
      });

    } catch (error: any) {
      logger.error('Error dalam getTenantStats:', {
        error: error.message,
        userId: req.user?.id,
        tenantId: req.accessScope?.tenantId
      });

      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil statistik tenant',
        error: error.message
      });
    }
  }

  /**
   * Health check untuk endpoint tenantsaya
   * GET /api/tenantsaya/health
   */
  static async healthCheck(req: Request, res: Response) {
    try {
      return res.status(200).json({
        success: true,
        message: 'Endpoint tenantsaya berfungsi normal',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Health check gagal',
        error: error.message
      });
    }
  }

  /**
   * Endpoint khusus untuk mendapatkan data tenant untuk navbar
   * GET /api/tenantsaya/navbar
   */
  static async getTenantNavbar(req: Request, res: Response) {
    try {
      const user = req.user;
      const accessScope = req.accessScope;

      // Validasi autentikasi
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User tidak terautentikasi'
        });
      }

      // Validasi access scope
      if (!accessScope || !accessScope.tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant ID tidak ditemukan dalam access scope'
        });
      }

      // Ambil data tenant untuk navbar
      const tenantData = await TenantService.getTenantForNavbar(accessScope);

      if (!tenantData) {
        return res.status(404).json({
          success: false,
          message: 'Data tenant tidak ditemukan'
        });
      }

      // Return response sukses
      return res.status(200).json({
        success: true,
        message: 'Data tenant untuk navbar berhasil diambil',
        data: tenantData
      });

    } catch (error: any) {
      logger.error('Error dalam getTenantNavbar:', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        tenantId: req.accessScope?.tenantId
      });

      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data tenant untuk navbar',
        error: error.message
      });
    }
  }
}