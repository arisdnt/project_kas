/**
 * Controller StokOpname
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import { Request, Response } from 'express';
import { StokOpnameService } from '../services/StokOpnameService';
import { StokOpnameFilters } from '../models/StokOpname';
import { logger } from '@/core/utils/logger';

export class StokOpnameController {
  /**
   * Get all stok opname with pagination and filters
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 25;
      
      const filters: StokOpnameFilters = {
        kategoriId: req.query.kategori ? parseInt(req.query.kategori as string) : undefined,
        brandId: req.query.brand ? parseInt(req.query.brand as string) : undefined,
        supplierId: req.query.supplier ? parseInt(req.query.supplier as string) : undefined,
        status: req.query.status as any,
        tanggal: req.query.tanggal as string,
        search: req.query.search as string
      };

      const result = await StokOpnameService.getAll(page, limit, filters);
      
      const totalPages = Math.ceil(result.total / limit);
      const hasNextPage = page < totalPages;

      res.json({
        success: true,
        data: result.data,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages,
          hasNextPage
        }
      });
    } catch (error: any) {
      logger.error('Error in StokOpnameController.getAll:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengambil data stok opname'
      });
    }
  }

  /**
   * Get stok opname by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID tidak valid'
        });
        return;
      }

      const stokOpname = await StokOpnameService.getById(id);
      
      if (!stokOpname) {
        res.status(404).json({
          success: false,
          message: 'Stok opname tidak ditemukan'
        });
        return;
      }

      res.json({
        success: true,
        data: stokOpname
      });
    } catch (error: any) {
      logger.error('Error in StokOpnameController.getById:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengambil data stok opname'
      });
    }
  }

  /**
   * Create new stok opname
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { id_produk, stok_fisik, catatan } = req.body;
      const userId = (req as any).user?.id;

      if (!id_produk || stok_fisik === undefined) {
        res.status(400).json({
          success: false,
          message: 'ID produk dan stok fisik harus diisi'
        });
        return;
      }

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User tidak terautentikasi'
        });
        return;
      }

      const stokOpname = await StokOpnameService.create(
        { id_produk, stok_fisik, catatan },
        userId
      );

      res.status(201).json({
        success: true,
        data: stokOpname,
        message: 'Stok opname berhasil dibuat'
      });
    } catch (error: any) {
      logger.error('Error in StokOpnameController.create:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal membuat stok opname'
      });
    }
  }

  /**
   * Update stok opname
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { stok_fisik, status, catatan } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID tidak valid'
        });
        return;
      }

      const stokOpname = await StokOpnameService.update(id, {
        stok_fisik,
        status,
        catatan
      });

      res.json({
        success: true,
        data: stokOpname,
        message: 'Stok opname berhasil diupdate'
      });
    } catch (error: any) {
      logger.error('Error in StokOpnameController.update:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengupdate stok opname'
      });
    }
  }

  /**
   * Delete stok opname
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID tidak valid'
        });
        return;
      }

      await StokOpnameService.delete(id);

      res.json({
        success: true,
        message: 'Stok opname berhasil dihapus'
      });
    } catch (error: any) {
      logger.error('Error in StokOpnameController.delete:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal menghapus stok opname'
      });
    }
  }

  /**
   * Complete stok opname
   */
  static async complete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID tidak valid'
        });
        return;
      }

      const stokOpname = await StokOpnameService.update(id, {
        status: 'completed'
      });

      res.json({
        success: true,
        data: stokOpname,
        message: 'Stok opname berhasil diselesaikan'
      });
    } catch (error: any) {
      logger.error('Error in StokOpnameController.complete:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal menyelesaikan stok opname'
      });
    }
  }

  /**
   * Cancel stok opname
   */
  static async cancel(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID tidak valid'
        });
        return;
      }

      const stokOpname = await StokOpnameService.update(id, {
        status: 'cancelled'
      });

      res.json({
        success: true,
        data: stokOpname,
        message: 'Stok opname berhasil dibatalkan'
      });
    } catch (error: any) {
      logger.error('Error in StokOpnameController.cancel:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal membatalkan stok opname'
      });
    }
  }
}