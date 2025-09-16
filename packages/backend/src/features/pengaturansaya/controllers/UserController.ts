/**
 * User Controller untuk Pengaturan Saya
 * Controller untuk mengelola data user yang sedang login
 */

import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { 
  ChangePasswordSchema, 
  UpdateUserProfileSchema,
  ApiResponse 
} from '../models/User';
import { AuthenticatedUser } from '@/features/auth/models/User';
import { logger } from '@/core/utils/logger';

// Extend Request interface untuk user context
interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export class UserController {
  /**
   * Mendapatkan data user yang sedang login
   */
  static async getCurrentUser(req: AuthenticatedRequest, res: Response) {
    try {
      // Validasi user context dari middleware auth
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User tidak terautentikasi'
        } as ApiResponse);
      }

      // Ambil data user
      const user = await UserService.getCurrentUser({
        id: req.user.id,
        tenant_id: req.user.tenantId,
        toko_id: req.user.tokoId,
        peran_id: req.user.peranId,
        username: req.user.username,
        status: req.user.status
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Data user tidak ditemukan'
        } as ApiResponse);
      }

      return res.json({
        success: true,
        message: 'Data user berhasil diambil',
        data: user
      } as ApiResponse);
      
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id,
        ip: req.ip
      }, 'Get current user failed');
      
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Gagal mengambil data user'
      } as ApiResponse);
    }
  }

  /**
   * Ubah password user
   */
  static async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      // Validasi user context
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User tidak terautentikasi'
        } as ApiResponse);
      }

      // Validasi request body
      const passwordData = ChangePasswordSchema.parse(req.body);
      
      // Ubah password
      const success = await UserService.changePassword(
        req.user.id,
        req.user.tenantId,
        passwordData
      );
      
      if (!success) {
        return res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'Gagal mengubah password'
        } as ApiResponse);
      }

      return res.json({
        success: true,
        message: 'Password berhasil diubah',
        data: null
      } as ApiResponse);
      
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id,
        ip: req.ip
      }, 'Change password failed');
      
      if (error instanceof Error) {
        if (error.message.includes('Password saat ini tidak benar')) {
          return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: error.message
          } as ApiResponse);
        }
        
        if (error.message.includes('tidak memenuhi kriteria keamanan')) {
          return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: error.message
          } as ApiResponse);
        }
      }
      
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Gagal mengubah password'
      } as ApiResponse);
    }
  }
}