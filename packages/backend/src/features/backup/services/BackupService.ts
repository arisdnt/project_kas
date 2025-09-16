/**
 * Backup Service Orchestrator
 * Main service that coordinates backup and export/import operations
 */

import { AccessScope } from '@/core/middleware/accessScope';
import { SearchBackupQuery, CreateBackupJob, UpdateBackupJob, ExportRequest } from '../models/BackupCore';
import { BackupQueryService } from './modules/BackupQueryService';
import { BackupMutationService } from './modules/BackupMutationService';

export class BackupService {
  // Query operations
  static async searchBackupJobs(scope: AccessScope, query: SearchBackupQuery) {
    return BackupQueryService.searchBackupJobs(scope, query);
  }

  static async findBackupJobById(scope: AccessScope, id: string) {
    const job = await BackupQueryService.findBackupJobById(scope, id);
    if (!job) {
      throw new Error('Backup job not found');
    }
    return job;
  }

  static async getRunningBackups(scope: AccessScope) {
    return BackupQueryService.getRunningBackups(scope);
  }

  static async getBackupStats(scope: AccessScope) {
    return BackupQueryService.getBackupStats(scope);
  }

  static async getDatabaseTables(scope: AccessScope) {
    return BackupQueryService.getDatabaseTables(scope);
  }

  // Mutation operations
  static async createBackupJob(scope: AccessScope, data: CreateBackupJob) {
    // Periksa izin berdasarkan level user
    if ((scope.level || 5) > 2) {
      throw new Error('Insufficient permissions to create backup');
    }

    // Auto-set tenant and user if not provided
    if (!data.tenant_id) {
      data.tenant_id = scope.tenantId;
    }
    if (!data.user_id) {
      data.user_id = scope.tenantId || '';
    }

    // Validate include/exclude tables exist
    if (data.include_tables) {
      const availableTables = await this.getDatabaseTables(scope);
      const invalidTables = data.include_tables.filter(table => !availableTables.includes(table));
      if (invalidTables.length > 0) {
        throw new Error(`Invalid tables: ${invalidTables.join(', ')}`);
      }
    }

    return BackupMutationService.createBackupJob(scope, data);
  }

  static async updateBackupJob(scope: AccessScope, id: string, data: UpdateBackupJob) {
    return BackupMutationService.updateBackupJob(scope, id, data);
  }

  static async executeBackup(scope: AccessScope, jobId: string) {
    // Periksa izin eksekusi berdasarkan level user
    if ((scope.level || 5) > 2) {
      throw new Error('Insufficient permissions to execute backup');
    }

    return BackupMutationService.executeBackup(scope, jobId);
  }

  static async createExport(scope: AccessScope, request: ExportRequest) {
    if ((scope.level || 5) > 3) {
      throw new Error('Insufficient permissions to create exports');
    }

    // Validate tables exist
    const availableTables = await this.getDatabaseTables(scope);
    const invalidTables = request.tables.filter(table => !availableTables.includes(table));
    if (invalidTables.length > 0) {
      throw new Error(`Invalid tables: ${invalidTables.join(', ')}`);
    }

    const job = await BackupMutationService.createExportJob(scope, request);

    // Auto-execute the export
    try {
      await this.executeBackup(scope, job.id);
      return job;
    } catch (error: any) {
      throw new Error(`Export creation failed: ${error?.message || 'Unknown error'}`);
    }
  }

  static async downloadBackup(scope: AccessScope, jobId: string) {
    const job = await this.findBackupJobById(scope, jobId);

    if (job.status !== 'completed') {
      throw new Error('Backup is not completed yet');
    }

    if (!job.file_path) {
      throw new Error('Backup file not found');
    }

    return {
      file_path: job.file_path,
      filename: `${job.nama}.${job.format}`,
      mime_type: this.getMimeType(job.format)
    };
  }

  static async cleanupExpiredBackups() {
    return BackupMutationService.deleteExpiredBackups();
  }

  // Helper methods
  private static getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      'sql': 'application/sql',
      'json': 'application/json',
      'csv': 'text/csv',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };

    return mimeTypes[format] || 'application/octet-stream';
  }

  static async getSystemBackupStatus() {
    // Get overall system backup health
    const runningBackups = await BackupQueryService.getRunningBackups({
      tenantId: 'system',
      level: 1,
      storeId: undefined,
      role: 'ADMIN' as any,
      isGod: true,
      enforceTenant: false,
      enforceStore: false
    } as AccessScope);

    const expiredBackups = await BackupQueryService.getExpiredBackups();

    return {
      running_jobs: runningBackups.length,
      expired_backups: expiredBackups.length,
      system_health: runningBackups.length < 5 && expiredBackups.length < 10 ? 'healthy' : 'warning'
    };
  }
}