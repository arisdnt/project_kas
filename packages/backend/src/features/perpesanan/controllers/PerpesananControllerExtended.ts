/**
 * Perpesanan Controller Extended
 * Controller tambahan untuk fitur lanjutan perpesanan
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { PerpesananService } from '../services/PerpesananService';
import { MarkAsReadSchema } from '../models/PerpesananCore';
import { AccessScope } from '@/core/middleware/accessScope';

export class PerpesananControllerExtended {
  /**
   * Menandai pesan sebagai dibaca
   */
  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const accessScope = req.accessScope as AccessScope;
      
      // Validasi request body
      const bodyValidation = MarkAsReadSchema.safeParse(req.body);
      if (!bodyValidation.success) {
        res.status(400).json({
          success: false,
          message: 'Data tidak valid',
          errors: bodyValidation.error.errors
        });
        return;
      }

      const result = await PerpesananService.markAsRead(
        bodyValidation.data,
        accessScope
      );

      res.json({
        success: true,
        message: `${result.updated_count} pesan berhasil ditandai sebagai dibaca`,
        data: result
      });
    } catch (error) {
      console.error('Error in markAsRead:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menandai pesan sebagai dibaca'
      });
    }
  }

  /**
   * Menghapus pesan
   */
  static async deletePerpesanan(req: Request, res: Response): Promise<void> {
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

      const result = await PerpesananService.deletePerpesanan(id, accessScope);

      if (!result.success) {
        res.status(404).json({
          success: false,
          message: 'Pesan tidak ditemukan atau tidak dapat dihapus'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Pesan berhasil dihapus'
      });
    } catch (error) {
      console.error('Error in deletePerpesanan:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus pesan'
      });
    }
  }

  /**
   * Membalas pesan
   */
  static async replyPerpesanan(req: Request, res: Response): Promise<void> {
    try {
      const accessScope = req.accessScope as AccessScope;
      const { id } = req.params;
      const { pesan } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID pesan harus disediakan'
        });
        return;
      }

      if (!pesan || typeof pesan !== 'string' || pesan.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Pesan balasan harus disediakan'
        });
        return;
      }

      if (pesan.length > 5000) {
        res.status(400).json({
          success: false,
          message: 'Pesan balasan maksimal 5000 karakter'
        });
        return;
      }

      const reply = await PerpesananService.replyPerpesanan(
        id,
        pesan.trim(),
        accessScope
      );

      res.status(201).json({
        success: true,
        message: 'Balasan berhasil dikirim',
        data: reply
      });
    } catch (error) {
      console.error('Error in replyPerpesanan:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengirim balasan'
      });
    }
  }

  /**
   * Mendapatkan daftar konversasi
   */
  static async getConversations(req: Request, res: Response): Promise<void> {
    try {
      const accessScope = req.accessScope as AccessScope;
      
      const conversations = await PerpesananService.getConversations(accessScope);

      res.json({
        success: true,
        message: 'Daftar konversasi berhasil diambil',
        data: conversations
      });
    } catch (error) {
      console.error('Error in getConversations:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil daftar konversasi'
      });
    }
  }

  /**
   * Mendapatkan riwayat pesan dengan user tertentu
   */
  static async getConversationHistory(req: Request, res: Response): Promise<void> {
    try {
      const accessScope = req.accessScope as AccessScope;
      const { partnerId } = req.params;
      const { page = '1', limit = '20' } = req.query;

      if (!partnerId) {
        res.status(400).json({
          success: false,
          message: 'ID partner harus disediakan'
        });
        return;
      }

      // Validasi UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(partnerId)) {
        res.status(400).json({
          success: false,
          message: 'ID partner harus berupa UUID yang valid'
        });
        return;
      }

      const result = await PerpesananService.getConversationHistory(
        partnerId,
        accessScope,
        page as string,
        limit as string
      );

      res.json({
        success: true,
        message: 'Riwayat konversasi berhasil diambil',
        data: result.data,
        pagination: {
          total: result.total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total_pages: Math.ceil(result.total / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error('Error in getConversationHistory:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil riwayat konversasi'
      });
    }
  }

  /**
   * Mendapatkan jumlah pesan belum dibaca
   */
  static async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const accessScope = req.accessScope as AccessScope;
      
      const stats = await PerpesananService.getStats(accessScope);

      res.json({
        success: true,
        message: 'Jumlah pesan belum dibaca berhasil diambil',
        data: {
          unread_count: stats.pesan_belum_dibaca
        }
      });
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil jumlah pesan belum dibaca'
      });
    }
  }
}