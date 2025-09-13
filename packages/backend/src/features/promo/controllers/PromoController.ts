/**
 * Controller untuk API Promo
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { Request, Response } from 'express';
import { PromoService } from '../services/PromoService';
import { logger } from '@/core/utils/logger';
import { CreatePromoRequest, UpdatePromoRequest } from '../models/Promo';

export class PromoController {
  // Get all promos
  static async getAllPromos(req: Request, res: Response) {
    try {
      // Ambil ID toko dari konteks user yang terautentikasi
      const storeId = (req as any).user?.tenantId;
      if (!storeId) {
        return res.status(401).json({
          success: false,
          message: 'Tidak ada tenantId pada token. Silakan login ulang.'
        });
      }

      const promos = await PromoService.getAllPromos(storeId);
      
      return res.json({
        success: true,
        data: promos,
        message: 'Data promo berhasil diambil'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in getAllPromos');
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }

  // Get promo by ID
  static async getPromoById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const promoId = parseInt(id);
      
      if (isNaN(promoId)) {
        return res.status(400).json({
          success: false,
          message: 'ID promo tidak valid'
        });
      }

      const storeId = (req as any).user?.tenantId;
      if (!storeId) {
        return res.status(401).json({
          success: false,
          message: 'Tidak ada tenantId pada token. Silakan login ulang.'
        });
      }

      const promo = await PromoService.getPromoById(promoId, storeId);
      
      if (!promo) {
        return res.status(404).json({
          success: false,
          message: 'Promo tidak ditemukan'
        });
      }
      
      return res.json({
        success: true,
        data: promo,
        message: 'Data promo berhasil diambil'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in getPromoById');
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }

  // Create new promo
  static async createPromo(req: Request, res: Response) {
    try {
      const data: CreatePromoRequest = req.body;
      
      // Basic validation
      if (!data.nama || !data.deskripsi || !data.tipe || !data.nilai) {
        return res.status(400).json({
          success: false,
          message: 'Data promo tidak lengkap'
        });
      }

      const storeId = (req as any).user?.tenantId;
      if (!storeId) {
        return res.status(401).json({
          success: false,
          message: 'Tidak ada tenantId pada token. Silakan login ulang.'
        });
      }

      const newPromo = await PromoService.createPromo(data, storeId);
      
      return res.status(201).json({
        success: true,
        data: newPromo,
        message: 'Promo berhasil dibuat'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in createPromo');
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }

  // Update promo
  static async updatePromo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const promoId = parseInt(id);
      const data: UpdatePromoRequest = req.body;
      
      if (isNaN(promoId)) {
        return res.status(400).json({
          success: false,
          message: 'ID promo tidak valid'
        });
      }

      const storeId = (req as any).user?.tenantId;
      if (!storeId) {
        return res.status(401).json({
          success: false,
          message: 'Tidak ada tenantId pada token. Silakan login ulang.'
        });
      }

      const updatedPromo = await PromoService.updatePromo(promoId, data, storeId);
      
      if (!updatedPromo) {
        return res.status(404).json({
          success: false,
          message: 'Promo tidak ditemukan'
        });
      }
      
      return res.json({
        success: true,
        data: updatedPromo,
        message: 'Promo berhasil diperbarui'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in updatePromo');
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }

  // Delete promo
  static async deletePromo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const promoId = parseInt(id);
      
      if (isNaN(promoId)) {
        return res.status(400).json({
          success: false,
          message: 'ID promo tidak valid'
        });
      }

      const storeId = (req as any).user?.tenantId;
      if (!storeId) {
        return res.status(401).json({
          success: false,
          message: 'Tidak ada tenantId pada token. Silakan login ulang.'
        });
      }

      const deleted = await PromoService.deletePromo(promoId, storeId);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Promo tidak ditemukan'
        });
      }
      
      return res.json({
        success: true,
        message: 'Promo berhasil dihapus'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in deletePromo');
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }

  // Toggle promo status
  static async togglePromoStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const promoId = parseInt(id);
      
      if (isNaN(promoId)) {
        return res.status(400).json({
          success: false,
          message: 'ID promo tidak valid'
        });
      }

      const storeId = (req as any).user?.tenantId;
      if (!storeId) {
        return res.status(401).json({
          success: false,
          message: 'Tidak ada tenantId pada token. Silakan login ulang.'
        });
      }

      const toggledPromo = await PromoService.togglePromoStatus(promoId, storeId);
      
      if (!toggledPromo) {
        return res.status(404).json({
          success: false,
          message: 'Promo tidak ditemukan'
        });
      }
      
      return res.json({
        success: true,
        data: toggledPromo,
        message: 'Status promo berhasil diubah'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in togglePromoStatus');
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }

  // Get promo stats
  static async getPromoStats(req: Request, res: Response) {
    try {
      const storeId = (req as any).user?.tenantId;
      if (!storeId) {
        return res.status(401).json({
          success: false,
          message: 'Tidak ada tenantId pada token. Silakan login ulang.'
        });
      }

      const stats = await PromoService.getPromoStats(storeId);
      
      return res.json({
        success: true,
        data: stats,
        message: 'Statistik promo berhasil diambil'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in getPromoStats');
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }

  // Get active promos
  static async getActivePromos(req: Request, res: Response) {
    try {
      const storeId = (req as any).user?.tenantId;
      if (!storeId) {
        return res.status(401).json({
          success: false,
          message: 'Tidak ada tenantId pada token. Silakan login ulang.'
        });
      }

      const activePromos = await PromoService.getActivePromos(storeId);
      
      return res.json({
        success: true,
        data: activePromos,
        message: 'Data promo aktif berhasil diambil'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in getActivePromos');
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }

  // Get promos by date range
  static async getPromosByDateRange(req: Request, res: Response) {
    try {
      const { start_date, end_date } = req.query;
      
      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Parameter start_date dan end_date diperlukan'
        });
      }

      const storeId = (req as any).user?.tenantId;
      if (!storeId) {
        return res.status(401).json({
          success: false,
          message: 'Tidak ada tenantId pada token. Silakan login ulang.'
        });
      }

      const promos = await PromoService.getPromosByDateRange(
        start_date as string, 
        end_date as string, 
        storeId
      );
      
      return res.json({
        success: true,
        data: promos,
        message: 'Data promo berdasarkan rentang tanggal berhasil diambil'
      });
    } catch (error: any) {
      logger.error({ error }, 'Error in getPromosByDateRange');
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }
}