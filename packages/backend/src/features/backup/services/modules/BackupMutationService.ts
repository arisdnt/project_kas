/**
 * Backup Mutation Service Module
 * Handles backup job creation and execution operations
 */

import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2/promise';
import { pool } from '@/core/database/connection';
import { AccessScope } from '@/core/middleware/accessScope';
import { CreateBackupJob, UpdateBackupJob, ExportRequest, CreateImportJob } from '../../models/BackupCore';
import fs from 'fs/promises';
import path from 'path';

export class BackupMutationService {
  static async createBackupJob(scope: AccessScope, data: CreateBackupJob) {
    if (!scope.storeId && data.tipe === 'incremental') {
      throw new Error('Store ID is required for incremental backups');
    }

    const id = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Default 30 days retention

    const sql = `
      INSERT INTO backup_job (
        id, tenant_id, toko_id, user_id, nama, tipe, status, format,
        include_tables, exclude_tables, compression, expires_at,
        dibuat_pada, diperbarui_pada
      ) VALUES (
        ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, NOW(), NOW()
      )
    `;

    const params = [
      id, data.tenant_id, data.toko_id || null, data.user_id,
      data.nama, data.tipe, data.format,
      data.include_tables ? JSON.stringify(data.include_tables) : null,
      data.exclude_tables ? JSON.stringify(data.exclude_tables) : null,
      data.compression ? 1 : 0, data.expires_at || expiresAt
    ];

    await pool.execute(sql, params);

    // Return created job
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM backup_job WHERE id = ?',
      [id]
    );

    return rows[0];
  }

  static async updateBackupJob(scope: AccessScope, id: string, data: UpdateBackupJob) {
    // Check if backup job exists and user has access
    const checkSql = `
      SELECT id FROM backup_job
      WHERE id = ? AND tenant_id = ? ${scope.storeId ? 'AND (toko_id IS NULL OR toko_id = ?)' : ''}
    `;
    const checkParams = scope.storeId ? [id, scope.tenantId, scope.storeId] : [id, scope.tenantId];
    const [checkRows] = await pool.execute<RowDataPacket[]>(checkSql, checkParams);

    if (checkRows.length === 0) {
      throw new Error('Backup job not found or access denied');
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }

    if (data.progress_persen !== undefined) {
      updates.push('progress_persen = ?');
      params.push(data.progress_persen);
    }

    if (data.file_path !== undefined) {
      updates.push('file_path = ?');
      params.push(data.file_path);
    }

    if (data.file_size !== undefined) {
      updates.push('file_size = ?');
      params.push(data.file_size);
    }

    if (data.error_message !== undefined) {
      updates.push('error_message = ?');
      params.push(data.error_message);
    }

    if (data.started_at !== undefined) {
      updates.push('started_at = ?');
      params.push(data.started_at);
    }

    if (data.completed_at !== undefined) {
      updates.push('completed_at = ?');
      params.push(data.completed_at);
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push('diperbarui_pada = NOW()');
    const sql = `UPDATE backup_job SET ${updates.join(', ')} WHERE id = ?`;
    params.push(id);

    await pool.execute(sql, params);

    // Return updated job
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM backup_job WHERE id = ?',
      [id]
    );

    return rows[0];
  }

  static async executeBackup(scope: AccessScope, jobId: string) {
    // Get job details
    const [jobRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM backup_job WHERE id = ? AND tenant_id = ?',
      [jobId, scope.tenantId]
    );

    if (jobRows.length === 0) {
      throw new Error('Backup job not found');
    }

    const job = jobRows[0];

    try {
      // Update job status to running
      await this.updateBackupJob(scope, jobId, {
        status: 'running',
        started_at: new Date(),
        progress_persen: 0
      });

      // Create backup directory if it doesn't exist
      const backupDir = path.join(process.cwd(), 'backups', scope.tenantId);
      await fs.mkdir(backupDir, { recursive: true });

      const filename = `${job.nama}_${new Date().toISOString().replace(/[:.]/g, '-')}.${job.format}`;
      const filePath = path.join(backupDir, filename);

      // Execute backup based on type and format
      await this.performBackup(scope, job, filePath);

      // Get file size
      const stats = await fs.stat(filePath);

      // Update job as completed
      await this.updateBackupJob(scope, jobId, {
        status: 'completed',
        completed_at: new Date(),
        progress_persen: 100,
        file_path: filePath,
        file_size: stats.size
      });

      return { success: true, file_path: filePath, file_size: stats.size };
    } catch (error: any) {
      // Update job as failed
      await this.updateBackupJob(scope, jobId, {
        status: 'failed',
        completed_at: new Date(),
        error_message: error.message
      });

      throw error;
    }
  }

  private static async performBackup(scope: AccessScope, job: any, filePath: string) {
    const connection = await pool.getConnection();

    try {
      let tables = [];

      if (job.include_tables) {
        tables = JSON.parse(job.include_tables);
      } else {
        // Get all tenant-specific tables
        const [tableRows] = await connection.execute<RowDataPacket[]>(
          `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'`
        );
        tables = tableRows.map(row => row.TABLE_NAME);
      }

      if (job.exclude_tables) {
        const excludeTables = JSON.parse(job.exclude_tables);
        tables = tables.filter((table: string) => !excludeTables.includes(table));
      }

      if (job.format === 'sql') {
        await this.createSQLBackup(connection, scope, tables, filePath, job.tipe);
      } else if (job.format === 'json') {
        await this.createJSONBackup(connection, scope, tables, filePath);
      } else if (job.format === 'csv') {
        await this.createCSVBackup(connection, scope, tables, filePath);
      }

      // Compress if requested
      if (job.compression) {
        // Implementation would compress the file
        // For now, just note that compression is requested
      }

    } finally {
      connection.release();
    }
  }

  private static async createSQLBackup(connection: any, scope: AccessScope, tables: string[], filePath: string, tipe: string) {
    let sqlContent = `-- Backup created at ${new Date().toISOString()}\n`;
    sqlContent += `-- Tenant: ${scope.tenantId}\n`;
    sqlContent += `-- Type: ${tipe}\n\n`;

    for (const table of tables) {
      // Add table structure if needed
      if (tipe === 'full' || tipe === 'structure_only') {
        const [createRows] = await connection.execute(`SHOW CREATE TABLE ${table}`);
        sqlContent += `-- Structure for table ${table}\n`;
        sqlContent += `DROP TABLE IF EXISTS \`${table}\`;\n`;
        sqlContent += `${createRows[0]['Create Table']};\n\n`;
      }

      // Add data if needed
      if (tipe === 'full' || tipe === 'data_only' || tipe === 'incremental') {
        let dataQuery = `SELECT * FROM ${table}`;

        // Add tenant filtering where applicable
        const [columns] = await connection.execute(`SHOW COLUMNS FROM ${table}`);
        const hasTenanId = columns.some((col: any) => col.Field === 'tenant_id');

        if (hasTenanId) {
          dataQuery += ` WHERE tenant_id = '${scope.tenantId}'`;
          if (scope.storeId && columns.some((col: any) => col.Field === 'toko_id')) {
            dataQuery += ` AND (toko_id IS NULL OR toko_id = '${scope.storeId}')`;
          }
        }

        const [dataRows] = await connection.execute(dataQuery);

        if (dataRows.length > 0) {
          sqlContent += `-- Data for table ${table}\n`;
          for (const row of dataRows) {
            const values = Object.values(row).map(val =>
              val === null ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`
            ).join(', ');
            sqlContent += `INSERT INTO \`${table}\` VALUES (${values});\n`;
          }
          sqlContent += '\n';
        }
      }
    }

    await fs.writeFile(filePath, sqlContent);
  }

  private static async createJSONBackup(connection: any, scope: AccessScope, tables: string[], filePath: string) {
    const backupData: any = {
      metadata: {
        created_at: new Date().toISOString(),
        tenant_id: scope.tenantId,
        store_id: scope.storeId,
        tables: tables
      },
      data: {}
    };

    for (const table of tables) {
      let query = `SELECT * FROM ${table}`;

      // Add tenant filtering
      const [columns] = await connection.execute(`SHOW COLUMNS FROM ${table}`);
      const hasTenanId = columns.some((col: any) => col.Field === 'tenant_id');

      if (hasTenanId) {
        query += ` WHERE tenant_id = '${scope.tenantId}'`;
        if (scope.storeId && columns.some((col: any) => col.Field === 'toko_id')) {
          query += ` AND (toko_id IS NULL OR toko_id = '${scope.storeId}')`;
        }
      }

      const [rows] = await connection.execute(query);
      backupData.data[table] = rows;
    }

    await fs.writeFile(filePath, JSON.stringify(backupData, null, 2));
  }

  private static async createCSVBackup(connection: any, scope: AccessScope, tables: string[], filePath: string) {
    // For CSV, create a zip file with multiple CSV files
    const csvData: any = {};

    for (const table of tables) {
      let query = `SELECT * FROM ${table}`;

      const [columns] = await connection.execute(`SHOW COLUMNS FROM ${table}`);
      const hasTenanId = columns.some((col: any) => col.Field === 'tenant_id');

      if (hasTenanId) {
        query += ` WHERE tenant_id = '${scope.tenantId}'`;
        if (scope.storeId && columns.some((col: any) => col.Field === 'toko_id')) {
          query += ` AND (toko_id IS NULL OR toko_id = '${scope.storeId}')`;
        }
      }

      const [rows] = await connection.execute(query);

      if (rows.length > 0) {
        const headers = Object.keys(rows[0]).join(',');
        const csvRows = rows.map((row: any) =>
          Object.values(row).map(val =>
            val === null ? '' : `"${String(val).replace(/"/g, '""')}"`
          ).join(',')
        );
        csvData[table] = [headers, ...csvRows].join('\n');
      }
    }

    // For simplicity, write as single CSV with table separators
    let csvContent = '';
    for (const [table, data] of Object.entries(csvData)) {
      csvContent += `-- Table: ${table}\n${data}\n\n`;
    }

    await fs.writeFile(filePath, csvContent);
  }

  static async createExportJob(scope: AccessScope, request: ExportRequest) {
    const id = uuidv4();

    const backupData: CreateBackupJob = {
      tenant_id: scope.tenantId,
      toko_id: scope.storeId,
      user_id: scope.tenantId || '',
      nama: request.nama,
      tipe: 'data_only',
      format: request.format as any,
      include_tables: request.tables,
      compression: request.compression
    };

    return this.createBackupJob(scope, backupData);
  }

  static async deleteExpiredBackups() {
    const sql = `
      SELECT id, file_path FROM backup_job
      WHERE expires_at IS NOT NULL AND expires_at < NOW() AND status = 'completed'
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql);

    let deleted = 0;
    for (const row of rows) {
      try {
        // Delete file if it exists
        if (row.file_path) {
          await fs.unlink(row.file_path);
        }

        // Delete database record
        await pool.execute('DELETE FROM backup_job WHERE id = ?', [row.id]);
        deleted++;
      } catch (error) {
        console.error(`Failed to delete backup ${row.id}:`, error);
      }
    }

    return { deleted };
  }
}