/**
 * Profile Core Model
 * User profile and settings management models for POS system
 */

import { z } from 'zod';

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid().optional(),
  peran_id: z.string().uuid().optional(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  nama_lengkap: z.string().min(1).max(255),
  telepon: z.string().max(20).optional(),
  alamat: z.string().optional(),
  tanggal_lahir: z.date().optional(),
  jenis_kelamin: z.enum(['pria', 'wanita']).optional(),
  gaji_pokok: z.number().min(0).optional(),
  komisi_persen: z.number().min(0).max(100).optional(),
  tanggal_masuk: z.date().optional(),
  tanggal_keluar: z.date().optional(),
  avatar_url: z.string().url().optional(),
  status: z.enum(['aktif', 'nonaktif', 'suspend']),
  last_login: z.date().optional(),
  dibuat_pada: z.date(),
  diperbarui_pada: z.date()
});

export const UpdateProfileSchema = z.object({
  nama_lengkap: z.string().min(1).max(255).optional(),
  telepon: z.string().max(20).optional(),
  alamat: z.string().optional(),
  tanggal_lahir: z.date().optional(),
  jenis_kelamin: z.enum(['pria', 'wanita']).optional(),
  avatar_url: z.string().url().optional()
});

export const ChangePasswordSchema = z.object({
  current_password: z.string().min(6),
  new_password: z.string().min(6).max(255),
  confirm_password: z.string().min(6).max(255)
}).refine(data => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"]
});

export const UserPerformanceStatsSchema = z.object({
  user_id: z.string().uuid(),
  total_sales: z.number().int(),
  total_sales_amount: z.number(),
  total_purchases: z.number().int(),
  total_purchases_amount: z.number(),
  total_returns: z.number().int(),
  total_returns_amount: z.number(),
  average_transaction_value: z.number(),
  best_sales_day: z.date().optional(),
  performance_score: z.number(),
  commission_earned: z.number(),
  active_days: z.number().int(),
  productivity_rating: z.enum(['excellent', 'good', 'average', 'below_average', 'poor'])
});

export const UserActivityLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  activity_type: z.enum(['login', 'logout', 'sale', 'purchase', 'return', 'profile_update', 'password_change']),
  description: z.string(),
  transaction_id: z.string().uuid().optional(),
  amount: z.number().optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  created_at: z.date()
});

export const UserSalesReportSchema = z.object({
  date: z.date(),
  sales_count: z.number().int(),
  sales_amount: z.number(),
  returns_count: z.number().int(),
  returns_amount: z.number(),
  net_sales: z.number(),
  commission: z.number(),
  productivity_score: z.number()
});

export const ProfileSettingsSchema = z.object({
  user_id: z.string().uuid(),
  notifications_enabled: z.boolean().default(true),
  email_notifications: z.boolean().default(true),
  sms_notifications: z.boolean().default(false),
  language: z.enum(['id', 'en']).default('id'),
  timezone: z.string().default('Asia/Jakarta'),
  theme: z.enum(['light', 'dark', 'auto']).default('light'),
  currency_format: z.string().default('IDR'),
  date_format: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).default('DD/MM/YYYY'),
  auto_logout_minutes: z.number().min(5).max(480).default(60),
  dashboard_widgets: z.array(z.string()).default([]),
  created_at: z.date(),
  updated_at: z.date()
});

export const UpdateSettingsSchema = ProfileSettingsSchema.omit({
  user_id: true,
  created_at: true,
  updated_at: true
}).partial();

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
export type ChangePassword = z.infer<typeof ChangePasswordSchema>;
export type UserPerformanceStats = z.infer<typeof UserPerformanceStatsSchema>;
export type UserActivityLog = z.infer<typeof UserActivityLogSchema>;
export type UserSalesReport = z.infer<typeof UserSalesReportSchema>;
export type ProfileSettings = z.infer<typeof ProfileSettingsSchema>;
export type UpdateSettings = z.infer<typeof UpdateSettingsSchema>;