import { Request, Response } from 'express';
import { PajakMatauangService } from '../services/PajakMatauangService';
import {
  PajakMatauangFiltersSchema,
  CreatePajakRequestSchema,
  UpdatePajakRequestSchema,
  CreateMatauangRequestSchema,
  UpdateMatauangRequestSchema,
  createSuccessResponse,
  createErrorResponse,
} from '../models/PajakMatauangModel';
import { logger } from '@/core/utils/logger';

export class PajakMatauangController {
  // ========================================
  // Tax (Pajak) Controller Methods
  // ========================================

  /**
   * Get list of tax settings
   */
  static async getPajak(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json(createErrorResponse('Unauthorized'));
      }

      const filters = PajakMatauangFiltersSchema.parse(req.query);
      const result = await PajakMatauangService.searchPajak(req.accessScope, filters);

      return res.json({
        success: true,
        message: 'Data pajak berhasil diambil',
        data: result.data,
        pagination: {
          total: result.pagination.total,
          page: filters.page,
          totalPages: result.pagination.totalPages,
          limit: filters.limit,
        },
      });
    } catch (error) {
      logger.error('Error getting pajak:', error);
      return res.status(500).json(createErrorResponse('Gagal mengambil data pajak'));
    }
  }

  /**
   * Get tax setting by ID
   */
  static async getPajakById(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json(createErrorResponse('Unauthorized'));
      }

      const { id } = req.params;
      if (!id) {
        return res.status(400).json(createErrorResponse('ID pajak diperlukan'));
      }

      const pajak = await PajakMatauangService.findPajakById(req.accessScope, id);
      if (!pajak) {
        return res.status(404).json(createErrorResponse('Data pajak tidak ditemukan'));
      }

      return res.json(createSuccessResponse(pajak, 'Data pajak berhasil diambil'));
    } catch (error) {
      logger.error('Error getting pajak by ID:', error);
      return res.status(500).json(createErrorResponse('Gagal mengambil data pajak'));
    }
  }

  /**
   * Create new tax setting
   */
  static async createPajak(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json(createErrorResponse('Unauthorized'));
      }

      const data = CreatePajakRequestSchema.parse(req.body);
      const pajak = await PajakMatauangService.createPajak(req.accessScope, data, req.user.id);

      return res.status(201).json(createSuccessResponse(pajak, 'Data pajak berhasil dibuat'));
    } catch (error: any) {
      logger.error('Error creating pajak:', error);

      if (error.message.includes('sudah ada')) {
        return res.status(409).json(createErrorResponse(error.message));
      }

      return res.status(500).json(createErrorResponse('Gagal membuat data pajak'));
    }
  }

  /**
   * Update tax setting
   */
  static async updatePajak(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json(createErrorResponse('Unauthorized'));
      }

      const { id } = req.params;
      if (!id) {
        return res.status(400).json(createErrorResponse('ID pajak diperlukan'));
      }

      const data = UpdatePajakRequestSchema.parse(req.body);
      const pajak = await PajakMatauangService.updatePajak(req.accessScope, id, data, req.user.id);

      return res.json(createSuccessResponse(pajak, 'Data pajak berhasil diperbarui'));
    } catch (error: any) {
      logger.error('Error updating pajak:', error);

      if (error.message.includes('tidak ditemukan')) {
        return res.status(404).json(createErrorResponse(error.message));
      }
      if (error.message.includes('sudah ada')) {
        return res.status(409).json(createErrorResponse(error.message));
      }

      return res.status(500).json(createErrorResponse('Gagal memperbarui data pajak'));
    }
  }

  /**
   * Delete tax setting
   */
  static async deletePajak(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json(createErrorResponse('Unauthorized'));
      }

      const { id } = req.params;
      if (!id) {
        return res.status(400).json(createErrorResponse('ID pajak diperlukan'));
      }

      await PajakMatauangService.deletePajak(req.accessScope, id);

      return res.json(createSuccessResponse(null, 'Data pajak berhasil dihapus'));
    } catch (error: any) {
      logger.error('Error deleting pajak:', error);

      if (error.message.includes('tidak ditemukan')) {
        return res.status(404).json(createErrorResponse(error.message));
      }
      if (error.message.includes('tidak dapat menghapus')) {
        return res.status(400).json(createErrorResponse(error.message));
      }

      return res.status(500).json(createErrorResponse('Gagal menghapus data pajak'));
    }
  }

  /**
   * Toggle tax status (active/inactive)
   */
  static async togglePajakStatus(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json(createErrorResponse('Unauthorized'));
      }

      const { id } = req.params;
      if (!id) {
        return res.status(400).json(createErrorResponse('ID pajak diperlukan'));
      }

      // Get current status
      const currentPajak = await PajakMatauangService.findPajakById(req.accessScope, id);
      if (!currentPajak) {
        return res.status(404).json(createErrorResponse('Data pajak tidak ditemukan'));
      }

      // Toggle status
      const pajak = await PajakMatauangService.updatePajak(
        req.accessScope,
        id,
        { aktif: !currentPajak.aktif },
        req.user.id
      );

      return res.json(createSuccessResponse(pajak, 'Status pajak berhasil diubah'));
    } catch (error: any) {
      logger.error('Error toggling pajak status:', error);
      return res.status(500).json(createErrorResponse('Gagal mengubah status pajak'));
    }
  }

  // ========================================
  // Currency (Mata Uang) Controller Methods
  // ========================================

  /**
   * Get list of currency settings
   */
  static async getMatauang(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json(createErrorResponse('Unauthorized'));
      }

      const filters = PajakMatauangFiltersSchema.parse(req.query);
      const result = await PajakMatauangService.searchMatauang(req.accessScope, filters);

      return res.json({
        success: true,
        message: 'Data mata uang berhasil diambil',
        data: result.data,
        pagination: {
          total: result.pagination.total,
          page: filters.page,
          totalPages: result.pagination.totalPages,
          limit: filters.limit,
        },
      });
    } catch (error) {
      logger.error('Error getting mata uang:', error);
      return res.status(500).json(createErrorResponse('Gagal mengambil data mata uang'));
    }
  }

  /**
   * Get currency setting by ID
   */
  static async getMatauangById(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json(createErrorResponse('Unauthorized'));
      }

      const { id } = req.params;
      if (!id) {
        return res.status(400).json(createErrorResponse('ID mata uang diperlukan'));
      }

      const matauang = await PajakMatauangService.findMatauangById(req.accessScope, id);
      if (!matauang) {
        return res.status(404).json(createErrorResponse('Data mata uang tidak ditemukan'));
      }

      return res.json(createSuccessResponse(matauang, 'Data mata uang berhasil diambil'));
    } catch (error) {
      logger.error('Error getting mata uang by ID:', error);
      return res.status(500).json(createErrorResponse('Gagal mengambil data mata uang'));
    }
  }

  /**
   * Create new currency setting
   */
  static async createMatauang(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json(createErrorResponse('Unauthorized'));
      }

      const data = CreateMatauangRequestSchema.parse(req.body);
      const matauang = await PajakMatauangService.createMatauang(req.accessScope, data, req.user.id);

      return res.status(201).json(createSuccessResponse(matauang, 'Data mata uang berhasil dibuat'));
    } catch (error: any) {
      logger.error('Error creating mata uang:', error);

      if (error.message.includes('sudah ada')) {
        return res.status(409).json(createErrorResponse(error.message));
      }

      return res.status(500).json(createErrorResponse('Gagal membuat data mata uang'));
    }
  }

  /**
   * Update currency setting
   */
  static async updateMatauang(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json(createErrorResponse('Unauthorized'));
      }

      const { id } = req.params;
      if (!id) {
        return res.status(400).json(createErrorResponse('ID mata uang diperlukan'));
      }

      const data = UpdateMatauangRequestSchema.parse(req.body);
      const matauang = await PajakMatauangService.updateMatauang(req.accessScope, id, data, req.user.id);

      return res.json(createSuccessResponse(matauang, 'Data mata uang berhasil diperbarui'));
    } catch (error: any) {
      logger.error('Error updating mata uang:', error);

      if (error.message.includes('tidak ditemukan')) {
        return res.status(404).json(createErrorResponse(error.message));
      }
      if (error.message.includes('sudah ada')) {
        return res.status(409).json(createErrorResponse(error.message));
      }

      return res.status(500).json(createErrorResponse('Gagal memperbarui data mata uang'));
    }
  }

  /**
   * Delete currency setting
   */
  static async deleteMatauang(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json(createErrorResponse('Unauthorized'));
      }

      const { id } = req.params;
      if (!id) {
        return res.status(400).json(createErrorResponse('ID mata uang diperlukan'));
      }

      await PajakMatauangService.deleteMatauang(req.accessScope, id);

      return res.json(createSuccessResponse(null, 'Data mata uang berhasil dihapus'));
    } catch (error: any) {
      logger.error('Error deleting mata uang:', error);

      if (error.message.includes('tidak ditemukan')) {
        return res.status(404).json(createErrorResponse(error.message));
      }
      if (error.message.includes('tidak dapat menghapus')) {
        return res.status(400).json(createErrorResponse(error.message));
      }

      return res.status(500).json(createErrorResponse('Gagal menghapus data mata uang'));
    }
  }

  /**
   * Toggle currency status (active/inactive)
   */
  static async toggleMatauangStatus(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json(createErrorResponse('Unauthorized'));
      }

      const { id } = req.params;
      if (!id) {
        return res.status(400).json(createErrorResponse('ID mata uang diperlukan'));
      }

      // Get current status
      const currentMatauang = await PajakMatauangService.findMatauangById(req.accessScope, id);
      if (!currentMatauang) {
        return res.status(404).json(createErrorResponse('Data mata uang tidak ditemukan'));
      }

      // Toggle status
      const matauang = await PajakMatauangService.updateMatauang(
        req.accessScope,
        id,
        { aktif: !currentMatauang.aktif },
        req.user.id
      );

      return res.json(createSuccessResponse(matauang, 'Status mata uang berhasil diubah'));
    } catch (error: any) {
      logger.error('Error toggling mata uang status:', error);
      return res.status(500).json(createErrorResponse('Gagal mengubah status mata uang'));
    }
  }

  // ========================================
  // Statistics Controller Methods
  // ========================================

  /**
   * Get statistics for tax and currency settings
   */
  static async getStats(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json(createErrorResponse('Unauthorized'));
      }

      const stats = await PajakMatauangService.getStats(req.accessScope);

      return res.json(createSuccessResponse(stats, 'Statistik berhasil diambil'));
    } catch (error) {
      logger.error('Error getting stats:', error);
      return res.status(500).json(createErrorResponse('Gagal mengambil statistik'));
    }
  }
}