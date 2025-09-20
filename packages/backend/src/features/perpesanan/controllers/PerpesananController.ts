/**
 * Perpesanan Controller
 * Menangani HTTP requests untuk fitur perpesanan
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { PerpesananService } from '../services/PerpesananService';
import { 
  SearchPerpesananSchema,
  CreatePerpesananSchema,
  UpdatePerpesananSchema,
  MarkAsReadSchema
} from '../models/PerpesananCore';
import { AccessScope } from '@/core/middleware/accessScope';

export class PerpesananController {
  /**
   * Mendapatkan daftar pesan dengan pagination dan filter
   */
  static async searchPerpesanan(req: Request, res: Response): Promise<void> {
    try {
      const accessScope = req.accessScope as AccessScope;
      
      // Validasi query parameters
      const queryValidation = SearchPerpesananSchema.safeParse(req.query);
      if (!queryValidation.success) {
        res.status(400).json({
          success: false,
          message: 'Parameter query tidak valid',
          errors: queryValidation.error.errors
        });
        return;
      }

      const result = await PerpesananService.searchPerpesanan(
        queryValidation.data,
        accessScope
      );

      res.json({
        success: true,
        message: 'Data pesan berhasil diambil',
        data: result.data,
        pagination: {
          total: result.total,
          page: parseInt(queryValidation.data.page || '1'),
          limit: parseInt(queryValidation.data.limit || '10'),
          total_pages: Math.ceil(result.total / parseInt(queryValidation.data.limit || '10'))
        }
      });
    } catch (error) {
      console.error('Error in searchPerpesanan:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data pesan'
      });
    }
  }

  /**
   * Mendapatkan pesan berdasarkan ID
   */
  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const accessScope = req.accessScope as AccessScope;
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID pesan harus disediakan'
        });
        return;
      }

      const pesan = await PerpesananService.findById(id, accessScope);

      if (!pesan) {
        res.status(404).json({
          success: false,
          message: 'Pesan tidak ditemukan'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Data pesan berhasil diambil',
        data: pesan
      });
    } catch (error) {
      console.error('Error in findById:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data pesan'
      });
    }
  }

  /**
   * Mendapatkan statistik pesan
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const accessScope = req.accessScope as AccessScope;
      
      const stats = await PerpesananService.getStats(accessScope);

      res.json({
        success: true,
        message: 'Statistik pesan berhasil diambil',
        data: stats
      });
    } catch (error) {
      console.error('Error in getStats:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil statistik pesan'
      });
    }
  }

  /**
   * Membuat pesan baru
   */
  static async createPerpesanan(req: Request, res: Response): Promise<void> {
    try {
      const accessScope = req.accessScope as AccessScope;
      
      // Validasi request body
      const bodyValidation = CreatePerpesananSchema.safeParse(req.body);
      if (!bodyValidation.success) {
        res.status(400).json({
          success: false,
          message: 'Data pesan tidak valid',
          errors: bodyValidation.error.errors
        });
        return;
      }

      const pesan = await PerpesananService.createPerpesanan(
        bodyValidation.data,
        accessScope
      );

      res.status(201).json({
        success: true,
        message: 'Pesan berhasil dibuat',
        data: pesan
      });
    } catch (error) {
      console.error('Error in createPerpesanan:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat membuat pesan'
      });
    }
  }

  /**
   * Update pesan
   */
  static async updatePerpesanan(req: Request, res: Response): Promise<void> {
    try {
      const accessScope = req.accessScope as AccessScope;
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID pesan harus disediakan'
        });
        return;
      }

      // Validasi request body
      const bodyValidation = UpdatePerpesananSchema.safeParse(req.body);
      if (!bodyValidation.success) {
        res.status(400).json({
          success: false,
          message: 'Data update tidak valid',
          errors: bodyValidation.error.errors
        });
        return;
      }

      const pesan = await PerpesananService.updatePerpesanan(
        id,
        bodyValidation.data,
        accessScope
      );

      res.json({
        success: true,
        message: 'Pesan berhasil diupdate',
        data: pesan
      });
    } catch (error) {
      console.error('Error in updatePerpesanan:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengupdate pesan'
      });
    }
  }
}