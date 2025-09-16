/**
 * Audit Logger Service Module
 * Handles audit log creation and management
 */

import { ResultSetHeader } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { CreateAuditLog, AksiAudit } from '../../models/AuditLogCore';
import { v4 as uuidv4 } from 'uuid';

export class AuditLoggerService {
  static async log(data: CreateAuditLog) {
    try {
      const id = uuidv4();
      const now = new Date();

      const sql = `
        INSERT INTO audit_log (
          id, tenant_id, user_id, tabel, record_id, aksi,
          data_lama, data_baru, ip_address, user_agent, dibuat_pada
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        id,
        data.tenant_id,
        data.user_id || null,
        data.tabel,
        data.record_id || null,
        data.aksi,
        data.data_lama ? JSON.stringify(data.data_lama) : null,
        data.data_baru ? JSON.stringify(data.data_baru) : null,
        data.ip_address || null,
        data.user_agent || null,
        now
      ];

      await pool.execute<ResultSetHeader>(sql, params);
      return { id, logged: true };
    } catch (error) {
      console.error('Failed to log audit entry:', error);
      // Don't throw error to avoid breaking main functionality
      return { logged: false, error: error };
    }
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
    return this.log({
      tenant_id: tenantId,
      user_id: userId,
      tabel,
      record_id: recordId,
      aksi,
      data_lama: dataLama,
      data_baru: dataBaru,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  static async logSystemAction(
    tenantId: string,
    tabel: string,
    recordId: string | undefined,
    aksi: AksiAudit,
    dataLama?: any,
    dataBaru?: any
  ) {
    return this.log({
      tenant_id: tenantId,
      user_id: undefined, // System action
      tabel,
      record_id: recordId,
      aksi,
      data_lama: dataLama,
      data_baru: dataBaru
    });
  }

  static async cleanup(retentionDays: number = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const sql = `DELETE FROM audit_log WHERE dibuat_pada < ?`;
      const [result] = await pool.execute<ResultSetHeader>(sql, [cutoffDate]);

      return {
        success: true,
        deletedRows: result.affectedRows,
        cutoffDate
      };
    } catch (error) {
      console.error('Failed to cleanup audit logs:', error);
      return {
        success: false,
        error: error
      };
    }
  }
}