/**
 * Notification Core Model
 * Notification system model for various system events and alerts
 */

import { z } from 'zod';

export const NotifikasiSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  tipe: z.enum(['system', 'transaction', 'inventory', 'user', 'promo', 'backup', 'error']),
  kategori: z.enum(['info', 'warning', 'error', 'success', 'reminder']),
  judul: z.string().min(1).max(255),
  pesan: z.string().min(1),
  data_tambahan: z.record(z.any()).optional(),
  is_read: z.boolean().default(false),
  is_sent: z.boolean().default(false),
  kanal: z.array(z.enum(['in_app', 'email', 'sms', 'webhook'])).default(['in_app']),
  prioritas: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  expires_at: z.date().optional(),
  dibuat_pada: z.date(),
  dibaca_pada: z.date().optional(),
  dikirim_pada: z.date().optional()
});

export const CreateNotifikasiSchema = NotifikasiSchema.omit({
  id: true,
  dibuat_pada: true,
  dibaca_pada: true,
  dikirim_pada: true
});

export const UpdateNotifikasiSchema = z.object({
  is_read: z.boolean().optional(),
  is_sent: z.boolean().optional(),
  dibaca_pada: z.date().optional(),
  dikirim_pada: z.date().optional()
});

export const SearchNotifikasiQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  tipe: z.enum(['system', 'transaction', 'inventory', 'user', 'promo', 'backup', 'error']).optional(),
  kategori: z.enum(['info', 'warning', 'error', 'success', 'reminder']).optional(),
  is_read: z.boolean().optional(),
  prioritas: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

export const NotificationTemplateSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  kode: z.string().min(1).max(50),
  nama: z.string().min(1).max(255),
  tipe: z.enum(['system', 'transaction', 'inventory', 'user', 'promo', 'backup', 'error']),
  template_judul: z.string().min(1),
  template_pesan: z.string().min(1),
  kanal_default: z.array(z.enum(['in_app', 'email', 'sms', 'webhook'])),
  prioritas_default: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  is_aktif: z.boolean().default(true),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const CreateNotificationTemplateSchema = NotificationTemplateSchema.omit({
  id: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const NotificationSettingSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid(),
  tipe: z.enum(['system', 'transaction', 'inventory', 'user', 'promo', 'backup', 'error']),
  kanal_enabled: z.array(z.enum(['in_app', 'email', 'sms', 'webhook'])),
  is_enabled: z.boolean().default(true),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const BulkNotificationRequestSchema = z.object({
  template_kode: z.string(),
  user_ids: z.array(z.string().uuid()).optional(),
  toko_ids: z.array(z.string().uuid()).optional(),
  data: z.record(z.any()).optional(),
  kanal_override: z.array(z.enum(['in_app', 'email', 'sms', 'webhook'])).optional(),
  prioritas_override: z.enum(['low', 'medium', 'high', 'urgent']).optional()
});

export type Notifikasi = z.infer<typeof NotifikasiSchema>;
export type CreateNotifikasi = z.infer<typeof CreateNotifikasiSchema>;
export type UpdateNotifikasi = z.infer<typeof UpdateNotifikasiSchema>;
export type SearchNotifikasiQuery = z.infer<typeof SearchNotifikasiQuerySchema>;
export type NotificationTemplate = z.infer<typeof NotificationTemplateSchema>;
export type CreateNotificationTemplate = z.infer<typeof CreateNotificationTemplateSchema>;
export type NotificationSetting = z.infer<typeof NotificationSettingSchema>;
export type BulkNotificationRequest = z.infer<typeof BulkNotificationRequestSchema>;