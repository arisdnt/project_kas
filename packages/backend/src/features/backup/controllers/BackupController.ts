/**
 * Backup Controller
 * Handles backup and export/import operations with access scope validation
 */

import { Request, Response } from 'express';
import { BackupService } from '../services/BackupService';
import { SearchBackupQuerySchema, CreateBackupJobSchema, UpdateBackupJobSchema, ExportRequestSchema } from '../models/BackupCore';
import fs from 'fs';

export class BackupController {
  static async searchBackupJobs(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = SearchBackupQuerySchema.parse(req.query);
      const result = await BackupService.searchBackupJobs(req.accessScope, query);

      return res.json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit: Number(query.limit)
        }
      });
    } catch (error: any) {
      console.error('Search backup jobs error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to search backup jobs'
      });
    }
  }

  static async findBackupJobById(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const job = await BackupService.findBackupJobById(req.accessScope, id);

      return res.json({ success: true, data: job });
    } catch (error: any) {
      console.error('Find backup job error:', error);
      if (error.message === 'Backup job not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getRunningBackups(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const backups = await BackupService.getRunningBackups(req.accessScope);
      return res.json({ success: true, data: backups });
    } catch (error: any) {
      console.error('Get running backups error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getBackupStats(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const stats = await BackupService.getBackupStats(req.accessScope);
      return res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('Get backup stats error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getDatabaseTables(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const tables = await BackupService.getDatabaseTables(req.accessScope);
      return res.json({ success: true, data: tables });
    } catch (error: any) {
      console.error('Get database tables error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async createBackupJob(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data = CreateBackupJobSchema.parse(req.body);
      const job = await BackupService.createBackupJob(req.accessScope, data);

      return res.status(201).json({ success: true, data: job });
    } catch (error: any) {
      console.error('Create backup job error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create backup job'
      });
    }
  }

  static async updateBackupJob(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const data = UpdateBackupJobSchema.parse(req.body);
      const result = await BackupService.updateBackupJob(req.accessScope, id, data);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update backup job error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update backup job'
      });
    }
  }

  static async executeBackup(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const result = await BackupService.executeBackup(req.accessScope, id);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Execute backup error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to execute backup'
      });
    }
  }

  static async createExport(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const request = ExportRequestSchema.parse(req.body);
      const job = await BackupService.createExport(req.accessScope, request);

      return res.status(201).json({
        success: true,
        data: job,
        message: 'Export job created and executed successfully'
      });
    } catch (error: any) {
      console.error('Create export error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create export'
      });
    }
  }

  static async downloadBackup(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const downloadInfo = await BackupService.downloadBackup(req.accessScope, id);

      // Check if file exists
      if (!fs.existsSync(downloadInfo.file_path)) {
        return res.status(404).json({
          success: false,
          message: 'Backup file not found on disk'
        });
      }

      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${downloadInfo.filename}"`);
      res.setHeader('Content-Type', downloadInfo.mime_type);

      // Stream the file
      const fileStream = fs.createReadStream(downloadInfo.file_path);
      fileStream.pipe(res);
      return; // Explicit return for successful file streaming

    } catch (error: any) {
      console.error('Download backup error:', error);
      if (error.message.includes('not found') || error.message.includes('not completed')) {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async cleanupExpiredBackups(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Only God and Admin users can cleanup expired backups
      if ((req.user.level || 5) > 2) {
        return res.status(403).json({ success: false, message: 'Insufficient permissions' });
      }

      const result = await BackupService.cleanupExpiredBackups();
      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Cleanup expired backups error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getSystemBackupStatus(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Only God and Admin users can view system status
      if ((req.user.level || 5) > 2) {
        return res.status(403).json({ success: false, message: 'Insufficient permissions' });
      }

      const status = await BackupService.getSystemBackupStatus();
      return res.json({ success: true, data: status });
    } catch (error: any) {
      console.error('Get system backup status error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}