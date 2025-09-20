/**
 * Controller utama untuk berita
 * Menangani HTTP requests untuk operasi CRUD berita
 */

import { Request, Response } from 'express';
import { BeritaService } from '../services/BeritaService';
import { 
  CreateBeritaSchema, 
  UpdateBeritaSchema, 
  SearchBeritaQuerySchema 
} from '../models/BeritaCore';

export class BeritaController {
  /**
   * Pencarian berita dengan filter dan pagination
   */
  static async searchBerita(req: Request, res: Response): Promise<void> {
    try {
      // Validasi autentikasi dan access scope
      if (!req.user || !req.accessScope) {
        res.status(401).json({
          success: false,
          message: 'User tidak terautentikasi atau access scope tidak tersedia',
          data: null
        });
        return;
      }

      // Validasi query parameters
      const validatedQuery = SearchBeritaQuerySchema.parse({
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20
      });

      const result = await BeritaService.searchBerita(validatedQuery, req.accessScope!);

      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil data berita',
        data: result.data,
        pagination: {
          page: validatedQuery.page,
          limit: validatedQuery.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / validatedQuery.limit)
        }
      });
    } catch (error: any) {
      console.error('Error searching berita:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Gagal mengambil data berita',
        data: null
      });
    }
  }

  /**
   * Mendapatkan berita berdasarkan ID
   */
  static async findById(req: Request, res: Response): Promise<void> {
    try {
      // Validasi autentikasi dan access scope
      if (!req.user || !req.accessScope) {
        res.status(401).json({
          success: false,
          message: 'User tidak terautentikasi atau access scope tidak tersedia',
          data: null
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID berita wajib diisi',
          data: null
        });
        return;
      }

      const berita = await BeritaService.findById(id, req.accessScope!);

      if (!berita) {
        res.status(404).json({
          success: false,
          message: 'Berita tidak ditemukan',
          data: null
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil data berita',
        data: berita
      });
    } catch (error: any) {
      console.error('Error finding berita by ID:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengambil data berita',
        data: null
      });
    }
  }

  /**
   * Mendapatkan statistik berita
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      // Validasi autentikasi dan access scope
      if (!req.user || !req.accessScope) {
        res.status(401).json({
          success: false,
          message: 'User tidak terautentikasi atau access scope tidak tersedia',
          data: null
        });
        return;
      }

      const stats = await BeritaService.getStats(req.accessScope!);

      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil statistik berita',
        data: stats
      });
    } catch (error: any) {
      console.error('Error getting berita stats:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengambil statistik berita',
        data: null
      });
    }
  }

  /**
   * Membuat berita baru
   */
  static async createBerita(req: Request, res: Response): Promise<void> {
    try {
      // Validasi autentikasi dan access scope
      if (!req.user || !req.accessScope) {
        res.status(401).json({
          success: false,
          message: 'User tidak terautentikasi atau access scope tidak tersedia',
          data: null
        });
        return;
      }

      // Validasi data input
      const validatedData = CreateBeritaSchema.parse(req.body);

      const berita = await BeritaService.createBerita(validatedData, req.accessScope!);

      res.status(201).json({
        success: true,
        message: 'Berhasil membuat berita baru',
        data: berita
      });
    } catch (error: any) {
      console.error('Error creating berita:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Gagal membuat berita baru',
        data: null
      });
    }
  }

  /**
   * Mengupdate berita
   */
  static async updateBerita(req: Request, res: Response): Promise<void> {
    try {
      // Validasi autentikasi dan access scope
      if (!req.user || !req.accessScope) {
        res.status(401).json({
          success: false,
          message: 'User tidak terautentikasi atau access scope tidak tersedia',
          data: null
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID berita wajib diisi',
          data: null
        });
        return;
      }

      // Validasi data input
      const validatedData = UpdateBeritaSchema.parse(req.body);

      const berita = await BeritaService.updateBerita(id, validatedData, req.accessScope!);

      res.status(200).json({
        success: true,
        message: 'Berhasil mengupdate berita',
        data: berita
      });
    } catch (error: any) {
      console.error('Error updating berita:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Gagal mengupdate berita',
        data: null
      });
    }
  }

  /**
   * Menghapus berita
   */
  static async deleteBerita(req: Request, res: Response): Promise<void> {
    try {
      // Validasi autentikasi dan access scope
      if (!req.user || !req.accessScope) {
        res.status(401).json({
          success: false,
          message: 'User tidak terautentikasi atau access scope tidak tersedia',
          data: null
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID berita wajib diisi',
          data: null
        });
        return;
      }

      await BeritaService.deleteBerita(id, req.accessScope!);

      res.status(200).json({
        success: true,
        message: 'Berhasil menghapus berita',
        data: null
      });
    } catch (error: any) {
      console.error('Error deleting berita:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Gagal menghapus berita',
        data: null
      });
    }
  }

  /**
   * Mendapatkan berita aktif untuk tampilan publik
   */
  static async getActiveNews(req: Request, res: Response): Promise<void> {
    try {
      // Validasi autentikasi dan access scope
      if (!req.user || !req.accessScope) {
        res.status(401).json({
          success: false,
          message: 'User tidak terautentikasi atau access scope tidak tersedia',
          data: null
        });
        return;
      }

      const berita = await BeritaService.getActiveNews(req.accessScope!);

      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil berita aktif',
        data: berita
      });
    } catch (error: any) {
      console.error('Error getting active news:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengambil berita aktif',
        data: null
      });
    }
  }

  /**
   * Mendapatkan data dashboard berita
   */
  static async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      // Validasi autentikasi dan access scope
      if (!req.user || !req.accessScope) {
        res.status(401).json({
          success: false,
          message: 'User tidak terautentikasi atau access scope tidak tersedia',
          data: null
        });
        return;
      }

      const dashboard = await BeritaService.getDashboardBerita(req.accessScope!);

      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil data dashboard berita',
        data: dashboard
      });
    } catch (error: any) {
      console.error('Error getting berita dashboard:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengambil data dashboard berita',
        data: null
      });
    }
  }
}