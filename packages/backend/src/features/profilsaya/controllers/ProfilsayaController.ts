/**
 * Profil Saya Controller
 * Handles profil saya operations with access scope validation
 */

import { Request, Response } from 'express';
import { ProfilsayaService } from '../services/ProfilsayaService';
import {
  DetailUserQuerySchema,
  CreateDetailUserSchema,
  UpdateDetailUserSchema
} from '../models/ProfilsayaCore';
import { z } from 'zod';

// Additional validation schemas
const UserIdParamSchema = z.object({
  userId: z.string().uuid()
});

const IdParamSchema = z.object({
  id: z.string().uuid()
});

export class ProfilsayaController {
  // GET /detail-users - Get all detail users with pagination and filtering
  static async getAllDetailUsers(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Check permission - only admin and above can view all detail users
      if (req.accessScope.level && req.accessScope.level > 2) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to view detail users'
        });
      }

      // Parse query parameters dengan konversi tipe data
      const queryParams = {
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
      };
      const query = DetailUserQuerySchema.parse(queryParams);
      const result = await ProfilsayaService.getAllDetailUsers(req.accessScope, query);

      return res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error: any) {
      console.error('Get all detail users error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to get detail users'
      });
    }
  }

  // GET /detail-users/:id - Get detail user by ID
  static async getDetailUserById(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = IdParamSchema.parse(req.params);

      // Check if user can view this detail user
      // Admin and above can view all, others can only view their own
      if (req.accessScope.level && req.accessScope.level > 2) {
        // Check if this is their own detail user
        const detailUser = await ProfilsayaService.getDetailUserByUserId(req.accessScope, req.user.id);
        if (!detailUser || detailUser.id !== id) {
          return res.status(403).json({
            success: false,
            message: 'Insufficient permissions to view this detail user'
          });
        }
      }

      const detailUser = await ProfilsayaService.getDetailUserById(req.accessScope, id);

      if (!detailUser) {
        return res.status(404).json({
          success: false,
          message: 'Detail user not found'
        });
      }

      return res.json({ success: true, data: detailUser });
    } catch (error: any) {
      console.error('Get detail user by ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // GET /detail-users/user/:userId - Get detail user by user ID
  static async getDetailUserByUserId(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { userId } = UserIdParamSchema.parse(req.params);

      // Check if user can view this detail user
      // Admin and above can view all, others can only view their own
      if (req.accessScope.level && req.accessScope.level > 2 && userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to view this detail user'
        });
      }

      const detailUser = await ProfilsayaService.getDetailUserByUserId(req.accessScope, userId);

      if (!detailUser) {
        return res.status(404).json({
          success: false,
          message: 'Detail user not found'
        });
      }

      return res.json({ success: true, data: detailUser });
    } catch (error: any) {
      console.error('Get detail user by user ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // GET /detail-users/stats - Get detail user statistics
  static async getDetailUserStats(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Only admin and above can view stats
      if (req.accessScope.level && req.accessScope.level > 2) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to view detail user statistics'
        });
      }

      const stats = await ProfilsayaService.getDetailUserStats(req.accessScope);
      return res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('Get detail user stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // GET /detail-users/departments - Get detail users by department/store
  static async getDetailUsersByDepartment(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Only admin and above can view department breakdown
      if (req.accessScope.level && req.accessScope.level > 2) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to view department breakdown'
        });
      }

      const departments = await ProfilsayaService.getDetailUsersByDepartment(req.accessScope);
      return res.json({ success: true, data: departments });
    } catch (error: any) {
      console.error('Get detail users by department error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // POST /detail-users - Create new detail user
  static async createDetailUser(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Only admin and above can create detail users
      if (req.accessScope.level && req.accessScope.level > 2) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to create detail users'
        });
      }

      const data = CreateDetailUserSchema.parse(req.body);

      // Validate that the user exists and belongs to the same tenant
      const userExists = await ProfilsayaService.validateUserExists(req.accessScope, data.user_id);
      if (!userExists) {
        return res.status(400).json({
          success: false,
          message: 'User not found or access denied'
        });
      }

      // Validate email uniqueness if provided
      if (data.email) {
        const emailUnique = await ProfilsayaService.validateEmailUnique(req.accessScope, data.email);
        if (!emailUnique) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists'
          });
        }
      }

      const detailUser = await ProfilsayaService.createDetailUser(req.accessScope, data);

      return res.status(201).json({ success: true, data: detailUser });
    } catch (error: any) {
      console.error('Create detail user error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create detail user'
      });
    }
  }

  // PUT /detail-users/:id - Update detail user
  static async updateDetailUser(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = IdParamSchema.parse(req.params);

      // Check if user can update this detail user
      // Admin and above can update all, others can only update their own
      if (req.accessScope.level && req.accessScope.level > 2) {
        const detailUser = await ProfilsayaService.getDetailUserByUserId(req.accessScope, req.user.id);
        if (!detailUser || detailUser.id !== id) {
          return res.status(403).json({
            success: false,
            message: 'Insufficient permissions to update this detail user'
          });
        }
      }

      const data = UpdateDetailUserSchema.parse(req.body);

      // Validate email uniqueness if being updated
      if (data.email) {
        const emailUnique = await ProfilsayaService.validateEmailUnique(req.accessScope, data.email, id);
        if (!emailUnique) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists'
          });
        }
      }

      const detailUser = await ProfilsayaService.updateDetailUser(req.accessScope, id, data);

      return res.json({ success: true, data: detailUser });
    } catch (error: any) {
      console.error('Update detail user error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update detail user'
      });
    }
  }

  // DELETE /detail-users/:id - Delete detail user
  static async deleteDetailUser(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Only admin and above can delete detail users
      if (req.accessScope.level && req.accessScope.level > 2) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to delete detail users'
        });
      }

      const { id } = IdParamSchema.parse(req.params);

      const success = await ProfilsayaService.deleteDetailUser(req.accessScope, id);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Detail user not found'
        });
      }

      return res.json({
        success: true,
        message: 'Detail user deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete detail user error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete detail user'
      });
    }
  }

  // GET /detail-users/me - Get current user's detail user
  static async getMyDetailUser(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const detailUser = await ProfilsayaService.getDetailUserByUserId(req.accessScope, req.user.id);

      if (!detailUser) {
        return res.status(404).json({
          success: false,
          message: 'Detail user not found'
        });
      }

      return res.json({ success: true, data: detailUser });
    } catch (error: any) {
      console.error('Get my detail user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // PUT /detail-users/me - Update current user's detail user
  static async updateMyDetailUser(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Get current user's detail user
      const currentDetailUser = await ProfilsayaService.getDetailUserByUserId(req.accessScope, req.user.id);
      if (!currentDetailUser) {
        return res.status(404).json({
          success: false,
          message: 'Detail user not found'
        });
      }

      const data = UpdateDetailUserSchema.parse(req.body);

      // Validate email uniqueness if being updated
      if (data.email) {
        const emailUnique = await ProfilsayaService.validateEmailUnique(req.accessScope, data.email, currentDetailUser.id);
        if (!emailUnique) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists'
          });
        }
      }

      const detailUser = await ProfilsayaService.updateDetailUser(req.accessScope, currentDetailUser.id, data);

      return res.json({ success: true, data: detailUser });
    } catch (error: any) {
      console.error('Update my detail user error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update detail user'
      });
    }
  }
}