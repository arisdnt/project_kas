/**
 * Audit Service Orchestrator
 * Main service that coordinates audit log operations
 */

import { AccessScope } from '@/core/middleware/accessScope';
import { SearchAuditQuery, CreateAuditLog, AksiAudit } from '../models/AuditLogCore';
import { AuditQueryService } from './modules/AuditQueryService';
import { AuditLoggerService } from './modules/AuditLoggerService';

export class AuditService {
  // Query operations
  static async search(scope: AccessScope, query: SearchAuditQuery) {
    return AuditQueryService.search(scope, query);
  }

  static async findById(scope: AccessScope, id: string) {
    const auditLog = await AuditQueryService.findById(scope, id);
    if (!auditLog) {
      throw new Error('Audit log not found');
    }
    return auditLog;
  }

  static async getActivitySummary(scope: AccessScope, startDate: string, endDate: string) {
    return AuditQueryService.getActivitySummary(scope, startDate, endDate);
  }

  static async getUserActivity(scope: AccessScope, userId: string, startDate: string, endDate: string) {
    return AuditQueryService.getUserActivity(scope, userId, startDate, endDate);
  }

  // Logging operations
  static async log(data: CreateAuditLog) {
    return AuditLoggerService.log(data);
  }

  static async logUserAction(
    tenantId: string,
    userId: string,
    tabel: string,
    recordId: string | undefined,
    aksi: AksiAudit,
    dataLama?: any,
    dataBaru?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    return AuditLoggerService.logUserAction(
      tenantId,
      userId,
      tabel,
      recordId,
      aksi,
      dataLama,
      dataBaru,
      ipAddress,
      userAgent
    );
  }

  static async logSystemAction(
    tenantId: string,
    tabel: string,
    recordId: string | undefined,
    aksi: AksiAudit,
    dataLama?: any,
    dataBaru?: any
  ) {
    return AuditLoggerService.logSystemAction(
      tenantId,
      tabel,
      recordId,
      aksi,
      dataLama,
      dataBaru
    );
  }

  // Maintenance operations
  static async cleanup(retentionDays: number = 90) {
    return AuditLoggerService.cleanup(retentionDays);
  }
}