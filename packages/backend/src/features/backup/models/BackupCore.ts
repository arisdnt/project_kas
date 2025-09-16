/**
 * Backup Core Model
 * Backup and export/import system models
 */

import { z } from 'zod';

export const BackupJobSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  nama: z.string().min(1).max(255),
  tipe: z.enum(['full', 'incremental', 'data_only', 'structure_only']),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  format: z.enum(['sql', 'json', 'csv', 'xlsx']),
  include_tables: z.array(z.string()).optional(),
  exclude_tables: z.array(z.string()).optional(),
  compression: z.boolean().default(true),
  file_path: z.string().optional(),
  file_size: z.number().int().optional(),
  progress_persen: z.number().min(0).max(100).default(0),
  error_message: z.string().optional(),
  started_at: z.date().optional(),
  completed_at: z.date().optional(),
  expires_at: z.date().optional(),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const CreateBackupJobSchema = BackupJobSchema.omit({
  id: true,
  status: true,
  progress_persen: true,
  file_path: true,
  file_size: true,
  error_message: true,
  started_at: true,
  completed_at: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const UpdateBackupJobSchema = z.object({
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']).optional(),
  progress_persen: z.number().min(0).max(100).optional(),
  file_path: z.string().optional(),
  file_size: z.number().int().optional(),
  error_message: z.string().optional(),
  started_at: z.date().optional(),
  completed_at: z.date().optional()
});

export const SearchBackupQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  tipe: z.enum(['full', 'incremental', 'data_only', 'structure_only']).optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']).optional(),
  format: z.enum(['sql', 'json', 'csv', 'xlsx']).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

export const ImportJobSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  nama: z.string().min(1).max(255),
  tipe: z.enum(['restore', 'merge', 'data_import']),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  source_format: z.enum(['sql', 'json', 'csv', 'xlsx']),
  source_file_path: z.string(),
  target_tables: z.array(z.string()).optional(),
  validation_mode: z.enum(['strict', 'lenient', 'skip']).default('strict'),
  records_processed: z.number().int().default(0),
  records_success: z.number().int().default(0),
  records_failed: z.number().int().default(0),
  progress_persen: z.number().min(0).max(100).default(0),
  error_message: z.string().optional(),
  validation_errors: z.array(z.record(z.any())).optional(),
  started_at: z.date().optional(),
  completed_at: z.date().optional(),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const CreateImportJobSchema = ImportJobSchema.omit({
  id: true,
  status: true,
  records_processed: true,
  records_success: true,
  records_failed: true,
  progress_persen: true,
  error_message: true,
  validation_errors: true,
  started_at: true,
  completed_at: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const ExportRequestSchema = z.object({
  nama: z.string().min(1).max(255),
  format: z.enum(['json', 'csv', 'xlsx']),
  tables: z.array(z.string()).min(1),
  filters: z.record(z.any()).optional(),
  date_range: z.object({
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  }).optional(),
  compression: z.boolean().default(true)
});

export const ScheduledBackupSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  nama: z.string().min(1).max(255),
  tipe: z.enum(['full', 'incremental', 'data_only']),
  format: z.enum(['sql', 'json']),
  schedule_cron: z.string(),
  is_aktif: z.boolean().default(true),
  keep_backup_days: z.number().int().min(1).default(30),
  compression: z.boolean().default(true),
  last_run_at: z.date().optional(),
  next_run_at: z.date(),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export type BackupJob = z.infer<typeof BackupJobSchema>;
export type CreateBackupJob = z.infer<typeof CreateBackupJobSchema>;
export type UpdateBackupJob = z.infer<typeof UpdateBackupJobSchema>;
export type SearchBackupQuery = z.infer<typeof SearchBackupQuerySchema>;
export type ImportJob = z.infer<typeof ImportJobSchema>;
export type CreateImportJob = z.infer<typeof CreateImportJobSchema>;
export type ExportRequest = z.infer<typeof ExportRequestSchema>;
export type ScheduledBackup = z.infer<typeof ScheduledBackupSchema>;