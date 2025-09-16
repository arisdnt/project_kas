/**
 * User Session Core Model
 * Based on database schema for session management
 */

import { z } from 'zod';

export const UserSessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  toko_id: z.string().uuid().optional(),
  tenant_id: z.string().uuid().optional(),
  session_token: z.string().min(1),
  refresh_token: z.string().optional(),
  ip_address: z.string().max(45).optional(),
  user_agent: z.string().optional(),
  expires_at: z.date(),
  is_active: z.boolean().default(true),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const CreateSessionSchema = UserSessionSchema.omit({
  id: true,
  dibuat_pada: true,
  diperbarui_pada: true
});

export const UpdateSessionSchema = CreateSessionSchema.partial().omit({
  user_id: true,
  session_token: true
});

export const SearchSessionQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  user_id: z.string().uuid().optional(),
  is_active: z.enum(['true', 'false']).optional(),
  expired: z.enum(['true', 'false']).optional(),
  ip_address: z.string().optional()
});

export const DeviceInfoSchema = z.object({
  device_type: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  location: z.string().optional()
});

export type UserSession = z.infer<typeof UserSessionSchema>;
export type CreateSession = z.infer<typeof CreateSessionSchema>;
export type UpdateSession = z.infer<typeof UpdateSessionSchema>;
export type SearchSessionQuery = z.infer<typeof SearchSessionQuerySchema>;
export type DeviceInfo = z.infer<typeof DeviceInfoSchema>;