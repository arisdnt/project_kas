/**
 * Webhook Core Model
 * Webhook and integration system models
 */

import { z } from 'zod';

export const WebhookSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  nama: z.string().min(1).max(255),
  url: z.string().url(),
  events: z.array(z.enum(['transaction.created', 'transaction.updated', 'inventory.low_stock', 'user.created', 'backup.completed', 'system.error'])),
  secret: z.string().optional(),
  is_aktif: z.boolean().default(true),
  timeout_seconds: z.number().int().min(1).max(60).default(30),
  retry_attempts: z.number().int().min(0).max(5).default(3),
  headers: z.record(z.string()).optional(),
  last_triggered_at: z.date().optional(),
  last_response_status: z.number().int().optional(),
  last_error_message: z.string().optional(),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const CreateWebhookSchema = WebhookSchema.omit({
  id: true,
  last_triggered_at: true,
  last_response_status: true,
  last_error_message: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const UpdateWebhookSchema = WebhookSchema.partial().omit({
  id: true,
  tenant_id: true,
  user_id: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const SearchWebhookQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  is_aktif: z.boolean().optional(),
  event: z.enum(['transaction.created', 'transaction.updated', 'inventory.low_stock', 'user.created', 'backup.completed', 'system.error']).optional()
});

export const WebhookDeliverySchema = z.object({
  id: z.string().uuid(),
  webhook_id: z.string().uuid(),
  event_type: z.string(),
  payload: z.record(z.any()),
  response_status: z.number().int().optional(),
  response_body: z.string().optional(),
  response_time_ms: z.number().int().optional(),
  error_message: z.string().optional(),
  attempt_number: z.number().int().default(1),
  delivered_at: z.date().optional(),
  created_at: z.date()
});

export const IntegrationSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  nama: z.string().min(1).max(255),
  tipe: z.enum(['api', 'webhook', 'file_sync', 'database_sync']),
  provider: z.string().max(100),
  config: z.record(z.any()),
  credentials: z.record(z.string()).optional(),
  is_aktif: z.boolean().default(true),
  last_sync_at: z.date().optional(),
  sync_status: z.enum(['idle', 'syncing', 'success', 'error']).default('idle'),
  last_error_message: z.string().optional(),
  sync_interval_minutes: z.number().int().min(5).optional(),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const CreateIntegrationSchema = IntegrationSchema.omit({
  id: true,
  last_sync_at: true,
  sync_status: true,
  last_error_message: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const UpdateIntegrationSchema = IntegrationSchema.partial().omit({
  id: true,
  tenant_id: true,
  user_id: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const TriggerWebhookRequestSchema = z.object({
  event_type: z.enum(['transaction.created', 'transaction.updated', 'inventory.low_stock', 'user.created', 'backup.completed', 'system.error']),
  data: z.record(z.any()),
  webhook_ids: z.array(z.string().uuid()).optional()
});

export const WebhookTestRequestSchema = z.object({
  webhook_id: z.string().uuid(),
  test_payload: z.record(z.any()).optional()
});

export const SyncIntegrationRequestSchema = z.object({
  integration_id: z.string().uuid(),
  force_sync: z.boolean().default(false)
});

export const WebhookDeliveryStatsSchema = z.object({
  webhook_id: z.string().uuid(),
  total_deliveries: z.number().int(),
  successful_deliveries: z.number().int(),
  failed_deliveries: z.number().int(),
  average_response_time: z.number(),
  last_delivery_at: z.date().optional()
});

export type Webhook = z.infer<typeof WebhookSchema>;
export type CreateWebhook = z.infer<typeof CreateWebhookSchema>;
export type UpdateWebhook = z.infer<typeof UpdateWebhookSchema>;
export type SearchWebhookQuery = z.infer<typeof SearchWebhookQuerySchema>;
export type WebhookDelivery = z.infer<typeof WebhookDeliverySchema>;
export type Integration = z.infer<typeof IntegrationSchema>;
export type CreateIntegration = z.infer<typeof CreateIntegrationSchema>;
export type UpdateIntegration = z.infer<typeof UpdateIntegrationSchema>;
export type TriggerWebhookRequest = z.infer<typeof TriggerWebhookRequestSchema>;
export type WebhookTestRequest = z.infer<typeof WebhookTestRequestSchema>;
export type SyncIntegrationRequest = z.infer<typeof SyncIntegrationRequestSchema>;
export type WebhookDeliveryStats = z.infer<typeof WebhookDeliveryStatsSchema>;