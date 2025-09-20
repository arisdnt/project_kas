/**
 * Controller untuk menangani HTTP requests terkait catatan
 * Menangani validasi, error handling, dan response formatting
 */

import { Request, Response } from 'express';
import { CatatanService } from '../services/CatatanService';
import { 
  CreateCatatanSchema, 
  UpdateCatatanSchema, 
  SearchCatatanSchema 
} from '../models/CatatanCore';

export class CatatanController {
  /**
   * Pencarian catatan dengan filter dan pagination
   */
  static async searchCatatan(req: Request, res: Response) {
    try {
      const accessScope = req.accessScope;
      if (!accessScope) {
        return res.status(401).json({
          success: false,
          message: 'Access scope tidak ditemukan'
        });
      }

      // Validasi query parameters
      const validatedQuery = SearchCatatanSchema.parse(req.query);
      
      const result = await CatatanService.searchCatatan(validatedQuery, accessScope);
      
      const totalPages = Math.ceil(result.total / parseInt(validatedQuery.limit));
      
      return res.json({
        success: true,
        message: 'Data catatan berhasil diambil',
        data: result.data,
        pagination: {
          page: parseInt(validatedQuery.page),
          limit: parseInt(validatedQuery.limit),
          total: result.total,
          total_pages: totalPages
        }
      });

    } catch (error: any) {
      console.error('Error in searchCatatan:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data catatan',
        error: error.message
      });
    }
  }

  /**
   * Mendapatkan catatan berdasarkan ID
   */
  static async findById(req: Request, res: Response) {
    try {
      const accessScope = req.accessScope;
      if (!accessScope) {
        return res.status(401).json({
          success: false,
          message: 'Access scope tidak ditemukan'
        });
      }

      const { id } = req.params;
      
      const catatan = await CatatanService.findById(id, accessScope);
      
      if (!catatan) {
        return res.status(404).json({
          success: false,
          message: 'Catatan tidak ditemukan'
        });
      }

      return res.json({
        success: true,
        message: 'Data catatan berhasil diambil',
        data: catatan
      });

    } catch (error: any) {
      console.error('Error in findById:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data catatan',
        error: error.message
      });
    }
  }

  /**
   * Mendapatkan statistik catatan
   */
  static async getStats(req: Request, res: Response) {
    try {
      const accessScope = req.accessScope;
      if (!accessScope) {
        return res.status(401).json({
          success: false,
          message: 'Access scope tidak ditemukan'
        });
      }

      const stats = await CatatanService.getStats(accessScope);

      return res.json({
        success: true,
        message: 'Statistik catatan berhasil diambil',
        stats
      });

    } catch (error: any) {
      console.error('Error in getStats:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil statistik catatan',
        error: error.message
      });
    }
  }

  /**
   * Membuat catatan baru
   */
  static async createCatatan(req: Request, res: Response) {
    try {
      const accessScope = req.accessScope;
      if (!accessScope) {
        return res.status(401).json({
          success: false,
          message: 'Access scope tidak ditemukan'
        });
      }

      // Validasi data input
      const validatedData = CreateCatatanSchema.parse(req.body);
      
      const catatan = await CatatanService.createCatatan(validatedData, accessScope);

      return res.status(201).json({
        success: true,
        message: 'Catatan berhasil dibuat',
        data: catatan
      });

    } catch (error: any) {
      console.error('Error in createCatatan:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Data input tidak valid',
          errors: error.errors
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Gagal membuat catatan',
        error: error.message
      });
    }
  }

  /**
   * Update catatan
   */
  static async updateCatatan(req: Request, res: Response) {
    try {
      const accessScope = req.accessScope;
      if (!accessScope) {
        return res.status(401).json({
          success: false,
          message: 'Access scope tidak ditemukan'
        });
      }

      const { id } = req.params;
      
      // Validasi data input
      const validatedData = UpdateCatatanSchema.parse(req.body);
      
      const catatan = await CatatanService.updateCatatan(id, validatedData, accessScope);

      return res.json({
        success: true,
        message: 'Catatan berhasil diupdate',
        data: catatan
      });

    } catch (error: any) {
      console.error('Error in updateCatatan:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Data input tidak valid',
          errors: error.errors
        });
      }

      if (error.message.includes('tidak ditemukan')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('tidak memiliki izin')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Gagal mengupdate catatan',
        error: error.message
      });
    }
  }

  /**
   * Hapus catatan
   */
  static async deleteCatatan(req: Request, res: Response) {
    try {
      const accessScope = req.accessScope;
      if (!accessScope) {
        return res.status(401).json({
          success: false,
          message: 'Access scope tidak ditemukan'
        });
      }

      const { id } = req.params;
      
      await CatatanService.deleteCatatan(id, accessScope);

      return res.json({
        success: true,
        message: 'Catatan berhasil dihapus'
      });

    } catch (error: any) {
      console.error('Error in deleteCatatan:', error);
      
      if (error.message.includes('tidak ditemukan')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('tidak memiliki izin')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus catatan',
        error: error.message
      });
    }
  }
}