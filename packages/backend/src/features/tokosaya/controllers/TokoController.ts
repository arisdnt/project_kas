/**
 * Controller untuk mengelola endpoint toko saya
 * Menangani request dan response untuk operasi toko
 */

import { Request, Response } from 'express';
import { AccessScope } from '@/core/middleware/accessScope';
import { AuthenticatedUser } from '@/features/auth/models/User';
import { TokoService } from '../services/TokoService';
import { 
  Toko, 
  TokoFilter, 
  StatusToko, 
  createErrorResponse, 
  createSuccessResponse 
} from '../models/TokoModel';

/**
 * Interface untuk request yang sudah terautentikasi
 * Menggunakan Express Request yang sudah diperluas dengan accessScope
 */
interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  accessScope?: AccessScope;
}

/**
 * Controller class untuk mengelola endpoint toko
 */
export class TokoController {

  /**
   * Mengambil data toko milik user yang sedang login
   * GET /api/tokosaya
   */
  static async getTokoSaya(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json(createErrorResponse(
          'User tidak terautentikasi',
          'Token tidak valid atau user tidak ditemukan'
        ));
        return;
      }

      // GOD USER BYPASS: jika god user, izinkan ambil semua toko tanpa validateUserAccess strict
      if (req.user.isGodUser) {
        try {
          // Jika tenantId tersedia pada accessScope gunakan filter tenant itu; jika tidak, ambil semua (service harus mendukung)
          let tokoList: Toko[] = []
          if (req.accessScope?.tenantId) {
            tokoList = await TokoService.getTokoByTenantId(req.accessScope.tenantId, {})
          } else {
            // Fallback: coba service khusus (jika tidak ada akan tangkap error)
            if ((TokoService as any).getAllToko) {
              tokoList = await (TokoService as any).getAllToko()
            } else {
              // tanpa tenantId kita tidak bisa lanjutkan; kembalikan array kosong agar frontend bisa lakukan pemilihan manual
              tokoList = []
            }
          }
          res.status(200).json(createSuccessResponse(
            tokoList,
            'Data toko (god bypass) berhasil diambil'
          ))
          return
        } catch (inner) {
          console.error('God bypass gagal, lanjutkan ke alur normal:', inner)
          // lanjut ke alur normal di bawah
        }
      }

      if (!req.accessScope || !req.accessScope.tenantId) {
        res.status(401).json(createErrorResponse(
          'Access scope tidak valid',
          'Tenant ID tidak ditemukan dalam access scope'
        ));
        return;
      }

      const tenantId = req.accessScope.tenantId;
      const userId = req.user.id;

      const hasAccess = await TokoService.validateUserAccess(userId, tenantId);
      if (!hasAccess) {
        res.status(403).json(createErrorResponse(
          'Akses ditolak',
          'User tidak memiliki akses ke tenant ini'
        ));
        return;
      }

      const filter: TokoFilter = {};
      if (req.query.status && typeof req.query.status === 'string') {
        filter.status = req.query.status as any;
      }
      if (req.query.nama && typeof req.query.nama === 'string') {
        filter.nama = req.query.nama;
      }
      if (req.query.kode && typeof req.query.kode === 'string') {
        filter.kode = req.query.kode;
      }

      const tokoList = await TokoService.getTokoByTenantId(tenantId, filter);

      res.status(200).json(createSuccessResponse(
        tokoList,
        'Data toko berhasil diambil'
      ));

    } catch (error) {
      console.error('Error dalam TokoController.getTokoSaya:', error);
      res.status(500).json(createErrorResponse(
        'Terjadi kesalahan saat mengambil data toko',
        error instanceof Error ? error.message : 'Internal server error'
      ));
    }
  }

  /**
   * Mengambil statistik toko untuk tenant
   * GET /api/tokosaya/stats
   */
  static async getTokoStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Validasi autentikasi
      if (!req.user || !req.accessScope?.tenantId) {
        res.status(401).json(createErrorResponse(
          'User tidak terautentikasi'
        ));
        return;
      }

      const tenantId = req.accessScope.tenantId;
      const userId = req.user.id;

      // Validasi akses
      const hasAccess = await TokoService.validateUserAccess(userId, tenantId);
      if (!hasAccess) {
        res.status(403).json(createErrorResponse(
          'Akses ditolak'
        ));
        return;
      }

      // Ambil statistik toko
      const stats = await TokoService.getTokoStats(tenantId);

      res.status(200).json({
        success: true,
        message: 'Statistik toko berhasil diambil',
        data: stats
      });

    } catch (error) {
      console.error('Error dalam TokoController.getTokoStats:', error);
      
      res.status(500).json(createErrorResponse(
        'Terjadi kesalahan saat mengambil statistik toko',
        'Gagal mengambil statistik toko'
      ));
    }
  }

  /**
   * Health check endpoint untuk memastikan service berjalan
   * GET /api/tokosaya/health
   */
  static async healthCheck(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Endpoint tokosaya berfungsi normal',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error dalam TokoController.healthCheck:', error);
      
      res.status(500).json(createErrorResponse(
        'Health check gagal',
        'Service tidak dapat merespons dengan benar'
      ));
    }
  }

  /**
   * Mengambil detail toko berdasarkan ID
   * GET /api/tokosaya/:id
   */
  static async getTokoById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Validasi autentikasi
      if (!req.user || !req.accessScope?.tenantId) {
        res.status(401).json(createErrorResponse(
          'User tidak terautentikasi'
        ));
        return;
      }

      const tokoId = req.params.id;
      const tenantId = req.accessScope.tenantId;
      const userId = req.user.id;

      // Validasi parameter
      if (!tokoId) {
        res.status(400).json(createErrorResponse(
          'ID toko harus diisi'
        ));
        return;
      }

      // Validasi akses
      const hasAccess = await TokoService.validateUserAccess(userId, tenantId);
      if (!hasAccess) {
        res.status(403).json(createErrorResponse(
          'Akses ditolak'
        ));
        return;
      }

      // Ambil data toko
      const toko = await TokoService.getTokoById(tokoId, tenantId);

      if (!toko) {
        res.status(404).json(createErrorResponse(
          'Toko tidak ditemukan'
        ));
        return;
      }

      res.status(200).json(createSuccessResponse(
        [toko],
        'Detail toko berhasil diambil'
      ));

    } catch (error) {
      console.error('Error dalam TokoController.getTokoById:', error);
      
      res.status(500).json(createErrorResponse(
        'Terjadi kesalahan saat mengambil detail toko',
        error instanceof Error ? error.message : 'Internal server error'
      ));
    }
  }
}