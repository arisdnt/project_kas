/**
 * Controller untuk menangani request navbar
 * Mengelola endpoint untuk data navbar (toko + tenant)
 */

import { Request, Response } from 'express';
import { NavbarService } from '../services/NavbarService';
import { 
  createNavbarSuccessResponse, 
  createNavbarErrorResponse 
} from '../models/NavbarModel';

export class NavbarController {
  /**
   * Endpoint untuk mendapatkan informasi navbar
   * GET /api/navbar/info
   */
  static async getNavbarInfo(req: Request, res: Response): Promise<void> {
    try {
      // Validasi autentikasi
      if (!req.user) {
        res.status(401).json(createNavbarErrorResponse(
          'User tidak terautentikasi',
          'UNAUTHORIZED'
        ));
        return;
      }

      // Validasi access scope
      if (!req.accessScope) {
        res.status(403).json(createNavbarErrorResponse(
          'Access scope tidak tersedia',
          'FORBIDDEN'
        ));
        return;
      }

      // Validasi tenant ID
      if (!req.accessScope.tenantId) {
        res.status(400).json(createNavbarErrorResponse(
          'Tenant ID tidak ditemukan dalam access scope',
          'INVALID_TENANT'
        ));
        return;
      }

      // Ambil data navbar dari service
      const navbarInfo = await NavbarService.getNavbarInfo(req.accessScope);

      // Return response sukses
      res.status(200).json(createNavbarSuccessResponse(
        navbarInfo,
        'Data navbar berhasil diambil'
      ));

    } catch (error) {
      console.error('Error dalam getNavbarInfo:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan server';
      
      res.status(500).json(createNavbarErrorResponse(
        'Gagal mengambil data navbar',
        errorMessage
      ));
    }
  }

  /**
   * Health check endpoint untuk navbar
   * GET /api/navbar/health
   */
  static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Navbar service berjalan dengan baik',
        timestamp: new Date().toISOString(),
        service: 'navbar'
      });
    } catch (error) {
      console.error('Error dalam navbar health check:', error);
      
      res.status(500).json({
        success: false,
        message: 'Navbar service mengalami masalah',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}