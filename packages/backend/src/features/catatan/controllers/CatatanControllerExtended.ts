/**
 * Controller extended untuk fitur tambahan catatan
 * Menangani endpoint khusus seperti filter berdasarkan kategori, prioritas, tags
 */

import { Request, Response } from 'express';
import { CatatanService } from '../services/CatatanService';
import { z } from 'zod';

export class CatatanControllerExtended {
  /**
   * Mendapatkan catatan berdasarkan kategori
   */
  static async getCatatanByKategori(req: Request, res: Response) {
    try {
      const accessScope = req.accessScope;
      if (!accessScope) {
        return res.status(401).json({
          success: false,
          message: 'Access scope tidak ditemukan'
        });
      }

      const { kategori } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await CatatanService.getCatatanByKategori(
        kategori, 
        accessScope, 
        page, 
        limit
      );

      const totalPages = Math.ceil(result.total / limit);

      return res.json({
        success: true,
        message: `Catatan kategori ${kategori} berhasil diambil`,
        data: result.data,
        pagination: {
          page,
          limit,
          total: result.total,
          total_pages: totalPages
        }
      });

    } catch (error: any) {
      console.error('Error in getCatatanByKategori:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil catatan berdasarkan kategori',
        error: error.message
      });
    }
  }

  /**
   * Mendapatkan catatan dengan reminder
   */
  static async getCatatanWithReminder(req: Request, res: Response) {
    try {
      const accessScope = req.accessScope;
      if (!accessScope) {
        return res.status(401).json({
          success: false,
          message: 'Access scope tidak ditemukan'
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await CatatanService.getCatatanWithReminder(
        accessScope, 
        page, 
        limit
      );

      const totalPages = Math.ceil(result.total / limit);

      return res.json({
        success: true,
        message: 'Catatan dengan reminder berhasil diambil',
        data: result.data,
        pagination: {
          page,
          limit,
          total: result.total,
          total_pages: totalPages
        }
      });

    } catch (error: any) {
      console.error('Error in getCatatanWithReminder:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil catatan dengan reminder',
        error: error.message
      });
    }
  }

  /**
   * Mendapatkan catatan berdasarkan prioritas
   */
  static async getCatatanByPrioritas(req: Request, res: Response) {
    try {
      const accessScope = req.accessScope;
      if (!accessScope) {
        return res.status(401).json({
          success: false,
          message: 'Access scope tidak ditemukan'
        });
      }

      const { prioritas } = req.params;
      
      // Validasi prioritas
      const validPrioritas = z.enum(['rendah', 'normal', 'tinggi']).parse(prioritas);
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await CatatanService.getCatatanByPrioritas(
        validPrioritas, 
        accessScope, 
        page, 
        limit
      );

      const totalPages = Math.ceil(result.total / limit);

      return res.json({
        success: true,
        message: `Catatan prioritas ${prioritas} berhasil diambil`,
        data: result.data,
        pagination: {
          page,
          limit,
          total: result.total,
          total_pages: totalPages
        }
      });

    } catch (error: any) {
      console.error('Error in getCatatanByPrioritas:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Prioritas tidak valid. Gunakan: rendah, normal, atau tinggi'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil catatan berdasarkan prioritas',
        error: error.message
      });
    }
  }

  /**
   * Mendapatkan catatan berdasarkan status
   */
  static async getCatatanByStatus(req: Request, res: Response) {
    try {
      const accessScope = req.accessScope;
      if (!accessScope) {
        return res.status(401).json({
          success: false,
          message: 'Access scope tidak ditemukan'
        });
      }

      const { status } = req.params;
      
      // Validasi status
      const validStatus = z.enum(['draft', 'aktif', 'arsip']).parse(status);
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await CatatanService.getCatatanByStatus(
        validStatus, 
        accessScope, 
        page, 
        limit
      );

      const totalPages = Math.ceil(result.total / limit);

      return res.json({
        success: true,
        message: `Catatan status ${status} berhasil diambil`,
        data: result.data,
        pagination: {
          page,
          limit,
          total: result.total,
          total_pages: totalPages
        }
      });

    } catch (error: any) {
      console.error('Error in getCatatanByStatus:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Status tidak valid. Gunakan: draft, aktif, atau arsip'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil catatan berdasarkan status',
        error: error.message
      });
    }
  }

  /**
   * Pencarian catatan berdasarkan tags
   */
  static async searchByTags(req: Request, res: Response) {
    try {
      const accessScope = req.accessScope;
      if (!accessScope) {
        return res.status(401).json({
          success: false,
          message: 'Access scope tidak ditemukan'
        });
      }

      const tagsParam = req.query.tags as string;
      if (!tagsParam) {
        return res.status(400).json({
          success: false,
          message: 'Parameter tags diperlukan'
        });
      }

      const tags = tagsParam.split(',').map(tag => tag.trim());
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await CatatanService.searchByTags(
        tags, 
        accessScope, 
        page, 
        limit
      );

      const totalPages = Math.ceil(result.total / limit);

      return res.json({
        success: true,
        message: `Catatan dengan tags ${tags.join(', ')} berhasil diambil`,
        data: result.data,
        pagination: {
          page,
          limit,
          total: result.total,
          total_pages: totalPages
        }
      });

    } catch (error: any) {
      console.error('Error in searchByTags:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mencari catatan berdasarkan tags',
        error: error.message
      });
    }
  }

  /**
   * Mendapatkan catatan terbaru
   */
  static async getRecentCatatan(req: Request, res: Response) {
    try {
      const accessScope = req.accessScope;
      if (!accessScope) {
        return res.status(401).json({
          success: false,
          message: 'Access scope tidak ditemukan'
        });
      }

      const limit = parseInt(req.query.limit as string) || 10;

      const result = await CatatanService.getRecentCatatan(accessScope, limit);

      return res.json({
        success: true,
        message: 'Catatan terbaru berhasil diambil',
        data: result.data,
        total: result.total
      });

    } catch (error: any) {
      console.error('Error in getRecentCatatan:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil catatan terbaru',
        error: error.message
      });
    }
  }
}