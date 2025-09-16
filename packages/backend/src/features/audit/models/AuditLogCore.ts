/**
 * Audit Log Core Model
 * Based on database schema for activity tracking
 */

import { z } from 'zod';

export enum AksiAudit {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout'
}

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  tabel: z.string().min(1).max(64),
  record_id: z.string().uuid().optional(),
  aksi: z.nativeEnum(AksiAudit),
  data_lama: z.any().optional(),
  data_baru: z.any().optional(),
  ip_address: z.string().max(45).optional(),
  user_agent: z.string().optional(),
  dibuat_pada: z.date()
});

export const CreateAuditLogSchema = AuditLogSchema.omit({
  id: true,
  dibuat_pada: true
});

export const SearchAuditQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  search: z.string().optional(),
  user_id: z.string().uuid().optional(),
  tabel: z.string().optional(),
  aksi: z.nativeEnum(AksiAudit).optional(),
  tanggal_dari: z.string().optional(),
  tanggal_sampai: z.string().optional(),
  record_id: z.string().uuid().optional()
});

export type AuditLog = z.infer<typeof AuditLogSchema>;
export type CreateAuditLog = z.infer<typeof CreateAuditLogSchema>;
export type SearchAuditQuery = z.infer<typeof SearchAuditQuerySchema>;